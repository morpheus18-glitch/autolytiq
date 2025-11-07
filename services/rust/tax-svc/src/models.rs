use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaxQuoteRequest {
    pub vin: Option<String>,
    pub address: Address,
    pub county: Option<String>,
    pub sale_price: f64,
    pub trade_value: Option<f64>,
    pub fees: Option<f64>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Address {
    pub line1: String,
    pub city: String,
    pub state: String,
    pub postal: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaxQuoteResponse {
    pub jurisdictions: Vec<Jurisdiction>,
    pub fees: Vec<Fee>,
    pub tax: f64,
    pub total_fees: f64,
    pub total: f64,
    pub version: String,
    pub latency_ms: u64,
    pub effective_date: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Jurisdiction {
    pub name: String,
    #[serde(rename = "type")]
    pub jurisdiction_type: String,
    pub rate: f64,
    pub amount: f64,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Fee {
    pub name: String,
    #[serde(rename = "type")]
    pub fee_type: String,
    pub amount: f64,
    pub required: bool,
}

impl TaxQuoteRequest {
    pub fn get_tax_basis(&self) -> f64 {
        let trade_value = self.trade_value.unwrap_or(0.0);
        // In some states, trade-in reduces tax basis
        (self.sale_price - trade_value).max(0.0)
    }
}
