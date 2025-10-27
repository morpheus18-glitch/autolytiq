use crate::config::PricingConfig;
use crate::proto::common::{HealthRequest, HealthResponse, ResponseMetadata};
use crate::proto::pricing::price_engine_server::PriceEngine;
use crate::proto::pricing::*;
use crate::services::{
    GrossCalculatorService, MarkdownSuggesterService, MarketPricingService,
    PaymentCalculatorService,
};
use rust_decimal::Decimal;
use shared::db::DbPool;
use shared::error::AppError;
use shared::middleware::extract_request_context;
use shared::redis_client::RedisClient;
use shared::types::Money;
use std::sync::Arc;
use tokio::sync::Mutex;
use tonic::{Request, Response, Status};
use tracing::{info, instrument};

pub struct PriceEngineServer {
    db_pool: Arc<DbPool>,
    redis_client: Arc<Mutex<RedisClient>>,
    market_pricing: MarketPricingService,
    gross_calculator: GrossCalculatorService,
    payment_calculator: PaymentCalculatorService,
    markdown_suggester: MarkdownSuggesterService,
    config: PricingConfig,
}

impl PriceEngineServer {
    pub fn new(db_pool: DbPool, redis_client: RedisClient) -> Self {
        Self {
            db_pool: Arc::new(db_pool),
            redis_client: Arc::new(Mutex::new(redis_client)),
            market_pricing: MarketPricingService::new(),
            gross_calculator: GrossCalculatorService::new(),
            payment_calculator: PaymentCalculatorService::new(),
            markdown_suggester: MarkdownSuggesterService::new(),
            config: PricingConfig::default(),
        }
    }

    fn create_response_metadata(&self, request_id: &str) -> ResponseMetadata {
        ResponseMetadata {
            request_id: request_id.to_string(),
            timestamp_ms: chrono::Utc::now().timestamp_millis(),
            duration_ms: 0, // Could track actual duration
            server_version: env!("CARGO_PKG_VERSION").to_string(),
        }
    }

    fn proto_money_to_decimal(&self, money: &Option<common::Money>) -> Decimal {
        money
            .as_ref()
            .map(|m| Decimal::new(m.amount_cents, 2))
            .unwrap_or(Decimal::ZERO)
    }

    fn proto_decimal_to_decimal(&self, dec: &Option<common::Decimal>) -> Decimal {
        dec.as_ref()
            .and_then(|d| d.value.parse::<Decimal>().ok())
            .unwrap_or(Decimal::ZERO)
    }

    fn decimal_to_proto_money(&self, amount: Decimal, currency: &str) -> common::Money {
        common::Money {
            amount_cents: (amount * Decimal::new(100, 0))
                .to_i64()
                .unwrap_or(0),
            currency: currency.to_string(),
        }
    }

    fn decimal_to_proto_decimal(&self, amount: Decimal) -> common::Decimal {
        common::Decimal {
            value: amount.to_string(),
        }
    }
}

#[tonic::async_trait]
impl PriceEngine for PriceEngineServer {
    #[instrument(skip(self, request))]
    async fn get_market_data(
        &self,
        request: Request<MarketDataRequest>,
    ) -> Result<Response<MarketDataResponse>, Status> {
        let req = request.get_ref();
        let context = extract_request_context(&request)?;

        info!(
            request_id = %context.request_id,
            tenant_id = %context.tenant_id,
            year = req.year,
            make = %req.make,
            model = %req.model,
            "Processing GetMarketData request"
        );

        // Query market comps from database
        let year_variance = if req.year_variance > 0 {
            req.year_variance
        } else {
            self.config.default_year_variance
        };

        let time_window_days = if req.time_window_days > 0 {
            req.time_window_days
        } else {
            self.config.default_time_window_days
        };

        // TODO: Implement actual database query
        let mut market_comps = crate::db::query_market_comps(
            &self.db_pool,
            &context.tenant_id,
            req.year,
            &req.make,
            &req.model,
            year_variance,
            time_window_days,
            100,
        )
        .await
        .map_err(|e| Status::internal(format!("Database error: {}", e)))?;

        // Calculate match scores
        let mileage_variance = if req.mileage_variance > 0 {
            req.mileage_variance
        } else {
            self.config.default_mileage_variance
        };

        for comp in &mut market_comps {
            comp.match_score = self.market_pricing.calculate_match_score(
                req.year,
                req.mileage,
                comp.year,
                comp.mileage,
                year_variance,
                mileage_variance,
            );
        }

        // Filter and sort comparables
        let filtered_comps = self
            .market_pricing
            .filter_comparables(market_comps.clone(), 0.5, 50);

        // Calculate competitive range
        let competitive_range = self.market_pricing.calculate_competitive_range(&filtered_comps);

        // Calculate market stats
        let market_stats =
            self.market_pricing
                .calculate_market_stats(&market_comps, &filtered_comps);

        // Convert to proto response
        let response = MarketDataResponse {
            metadata: Some(self.create_response_metadata(&context.request_id.to_string())),
            competitive_range: competitive_range.map(|range| CompetitiveRange {
                floor_price: Some(self.decimal_to_proto_money(range.floor_price, "USD")),
                target_price: Some(self.decimal_to_proto_money(range.target_price, "USD")),
                ceiling_price: Some(self.decimal_to_proto_money(range.ceiling_price, "USD")),
                average_price: Some(self.decimal_to_proto_money(range.average_price, "USD")),
                comp_count: range.comp_count as i32,
                days_to_sale_avg: range.days_to_sale_avg,
            }),
            comparables: filtered_comps
                .iter()
                .map(|comp| MarketComp {
                    id: comp.id.clone(),
                    vin: comp.vin.clone(),
                    year: comp.year,
                    make: comp.make.clone(),
                    model: comp.model.clone(),
                    trim: comp.trim.clone().unwrap_or_default(),
                    mileage: comp.mileage,
                    price: Some(self.decimal_to_proto_money(comp.price, "USD")),
                    days_on_market: comp.days_on_market,
                    sale_date: comp.sale_date.to_string(),
                    source: comp.source.clone(),
                    match_score: comp.match_score,
                })
                .collect(),
            statistics: Some(MarketStats {
                total_comps_found: market_stats.total_comps_found as i32,
                comps_used: market_stats.comps_used as i32,
                price_std_dev: market_stats.price_std_dev,
                mileage_std_dev: market_stats.mileage_std_dev,
                price_per_mile: Some(self.decimal_to_proto_money(market_stats.price_per_mile, "USD")),
            }),
        };

        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn calculate_gross(
        &self,
        request: Request<GrossRequest>,
    ) -> Result<Response<GrossResponse>, Status> {
        let req = request.get_ref();
        let context = extract_request_context(&request)?;

        info!(
            request_id = %context.request_id,
            tenant_id = %context.tenant_id,
            "Processing CalculateGross request"
        );

        // Convert proto to rust types
        let vehicle_price = self.proto_money_to_decimal(&req.vehicle_price);
        let vehicle_cost = self.proto_money_to_decimal(&req.vehicle_cost);
        let pack = self.proto_money_to_decimal(&req.pack);
        let trade_value = self.proto_money_to_decimal(&req.trade_value);
        let trade_payoff = self.proto_money_to_decimal(&req.trade_payoff);
        let trade_allowance = self.proto_money_to_decimal(&req.trade_allowance);
        let rate_markup = self.proto_decimal_to_decimal(&req.rate_markup);
        let amount_financed = self.proto_money_to_decimal(&req.amount_financed);

        // Convert products
        let products: Vec<_> = req
            .products
            .iter()
            .map(|p| {
                (
                    p.r#type.clone(),
                    self.proto_money_to_decimal(&p.price),
                    self.proto_money_to_decimal(&p.cost),
                    p.participation,
                )
            })
            .collect();

        // Calculate gross
        let breakdown = self.gross_calculator.calculate_gross(
            vehicle_price,
            vehicle_cost,
            pack,
            trade_value,
            trade_payoff,
            trade_allowance,
            rate_markup,
            req.term_months,
            amount_financed,
            req.participation,
            products,
        );

        // Convert to proto response
        let response = GrossResponse {
            metadata: Some(self.create_response_metadata(&context.request_id.to_string())),
            breakdown: Some(GrossBreakdown {
                front_end_gross: Some(self.decimal_to_proto_money(breakdown.front_end_gross, "USD")),
                trade_reserve: Some(self.decimal_to_proto_money(breakdown.trade_reserve, "USD")),
                total_front_gross: Some(self.decimal_to_proto_money(breakdown.total_front_gross, "USD")),
                finance_reserve: Some(self.decimal_to_proto_money(breakdown.finance_reserve, "USD")),
                back_end_gross: Some(self.decimal_to_proto_money(breakdown.back_end_gross, "USD")),
                product_profits: breakdown
                    .product_profits
                    .iter()
                    .map(|p| ProductProfit {
                        r#type: p.product_type.clone(),
                        selling_price: Some(self.decimal_to_proto_money(p.selling_price, "USD")),
                        cost: Some(self.decimal_to_proto_money(p.cost, "USD")),
                        profit: Some(self.decimal_to_proto_money(p.profit, "USD")),
                        participation: p.participation,
                    })
                    .collect(),
                total_gross: Some(self.decimal_to_proto_money(breakdown.total_gross, "USD")),
                gross_percentage: breakdown.gross_percentage,
            }),
        };

        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn calculate_payment(
        &self,
        request: Request<PaymentRequest>,
    ) -> Result<Response<PaymentResponse>, Status> {
        let req = request.get_ref();
        let context = extract_request_context(&request)?;

        info!(
            request_id = %context.request_id,
            tenant_id = %context.tenant_id,
            "Processing CalculatePayment request"
        );

        let amount_financed = self.proto_money_to_decimal(&req.amount_financed);
        let apr = self.proto_decimal_to_decimal(&req.apr);
        let gross_monthly_income = req.gross_monthly_income.as_ref().map(|m| self.proto_money_to_decimal(&Some(m.clone())));
        let total_monthly_debt = req.total_monthly_debt.as_ref().map(|m| self.proto_money_to_decimal(&Some(m.clone())));

        let details = self.payment_calculator.calculate_payment(
            amount_financed,
            apr,
            req.term_months,
            gross_monthly_income,
            total_monthly_debt,
        );

        let response = PaymentResponse {
            metadata: Some(self.create_response_metadata(&context.request_id.to_string())),
            monthly_payment: Some(self.decimal_to_proto_money(details.monthly_payment, "USD")),
            total_interest: Some(self.decimal_to_proto_money(details.total_interest, "USD")),
            total_payment: Some(self.decimal_to_proto_money(details.total_payment, "USD")),
            pti_ratio: details.pti_ratio,
            dti_ratio: details.dti_ratio,
            amortization_schedule: details
                .amortization_schedule
                .iter()
                .map(|entry| AmortizationEntry {
                    payment_number: entry.payment_number,
                    payment_amount: Some(self.decimal_to_proto_money(entry.payment_amount, "USD")),
                    principal: Some(self.decimal_to_proto_money(entry.principal, "USD")),
                    interest: Some(self.decimal_to_proto_money(entry.interest, "USD")),
                    balance: Some(self.decimal_to_proto_money(entry.balance, "USD")),
                })
                .collect(),
        };

        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn suggest_markdown(
        &self,
        request: Request<MarkdownRequest>,
    ) -> Result<Response<MarkdownResponse>, Status> {
        let req = request.get_ref();
        let context = extract_request_context(&request)?;

        info!(
            request_id = %context.request_id,
            tenant_id = %context.tenant_id,
            days_in_stock = req.days_in_stock,
            "Processing SuggestMarkdown request"
        );

        let current_price = self.proto_money_to_decimal(&req.current_price);
        let cost = self.proto_money_to_decimal(&req.cost);

        // Convert competitive range if provided
        let market_range = req.market_range.as_ref().map(|range| {
            crate::models::CompetitiveRange {
                floor_price: self.proto_money_to_decimal(&range.floor_price),
                target_price: self.proto_money_to_decimal(&range.target_price),
                ceiling_price: self.proto_money_to_decimal(&range.ceiling_price),
                average_price: self.proto_money_to_decimal(&range.average_price),
                comp_count: range.comp_count as usize,
                days_to_sale_avg: range.days_to_sale_avg,
            }
        });

        // Use custom aging bands or defaults
        let aging_bands = if !req.aging_bands.is_empty() {
            req.aging_bands
                .iter()
                .map(|b| crate::config::AgingBand {
                    days_threshold: b.days_threshold,
                    markdown_percentage: b.markdown_percentage,
                })
                .collect()
        } else {
            self.config.default_aging_bands.clone()
        };

        let suggestion = self.markdown_suggester.suggest_markdown(
            current_price,
            cost,
            req.days_in_stock,
            market_range.as_ref(),
            &aging_bands,
        );

        let response = MarkdownResponse {
            metadata: Some(self.create_response_metadata(&context.request_id.to_string())),
            suggested_price: Some(self.decimal_to_proto_money(suggestion.suggested_price, "USD")),
            markdown_amount: Some(self.decimal_to_proto_money(suggestion.markdown_amount, "USD")),
            markdown_percentage: suggestion.markdown_percentage,
            aging_band: suggestion.aging_band,
            competitive_position: suggestion.competitive_position,
            recommendation: suggestion.recommendation,
            projected_gross: Some(self.decimal_to_proto_money(suggestion.projected_gross, "USD")),
            estimated_days_to_sale: suggestion.estimated_days_to_sale,
        };

        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn batch_price(
        &self,
        request: Request<BatchPriceRequest>,
    ) -> Result<Response<tokio_stream::wrappers::ReceiverStream<Result<BatchPriceResponse, Status>>>, Status> {
        let _req = request.get_ref();
        let _context = extract_request_context(&request)?;

        // TODO: Implement batch processing with streaming responses
        Err(Status::unimplemented("Batch pricing not yet implemented"))
    }

    #[instrument(skip(self, request))]
    async fn get_health(
        &self,
        request: Request<HealthRequest>,
    ) -> Result<Response<HealthResponse>, Status> {
        info!("Health check requested");

        let status = health_response::Status::Healthy;

        let response = HealthResponse {
            status: status as i32,
            version: env!("CARGO_PKG_VERSION").to_string(),
            uptime_seconds: 0, // TODO: Track actual uptime
            dependencies: std::collections::HashMap::new(), // TODO: Check dependencies
        };

        Ok(Response::new(response))
    }
}
