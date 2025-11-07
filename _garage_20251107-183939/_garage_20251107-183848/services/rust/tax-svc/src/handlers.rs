use actix_web::{web, HttpResponse, Responder};
use log::{info, warn};
use std::time::Instant;

use crate::{AppState, models::*, tax_rules, cache, utils};

pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "tax-svc",
        "version": "0.1.0"
    }))
}

pub async fn calculate_tax(
    state: web::Data<AppState>,
    req: web::Json<TaxQuoteRequest>,
) -> impl Responder {
    let start_time = Instant::now();

    // Normalize address
    let normalized_county = req.county.clone().unwrap_or_else(|| {
        utils::lookup_county(&req.address.postal, &req.address.state)
    });

    // Generate cache key
    let cache_key = cache::generate_cache_key(
        &req.address.postal,
        &normalized_county,
        req.sale_price,
        req.trade_value.unwrap_or(0.0),
    );

    // Check cache
    if let Some(cached) = cache::get_cached(&state.redis_client, &cache_key).await {
        info!("Cache hit for key: {}", cache_key);
        return HttpResponse::Ok().json(cached);
    }

    // Calculate tax
    let tax_basis = req.get_tax_basis();
    let jurisdictions = tax_rules::calculate_tax_by_state(
        &req.address.state,
        &normalized_county,
        tax_basis,
    );

    let fees = tax_rules::calculate_fees(&req.address.state);

    let total_tax: f64 = jurisdictions.iter().map(|j| j.amount).sum();
    let total_fees: f64 = fees.iter().map(|f| f.amount).sum();

    let response = TaxQuoteResponse {
        jurisdictions,
        fees,
        tax: total_tax,
        total_fees,
        total: total_tax + total_fees,
        version: "v1.0.0".to_string(),
        latency_ms: start_time.elapsed().as_millis() as u64,
        effective_date: chrono::Utc::now().format("%Y-%m-%d").to_string(),
    };

    // Cache result (TTL: 5 minutes)
    if let Err(e) = cache::set_cached(&state.redis_client, &cache_key, &response, 300).await {
        warn!("Failed to cache result: {}", e);
    }

    info!("Tax calculation completed in {}ms", response.latency_ms);
    HttpResponse::Ok().json(response)
}
