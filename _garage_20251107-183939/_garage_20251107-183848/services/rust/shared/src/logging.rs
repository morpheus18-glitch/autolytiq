use tracing_subscriber::{
    fmt::{self, format::FmtSpan},
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter, Layer,
};

pub fn init_logging(service_name: &str, log_level: &str, format: &str) {
    let env_filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new(log_level))
        .unwrap_or_else(|_| EnvFilter::new("info"));

    let fmt_layer = match format {
        "json" => fmt::layer()
            .json()
            .with_span_events(FmtSpan::CLOSE)
            .with_span_list(false)
            .with_target(true)
            .with_thread_ids(true)
            .with_thread_names(true)
            .with_filter(env_filter)
            .boxed(),
        _ => fmt::layer()
            .pretty()
            .with_span_events(FmtSpan::CLOSE)
            .with_target(true)
            .with_thread_ids(true)
            .with_thread_names(true)
            .with_filter(env_filter)
            .boxed(),
    };

    tracing_subscriber::registry().with(fmt_layer).init();

    tracing::info!(
        service_name = service_name,
        log_level = log_level,
        "Logging initialized"
    );
}
