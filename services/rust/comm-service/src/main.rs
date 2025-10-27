mod proto {
    pub mod common {
        tonic::include_proto!("autolytiq.common");
    }
    pub mod comm {
        tonic::include_proto!("autolytiq.comm");
    }
}

mod circuit_breaker;
mod idempotency;
mod metrics;
mod retry;
mod server;

use server::CommServiceServer;
use shared::{init_logging, AppConfig};
use std::net::SocketAddr;
use tonic::transport::Server;
use tracing::{error, info};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AppConfig::load("comm-service")?;

    init_logging(
        &config.service.name,
        &config.logging.level,
        &config.logging.format,
    );

    info!(
        service = %config.service.name,
        version = %config.service.version,
        "Starting CommService"
    );

    let redis_client = shared::redis_client::RedisClient::new(&config.redis).await?;
    info!("Redis connection established");

    let addr: SocketAddr = config.service_address().parse()?;
    let comm_service = CommServiceServer::new(redis_client);

    info!(address = %addr, "Starting gRPC server");

    Server::builder()
        .add_service(proto::comm::comm_service_server::CommServiceServer::new(
            comm_service,
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
