use crate::types::RequestContext;
use tonic::{Request, Status};
use tracing::Span;
use uuid::Uuid;

/// Extract request context from gRPC metadata
pub fn extract_request_context<T>(request: &Request<T>) -> Result<RequestContext, Status> {
    let metadata = request.metadata();

    // Extract tenant_id (required)
    let tenant_id = metadata
        .get("x-tenant-id")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| Status::unauthenticated("Missing x-tenant-id header"))?
        .to_string();

    // Extract optional fields
    let request_id = metadata
        .get("x-request-id")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| Uuid::parse_str(s).ok())
        .unwrap_or_else(Uuid::new_v4);

    let user_id = metadata
        .get("x-user-id")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let idempotency_key = metadata
        .get("x-idempotency-key")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let correlation_id = metadata
        .get("x-correlation-id")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let mut context = RequestContext::new(tenant_id);
    context.request_id = request_id;
    context.user_id = user_id;
    context.idempotency_key = idempotency_key;
    context.correlation_id = correlation_id;

    Ok(context)
}

/// Add request context to tracing span
pub fn add_context_to_span(context: &RequestContext, span: &Span) {
    span.record("request_id", context.request_id.to_string().as_str());
    span.record("tenant_id", context.tenant_id.as_str());
    if let Some(ref user_id) = context.user_id {
        span.record("user_id", user_id.as_str());
    }
    if let Some(ref correlation_id) = context.correlation_id {
        span.record("correlation_id", correlation_id.as_str());
    }
}

/// Logging interceptor for gRPC requests
pub mod logging_interceptor {
    use tonic::{Request, Status};
    use tracing::{info, instrument};

    #[instrument(skip(request), fields(
        method = ?request.uri(),
        request_id = tracing::field::Empty,
        tenant_id = tracing::field::Empty,
        user_id = tracing::field::Empty,
    ))]
    pub fn log_request<T>(request: &Request<T>) -> Result<(), Status> {
        let metadata = request.metadata();

        if let Some(request_id) = metadata.get("x-request-id") {
            if let Ok(id) = request_id.to_str() {
                tracing::Span::current().record("request_id", id);
            }
        }

        if let Some(tenant_id) = metadata.get("x-tenant-id") {
            if let Ok(id) = tenant_id.to_str() {
                tracing::Span::current().record("tenant_id", id);
            }
        }

        if let Some(user_id) = metadata.get("x-user-id") {
            if let Ok(id) = user_id.to_str() {
                tracing::Span::current().record("user_id", id);
            }
        }

        info!("Received gRPC request");
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tonic::metadata::MetadataMap;

    #[test]
    fn test_extract_request_context_missing_tenant() {
        let mut request = Request::new(());
        let result = extract_request_context(&request);
        assert!(result.is_err());
    }

    #[test]
    fn test_extract_request_context_success() {
        let mut request = Request::new(());
        let metadata = request.metadata_mut();
        metadata.insert("x-tenant-id", "tenant-123".parse().unwrap());
        metadata.insert("x-user-id", "user-456".parse().unwrap());

        let context = extract_request_context(&request).unwrap();
        assert_eq!(context.tenant_id, "tenant-123");
        assert_eq!(context.user_id, Some("user-456".to_string()));
    }
}
