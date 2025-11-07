use chrono::{DateTime, Utc};
use rust_decimal::{prelude::ToPrimitive, Decimal};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Money type for precise currency calculations (stored in cents)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Money {
    pub amount_cents: i64,
    pub currency: Currency,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Currency {
    USD,
    CAD,
    EUR,
    GBP,
}

impl Money {
    pub fn new(amount_cents: i64, currency: Currency) -> Self {
        Self {
            amount_cents,
            currency,
        }
    }

    pub fn from_dollars(dollars: Decimal, currency: Currency) -> Self {
        let cents = (dollars * Decimal::from(100)).round().to_i64().unwrap_or(0);
        Self::new(cents, currency)
    }

    pub fn to_dollars(&self) -> Decimal {
        Decimal::from(self.amount_cents) / Decimal::from(100)
    }

    pub fn add(&self, other: &Money) -> Result<Money, String> {
        if self.currency != other.currency {
            return Err(format!(
                "Cannot add different currencies: {:?} and {:?}",
                self.currency, other.currency
            ));
        }
        Ok(Money::new(
            self.amount_cents + other.amount_cents,
            self.currency,
        ))
    }

    pub fn subtract(&self, other: &Money) -> Result<Money, String> {
        if self.currency != other.currency {
            return Err(format!(
                "Cannot subtract different currencies: {:?} and {:?}",
                self.currency, other.currency
            ));
        }
        Ok(Money::new(
            self.amount_cents - other.amount_cents,
            self.currency,
        ))
    }

    pub fn multiply(&self, factor: Decimal) -> Money {
        let result = Decimal::from(self.amount_cents) * factor;
        Money::new(result.round().to_i64().unwrap_or(0), self.currency)
    }

    pub fn divide(&self, divisor: Decimal) -> Money {
        if divisor.is_zero() {
            return Money::new(0, self.currency);
        }
        let result = Decimal::from(self.amount_cents) / divisor;
        Money::new(result.round().to_i64().unwrap_or(0), self.currency)
    }
}

impl Default for Money {
    fn default() -> Self {
        Self::new(0, Currency::USD)
    }
}

/// Request context containing tenant and user information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestContext {
    pub request_id: Uuid,
    pub tenant_id: String,
    pub user_id: Option<String>,
    pub idempotency_key: Option<String>,
    pub correlation_id: Option<String>,
    pub timestamp: DateTime<Utc>,
}

impl RequestContext {
    pub fn new(tenant_id: String) -> Self {
        Self {
            request_id: Uuid::new_v4(),
            tenant_id,
            user_id: None,
            idempotency_key: None,
            correlation_id: None,
            timestamp: Utc::now(),
        }
    }

    pub fn with_user(mut self, user_id: String) -> Self {
        self.user_id = Some(user_id);
        self
    }

    pub fn with_idempotency_key(mut self, key: String) -> Self {
        self.idempotency_key = Some(key);
        self
    }

    pub fn with_correlation_id(mut self, id: String) -> Self {
        self.correlation_id = Some(id);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rust_decimal_macros::dec;

    #[test]
    fn test_money_operations() {
        let m1 = Money::new(10050, Currency::USD); // $100.50
        let m2 = Money::new(2500, Currency::USD); // $25.00

        // Addition
        let sum = m1.add(&m2).unwrap();
        assert_eq!(sum.amount_cents, 12550); // $125.50

        // Subtraction
        let diff = m1.subtract(&m2).unwrap();
        assert_eq!(diff.amount_cents, 7550); // $75.50

        // Multiplication
        let product = m1.multiply(dec!(2.0));
        assert_eq!(product.amount_cents, 20100); // $201.00

        // Division
        let quotient = m1.divide(dec!(2.0));
        assert_eq!(quotient.amount_cents, 5025); // $50.25
    }

    #[test]
    fn test_money_from_dollars() {
        let money = Money::from_dollars(dec!(100.50), Currency::USD);
        assert_eq!(money.amount_cents, 10050);
        assert_eq!(money.to_dollars(), dec!(100.50));
    }

    #[test]
    fn test_money_currency_mismatch() {
        let usd = Money::new(100, Currency::USD);
        let eur = Money::new(100, Currency::EUR);

        assert!(usd.add(&eur).is_err());
        assert!(usd.subtract(&eur).is_err());
    }
}
