use redis::{Client, AsyncCommands};
use sha2::{Sha256, Digest};
use anyhow::Result;
use log::error;

use crate::models::TaxQuoteResponse;

/// Generate cache key from normalized inputs
pub fn generate_cache_key(postal: &str, county: &str, sale_price: f64, trade_value: f64) -> String {
    let input = format!("{}|{}|{:.2}|{:.2}", postal, county, sale_price, trade_value);
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let hash = hasher.finalize();
    format!("tax:{}", hex::encode(hash))
}

/// Get cached tax quote
pub async fn get_cached(client: &Client, key: &str) -> Option<TaxQuoteResponse> {
    let mut conn = match client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(e) => {
            error!("Redis connection error: {}", e);
            return None;
        }
    };

    let result: Result<String, _> = conn.get(key).await;
    match result {
        Ok(json) => {
            serde_json::from_str(&json).ok()
        }
        Err(_) => None,
    }
}

/// Set cached tax quote with TTL
pub async fn set_cached(client: &Client, key: &str, value: &TaxQuoteResponse, ttl_seconds: usize) -> Result<()> {
    let mut conn = client.get_multiplexed_async_connection().await?;
    let json = serde_json::to_string(value)?;
    conn.set_ex(key, json, ttl_seconds).await?;
    Ok(())
}
