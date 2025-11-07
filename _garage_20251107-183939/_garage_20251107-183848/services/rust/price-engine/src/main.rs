mod proto {
    pub mod common {
        tonic::include_proto!("autolytiq.common");
    }
    pub mod pricing {
        tonic::include_proto!("autolytiq.pricing");
    }
}

mod config;
mod db;
mod models;
mod server;
mod services;

use server::PriceEngineServer;
use shared::{init_logging, AppConfig};
use std::net::SocketAddr;
use tonic::transport::Server;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load configuration
    let config = AppConfig::load("price-engine")?;

    // Initialize logging
    init_logging(
        &config.service.name,
        &config.logging.level,
        &config.logging.format,
    );

    info!(
        service = %config.service.name,
        version = %config.service.version,
        "Starting PriceEngine service"
    );

    // Create database connection pool
    let db_pool = shared::db::create_pool(&config.database)?;
    info!("Database pool created");

    // Test database connection
    shared::db::test_connection(&db_pool).await?;
    info!("Database connection verified");

    // Create Redis client
    let redis_client = shared::redis_client::RedisClient::new(&config.redis).await?;
    info!("Redis connection established");

    // Create gRPC server
    let addr: SocketAddr = config.service_address().parse()?;
    let price_engine_service = PriceEngineServer::new(db_pool, redis_client);

    info!(address = %addr, "Starting gRPC server");

    // Build and serve
    Server::builder()
        .add_service(proto::pricing::price_engine_server::PriceEngineServer::new(
            price_engine_service,
        ))
        .serve_with_shutdown(addr, shutdown_signal())
        .await?;

    info!("Server shut down gracefully");
    Ok(())
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Failed to install CTRL+C signal handler");
    info!("Received shutdown signal");
}
