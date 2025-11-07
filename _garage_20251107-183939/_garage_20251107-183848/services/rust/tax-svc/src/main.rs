/**
 * Tax & Title Quote Service (Rust)
 *
 * High-performance tax calculation service with:
 * - Address normalization → county → rules lookup
 * - Redis caching (key: normalized {postal, county, price, trade})
 * - Multi-state support (2-3 mock states for now)
 * - Versioned calculations
 * - Sub-200ms response time (cached)
 */

mod models;
mod handlers;
mod tax_rules;
mod cache;
mod utils;

use actix_web::{web, App, HttpServer, middleware};
use actix_cors::Cors;
use env_logger::Env;
use log::info;
use redis::Client as RedisClient;
use std::sync::Arc;

/// Application state
pub struct AppState {
    redis_client: Arc<RedisClient>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();

    // Connect to Redis
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let redis_client = RedisClient::open(redis_url.clone())
        .expect("Failed to create Redis client");

    info!("Connected to Redis at {}", redis_url);

    let app_state = web::Data::new(AppState {
        redis_client: Arc::new(redis_client),
    });

    let bind_addr = std::env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string());
    info!("Starting tax-svc server on {}", bind_addr);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(app_state.clone())
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .route("/health", web::get().to(handlers::health_check))
            .route("/tax/quote", web::post().to(handlers::calculate_tax))
    })
    .bind(&bind_addr)?
    .run()
    .await
}
