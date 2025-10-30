use crate::models::{GrossBreakdown, ProductProfit};
use rust_decimal::{prelude::ToPrimitive, Decimal};
use rust_decimal_macros::dec;
use tracing::{info, instrument};

pub struct GrossCalculatorService;

impl GrossCalculatorService {
    pub fn new() -> Self {
        Self
    }

    /// Calculate complete gross profit breakdown for a deal
    #[instrument(skip(self))]
    pub fn calculate_gross(
        &self,
        vehicle_price: Decimal,
        vehicle_cost: Decimal,
        pack: Decimal,
        trade_value: Decimal,
        trade_payoff: Decimal,
        trade_allowance: Decimal,
        rate_markup: Decimal,
        term_months: i32,
        amount_financed: Decimal,
        participation: f64,
        products: Vec<(String, Decimal, Decimal, f64)>, // (type, price, cost, participation)
    ) -> GrossBreakdown {
        // Calculate front-end gross
        let front_end_gross = vehicle_price - vehicle_cost - pack;

        // Calculate trade reserve (profit from trade)
        // Trade reserve = ACV - Payoff (what dealer pays for trade)
        // If dealer owes more than ACV, it's a loss
        let trade_reserve = trade_value - trade_payoff;

        // Calculate overallow (giving customer more than ACV)
        let overallow = if trade_allowance > trade_value {
            trade_allowance - trade_value
        } else {
            dec!(0)
        };

        // Total front gross (subtract overallow as it's a cost)
        let total_front_gross = front_end_gross + trade_reserve - overallow;

        // Calculate finance reserve
        // Formula: amount_financed × (rate_markup / 100) × (term / 12) × participation
        let finance_reserve = if rate_markup > dec!(0) && term_months > 0 {
            let markup_decimal = rate_markup / dec!(100);
            let term_years = Decimal::from(term_months) / dec!(12);
            let reserve = amount_financed * markup_decimal * term_years;
            reserve * Decimal::from_f64_retain(participation).unwrap_or(dec!(1))
        } else {
            dec!(0)
        };

        // Calculate back-end product profits
        let mut product_profits = Vec::new();
        let mut back_end_gross = dec!(0);

        for (product_type, selling_price, cost, product_participation) in products {
            let gross_profit = selling_price - cost;
            let profit =
                gross_profit * Decimal::from_f64_retain(product_participation).unwrap_or(dec!(1));

            product_profits.push(ProductProfit {
                product_type,
                selling_price,
                cost,
                profit,
                participation: product_participation,
            });

            back_end_gross += profit;
        }

        // Total gross profit
        let total_gross = total_front_gross + finance_reserve + back_end_gross;

        // Gross percentage (as percentage of vehicle price)
        let gross_percentage = if vehicle_price > dec!(0) {
            ((total_gross / vehicle_price) * dec!(100))
                .to_f64()
                .unwrap_or(0.0)
        } else {
            0.0
        };

        info!(
            front_end_gross = %front_end_gross,
            finance_reserve = %finance_reserve,
            back_end_gross = %back_end_gross,
            total_gross = %total_gross,
            gross_percentage = gross_percentage,
            "Calculated gross breakdown"
        );

        GrossBreakdown {
            front_end_gross,
            trade_reserve,
            total_front_gross,
            finance_reserve,
            back_end_gross,
            product_profits,
            total_gross,
            gross_percentage,
        }
    }

    /// Calculate front-end gross only
    pub fn calculate_front_end_gross(
        &self,
        vehicle_price: Decimal,
        vehicle_cost: Decimal,
        pack: Decimal,
    ) -> Decimal {
        vehicle_price - vehicle_cost - pack
    }

    /// Calculate trade reserve
    pub fn calculate_trade_reserve(&self, trade_value: Decimal, trade_payoff: Decimal) -> Decimal {
        trade_value - trade_payoff
    }

    /// Calculate overallow (negative equity absorbed by dealer)
    pub fn calculate_overallow(&self, trade_allowance: Decimal, trade_value: Decimal) -> Decimal {
        if trade_allowance > trade_value {
            trade_allowance - trade_value
        } else {
            dec!(0)
        }
    }

    /// Calculate finance reserve from rate markup
    pub fn calculate_finance_reserve(
        &self,
        amount_financed: Decimal,
        rate_markup: Decimal,
        term_months: i32,
        participation: f64,
    ) -> Decimal {
        if rate_markup <= dec!(0) || term_months <= 0 {
            return dec!(0);
        }

        let markup_decimal = rate_markup / dec!(100);
        let term_years = Decimal::from(term_months) / dec!(12);
        let reserve = amount_financed * markup_decimal * term_years;

        reserve * Decimal::from_f64_retain(participation).unwrap_or(dec!(1))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rust_decimal_macros::dec;

    #[test]
    fn test_calculate_gross_basic() {
        let service = GrossCalculatorService::new();

        let breakdown = service.calculate_gross(
            dec!(30000), // vehicle_price
            dec!(25000), // vehicle_cost
            dec!(500),   // pack
            dec!(0),     // trade_value
            dec!(0),     // trade_payoff
            dec!(0),     // trade_allowance
            dec!(0),     // rate_markup
            0,           // term_months
            dec!(0),     // amount_financed
            1.0,         // participation
            vec![],      // products
        );

        // Front-end gross: 30000 - 25000 - 500 = 4500
        assert_eq!(breakdown.front_end_gross, dec!(4500));
        assert_eq!(breakdown.total_gross, dec!(4500));
        assert_eq!(breakdown.finance_reserve, dec!(0));
        assert_eq!(breakdown.back_end_gross, dec!(0));
    }

    #[test]
    fn test_calculate_gross_with_trade() {
        let service = GrossCalculatorService::new();

        let breakdown = service.calculate_gross(
            dec!(30000), // vehicle_price
            dec!(25000), // vehicle_cost
            dec!(500),   // pack
            dec!(8000),  // trade_value (ACV)
            dec!(7000),  // trade_payoff (owed)
            dec!(9000),  // trade_allowance (given to customer)
            dec!(0),
            0,
            dec!(0),
            1.0,
            vec![],
        );

        // Front-end gross: 30000 - 25000 - 500 = 4500
        assert_eq!(breakdown.front_end_gross, dec!(4500));

        // Trade reserve: 8000 - 7000 = 1000 (profit from trade)
        assert_eq!(breakdown.trade_reserve, dec!(1000));

        // Overallow: 9000 - 8000 = 1000 (gave customer more than ACV)
        // Total front gross: 4500 + 1000 - 1000 = 4500
        assert_eq!(breakdown.total_front_gross, dec!(4500));
    }

    #[test]
    fn test_calculate_gross_with_finance_reserve() {
        let service = GrossCalculatorService::new();

        let breakdown = service.calculate_gross(
            dec!(30000),
            dec!(25000),
            dec!(500),
            dec!(0),
            dec!(0),
            dec!(0),
            dec!(2.0),   // 2% rate markup
            60,          // 60 months
            dec!(30000), // amount financed
            0.8,         // 80% participation
            vec![],
        );

        // Finance reserve: 30000 × 0.02 × 5 × 0.8 = 2400
        assert_eq!(breakdown.finance_reserve, dec!(2400));

        // Total: 4500 + 2400 = 6900
        assert_eq!(breakdown.total_gross, dec!(6900));
    }

    #[test]
    fn test_calculate_gross_with_products() {
        let service = GrossCalculatorService::new();

        let products = vec![
            ("warranty".to_string(), dec!(2000), dec!(1200), 1.0), // $800 profit
            ("gap".to_string(), dec!(800), dec!(500), 0.5), // $150 profit (50% participation)
        ];

        let breakdown = service.calculate_gross(
            dec!(30000),
            dec!(25000),
            dec!(500),
            dec!(0),
            dec!(0),
            dec!(0),
            dec!(0),
            0,
            dec!(0),
            1.0,
            products,
        );

        // Back-end: 800 + 150 = 950
        assert_eq!(breakdown.back_end_gross, dec!(950));
        assert_eq!(breakdown.product_profits.len(), 2);

        // Total: 4500 + 950 = 5450
        assert_eq!(breakdown.total_gross, dec!(5450));
    }

    #[test]
    fn test_gross_percentage() {
        let service = GrossCalculatorService::new();

        let breakdown = service.calculate_gross(
            dec!(30000), // vehicle_price
            dec!(25000), // vehicle_cost
            dec!(500),   // pack
            dec!(0),
            dec!(0),
            dec!(0),
            dec!(0),
            0,
            dec!(0),
            1.0,
            vec![],
        );

        // Gross: 4500 / 30000 = 15%
        assert!((breakdown.gross_percentage - 15.0).abs() < 0.01);
    }
}
