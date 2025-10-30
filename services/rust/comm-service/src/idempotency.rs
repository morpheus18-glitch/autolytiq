use shared::error::Result;
use shared::redis_client::RedisClient;
use std::time::Duration;
use tracing::{info, instrument};

pub struct IdempotencyManager {
    ttl: Duration,
}

impl IdempotencyManager {
    pub fn new(ttl_seconds: u64) -> Self {
        Self {
            ttl: Duration::from_secs(ttl_seconds),
        }
    }

    /// Check if a request with this idempotency key was already processed
    #[instrument(skip(self, redis))]
    pub async fn check_cached_response(
        &self,
        redis: &mut RedisClient,
        tenant_id: &str,
        idempotency_key: &str,
    ) -> Result<Option<Vec<u8>>> {
        let cache_key = self.build_key(tenant_id, idempotency_key);
        let cached = redis.get_bytes(&cache_key).await?;

        if cached.is_some() {
            info!(
                tenant_id = tenant_id,
                idempotency_key = idempotency_key,
                "Idempotency cache hit"
            );
        }

        Ok(cached)
    }

    /// Cache a response for future idempotent requests
    #[instrument(skip(self, redis, response))]
    pub async fn cache_response(
        &self,
        redis: &mut RedisClient,
        tenant_id: &str,
        idempotency_key: &str,
        response: &[u8],
    ) -> Result<()> {
        let cache_key = self.build_key(tenant_id, idempotency_key);
        redis
            .set_bytes(&cache_key, response, Some(self.ttl))
            .await?;

        info!(
            tenant_id = tenant_id,
            idempotency_key = idempotency_key,
            ttl_seconds = self.ttl.as_secs(),
            "Cached response for idempotency"
        );

        Ok(())
    }

    fn build_key(&self, tenant_id: &str, idempotency_key: &str) -> String {
        format!("idempotency:{}:{}", tenant_id, idempotency_key)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_key() {
        let manager = IdempotencyManager::new(86400);
        let key = manager.build_key("tenant1", "key123");
        assert_eq!(key, "idempotency:tenant1:key123");
    }
}
