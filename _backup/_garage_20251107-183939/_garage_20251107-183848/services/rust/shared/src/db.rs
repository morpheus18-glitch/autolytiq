use crate::config::DatabaseConfig;
use crate::error::{AppError, Result};
use diesel::pg::PgConnection;
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use diesel::RunQueryDsl;
use std::time::Duration;
use tracing::{info, instrument};

pub type DbPool = Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = PooledConnection<ConnectionManager<PgConnection>>;

#[instrument(skip(config))]
pub fn create_pool(config: &DatabaseConfig) -> Result<DbPool> {
    info!(
        url = %mask_password(&config.url),
        max_connections = config.max_connections,
        "Creating database connection pool"
    );

    let manager = ConnectionManager::<PgConnection>::new(&config.url);

    let pool = Pool::builder()
        .max_size(config.max_connections)
        .min_idle(config.min_connections)
        .connection_timeout(Duration::from_secs(config.connection_timeout_seconds))
        .build(manager)
        .map_err(AppError::Pool)?;

    info!("Database connection pool created");

    Ok(pool)
}

pub async fn test_connection(pool: &DbPool) -> Result<()> {
    let mut conn = pool.get().map_err(AppError::Pool)?;
    diesel::sql_query("SELECT 1")
        .execute(&mut conn)
        .map_err(AppError::from)?;
    Ok(())
}

/// Mask password in database URL for logging
fn mask_password(url: &str) -> String {
    if let Some(at_pos) = url.rfind('@') {
        if let Some(colon_pos) = url[..at_pos].rfind(':') {
            let mut masked = url.to_string();
            masked.replace_range(colon_pos + 1..at_pos, "****");
            return masked;
        }
    }
    url.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mask_password() {
        let url = "postgresql://user:secret123@localhost:5432/db";
        let masked = mask_password(url);
        assert_eq!(masked, "postgresql://user:****@localhost:5432/db");
    }

    #[test]
    fn test_mask_password_no_password() {
        let url = "postgresql://localhost:5432/db";
        let masked = mask_password(url);
        assert_eq!(masked, "postgresql://localhost:5432/db");
    }
}
