use crate::models::{CompetitiveRange, MarketComp, MarketStats};
use rust_decimal::{prelude::ToPrimitive, Decimal};
use rust_decimal_macros::dec;
use tracing::{info, instrument};

pub struct MarketPricingService;

impl MarketPricingService {
    pub fn new() -> Self {
        Self
    }

    /// Calculate competitive pricing range from market comparables
    #[instrument(skip(self, comps))]
    pub fn calculate_competitive_range(&self, comps: &[MarketComp]) -> Option<CompetitiveRange> {
        if comps.is_empty() {
            return None;
        }

        let mut prices: Vec<Decimal> = comps.iter().map(|c| c.price).collect();
        prices.sort();

        let comp_count = prices.len();

        // Calculate percentiles
        let floor_price = self.percentile(&prices, 0.25);
        let target_price = self.percentile(&prices, 0.50); // Median
        let ceiling_price = self.percentile(&prices, 0.75);

        // Calculate average
        let total: Decimal = prices.iter().sum();
        let average_price = total / Decimal::from(comp_count);

        // Calculate average days on market
        let total_days: i32 = comps.iter().map(|c| c.days_on_market).sum();
        let days_to_sale_avg = if comp_count > 0 {
            total_days / comp_count as i32
        } else {
            0
        };

        info!(
            comp_count = comp_count,
            floor_price = %floor_price,
            target_price = %target_price,
            ceiling_price = %ceiling_price,
            "Calculated competitive range"
        );

        Some(CompetitiveRange {
            floor_price,
            target_price,
            ceiling_price,
            average_price,
            comp_count,
            days_to_sale_avg,
        })
    }

    /// Calculate market statistics
    #[instrument(skip(self, comps, filtered_comps))]
    pub fn calculate_market_stats(
        &self,
        comps: &[MarketComp],
        filtered_comps: &[MarketComp],
    ) -> MarketStats {
        let prices: Vec<Decimal> = filtered_comps.iter().map(|c| c.price).collect();
        let mileages: Vec<i32> = filtered_comps.iter().map(|c| c.mileage).collect();

        let price_std_dev = self.standard_deviation(&prices);
        let mileage_std_dev = self.standard_deviation_i32(&mileages);

        // Calculate price per mile
        let total_price: Decimal = filtered_comps.iter().map(|c| c.price).sum();
        let total_mileage: i32 = filtered_comps.iter().map(|c| c.mileage).sum();
        let price_per_mile = if total_mileage > 0 {
            total_price / Decimal::from(total_mileage)
        } else {
            dec!(0)
        };

        MarketStats {
            total_comps_found: comps.len(),
            comps_used: filtered_comps.len(),
            price_std_dev,
            mileage_std_dev,
            price_per_mile,
        }
    }

    /// Filter comparables by match criteria
    #[instrument(skip(self, comps))]
    pub fn filter_comparables(
        &self,
        comps: Vec<MarketComp>,
        min_match_score: f64,
        max_comps: usize,
    ) -> Vec<MarketComp> {
        let mut filtered: Vec<MarketComp> = comps
            .into_iter()
            .filter(|c| c.match_score >= min_match_score)
            .collect();

        // Sort by match score (descending) and then by recency
        filtered.sort_by(|a, b| {
            b.match_score
                .partial_cmp(&a.match_score)
                .unwrap()
                .then_with(|| b.sale_date.cmp(&a.sale_date))
        });

        // Take top N comparables
        filtered.truncate(max_comps);

        info!(
            filtered_count = filtered.len(),
            "Filtered comparables by match score"
        );

        filtered
    }

    /// Calculate match score between target vehicle and comp
    pub fn calculate_match_score(
        &self,
        target_year: i32,
        target_mileage: i32,
        comp_year: i32,
        comp_mileage: i32,
        year_variance: i32,
        mileage_variance: i32,
    ) -> f64 {
        // Year similarity (0-1)
        let year_diff = (target_year - comp_year).abs();
        let year_score = if year_diff <= year_variance {
            1.0 - (year_diff as f64 / year_variance as f64) * 0.5
        } else {
            0.0
        };

        // Mileage similarity (0-1)
        let mileage_diff = (target_mileage - comp_mileage).abs();
        let mileage_score = if mileage_diff <= mileage_variance {
            1.0 - (mileage_diff as f64 / mileage_variance as f64) * 0.5
        } else {
            0.0
        };

        // Weighted average (year is more important)
        let match_score = (year_score * 0.6) + (mileage_score * 0.4);

        match_score.max(0.0).min(1.0)
    }

    /// Calculate percentile from sorted array
    fn percentile(&self, sorted_values: &[Decimal], percentile: f64) -> Decimal {
        if sorted_values.is_empty() {
            return dec!(0);
        }

        let index = (sorted_values.len() as f64 * percentile) as usize;
        let index = index.min(sorted_values.len() - 1);

        sorted_values[index]
    }

    /// Calculate standard deviation for Decimal values
    fn standard_deviation(&self, values: &[Decimal]) -> f64 {
        if values.is_empty() {
            return 0.0;
        }

        let mean: Decimal = values.iter().sum::<Decimal>() / Decimal::from(values.len());
        let variance: f64 = values
            .iter()
            .map(|v| {
                let diff = (*v - mean).to_f64().unwrap_or(0.0);
                diff * diff
            })
            .sum::<f64>()
            / values.len() as f64;

        variance.sqrt()
    }

    /// Calculate standard deviation for i32 values
    fn standard_deviation_i32(&self, values: &[i32]) -> f64 {
        if values.is_empty() {
            return 0.0;
        }

        let mean = values.iter().sum::<i32>() as f64 / values.len() as f64;
        let variance: f64 = values
            .iter()
            .map(|v| {
                let diff = *v as f64 - mean;
                diff * diff
            })
            .sum::<f64>()
            / values.len() as f64;

        variance.sqrt()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;

    fn create_test_comp(price: f64, days_on_market: i32, match_score: f64) -> MarketComp {
        MarketComp {
            id: "test".to_string(),
            vin: "TEST123".to_string(),
            year: 2020,
            make: "Test".to_string(),
            model: "Model".to_string(),
            trim: None,
            mileage: 50000,
            price: Decimal::from_f64_retain(price).unwrap(),
            days_on_market,
            sale_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            source: "test".to_string(),
            match_score,
        }
    }

    #[test]
    fn test_calculate_competitive_range() {
        let service = MarketPricingService::new();
        let comps = vec![
            create_test_comp(20000.0, 30, 0.9),
            create_test_comp(22000.0, 25, 0.85),
            create_test_comp(24000.0, 20, 0.8),
            create_test_comp(26000.0, 15, 0.75),
            create_test_comp(28000.0, 10, 0.7),
        ];

        let range = service.calculate_competitive_range(&comps).unwrap();

        assert_eq!(range.comp_count, 5);
        assert!(range.target_price >= range.floor_price);
        assert!(range.ceiling_price >= range.target_price);
    }

    #[test]
    fn test_calculate_match_score() {
        let service = MarketPricingService::new();

        // Perfect match
        let score = service.calculate_match_score(2020, 50000, 2020, 50000, 2, 20000);
        assert_eq!(score, 1.0);

        // Year difference
        let score = service.calculate_match_score(2020, 50000, 2018, 50000, 2, 20000);
        assert!(score < 1.0 && score > 0.0);

        // Mileage difference
        let score = service.calculate_match_score(2020, 50000, 2020, 60000, 2, 20000);
        assert!(score < 1.0 && score > 0.0);
    }

    #[test]
    fn test_filter_comparables() {
        let service = MarketPricingService::new();
        let comps = vec![
            create_test_comp(20000.0, 30, 0.9),
            create_test_comp(22000.0, 25, 0.5), // Below threshold
            create_test_comp(24000.0, 20, 0.8),
            create_test_comp(26000.0, 15, 0.3), // Below threshold
        ];

        let filtered = service.filter_comparables(comps, 0.7, 10);

        assert_eq!(filtered.len(), 2);
        assert_eq!(filtered[0].match_score, 0.9); // Highest score first
    }
}
