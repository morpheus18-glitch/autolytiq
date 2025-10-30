use crate::config::RedisConfig;
use crate::error::Result;
use redis::{aio::ConnectionManager, AsyncCommands, Client};
use std::time::Duration;
use tracing::{info, instrument};

pub struct RedisClient {
    manager: ConnectionManager,
}

impl RedisClient {
    #[instrument(skip(config))]
    pub async fn new(config: &RedisConfig) -> Result<Self> {
        info!(url = %config.url, "Connecting to Redis");

        let client = Client::open(config.url.clone())?;
        let manager = ConnectionManager::new(client).await?;

        info!("Redis connection established");

        Ok(Self { manager })
    }

    #[instrument(skip(self))]
    pub async fn get(&mut self, key: &str) -> Result<Option<String>> {
        let result: Option<String> = self.manager.get(key).await?;
        Ok(result)
    }

    #[instrument(skip(self))]
    pub async fn get_bytes(&mut self, key: &str) -> Result<Option<Vec<u8>>> {
        let result: Option<Vec<u8>> = self.manager.get(key).await?;
        Ok(result)
    }

    #[instrument(skip(self, value))]
    pub async fn set(&mut self, key: &str, value: &str, ttl: Option<Duration>) -> Result<()> {
        if let Some(ttl) = ttl {
            self.manager
                .set_ex::<_, _, ()>(key, value, ttl.as_secs())
                .await?;
        } else {
            self.manager.set::<_, _, ()>(key, value).await?;
        }
        Ok(())
    }

    #[instrument(skip(self, value))]
    pub async fn set_bytes(
        &mut self,
        key: &str,
        value: &[u8],
        ttl: Option<Duration>,
    ) -> Result<()> {
        if let Some(ttl) = ttl {
            self.manager
                .set_ex::<_, _, ()>(key, value, ttl.as_secs())
                .await?;
        } else {
            self.manager.set::<_, _, ()>(key, value).await?;
        }
        Ok(())
    }

    #[instrument(skip(self))]
    pub async fn delete(&mut self, key: &str) -> Result<bool> {
        let deleted: i32 = self.manager.del(key).await?;
        Ok(deleted > 0)
    }

    #[instrument(skip(self))]
    pub async fn exists(&mut self, key: &str) -> Result<bool> {
        let exists: bool = self.manager.exists(key).await?;
        Ok(exists)
    }

    #[instrument(skip(self))]
    pub async fn ttl(&mut self, key: &str) -> Result<i64> {
        let ttl: i64 = self.manager.ttl(key).await?;
        Ok(ttl)
    }

    #[instrument(skip(self))]
    pub async fn keys(&mut self, pattern: &str) -> Result<Vec<String>> {
        let keys: Vec<String> = self.manager.keys(pattern).await?;
        Ok(keys)
    }

    #[instrument(skip(self))]
    pub async fn delete_pattern(&mut self, pattern: &str) -> Result<usize> {
        let keys: Vec<String> = self.manager.keys(pattern).await?;
        if keys.is_empty() {
            return Ok(0);
        }
        let deleted: i32 = self.manager.del(&keys).await?;
        Ok(deleted as usize)
    }

    #[instrument(skip(self))]
    pub async fn ping(&mut self) -> Result<bool> {
        let pong: String = redis::cmd("PING").query_async(&mut self.manager).await?;
        Ok(pong == "PONG")
    }

    /// Set if not exists (for idempotency)
    #[instrument(skip(self, value))]
    pub async fn set_nx(&mut self, key: &str, value: &[u8], ttl: Duration) -> Result<bool> {
        let response: Option<String> = redis::cmd("SET")
            .arg(key)
            .arg(value)
            .arg("NX")
            .arg("EX")
            .arg(ttl.as_secs())
            .query_async(&mut self.manager)
            .await?;
        Ok(response.is_some())
    }

    /// Atomic increment
    #[instrument(skip(self))]
    pub async fn incr(&mut self, key: &str) -> Result<i64> {
        let value: i64 = self.manager.incr(key, 1).await?;
        Ok(value)
    }

    /// Atomic decrement
    #[instrument(skip(self))]
    pub async fn decr(&mut self, key: &str) -> Result<i64> {
        let value: i64 = self.manager.decr(key, 1).await?;
        Ok(value)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Integration tests require Redis running
    // Run with: cargo test --features integration-tests
}
