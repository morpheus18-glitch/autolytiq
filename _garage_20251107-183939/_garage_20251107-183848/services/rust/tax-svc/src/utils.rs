/// Lookup county from postal code (mock implementation)
pub fn lookup_county(postal: &str, state: &str) -> String {
    match state.to_uppercase().as_str() {
        "CA" => {
            if postal.starts_with("900") || postal.starts_with("901") {
                "Los Angeles".to_string()
            } else if postal.starts_with("920") || postal.starts_with("921") {
                "San Diego".to_string()
            } else if postal.starts_with("941") || postal.starts_with("945") {
                "San Francisco".to_string()
            } else {
                "Orange".to_string()
            }
        }
        "TX" => {
            if postal.starts_with("770") || postal.starts_with("772") {
                "Harris".to_string()
            } else if postal.starts_with("752") || postal.starts_with("753") {
                "Dallas".to_string()
            } else if postal.starts_with("787") {
                "Travis".to_string()
            } else {
                "Bexar".to_string()
            }
        }
        "FL" => {
            if postal.starts_with("331") || postal.starts_with("339") {
                "Miami-Dade".to_string()
            } else if postal.starts_with("337") {
                "Broward".to_string()
            } else {
                "Orange".to_string()
            }
        }
        _ => "Unknown".to_string(),
    }
}
