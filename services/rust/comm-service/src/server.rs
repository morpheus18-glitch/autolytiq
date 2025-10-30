use crate::circuit_breaker::CircuitBreaker;
use crate::idempotency::IdempotencyManager;
use crate::metrics::Metrics;
use crate::proto::comm::comm_service_server::CommService;
use crate::proto::comm::*;
use crate::proto::common::{HealthRequest, HealthResponse};
use shared::middleware::extract_request_context;
use shared::redis_client::RedisClient;
use std::sync::Arc;
use tokio::sync::Mutex;
use tonic::{Request, Response, Status};
use tracing::{info, instrument};

pub struct CommServiceServer {
    redis_client: Arc<Mutex<RedisClient>>,
    idempotency: IdempotencyManager,
    circuit_breaker: CircuitBreaker,
    metrics: Arc<Metrics>,
}

impl CommServiceServer {
    pub fn new(redis_client: RedisClient) -> Self {
        Self {
            redis_client: Arc::new(Mutex::new(redis_client)),
            idempotency: IdempotencyManager::new(86400), // 24h TTL
            circuit_breaker: CircuitBreaker::new(10, 30), // 10 failures, 30s timeout
            metrics: Arc::new(Metrics::new()),
        }
    }
}

#[tonic::async_trait]
impl CommService for CommServiceServer {
    #[instrument(skip(self, request))]
    async fn forward_request(
        &self,
        request: Request<ForwardRequestMessage>,
    ) -> Result<Response<ForwardResponseMessage>, Status> {
        let req = request.get_ref();
        let context = extract_request_context(&request)?;

        info!(
            request_id = %context.request_id,
            tenant_id = %context.tenant_id,
            target_service = %req.target_service,
            target_method = %req.target_method,
            "Processing ForwardRequest"
        );

        // Check idempotency cache if key provided
        if let Some(ref idempotency_key) = context.idempotency_key {
            let mut redis = self.redis_client.lock().await;
            if let Some(cached_response) = self
                .idempotency
                .check_cached_response(&mut redis, &context.tenant_id, idempotency_key)
                .await
                .map_err(|e| Status::internal(format!("Redis error: {}", e)))?
            {
                self.metrics.record_cache_hit();

                return Ok(Response::new(ForwardResponseMessage {
                    metadata: Some(crate::proto::common::ResponseMetadata {
                        request_id: context.request_id.to_string(),
                        timestamp_ms: chrono::Utc::now().timestamp_millis(),
                        duration_ms: 0,
                        server_version: env!("CARGO_PKG_VERSION").to_string(),
                    }),
                    response_payload: cached_response,
                    execution: Some(ExecutionDetails {
                        attempts: 1,
                        from_cache: true,
                        total_duration_ms: 0,
                        retry_attempts: vec![],
                    }),
                }));
            }
            self.metrics.record_cache_miss();
        }

        // TODO: Implement actual forwarding to target service
        // For now, return unimplemented
        Err(Status::unimplemented(
            "Request forwarding not yet implemented",
        ))
    }

    async fn get_health(
        &self,
        _request: Request<HealthRequest>,
    ) -> Result<Response<HealthResponse>, Status> {
        let response = HealthResponse {
            status: crate::proto::common::health_response::Status::Healthy as i32,
            version: env!("CARGO_PKG_VERSION").to_string(),
            uptime_seconds: 0,
            dependencies: std::collections::HashMap::new(),
        };

        Ok(Response::new(response))
    }

    async fn get_metrics(
        &self,
        _request: Request<MetricsRequest>,
    ) -> Result<Response<MetricsResponse>, Status> {
        Err(Status::unimplemented("Metrics not yet implemented"))
    }

    async fn get_circuit_breaker_status(
        &self,
        _request: Request<CircuitBreakerStatusRequest>,
    ) -> Result<Response<CircuitBreakerStatusResponse>, Status> {
        Err(Status::unimplemented(
            "Circuit breaker status not yet implemented",
        ))
    }
}
