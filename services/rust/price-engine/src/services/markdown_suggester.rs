use crate::config::AgingBand;
use crate::models::{CompetitiveRange, MarkdownSuggestion};
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use tracing::{info, instrument};

pub struct MarkdownSuggesterService;

impl MarkdownSuggesterService {
    pub fn new() -> Self {
        Self
    }

    /// Suggest price markdown based on aging and market position
    #[instrument(skip(self, aging_bands))]
    pub fn suggest_markdown(
        &self,
        current_price: Decimal,
        cost: Decimal,
        days_in_stock: i32,
        market_range: Option<&CompetitiveRange>,
        aging_bands: &[AgingBand],
    ) -> MarkdownSuggestion {
        // Find applicable aging band
        let aging_band = self.find_aging_band(days_in_stock, aging_bands);

        // Calculate base markdown from aging
        let aging_markdown_pct = aging_band
            .as_ref()
            .map(|b| b.markdown_percentage)
            .unwrap_or(0.0);

        // Calculate competitive position (0.0 = at/below floor, 1.0 = at/above ceiling)
        let competitive_position = market_range
            .map(|range| self.calculate_competitive_position(current_price, range))
            .unwrap_or(0.5);

        // Adjust markdown based on competitive position
        // If price is high (>0.75), increase markdown
        // If price is low (<0.25), reduce markdown
        let position_adjustment = if competitive_position > 0.75 {
            2.0 // Double the markdown if priced too high
        } else if competitive_position < 0.25 {
            0.5 // Reduce markdown if already competitive
        } else {
            1.0 // Standard markdown
        };

        let total_markdown_pct = aging_markdown_pct * position_adjustment;

        // Calculate suggested price
        let markdown_amount = current_price * Decimal::from_f64_retain(total_markdown_pct / 100.0)
            .unwrap_or(dec!(0));
        let suggested_price = current_price - markdown_amount;

        // Ensure we don't go below cost (maintain minimum $500 margin)
        let minimum_price = cost + dec!(500);
        let (final_price, final_markdown) = if suggested_price < minimum_price {
            let adjusted_markdown = current_price - minimum_price;
            (minimum_price, adjusted_markdown)
        } else {
            (suggested_price, markdown_amount)
        };

        let final_markdown_pct = if current_price > dec!(0) {
            (final_markdown / current_price * dec!(100))
                .to_f64()
                .unwrap_or(0.0)
        } else {
            0.0
        };

        // Calculate projected gross
        let projected_gross = final_price - cost;

        // Estimate days to sale based on competitive position
        let estimated_days_to_sale = self.estimate_days_to_sale(
            competitive_position,
            days_in_stock,
            market_range,
        );

        // Generate recommendation text
        let recommendation = self.generate_recommendation(
            days_in_stock,
            competitive_position,
            final_markdown_pct,
            projected_gross,
        );

        let aging_band_text = aging_band
            .map(|b| format!("{}-{} days", b.days_threshold - 15, b.days_threshold))
            .unwrap_or_else(|| "0-30 days".to_string());

        info!(
            current_price = %current_price,
            suggested_price = %final_price,
            markdown_pct = final_markdown_pct,
            days_in_stock = days_in_stock,
            competitive_position = competitive_position,
            "Generated markdown suggestion"
        );

        MarkdownSuggestion {
            suggested_price: final_price,
            markdown_amount: final_markdown,
            markdown_percentage: final_markdown_pct,
            aging_band: aging_band_text,
            competitive_position,
            recommendation,
            projected_gross,
            estimated_days_to_sale,
        }
    }

    /// Find the applicable aging band for the given days in stock
    fn find_aging_band<'a>(
        &self,
        days_in_stock: i32,
        aging_bands: &'a [AgingBand],
    ) -> Option<&'a AgingBand> {
        // Sort bands by threshold and find the first one that applies
        let mut applicable_band: Option<&AgingBand> = None;

        for band in aging_bands {
            if days_in_stock >= band.days_threshold {
                applicable_band = Some(band);
            }
        }

        applicable_band
    }

    /// Calculate where the current price sits in the competitive range
    /// Returns 0.0-1.0 where 0.0 = at/below floor, 1.0 = at/above ceiling
    fn calculate_competitive_position(
        &self,
        current_price: Decimal,
        range: &CompetitiveRange,
    ) -> f64 {
        if range.floor_price == range.ceiling_price {
            return 0.5;
        }

        if current_price <= range.floor_price {
            return 0.0;
        }

        if current_price >= range.ceiling_price {
            return 1.0;
        }

        let range_span = range.ceiling_price - range.floor_price;
        let price_above_floor = current_price - range.floor_price;

        (price_above_floor / range_span).to_f64().unwrap_or(0.5)
    }

    /// Estimate days to sale based on competitive position and market data
    fn estimate_days_to_sale(
        &self,
        competitive_position: f64,
        current_days_in_stock: i32,
        market_range: Option<&CompetitiveRange>,
    ) -> i32 {
        let base_days = market_range
            .map(|r| r.days_to_sale_avg)
            .unwrap_or(45);

        // Adjust based on competitive position
        // Lower position = sells faster
        let position_multiplier = if competitive_position < 0.25 {
            0.7 // Priced aggressively, should sell in 70% of avg time
        } else if competitive_position > 0.75 {
            1.5 // Priced high, will take 150% of avg time
        } else {
            1.0 // Average position, average time
        };

        let estimated_days = (base_days as f64 * position_multiplier) as i32;

        // If already past estimated days, add a bit more time
        if current_days_in_stock >= estimated_days {
            estimated_days + 15
        } else {
            estimated_days
        }
    }

    /// Generate human-readable recommendation
    fn generate_recommendation(
        &self,
        days_in_stock: i32,
        competitive_position: f64,
        markdown_pct: f64,
        projected_gross: Decimal,
    ) -> String {
        let aging_urgency = if days_in_stock < 30 {
            "fresh inventory"
        } else if days_in_stock < 60 {
            "approaching aging threshold"
        } else if days_in_stock < 90 {
            "aged inventory requiring attention"
        } else {
            "critical aging situation"
        };

        let price_position = if competitive_position < 0.25 {
            "very competitive"
        } else if competitive_position < 0.50 {
            "competitive"
        } else if competitive_position < 0.75 {
            "above market average"
        } else {
            "significantly above market"
        };

        let action = if markdown_pct > 5.0 {
            "Aggressive markdown recommended"
        } else if markdown_pct > 2.0 {
            "Moderate markdown suggested"
        } else if markdown_pct > 0.0 {
            "Light markdown suggested"
        } else {
            "Price is competitive, monitor market"
        };

        format!(
            "{} to move {} unit currently priced {}. {} at {:.1}% markdown, maintaining ${:.0} gross profit.",
            action,
            aging_urgency,
            price_position,
            if markdown_pct > 0.0 { "Reduce price" } else { "Hold steady" },
            markdown_pct,
            projected_gross
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_range() -> CompetitiveRange {
        CompetitiveRange {
            floor_price: dec!(20000),
            target_price: dec!(24000),
            ceiling_price: dec!(28000),
            average_price: dec!(24000),
            comp_count: 10,
            days_to_sale_avg: 35,
        }
    }

    fn create_test_aging_bands() -> Vec<AgingBand> {
        vec![
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
        ]
    }

    #[test]
    fn test_calculate_competitive_position() {
        let service = MarkdownSuggesterService::new();
        let range = create_test_range();

        // At floor
        let pos = service.calculate_competitive_position(dec!(20000), &range);
        assert_eq!(pos, 0.0);

        // At ceiling
        let pos = service.calculate_competitive_position(dec!(28000), &range);
        assert_eq!(pos, 1.0);

        // At midpoint
        let pos = service.calculate_competitive_position(dec!(24000), &range);
        assert!((pos - 0.5).abs() < 0.01);
    }

    #[test]
    fn test_find_aging_band() {
        let service = MarkdownSuggesterService::new();
        let bands = create_test_aging_bands();

        // 35 days -> should match 30-day band
        let band = service.find_aging_band(35, &bands).unwrap();
        assert_eq!(band.days_threshold, 30);

        // 50 days -> should match 45-day band
        let band = service.find_aging_band(50, &bands).unwrap();
        assert_eq!(band.days_threshold, 45);

        // 100 days -> should match 90-day band
        let band = service.find_aging_band(100, &bands).unwrap();
        assert_eq!(band.days_threshold, 90);
    }

    #[test]
    fn test_suggest_markdown_fresh_inventory() {
        let service = MarkdownSuggesterService::new();
        let range = create_test_range();
        let bands = create_test_aging_bands();

        // Fresh inventory (25 days), competitive price
        let suggestion = service.suggest_markdown(
            dec!(24000), // current price (at target)
            dec!(20000), // cost
            25,          // days in stock
            Some(&range),
            &bands,
        );

        // Should suggest minimal or no markdown
        assert!(suggestion.markdown_percentage < 1.0);
        assert!(suggestion.projected_gross > dec!(3000));
    }

    #[test]
    fn test_suggest_markdown_aged_overpriced() {
        let service = MarkdownSuggesterService::new();
        let range = create_test_range();
        let bands = create_test_aging_bands();

        // Aged inventory (65 days), priced high
        let suggestion = service.suggest_markdown(
            dec!(29000), // current price (above ceiling)
            dec!(20000), // cost
            65,          // days in stock
            Some(&range),
            &bands,
        );

        // Should suggest significant markdown
        assert!(suggestion.markdown_percentage > 5.0);
        assert!(suggestion.competitive_position > 0.75);
    }

    #[test]
    fn test_markdown_doesnt_go_below_minimum() {
        let service = MarkdownSuggesterService::new();
        let range = create_test_range();
        let bands = create_test_aging_bands();

        // Very aged, but low cost
        let suggestion = service.suggest_markdown(
            dec!(21000), // current price
            dec!(20000), // cost (close to price)
            100,         // days in stock
            Some(&range),
            &bands,
        );

        // Should maintain at least $500 margin
        assert!(suggestion.suggested_price >= dec!(20500));
        assert!(suggestion.projected_gross >= dec!(500));
    }
}
