"""Deal optimization logic built around pipeline pricing outputs."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, List

from .pricing_service import PricingInsightsService


@dataclass
class DealStructure:
    down_payment: float
    amount_financed: float
    apr: float
    term_months: int
    monthly_payment: float
    total_interest: float
    total_cost: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "down_payment": round(self.down_payment, 2),
            "amount_financed": round(self.amount_financed, 2),
            "apr": round(self.apr, 3),
            "term_months": self.term_months,
            "monthly_payment": round(self.monthly_payment, 2),
            "total_interest": round(self.total_interest, 2),
            "total_cost": round(self.total_cost, 2),
        }


@dataclass
class FIProduct:
    name: str
    type: str
    cost: float
    recommended: bool
    expected_profit: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "type": self.type,
            "cost": round(self.cost, 2),
            "recommended": self.recommended,
            "expected_profit": round(self.expected_profit, 2),
        }


class DealOptimizer:
    """Optimizes deal structures using rule-based heuristics."""

    def __init__(self, pricing_service: PricingInsightsService) -> None:
        self.pricing_service = pricing_service
        self.logger = logging.getLogger(self.__class__.__name__)
        self.rate_sheet = self._build_rate_sheet()
        self.fi_products = self._load_fi_products()

    # ------------------------------------------------------------------
    def optimize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            vehicle_price = float(payload["vehicle_price"])
            credit_score = int(payload["customer_credit_score"])
            income = float(payload["customer_income"])
        except (KeyError, TypeError, ValueError) as exc:
            raise ValueError("vehicle_price, customer_credit_score, and customer_income must be numeric") from exc

        down_payment = float(payload.get("down_payment", 0) or 0)
        trade_value = float(payload.get("trade_in_value", 0) or 0)
        trade_payoff = float(payload.get("trade_in_payoff", 0) or 0)
        desired_payment = payload.get("desired_monthly_payment")

        trade_equity = trade_value - trade_payoff
        amount_financed = max(vehicle_price - down_payment - trade_equity, 0)

        pricing_context = None
        vehicle_context = payload.get("vehicle_context")
        if isinstance(vehicle_context, dict):
            try:
                pricing_context = self.pricing_service.predict_price(vehicle_context)
            except Exception as exc:
                self.logger.warning("Pricing context unavailable: %s", exc)

        credit_tier = self._determine_credit_tier(credit_score)
        apr = self._determine_apr(credit_tier, amount_financed)
        term = self._determine_term(income, amount_financed, desired_payment)
        monthly_payment = self._calculate_payment(amount_financed, apr, term)

        structure = DealStructure(
            down_payment=down_payment,
            amount_financed=amount_financed,
            apr=apr,
            term_months=term,
            monthly_payment=monthly_payment,
            total_interest=monthly_payment * term - amount_financed,
            total_cost=monthly_payment * term + down_payment,
        )

        approval_probability = self._calculate_approval_probability(
            credit_score, income, monthly_payment, vehicle_price, amount_financed
        )
        front_gross = self._estimate_front_gross(vehicle_price)
        reserve_profit = self._estimate_reserve_profit(amount_financed, apr, term)
        recommended_products = self._recommend_fi_products(credit_score, vehicle_price, approval_probability)
        fi_profit = sum(p.expected_profit for p in recommended_products if p.recommended)

        alternatives = self._build_alternatives(payload, credit_tier, trade_equity)
        risk = self._assess_risk(credit_score, approval_probability, amount_financed, vehicle_price)

        response = {
            "optimal_deal_structure": structure.to_dict(),
            "approval_probability": approval_probability,
            "estimated_front_gross": round(front_gross, 2),
            "estimated_back_gross": round(reserve_profit + fi_profit, 2),
            "total_profit_projection": round(front_gross + reserve_profit + fi_profit, 2),
            "recommended_fi_products": [p.to_dict() for p in recommended_products],
            "alternative_structures": [alt.to_dict() for alt in alternatives],
            "risk_assessment": risk,
        }
        if pricing_context:
            response["market_context"] = {
                "predicted_price": pricing_context["predicted_price"],
                "pricing_recommendation": pricing_context["pricing_recommendation"],
                "confidence_interval": pricing_context["confidence_interval"],
            }
        return response

    # ------------------------------------------------------------------
    def _build_rate_sheet(self) -> Dict[str, Dict[str, float]]:
        return {
            "super_prime": {"min_score": 740, "base_rate": 4.15},
            "prime": {"min_score": 680, "base_rate": 5.75},
            "near_prime": {"min_score": 620, "base_rate": 8.99},
            "subprime": {"min_score": 580, "base_rate": 12.5},
            "deep_subprime": {"min_score": 0, "base_rate": 17.99},
        }

    def _load_fi_products(self) -> List[FIProduct]:
        return [
            FIProduct("Vehicle Service Contract", "service_contract", 2200, False, 1430),
            FIProduct("Guaranteed Asset Protection", "gap", 795, False, 556),
            FIProduct("Tire & Wheel Protection", "tire_wheel", 695, False, 486),
            FIProduct("Appearance Protection", "appearance", 595, False, 416),
            FIProduct("Maintenance Plan", "maintenance", 1295, False, 777),
        ]

    def _determine_credit_tier(self, score: int) -> str:
        for tier, config in self.rate_sheet.items():
            if score >= config["min_score"]:
                return tier
        return "deep_subprime"

    def _determine_apr(self, tier: str, amount_financed: float) -> float:
        base_rate = self.rate_sheet[tier]["base_rate"]
        reserve = 1.5 if amount_financed > 35000 else 1.25
        return base_rate + reserve

    def _determine_term(self, income: float, amount_financed: float, target_payment: Any) -> int:
        monthly_income = income / 12
        allowable_payment = monthly_income * 0.15
        if target_payment:
            allowable_payment = min(allowable_payment, float(target_payment))

        for term in (72, 66, 60, 54, 48, 42, 36):
            payment = self._calculate_payment(amount_financed, 6.5, term)
            if payment <= allowable_payment:
                return term
        return 72

    def _calculate_payment(self, principal: float, apr: float, term: int) -> float:
        if principal <= 0:
            return 0.0
        monthly_rate = (apr / 100) / 12
        if monthly_rate == 0:
            return principal / term
        payment = principal * (monthly_rate * (1 + monthly_rate) ** term) / ((1 + monthly_rate) ** term - 1)
        return round(payment, 2)

    def _calculate_approval_probability(self, credit_score: int, income: float, payment: float,
                                         vehicle_price: float, amount_financed: float) -> float:
        probability = 0.2
        if credit_score >= 740:
            probability += 0.35
        elif credit_score >= 680:
            probability += 0.28
        elif credit_score >= 620:
            probability += 0.22
        elif credit_score >= 580:
            probability += 0.15
        else:
            probability += 0.08

        monthly_income = income / 12 if income else 0
        dti = payment / monthly_income if monthly_income else 1
        if dti <= 0.1:
            probability += 0.3
        elif dti <= 0.15:
            probability += 0.24
        elif dti <= 0.2:
            probability += 0.16
        else:
            probability += 0.08

        ltv = amount_financed / vehicle_price if vehicle_price else 1
        if ltv <= 0.9:
            probability += 0.15
        elif ltv <= 1.0:
            probability += 0.1
        elif ltv <= 1.1:
            probability += 0.05

        return round(min(probability, 0.97), 3)

    def _estimate_front_gross(self, selling_price: float) -> float:
        # Estimate cost at 87% of selling price and include a $450 pack
        estimated_cost = selling_price * 0.87
        pack = 450
        return selling_price - estimated_cost - pack

    def _estimate_reserve_profit(self, amount_financed: float, apr: float, term: int) -> float:
        reserve_rate = max(apr - 3.0, 0)
        reserve_factor = reserve_rate / 100 * 0.65
        return amount_financed * reserve_factor * (term / 12) / 5

    def _recommend_fi_products(self, credit_score: int, vehicle_price: float, approval_probability: float) -> List[FIProduct]:
        recommendations: List[FIProduct] = []
        for product in self.fi_products:
            qualifies = credit_score >= 600 or product.type in {"gap", "tire_wheel"}
            recommended = qualifies and vehicle_price >= 15000 and approval_probability >= 0.6
            recommendations.append(
                FIProduct(
                    product.name,
                    product.type,
                    product.cost,
                    recommended,
                    product.expected_profit if recommended else 0,
                )
            )
        return recommendations

    def _build_alternatives(self, payload: Dict[str, Any], tier: str, trade_equity: float) -> List[DealStructure]:
        vehicle_price = float(payload.get("vehicle_price"))
        down_payment = float(payload.get("down_payment", 0))

        lower_down = max(0.0, down_payment - 1000)
        higher_down = down_payment + 2000

        alt1_amount = max(vehicle_price - lower_down - trade_equity, 0)
        alt2_amount = max(vehicle_price - higher_down - trade_equity, 0)

        alt1 = DealStructure(
            down_payment=lower_down,
            amount_financed=alt1_amount,
            apr=self._determine_apr(tier, alt1_amount) + 0.25,
            term_months=72,
            monthly_payment=self._calculate_payment(alt1_amount, self._determine_apr(tier, alt1_amount) + 0.25, 72),
            total_interest=0.0,
            total_cost=0.0,
        )
        alt1.total_interest = alt1.monthly_payment * alt1.term_months - alt1.amount_financed
        alt1.total_cost = alt1.monthly_payment * alt1.term_months + alt1.down_payment

        alt2 = DealStructure(
            down_payment=higher_down,
            amount_financed=alt2_amount,
            apr=max(self._determine_apr(tier, alt2_amount) - 0.4, 2.9),
            term_months=60,
            monthly_payment=self._calculate_payment(alt2_amount, max(self._determine_apr(tier, alt2_amount) - 0.4, 2.9), 60),
            total_interest=0.0,
            total_cost=0.0,
        )
        alt2.total_interest = alt2.monthly_payment * alt2.term_months - alt2.amount_financed
        alt2.total_cost = alt2.monthly_payment * alt2.term_months + alt2.down_payment

        return [alt1, alt2]

    def _assess_risk(self, credit_score: int, approval_probability: float, amount_financed: float, vehicle_price: float) -> str:
        ltv = amount_financed / vehicle_price if vehicle_price else 1
        if approval_probability >= 0.85 and credit_score >= 700 and ltv <= 0.95:
            return "Low risk – strong borrower with conservative structure."
        if approval_probability >= 0.7 and ltv <= 1.05:
            return "Moderate risk – monitor stipulations and consider backup lender."
        if approval_probability >= 0.55:
            return "Elevated risk – add equity or restructure reserve to strengthen approval odds."
        return "High risk – restructure deal or seek alternative financing options."
