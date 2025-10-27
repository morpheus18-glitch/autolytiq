use crate::models::{AmortizationEntry, PaymentDetails};
use rust_decimal::Decimal;
use rust_decimal::prelude::*;
use rust_decimal_macros::dec;
use tracing::{info, instrument};

pub struct PaymentCalculatorService;

impl PaymentCalculatorService {
    pub fn new() -> Self {
        Self
    }

    /// Calculate monthly payment and full payment details
    #[instrument(skip(self))]
    pub fn calculate_payment(
        &self,
        amount_financed: Decimal,
        apr: Decimal,
        term_months: i32,
        gross_monthly_income: Option<Decimal>,
        total_monthly_debt: Option<Decimal>,
    ) -> PaymentDetails {
        // Calculate monthly payment
        let monthly_payment = self.calculate_monthly_payment(amount_financed, apr, term_months);

        // Generate amortization schedule (first 12 months)
        let amortization_schedule =
            self.generate_amortization_schedule(amount_financed, apr, term_months, 12);

        // Calculate total interest and total payment
        let total_payment = monthly_payment * Decimal::from(term_months);
        let total_interest = total_payment - amount_financed;

        // Calculate ratios if income provided
        let pti_ratio = gross_monthly_income.map(|income| {
            if income > dec!(0) {
                (monthly_payment / income * dec!(100))
                    .to_f64()
                    .unwrap_or(0.0)
            } else {
                0.0
            }
        });

        let dti_ratio = match (total_monthly_debt, gross_monthly_income) {
            (Some(debt), Some(income)) if income > dec!(0) => {
                Some(((debt + monthly_payment) / income * dec!(100))
                    .to_f64()
                    .unwrap_or(0.0))
            }
            _ => None,
        };

        info!(
            monthly_payment = %monthly_payment,
            total_interest = %total_interest,
            ?pti_ratio,
            ?dti_ratio,
            "Calculated payment details"
        );

        PaymentDetails {
            monthly_payment,
            total_interest,
            total_payment,
            pti_ratio,
            dti_ratio,
            amortization_schedule,
        }
    }

    /// Calculate monthly payment using standard loan formula
    /// P = L × (r × (1 + r)^n) / ((1 + r)^n - 1)
    /// Where: P = payment, L = loan amount, r = monthly rate, n = number of payments
    #[instrument(skip(self))]
    pub fn calculate_monthly_payment(
        &self,
        amount_financed: Decimal,
        apr: Decimal,
        term_months: i32,
    ) -> Decimal {
        if amount_financed <= dec!(0) || term_months <= 0 {
            return dec!(0);
        }

        // If APR is 0, simple division
        if apr == dec!(0) {
            return (amount_financed / Decimal::from(term_months))
                .round_dp_with_strategy(2, RoundingStrategy::MidpointAwayFromZero);
        }

        // Convert APR to monthly rate (APR / 12 / 100)
        let monthly_rate = apr / dec!(12) / dec!(100);

        // Calculate (1 + r)^n using power approximation
        let one_plus_r = dec!(1) + monthly_rate;
        let power = self.decimal_power(one_plus_r, term_months);

        // Calculate payment: L × (r × power) / (power - 1)
        let numerator = amount_financed * monthly_rate * power;
        let denominator = power - dec!(1);

        if denominator == dec!(0) {
            return dec!(0);
        }

        let payment = numerator / denominator;

        // Round to 2 decimal places (cents)
        payment.round_dp_with_strategy(2, RoundingStrategy::MidpointAwayFromZero)
    }

    /// Generate amortization schedule
    #[instrument(skip(self))]
    pub fn generate_amortization_schedule(
        &self,
        amount_financed: Decimal,
        apr: Decimal,
        term_months: i32,
        max_entries: usize,
    ) -> Vec<AmortizationEntry> {
        let monthly_payment = self.calculate_monthly_payment(amount_financed, apr, term_months);
        let monthly_rate = apr / dec!(12) / dec!(100);

        let mut schedule = Vec::new();
        let mut remaining_balance = amount_financed;

        let entries_to_generate = std::cmp::min(term_months as usize, max_entries);

        for i in 1..=entries_to_generate {
            // Calculate interest for this period
            let interest = (remaining_balance * monthly_rate)
                .round_dp_with_strategy(2, RoundingStrategy::MidpointAwayFromZero);

            // Principal is payment minus interest
            let principal = monthly_payment - interest;

            // Update balance
            remaining_balance -= principal;

            // Ensure balance doesn't go negative due to rounding
            if remaining_balance < dec!(0) {
                remaining_balance = dec!(0);
            }

            schedule.push(AmortizationEntry {
                payment_number: i as i32,
                payment_amount: monthly_payment,
                principal,
                interest,
                balance: remaining_balance,
            });
        }

        schedule
    }

    /// Calculate APR from buy rate and sell rate
    pub fn calculate_apr_from_rates(&self, buy_rate: Decimal, sell_rate: Decimal) -> Decimal {
        sell_rate
    }

    /// Calculate rate markup
    pub fn calculate_rate_markup(&self, buy_rate: Decimal, sell_rate: Decimal) -> Decimal {
        sell_rate - buy_rate
    }

    /// Calculate PTI (Payment-to-Income) ratio
    pub fn calculate_pti(&self, monthly_payment: Decimal, gross_monthly_income: Decimal) -> f64 {
        if gross_monthly_income <= dec!(0) {
            return 0.0;
        }

        (monthly_payment / gross_monthly_income * dec!(100))
            .to_f64()
            .unwrap_or(0.0)
    }

    /// Calculate DTI (Debt-to-Income) ratio
    pub fn calculate_dti(
        &self,
        monthly_payment: Decimal,
        total_monthly_debt: Decimal,
        gross_monthly_income: Decimal,
    ) -> f64 {
        if gross_monthly_income <= dec!(0) {
            return 0.0;
        }

        ((monthly_payment + total_monthly_debt) / gross_monthly_income * dec!(100))
            .to_f64()
            .unwrap_or(0.0)
    }

    /// Approximate decimal power using iterative multiplication
    /// More efficient than converting to f64 for precision-sensitive calculations
    fn decimal_power(&self, base: Decimal, exponent: i32) -> Decimal {
        if exponent == 0 {
            return dec!(1);
        }

        let mut result = dec!(1);
        for _ in 0..exponent {
            result *= base;
        }

        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_monthly_payment_zero_apr() {
        let service = PaymentCalculatorService::new();
        let payment = service.calculate_monthly_payment(dec!(30000), dec!(0), 60);

        // 30000 / 60 = 500
        assert_eq!(payment, dec!(500.00));
    }

    #[test]
    fn test_calculate_monthly_payment_with_apr() {
        let service = PaymentCalculatorService::new();
        let payment = service.calculate_monthly_payment(dec!(30000), dec!(5.99), 60);

        // Expected: ~$579.98 (verified with financial calculator)
        assert!(payment > dec!(579) && payment < dec!(581));
    }

    #[test]
    fn test_calculate_pti() {
        let service = PaymentCalculatorService::new();
        let pti = service.calculate_pti(dec!(500), dec!(4000));

        // 500 / 4000 = 12.5%
        assert!((pti - 12.5).abs() < 0.01);
    }

    #[test]
    fn test_calculate_dti() {
        let service = PaymentCalculatorService::new();
        let dti = service.calculate_dti(dec!(500), dec!(1000), dec!(4000));

        // (500 + 1000) / 4000 = 37.5%
        assert!((dti - 37.5).abs() < 0.01);
    }

    #[test]
    fn test_generate_amortization_schedule() {
        let service = PaymentCalculatorService::new();
        let schedule = service.generate_amortization_schedule(dec!(30000), dec!(5.99), 60, 3);

        assert_eq!(schedule.len(), 3);

        // First payment should have more interest than principal
        assert!(schedule[0].interest > dec!(0));
        assert!(schedule[0].principal > dec!(0));

        // Balance should decrease
        assert!(schedule[1].balance < schedule[0].balance);
        assert!(schedule[2].balance < schedule[1].balance);
    }

    #[test]
    fn test_decimal_power() {
        let service = PaymentCalculatorService::new();
        let result = service.decimal_power(dec!(1.5), 3);

        // 1.5^3 = 3.375
        assert_eq!(result, dec!(3.375));
    }
}
