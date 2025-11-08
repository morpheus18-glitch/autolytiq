use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketComp {
    pub id: String,
    pub vin: String,
    pub year: i32,
    pub make: String,
    pub model: String,
    pub trim: Option<String>,
    pub mileage: i32,
    pub price: Decimal,
    pub days_on_market: i32,
    pub sale_date: NaiveDate,
    pub source: String,
    pub match_score: f64,
}

#[derive(Debug, Clone)]
pub struct CompetitiveRange {
    pub floor_price: Decimal,
    pub target_price: Decimal,
    pub ceiling_price: Decimal,
    pub average_price: Decimal,
    pub comp_count: usize,
    pub days_to_sale_avg: i32,
}

#[derive(Debug, Clone)]
pub struct MarketStats {
    pub total_comps_found: usize,
    pub comps_used: usize,
    pub price_std_dev: f64,
    pub mileage_std_dev: f64,
    pub price_per_mile: Decimal,
}

#[derive(Debug, Clone)]
pub struct GrossBreakdown {
    pub front_end_gross: Decimal,
    pub trade_reserve: Decimal,
    pub total_front_gross: Decimal,
    pub finance_reserve: Decimal,
    pub back_end_gross: Decimal,
    pub product_profits: Vec<ProductProfit>,
    pub total_gross: Decimal,
    pub gross_percentage: f64,
}

#[derive(Debug, Clone)]
pub struct ProductProfit {
    pub product_type: String,
    pub selling_price: Decimal,
    pub cost: Decimal,
    pub profit: Decimal,
    pub participation: f64,
}

#[derive(Debug, Clone)]
pub struct PaymentDetails {
    pub monthly_payment: Decimal,
    pub total_interest: Decimal,
    pub total_payment: Decimal,
    pub pti_ratio: Option<f64>,
    pub dti_ratio: Option<f64>,
    pub amortization_schedule: Vec<AmortizationEntry>,
}

#[derive(Debug, Clone)]
pub struct AmortizationEntry {
    pub payment_number: i32,
    pub payment_amount: Decimal,
    pub principal: Decimal,
    pub interest: Decimal,
    pub balance: Decimal,
}

#[derive(Debug, Clone)]
pub struct MarkdownSuggestion {
    pub suggested_price: Decimal,
    pub markdown_amount: Decimal,
    pub markdown_percentage: f64,
    pub aging_band: String,
    pub competitive_position: f64,
    pub recommendation: String,
    pub projected_gross: Decimal,
    pub estimated_days_to_sale: i32,
}
