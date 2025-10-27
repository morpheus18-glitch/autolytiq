use anyhow::Result;

use crate::proto::pricing::v1::*;

/// Calculate market data for a vehicle
pub async fn calculate_market_data(req: &MarketDataRequest) -> Result<MarketDataResponse> {
    // TODO: Replace with actual market data API calls
    // For now, using heuristics based on vehicle data

    let base_value = calculate_base_value(req.year, &req.make, &req.model);
    let mileage_adjustment = calculate_mileage_adjustment(req.mileage);
    let condition_multiplier = get_condition_multiplier(&req.condition);

    let adjusted_value = base_value * mileage_adjustment * condition_multiplier;

    Ok(MarketDataResponse {
        kbb_trade_in: adjusted_value * 0.85,
        kbb_retail: adjusted_value * 1.15,
        nada_clean: adjusted_value * 0.90,
        black_book_average: adjusted_value * 0.88,
        market_average: adjusted_value,
        recommended_price: adjusted_value * 1.10,
        confidence: 0.85,
        comparables: vec![],
    })
}

/// Calculate gross profit on a deal
pub async fn calculate_gross(req: &GrossRequest) -> Result<GrossResponse> {
    // Front gross = vehicle_price - vehicle_cost - pack
    let vehicle_profit = req.vehicle_price - req.vehicle_cost;
    let front_gross = vehicle_profit - req.pack;

    // Calculate fee profit
    let fee_profit: f64 = req.additional_fees.iter().map(|f| f.amount).sum();

    // Calculate F&I product profit
    let fi_profit: f64 = req
        .fi_products
        .iter()
        .map(|p| p.sell_price - p.cost)
        .sum();

    let back_gross = fee_profit + fi_profit;
    let total_gross = front_gross + back_gross;

    let gross_percentage = if req.vehicle_price > 0.0 {
        (total_gross / req.vehicle_price) * 100.0
    } else {
        0.0
    };

    Ok(GrossResponse {
        front_gross,
        back_gross,
        total_gross,
        gross_percentage,
        breakdown: Some(GrossBreakdown {
            vehicle_profit,
            pack_profit: -req.pack,
            fee_profit,
            fi_profit,
        }),
    })
}

/// Calculate payment schedule
pub async fn calculate_payments(req: &PaymentRequest) -> Result<PaymentResponse> {
    let principal = req.amount_financed;
    let monthly_rate = (req.apr / 100.0) / 12.0;
    let num_payments = req.term_months as f64;

    // Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    let monthly_payment = if monthly_rate > 0.0 {
        let numerator = principal * monthly_rate * (1.0 + monthly_rate).powf(num_payments);
        let denominator = (1.0 + monthly_rate).powf(num_payments) - 1.0;
        numerator / denominator
    } else {
        principal / num_payments
    };

    let total_amount = monthly_payment * num_payments;
    let total_interest = total_amount - principal;

    // Generate payment schedule (first 3 + last 3)
    let schedule = generate_payment_schedule(principal, monthly_payment, monthly_rate, req.term_months);

    Ok(PaymentResponse {
        monthly_payment,
        total_amount,
        total_interest,
        total_principal: principal,
        schedule,
    })
}

// Helper functions

fn calculate_base_value(year: i32, make: &str, model: &str) -> f64 {
    // Simplified base value calculation
    let current_year = 2025;
    let age = (current_year - year).max(0);

    let base_msrp = match (make, model) {
        ("Toyota", "Camry") => 28_000.0,
        ("Honda", "Accord") => 27_000.0,
        ("Ford", "F-150") => 35_000.0,
        _ => 25_000.0,
    };

    // Depreciation: ~15% per year
    base_msrp * 0.85_f64.powi(age)
}

fn calculate_mileage_adjustment(mileage: i32) -> f64 {
    let avg_miles_per_year = 12_000.0;
    let years_equivalent = mileage as f64 / avg_miles_per_year;

    // Adjust for high/low mileage
    if years_equivalent < 3.0 {
        1.05 // Low mileage premium
    } else if years_equivalent > 10.0 {
        0.90 // High mileage discount
    } else {
        1.0
    }
}

fn get_condition_multiplier(condition: &str) -> f64 {
    match condition {
        "EXCELLENT" => 1.15,
        "GOOD" => 1.0,
        "FAIR" => 0.85,
        "POOR" => 0.70,
        _ => 1.0,
    }
}

fn generate_payment_schedule(
    principal: f64,
    monthly_payment: f64,
    monthly_rate: f64,
    term_months: i32,
) -> Vec<PaymentScheduleItem> {
    let mut schedule = Vec::new();
    let mut balance = principal;

    // Generate first 3 payments
    for i in 1..=term_months.min(3) {
        let interest = balance * monthly_rate;
        let principal_payment = monthly_payment - interest;
        balance -= principal_payment;

        schedule.push(PaymentScheduleItem {
            payment_number: i,
            payment_amount: monthly_payment,
            principal: principal_payment,
            interest,
            balance,
        });
    }

    // Generate last 3 payments (if term > 6)
    if term_months > 6 {
        balance = principal;
        for _ in 1..=(term_months - 3) {
            let interest = balance * monthly_rate;
            let principal_payment = monthly_payment - interest;
            balance -= principal_payment;
        }

        for i in (term_months - 2)..=term_months {
            let interest = balance * monthly_rate;
            let principal_payment = monthly_payment - interest;
            balance -= principal_payment;

            schedule.push(PaymentScheduleItem {
                payment_number: i,
                payment_amount: monthly_payment,
                principal: principal_payment,
                interest,
                balance: balance.max(0.0),
            });
        }
    }

    schedule
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_calculate_gross() {
        let req = GrossRequest {
            tenant_id: "test".to_string(),
            vehicle_price: 30_000.0,
            vehicle_cost: 25_000.0,
            pack: 500.0,
            additional_fees: vec![],
            fi_products: vec![],
        };

        let result = calculate_gross(&req).await.unwrap();

        assert_eq!(result.front_gross, 4_500.0); // 30000 - 25000 - 500
        assert_eq!(result.total_gross, 4_500.0);
    }

    #[tokio::test]
    async fn test_calculate_payments() {
        let req = PaymentRequest {
            tenant_id: "test".to_string(),
            amount_financed: 20_000.0,
            apr: 5.99,
            term_months: 60,
            sales_tax_rate: 0.0,
            fees: vec![],
        };

        let result = calculate_payments(&req).await.unwrap();

        assert!(result.monthly_payment > 380.0 && result.monthly_payment < 390.0);
        assert!(result.total_interest > 3_000.0);
    }
}
