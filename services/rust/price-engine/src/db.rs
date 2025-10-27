use crate::models::MarketComp;
use chrono::NaiveDate;
use rust_decimal::Decimal;
use shared::db::DbPool;
use shared::error::{AppError, Result};
use tracing::instrument;

/// Query market comparables from database
/// This is a simplified implementation - in production, you'd use Diesel ORM with schema
#[instrument(skip(pool))]
pub async fn query_market_comps(
    pool: &DbPool,
    tenant_id: &str,
    year: i32,
    make: &str,
    model: &str,
    year_variance: i32,
    time_window_days: i32,
    max_results: i64,
) -> Result<Vec<MarketComp>> {
    // In a real implementation, this would use Diesel to query the database
    // For now, return empty vector as a placeholder
    // The actual query would be something like:
    //
    // use diesel::prelude::*;
    // market_comps::table
    //     .filter(market_comps::tenant_id.eq(tenant_id))
    //     .filter(market_comps::year.between(year - year_variance, year + year_variance))
    //     .filter(market_comps::make.eq(make))
    //     .filter(market_comps::model.eq(model))
    //     .filter(market_comps::sale_date.gt(now - time_window_days))
    //     .order(market_comps::sale_date.desc())
    //     .limit(max_results)
    //     .load::<MarketComp>(conn)?

    tracing::info!(
        tenant_id = tenant_id,
        year = year,
        make = make,
        model = model,
        "Querying market comps from database"
    );

    // Placeholder: Return empty vector
    // TODO: Implement actual database query using Diesel ORM
    Ok(vec![])
}

/// Helper function to calculate match score for database results
pub fn calculate_match_score_for_comp(
    target_year: i32,
    target_mileage: i32,
    comp: &MarketComp,
    year_variance: i32,
    mileage_variance: i32,
) -> f64 {
    // Year similarity
    let year_diff = (target_year - comp.year).abs();
    let year_score = if year_diff <= year_variance {
        1.0 - (year_diff as f64 / year_variance as f64) * 0.5
    } else {
        0.0
    };

    // Mileage similarity
    let mileage_diff = (target_mileage - comp.mileage).abs();
    let mileage_score = if mileage_diff <= mileage_variance {
        1.0 - (mileage_diff as f64 / mileage_variance as f64) * 0.5
    } else {
        0.0
    };

    // Weighted average
    (year_score * 0.6) + (mileage_score * 0.4)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_match_score() {
        let comp = MarketComp {
            id: "test".to_string(),
            vin: "TEST123".to_string(),
            year: 2020,
            make: "Test".to_string(),
            model: "Model".to_string(),
            trim: None,
            mileage: 50000,
            price: Decimal::new(20000, 0),
            days_on_market: 30,
            sale_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            source: "test".to_string(),
            match_score: 0.0,
        };

        // Perfect match
        let score = calculate_match_score_for_comp(2020, 50000, &comp, 2, 20000);
        assert_eq!(score, 1.0);

        // Year difference
        let score = calculate_match_score_for_comp(2018, 50000, &comp, 2, 20000);
        assert!(score < 1.0 && score > 0.0);
    }
}
