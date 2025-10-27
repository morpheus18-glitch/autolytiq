use thiserror::Error;
use tonic::{Code, Status};

pub type Result<T> = std::result::Result<T, AppError>;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] diesel::result::Error),

    #[error("Redis error: {0}")]
    Redis(#[from] redis::RedisError),

    #[error("Configuration error: {0}")]
    Config(#[from] config::ConfigError),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Service unavailable: {0}")]
    ServiceUnavailable(String),

    #[error("Timeout: {0}")]
    Timeout(String),

    #[error("Circuit breaker open: {0}")]
    CircuitBreakerOpen(String),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

impl From<AppError> for Status {
    fn from(err: AppError) -> Self {
        match err {
            AppError::NotFound(msg) => Status::not_found(msg),
            AppError::InvalidInput(msg) => Status::invalid_argument(msg),
            AppError::Unauthorized(msg) => Status::unauthenticated(msg),
            AppError::Forbidden(msg) => Status::permission_denied(msg),
            AppError::Timeout(msg) => Status::deadline_exceeded(msg),
            AppError::CircuitBreakerOpen(msg) => Status::unavailable(msg),
            AppError::ServiceUnavailable(msg) => Status::unavailable(msg),
            AppError::Database(e) => Status::internal(format!("Database error: {}", e)),
            AppError::Redis(e) => Status::internal(format!("Cache error: {}", e)),
            AppError::Config(e) => Status::internal(format!("Configuration error: {}", e)),
            AppError::Serialization(e) => Status::internal(format!("Serialization error: {}", e)),
            AppError::Internal(msg) => Status::internal(msg),
            AppError::Other(e) => Status::internal(format!("Internal error: {}", e)),
        }
    }
}

// Helper to convert gRPC Status to AppError
impl From<Status> for AppError {
    fn from(status: Status) -> Self {
        match status.code() {
            Code::NotFound => AppError::NotFound(status.message().to_string()),
            Code::InvalidArgument => AppError::InvalidInput(status.message().to_string()),
            Code::Unauthenticated => AppError::Unauthorized(status.message().to_string()),
            Code::PermissionDenied => AppError::Forbidden(status.message().to_string()),
            Code::DeadlineExceeded => AppError::Timeout(status.message().to_string()),
            Code::Unavailable => AppError::ServiceUnavailable(status.message().to_string()),
            _ => AppError::Internal(status.message().to_string()),
        }
    }
}
