use crate::config::TelemetryConfig;
use opentelemetry::{global, KeyValue};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{
    trace::{self, RandomIdGenerator, Sampler},
    Resource,
};
use tracing::info;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

pub fn init_telemetry(config: &TelemetryConfig) -> anyhow::Result<()> {
    if !config.enabled {
        info!("Telemetry disabled");
        return Ok(());
    }

    let endpoint = config
        .endpoint
        .clone()
        .unwrap_or_else(|| "http://localhost:4317".to_string());

    info!(
        endpoint = %endpoint,
        service_name = %config.service_name,
        "Initializing telemetry"
    );

    // Create OTLP exporter
    let exporter = opentelemetry_otlp::new_exporter()
        .tonic()
        .with_endpoint(&endpoint);

    // Create tracer provider
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(exporter)
        .with_trace_config(
            trace::config()
                .with_sampler(Sampler::AlwaysOn)
                .with_id_generator(RandomIdGenerator::default())
                .with_resource(Resource::new(vec![
                    KeyValue::new("service.name", config.service_name.clone()),
                    KeyValue::new("service.version", env!("CARGO_PKG_VERSION")),
                ])),
        )
        .install_batch(opentelemetry_sdk::runtime::Tokio)?;

    // Create tracing layer
    let telemetry_layer = tracing_opentelemetry::layer().with_tracer(tracer);

    // Initialize subscriber with telemetry layer
    tracing_subscriber::registry()
        .with(telemetry_layer)
        .try_init()?;

    info!("Telemetry initialized successfully");
    Ok(())
}

pub fn shutdown_telemetry() {
    global::shutdown_tracer_provider();
}
