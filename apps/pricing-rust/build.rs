fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_server(true)
        .compile(&["proto/pricing/v1/pricing.proto"], &["proto"])?;
    Ok(())
}
