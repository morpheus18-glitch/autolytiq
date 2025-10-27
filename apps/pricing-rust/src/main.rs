use std::net::SocketAddr;

use tonic::{transport::Server, Request, Response, Status};
use tracing::{info, warn};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod proto;
mod service;

use proto::pricing::v1::pricing_service_server::{PricingService, PricingServiceServer};
use proto::pricing::v1::*;
use service::{calculate_gross, calculate_market_data, calculate_payments};

pub struct PricingServiceImpl;

#[tonic::async_trait]
impl PricingService for PricingServiceImpl {
    async fn get_market_data(
        &self,
        request: Request<MarketDataRequest>,
    ) -> Result<Response<MarketDataResponse>, Status> {
        let start = std::time::Instant::now();
        let req = request.into_inner();

        info!(
            tenant_id = %req.tenant_id,
            year = req.year,
            make = %req.make,
            model = %req.model,
            "Processing market data request"
        );

        match calculate_market_data(&req).await {
            Ok(response) => {
                let duration = start.elapsed();
                info!(duration_ms = duration.as_millis(), "Market data calculated");
                Ok(Response::new(response))
            }
            Err(e) => {
                warn!(error = %e, "Market data calculation failed");
                Err(Status::internal("Calculation failed"))
            }
        }
    }

    async fn calculate_gross(
        &self,
        request: Request<GrossRequest>,
    ) -> Result<Response<GrossResponse>, Status> {
        let start = std::time::Instant::now();
        let req = request.into_inner();

        info!(
            tenant_id = %req.tenant_id,
            vehicle_price = req.vehicle_price,
            "Processing gross calculation"
        );

        match calculate_gross(&req).await {
            Ok(response) => {
                let duration = start.elapsed();
                info!(
                    duration_ms = duration.as_millis(),
                    front_gross = response.front_gross,
                    total_gross = response.total_gross,
                    "Gross calculated"
                );
                Ok(Response::new(response))
            }
            Err(e) => {
                warn!(error = %e, "Gross calculation failed");
                Err(Status::internal("Calculation failed"))
            }
        }
    }

    async fn calculate_payments(
        &self,
        request: Request<PaymentRequest>,
    ) -> Result<Response<PaymentResponse>, Status> {
        let start = std::time::Instant::now();
        let req = request.into_inner();

        info!(
            tenant_id = %req.tenant_id,
            amount = req.amount_financed,
            apr = req.apr,
            term = req.term_months,
            "Processing payment calculation"
        );

        match calculate_payments(&req).await {
            Ok(response) => {
                let duration = start.elapsed();
                info!(
                    duration_ms = duration.as_millis(),
                    monthly_payment = response.monthly_payment,
                    "Payment calculated"
                );
                Ok(Response::new(response))
            }
            Err(e) => {
                warn!(error = %e, "Payment calculation failed");
                Err(Status::internal("Calculation failed"))
            }
        }
    }

    async fn check(
        &self,
        _request: Request<HealthCheckRequest>,
    ) -> Result<Response<HealthCheckResponse>, Status> {
        Ok(Response::new(HealthCheckResponse {
            status: "SERVING".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
        }))
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "pricing_service=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer().json())
        .init();

    // Load config
    dotenvy::dotenv().ok();
    let port = std::env::var("SERVICE_PORT")
        .unwrap_or_else(|_| "50051".to_string())
        .parse::<u16>()?;

    let addr: SocketAddr = ([0, 0, 0, 0], port).into();

    info!("Starting Pricing Service on {}", addr);

    let service = PricingServiceImpl;

    Server::builder()
        .trace_fn(|_| tracing::info_span!("pricing_service"))
        .add_service(PricingServiceServer::new(service))
        .serve(addr)
        .await?;

    Ok(())
}
