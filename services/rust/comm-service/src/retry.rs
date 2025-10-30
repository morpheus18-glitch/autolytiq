use std::time::Duration;
use tokio::time::sleep;
use tracing::{info, instrument, warn};

#[derive(Debug, Clone)]
pub struct RetryConfig {
    pub max_attempts: u32,
    pub initial_backoff_ms: u64,
    pub max_backoff_ms: u64,
    pub multiplier: f64,
    pub jitter_factor: f64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 5,
            initial_backoff_ms: 100,
            max_backoff_ms: 10000,
            multiplier: 2.0,
            jitter_factor: 0.25,
        }
    }
}

pub struct RetryExecutor {
    config: RetryConfig,
}

impl RetryExecutor {
    pub fn new(config: RetryConfig) -> Self {
        Self { config }
    }

    /// Execute an operation with retry logic
    #[instrument(skip(self, operation))]
    pub async fn execute<F, Fut, T, E>(&self, mut operation: F) -> Result<T, E>
    where
        F: FnMut() -> Fut,
        Fut: std::future::Future<Output = Result<T, E>>,
        E: std::fmt::Display,
    {
        let mut attempt = 1;
        let mut backoff_ms = self.config.initial_backoff_ms;

        loop {
            match operation().await {
                Ok(result) => {
                    if attempt > 1 {
                        info!(attempt = attempt, "Operation succeeded after retry");
                    }
                    return Ok(result);
                }
                Err(e) if attempt >= self.config.max_attempts => {
                    warn!(
                        attempt = attempt,
                        max_attempts = self.config.max_attempts,
                        error = %e,
                        "Operation failed after max retries"
                    );
                    return Err(e);
                }
                Err(e) => {
                    warn!(
                        attempt = attempt,
                        backoff_ms = backoff_ms,
                        error = %e,
                        "Operation failed, retrying"
                    );

                    // Apply jitter
                    let jitter = (backoff_ms as f64
                        * self.config.jitter_factor
                        * rand::random::<f64>()) as u64;
                    let actual_backoff = backoff_ms + jitter;

                    sleep(Duration::from_millis(actual_backoff)).await;

                    // Exponential backoff with cap
                    backoff_ms = ((backoff_ms as f64 * self.config.multiplier) as u64)
                        .min(self.config.max_backoff_ms);
                    attempt += 1;
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_retry_success_first_attempt() {
        let config = RetryConfig::default();
        let executor = RetryExecutor::new(config);

        let mut call_count = 0;
        let result = executor
            .execute(|| async {
                call_count += 1;
                Ok::<i32, String>(42)
            })
            .await;

        assert_eq!(result.unwrap(), 42);
        assert_eq!(call_count, 1);
    }

    #[tokio::test]
    async fn test_retry_success_after_failure() {
        let config = RetryConfig {
            max_attempts: 3,
            initial_backoff_ms: 10,
            max_backoff_ms: 100,
            multiplier: 2.0,
            jitter_factor: 0.1,
        };
        let executor = RetryExecutor::new(config);

        let mut call_count = 0;
        let result = executor
            .execute(|| async {
                call_count += 1;
                if call_count < 3 {
                    Err("fail")
                } else {
                    Ok(42)
                }
            })
            .await;

        assert_eq!(result.unwrap(), 42);
        assert_eq!(call_count, 3);
    }
}
