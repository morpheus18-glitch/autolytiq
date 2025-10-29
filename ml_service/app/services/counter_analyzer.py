from __future__ import annotations

from dataclasses import dataclass
from typing import List
from uuid import uuid4

import numpy as np

from ..config.scoring import get_config
from ..schemas.desking import (
    ApprovalPredictionRequest,
    ClosePredictionRequest,
    CompetitiveContext,
    CounterAnalysisRequest,
    CounterAnalysisResponse,
    CounterCustomerInput,
    CounterOption,
    DealStructure,
    EngagementMetrics,
    GrossCalculation,
    PaymentCalculation,
)
from .approval_predictor import ApprovalEstimate, ApprovalPredictor
from .calculations import build_payment, compute_amount_financed, estimate_gross
from .close_predictor import ClosePredictor

RANDOM_SEED = 211


@dataclass
class StrategyBlueprint:
    label: str
    sale_price_delta: float
    cash_adjustment: float
    term_adjustment: int
    emphasize_value: bool


class CounterAnalyzer:
    def __init__(
        self,
        approval_predictor: ApprovalPredictor,
        close_predictor: ClosePredictor,
    ) -> None:
        self._approval_predictor = approval_predictor
        self._close_predictor = close_predictor
        self._rng = np.random.default_rng(RANDOM_SEED)

    def analyze(self, request: CounterAnalysisRequest, ml_trace_id: str) -> CounterAnalysisResponse:
        config = get_config()
        blueprints = self._build_blueprints(request, config)
        options: List[CounterOption] = []
        for blueprint in blueprints:
            option = self._build_option(request, blueprint)
            options.append(option)

        summary = self._craft_summary(request.customer_input, options)
        recommendation = options[0].label if options else "Maintain current offer"
        recommended_option_id = options[0].id if options else None
        confidence = float(np.clip(options[0].probability_of_close if options else 0.5, 0.25, 0.95))

        return CounterAnalysisResponse(
            summary=summary,
            options=options,
            recommendation=recommendation,
            recommended_option_id=recommended_option_id,
            confidence=confidence,
            outcome=None,
            ml_trace_id=ml_trace_id,
        )

    def _build_blueprints(
        self,
        request: CounterAnalysisRequest,
        config: Dict[str, Any],
    ) -> List[StrategyBlueprint]:
        customer_input = request.customer_input
        requested_payment = customer_input.requested_payment
        strategy_cfg = config.get("counter_strategy") or {}
        max_over_allow = float(strategy_cfg.get("max_over_allow_extra", 500.0))
        biases = {
            "Balanced concession": float(strategy_cfg.get("split_diff_bias", 0.5)),
            "Gross preservation": float(strategy_cfg.get("hold_line_bias", 0.3)),
            "Close oriented": float(strategy_cfg.get("drop_price_bias", 0.2)),
            "Match requested payment": float(strategy_cfg.get("split_diff_bias", 0.5)),
        }
        blueprints = [
            StrategyBlueprint(label="Balanced concession", sale_price_delta=-350, cash_adjustment=0.0, term_adjustment=0, emphasize_value=True),
            StrategyBlueprint(label="Gross preservation", sale_price_delta=150, cash_adjustment=500.0, term_adjustment=0, emphasize_value=False),
            StrategyBlueprint(label="Close oriented", sale_price_delta=-750, cash_adjustment=-250.0, term_adjustment=6, emphasize_value=True),
        ]
        if requested_payment and requested_payment < request.current_payment.monthly_payment * 0.92:
            blueprints.append(
                StrategyBlueprint(
                    label="Match requested payment", sale_price_delta=-950, cash_adjustment=-500.0, term_adjustment=12, emphasize_value=True
                )
            )
        ordered: List[StrategyBlueprint] = []
        for blueprint in blueprints:
            adjusted_cash = float(np.clip(blueprint.cash_adjustment, -max_over_allow, max_over_allow))
            blueprint.cash_adjustment = adjusted_cash
            ordered.append(blueprint)
        ordered.sort(key=lambda bp: biases.get(bp.label, 0.0), reverse=True)
        return ordered

    def _build_option(self, request: CounterAnalysisRequest, blueprint: StrategyBlueprint) -> CounterOption:
        structure = request.structure.model_copy(deep=True)
        sale_price = max(structure.pricing.sale_price + blueprint.sale_price_delta, 2000.0)
        structure.pricing.sale_price = sale_price
        if structure.cash_down:
            structure.cash_down.total = max((structure.cash_down.total or 0.0) + blueprint.cash_adjustment, 0.0)
        amount_financed = compute_amount_financed(structure, sale_price)
        term = max(request.current_payment.term_months + blueprint.term_adjustment, 24)
        payment = build_payment(
            amount_financed,
            request.current_payment.apr,
            term,
            structure.cash_down.total if structure.cash_down else 0.0,
        )
        gross = estimate_gross(structure, sale_price, payment, (request.vehicle.msrp or sale_price) * 0.92)
        approval_estimate = self._estimate_approval(request, structure, payment)
        close_probability = self._estimate_close_probability(request, structure, payment, sale_price, approval_estimate)
        rebuttal_script = self._craft_script(request.customer_input, blueprint, payment, gross)
        return CounterOption(
            id=str(uuid4()),
            label=blueprint.label,
            structure=structure,
            payment=payment,
            gross=gross,
            probability_of_close=float(round(close_probability, 3)),
            notes=self._build_notes(blueprint, gross, approval_estimate),
            rebuttal_script=rebuttal_script,
        )

    def _estimate_approval(
        self,
        request: CounterAnalysisRequest,
        structure: DealStructure,
        payment: PaymentCalculation,
    ) -> ApprovalEstimate:
        lender_id = (
            structure.lender.preferred_lender_id
            if structure.lender and structure.lender.preferred_lender_id
            else "ALLY"
        )
        approval_request = ApprovalPredictionRequest(
            deal_id=request.deal_id,
            worksheet_id=request.worksheet_id,
            version_id=request.version_id,
            lender_id=lender_id,
            structure=structure,
            customer_profile=request.customer_profile,
            vehicle=request.vehicle,
            payment=payment,
        )
        return self._approval_predictor.estimate(approval_request)

    def _estimate_close_probability(
        self,
        request: CounterAnalysisRequest,
        structure: DealStructure,
        payment: PaymentCalculation,
        sale_price: float,
        approval_estimate: ApprovalEstimate,
    ) -> float:
        competitive_payment_delta = (payment.monthly_payment - request.current_payment.monthly_payment) / max(
            request.current_payment.monthly_payment, 1.0
        )
        price_delta = (sale_price - request.structure.pricing.sale_price) / max(request.structure.pricing.sale_price, 1.0)
        engagement = self._rng.poisson(lam=[7, 11, 8, 2, 3])
        engagement_metrics = EngagementMetrics(
            site_visits=int(engagement[0]),
            vehicle_views=int(engagement[1]),
            email_opens=int(engagement[2]),
            sms_replies=int(engagement[3]),
            calls=int(engagement[4]),
        )
        close_request = ClosePredictionRequest(
            deal_id=request.deal_id,
            worksheet_id=request.worksheet_id,
            customer_profile=request.customer_profile,
            structure=structure,
            engagement=engagement_metrics,
            competitive_context=CompetitiveContext(
                payment_delta=float(round(competitive_payment_delta, 3)),
                price_delta=float(round(price_delta, 3)),
            ),
            time_in_deal_days=int(np.clip(request.current_payment.term_months / 2, 4, 45)),
            salesperson_win_rate=float(np.clip(0.5 + approval_estimate.probability * 0.4, 0.35, 0.9)),
            day_of_month=self._rng.integers(1, 30),
        )
        return self._close_predictor.estimate(close_request).probability

    def _craft_script(
        self,
        customer_input: CounterCustomerInput,
        blueprint: StrategyBlueprint,
        payment: PaymentCalculation,
        gross: GrossCalculation,
    ) -> str:
        rationale = "This option preserves profit while honoring your request" if not blueprint.emphasize_value else "This option balances value and payment relief"
        return (
            f"I hear your concern about {customer_input.customer_concern}. "
            f"If we move to ${payment.monthly_payment:,.0f} per month with ${payment.due_at_signing or 0:,.0f} due, "
            f"we can keep protections in place and still maintain dealership profitability of ${gross.total:,.0f}."
            f" Does that sound fair?"
        )

    def _build_notes(
        self,
        blueprint: StrategyBlueprint,
        gross: GrossCalculation,
        approval_estimate: ApprovalEstimate,
    ) -> str:
        if blueprint.emphasize_value:
            return (
                f"Focus on value-add products; projected gross ${gross.total:,.0f}; "
                f"approval {approval_estimate.probability:.0%}"
            )
        return (
            f"Preserves gross at ${gross.total:,.0f}; leverage lender appetite {approval_estimate.recommendation.value}"
        )

    def _craft_summary(self, customer_input: CounterCustomerInput, options: List[CounterOption]) -> str:
        if not options:
            return "No viable counter strategies available under current constraints."
        best = options[0]
        return (
            f"Primary recommendation lowers payment to ${best.payment.monthly_payment:,.0f} while keeping gross ${best.gross.total:,.0f}. "
            f"Customer concern: {customer_input.customer_concern}."
        )
