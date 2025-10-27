use config::{Config, ConfigError, Environment, File};
use serde::Deserialize;
use std::env;

#[derive(Debug, Clone, Deserialize)]
pub struct AppConfig {
    pub service: ServiceConfig,
    pub database: DatabaseConfig,
    pub redis: RedisConfig,
    pub logging: LoggingConfig,
    pub telemetry: TelemetryConfig,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ServiceConfig {
    pub name: String,
    pub version: String,
    pub host: String,
    pub port: u16,
    pub workers: Option<usize>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
    pub min_connections: Option<u32>,
    pub connection_timeout_seconds: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RedisConfig {
    pub url: String,
    pub pool_size: u32,
    pub connection_timeout_seconds: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub format: String, // "json" or "pretty"
}

#[derive(Debug, Clone, Deserialize)]
pub struct TelemetryConfig {
    pub enabled: bool,
    pub endpoint: Option<String>,
    pub service_name: String,
}

impl AppConfig {
    pub fn load(service_name: &str) -> Result<Self, ConfigError> {
        // Load .env file if present
        dotenvy::dotenv().ok();

        let environment = env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string());

        let config = Config::builder()
            // Default values
            .set_default("service.name", service_name)?
            .set_default("service.version", env!("CARGO_PKG_VERSION"))?
            .set_default("service.host", "0.0.0.0")?
            .set_default("service.port", 50051)?
            .set_default("database.max_connections", 10)?
            .set_default("database.connection_timeout_seconds", 30)?
            .set_default("redis.pool_size", 10)?
            .set_default("redis.connection_timeout_seconds", 5)?
            .set_default("logging.level", "info")?
            .set_default("logging.format", "json")?
            .set_default("telemetry.enabled", false)?
            .set_default("telemetry.service_name", service_name)?
            // Load base config file
            .add_source(
                File::with_name(&format!("config/{}", service_name))
                    .required(false)
            )
            // Load environment-specific config
            .add_source(
                File::with_name(&format!("config/{}.{}", service_name, environment))
                    .required(false)
            )
            // Override with environment variables (e.g., SERVICE__PORT=50052)
            .add_source(
                Environment::with_prefix(&service_name.to_uppercase().replace("-", "_"))
                    .separator("__")
            )
            .build()?;

        config.try_deserialize()
    }

    pub fn database_url(&self) -> &str {
        &self.database.url
    }

    pub fn redis_url(&self) -> &str {
        &self.redis.url
    }

    pub fn service_address(&self) -> String {
        format!("{}:{}", self.service.host, self.service.port)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_service_address() {
        let config = AppConfig {
            service: ServiceConfig {
                name: "test".to_string(),
                version: "1.0.0".to_string(),
                host: "127.0.0.1".to_string(),
                port: 8080,
                workers: None,
            },
            database: DatabaseConfig {
                url: "postgresql://localhost/test".to_string(),
                max_connections: 10,
                min_connections: None,
                connection_timeout_seconds: 30,
            },
            redis: RedisConfig {
                url: "redis://localhost".to_string(),
                pool_size: 10,
                connection_timeout_seconds: 5,
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                format: "json".to_string(),
            },
            telemetry: TelemetryConfig {
                enabled: false,
                endpoint: None,
                service_name: "test".to_string(),
            },
        };

        assert_eq!(config.service_address(), "127.0.0.1:8080");
    }
}
