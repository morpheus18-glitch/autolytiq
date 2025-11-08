use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct PricingConfig {
    pub default_time_window_days: i32,
    pub default_year_variance: i32,
    pub default_mileage_variance: i32,
    pub default_radius_miles: i32,
    pub min_comparable_count: usize,
    pub default_aging_bands: Vec<AgingBand>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AgingBand {
    pub days_threshold: i32,
    pub markdown_percentage: f64,
}

impl Default for PricingConfig {
    fn default() -> Self {
        Self {
            default_time_window_days: 90,
            default_year_variance: 2,
            default_mileage_variance: 20000,
            default_radius_miles: 100,
            min_comparable_count: 5,
            default_aging_bands: vec![
                AgingBand {
                    days_threshold: 30,
                    markdown_percentage: 0.0,
                },
                AgingBand {
                    days_threshold: 45,
                    markdown_percentage: 2.0,
                },
                AgingBand {
                    days_threshold: 60,
                    markdown_percentage: 3.5,
                },
                AgingBand {
                    days_threshold: 90,
                    markdown_percentage: 5.0,
                },
            ],
        }
    }
}
