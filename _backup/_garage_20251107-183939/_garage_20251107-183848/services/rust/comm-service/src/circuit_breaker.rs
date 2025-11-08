use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tracing::{info, warn};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum CircuitState {
    Closed,
    Open,
    HalfOpen,
}

pub struct CircuitBreaker {
    state: Arc<RwLock<CircuitBreakerState>>,
    failure_threshold: u32,
    timeout: Duration,
}

struct CircuitBreakerState {
    state: CircuitState,
    failure_count: u32,
    last_failure_time: Option<Instant>,
}

impl CircuitBreaker {
    pub fn new(failure_threshold: u32, timeout_seconds: u64) -> Self {
        Self {
            state: Arc::new(RwLock::new(CircuitBreakerState {
                state: CircuitState::Closed,
                failure_count: 0,
                last_failure_time: None,
            })),
            failure_threshold,
            timeout: Duration::from_secs(timeout_seconds),
        }
    }

    pub async fn call<F, Fut, T, E>(&self, operation: F) -> Result<T, E>
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = Result<T, E>>,
        E: From<String>,
    {
        // Check if circuit is open
        {
            let mut state = self.state.write().await;
            if state.state == CircuitState::Open {
                if let Some(last_failure) = state.last_failure_time {
                    if last_failure.elapsed() >= self.timeout {
                        info!("Circuit breaker transitioning to half-open");
                        state.state = CircuitState::HalfOpen;
                        state.failure_count = 0;
                    } else {
                        warn!("Circuit breaker is open, rejecting request");
                        return Err(E::from("Circuit breaker is open".to_string()));
                    }
                }
            }
        }

        // Execute operation
        match operation().await {
            Ok(result) => {
                self.on_success().await;
                Ok(result)
            }
            Err(e) => {
                self.on_failure().await;
                Err(e)
            }
        }
    }

    async fn on_success(&self) {
        let mut state = self.state.write().await;
        if state.state == CircuitState::HalfOpen {
            info!("Circuit breaker closing after successful request");
            state.state = CircuitState::Closed;
        }
        state.failure_count = 0;
    }

    async fn on_failure(&self) {
        let mut state = self.state.write().await;
        state.failure_count += 1;
        state.last_failure_time = Some(Instant::now());

        if state.failure_count >= self.failure_threshold {
            warn!(
                failure_count = state.failure_count,
                threshold = self.failure_threshold,
                "Circuit breaker opening due to failures"
            );
            state.state = CircuitState::Open;
        }
    }

    pub async fn get_state(&self) -> CircuitState {
        self.state.read().await.state
    }
}
