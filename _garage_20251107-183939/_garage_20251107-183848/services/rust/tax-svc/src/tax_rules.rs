use crate::models::{Jurisdiction, Fee};

/// Calculate sales tax for given state/county
pub fn calculate_tax_by_state(state: &str, county: &str, tax_basis: f64) -> Vec<Jurisdiction> {
    match state.to_uppercase().as_str() {
        "CA" => california_tax(county, tax_basis),
        "TX" => texas_tax(county, tax_basis),
        "FL" => florida_tax(county, tax_basis),
        _ => default_tax(state, tax_basis),
    }
}

/// Calculate state-specific fees
pub fn calculate_fees(state: &str) -> Vec<Fee> {
    match state.to_uppercase().as_str() {
        "CA" => california_fees(),
        "TX" => texas_fees(),
        "FL" => florida_fees(),
        _ => default_fees(),
    }
}

// California tax rates (mock)
fn california_tax(county: &str, basis: f64) -> Vec<Jurisdiction> {
    let state_rate = 0.0725;
    let county_rate = if county.contains("Los Angeles") {
        0.0100
    } else if county.contains("San Diego") {
        0.0075
    } else {
        0.0050
    };
    let local_rate = 0.0100;

    vec![
        Jurisdiction {
            name: "California State".to_string(),
            jurisdiction_type: "state".to_string(),
            rate: state_rate,
            amount: basis * state_rate,
        },
        Jurisdiction {
            name: format!("{} County", county),
            jurisdiction_type: "county".to_string(),
            rate: county_rate,
            amount: basis * county_rate,
        },
        Jurisdiction {
            name: "Local District".to_string(),
            jurisdiction_type: "district".to_string(),
            rate: local_rate,
            amount: basis * local_rate,
        },
    ]
}

fn california_fees() -> Vec<Fee> {
    vec![
        Fee {
            name: "Title Fee".to_string(),
            fee_type: "title".to_string(),
            amount: 60.0,
            required: true,
        },
        Fee {
            name: "Registration Fee".to_string(),
            fee_type: "registration".to_string(),
            amount: 200.0,
            required: true,
        },
        Fee {
            name: "Doc Fee".to_string(),
            fee_type: "doc".to_string(),
            amount: 85.0,
            required: false,
        },
    ]
}

// Texas tax rates (mock)
fn texas_tax(county: &str, basis: f64) -> Vec<Jurisdiction> {
    let state_rate = 0.0625;
    let local_rate = if county.contains("Harris") {
        0.0200
    } else if county.contains("Dallas") {
        0.0175
    } else {
        0.0100
    };

    vec![
        Jurisdiction {
            name: "Texas State".to_string(),
            jurisdiction_type: "state".to_string(),
            rate: state_rate,
            amount: basis * state_rate,
        },
        Jurisdiction {
            name: format!("{} Local", county),
            jurisdiction_type: "county".to_string(),
            rate: local_rate,
            amount: basis * local_rate,
        },
    ]
}

fn texas_fees() -> Vec<Fee> {
    vec![
        Fee {
            name: "Title Application Fee".to_string(),
            fee_type: "title".to_string(),
            amount: 33.0,
            required: true,
        },
        Fee {
            name: "Registration Fee".to_string(),
            fee_type: "registration".to_string(),
            amount: 75.0,
            required: true,
        },
        Fee {
            name: "Inspection Fee".to_string(),
            fee_type: "inspection".to_string(),
            amount: 25.50,
            required: true,
        },
    ]
}

// Florida tax rates (mock)
fn florida_tax(county: &str, basis: f64) -> Vec<Jurisdiction> {
    let state_rate = 0.06;
    let county_rate = if county.contains("Miami-Dade") {
        0.01
    } else {
        0.005
    };

    vec![
        Jurisdiction {
            name: "Florida State".to_string(),
            jurisdiction_type: "state".to_string(),
            rate: state_rate,
            amount: basis * state_rate,
        },
        Jurisdiction {
            name: format!("{} County", county),
            jurisdiction_type: "county".to_string(),
            rate: county_rate,
            amount: basis * county_rate,
        },
    ]
}

fn florida_fees() -> Vec<Fee> {
    vec![
        Fee {
            name: "Title Fee".to_string(),
            fee_type: "title".to_string(),
            amount: 77.25,
            required: true,
        },
        Fee {
            name: "Registration Fee".to_string(),
            fee_type: "registration".to_string(),
            amount: 225.0,
            required: true,
        },
    ]
}

// Default tax (7% flat)
fn default_tax(state: &str, basis: f64) -> Vec<Jurisdiction> {
    vec![Jurisdiction {
        name: format!("{} State", state),
        jurisdiction_type: "state".to_string(),
        rate: 0.07,
        amount: basis * 0.07,
    }]
}

fn default_fees() -> Vec<Fee> {
    vec![
        Fee {
            name: "Title Fee".to_string(),
            fee_type: "title".to_string(),
            amount: 50.0,
            required: true,
        },
        Fee {
            name: "Registration Fee".to_string(),
            fee_type: "registration".to_string(),
            amount: 100.0,
            required: true,
        },
    ]
}
