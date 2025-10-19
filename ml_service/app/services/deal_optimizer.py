from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Sequence, Tuple
from uuid import uuid4

import numpy as np

from ..schemas.desking import (
    AlternativeStructure,
    ApprovalPredictionRequest,
    ClosePredictionRequest,
    CompetitiveContext,
    DealStructure,
    EngagementMetrics,
    GrossCalculation,
    OptimizationConstraints,
    OptimizationGoals,
    OptimizationRequest,
    OptimizationResponse,
    PaymentCalculation,
)
from .approval_predictor import ApprovalEstimate, ApprovalPredictor
from .calculations import build_payment, compute_amount_financed, estimate_gross, normalize
from .close_predictor import ClosePredictor

RANDOM_SEED = 97


@dataclass
class CandidateScore:
    identifier: str
    label: str
    structure: DealStructure
    payment: PaymentCalculation
    gross: GrossCalculation
    approval: ApprovalEstimate
    close_probability: float
    payment_delta: float
    score: float
    attributes: Dict[str, float]


class DealOptimizer:
    """Grid search based multi-objective optimizer for deal structures."""

    def __init__(
        self,
        approval_predictor: ApprovalPredictor,
        close_predictor: ClosePredictor,
    ) -> None:
        self._approval_predictor = approval_predictor
        self._close_predictor = close_predictor
        self._rng = np.random.default_rng(RANDOM_SEED)

    def optimize(self, request: OptimizationRequest) -> OptimizationResponse:
        lender_id = (
            request.structure.lender.preferred_lender_id
            if request.structure.lender and request.structure.lender.preferred_lender_id
            else request.goals.lender_preference
            if request.goals.lender_preference
            else "ALLY"
        )

        base_sale_price = request.structure.pricing.sale_price
        base_cash_down = request.structure.cash_down.total if request.structure.cash_down else 0.0
        base_term = request.current_payment.term_months
        apr = request.current_payment.apr
        vehicle_cost_basis = (request.vehicle.msrp or base_sale_price) * 0.92

        term_candidates = self._determine_term_grid(base_term, request.goals, request.constraints)
        price_deltas = np.array([-1000, -750, -500, -250, 0, 250, 500, 750, 1000])
        down_deltas = np.array([-2000, -1000, -500, 0, 500, 1000, 2000])
        rebate_toggles = self._determine_rebate_options(request.structure)

        candidates: List[CandidateScore] = []
        for term in term_candidates:
            if not self._is_term_allowed(term, request.constraints, request.goals):
                continue
            for price_delta in price_deltas:
                sale_price = max(base_sale_price + float(price_delta), 2000.0)
                base_structure = request.structure.model_copy(deep=True)
                base_structure.pricing.sale_price = sale_price
                self._apply_product_constraints(base_structure, request.constraints, request.goals)
                for rebate_factor in rebate_toggles:
                    cash_down_total = base_cash_down * rebate_factor
                    for down_delta in down_deltas:
                        structure = base_structure.model_copy(deep=True)
                        if structure.cash_down and structure.cash_down.manufacturer_rebate is not None and rebate_factor == 0.0:
                            structure.cash_down.manufacturer_rebate = 0.0
                        total_cash_down = self._clamp_cash_down(
                            cash_down_total + float(down_delta), request.constraints
                        )
                        if total_cash_down < 0:
                            continue
                        if not self._cash_within_constraints(total_cash_down, request.constraints):
                            continue
                        if structure.cash_down:
                            structure.cash_down.total = float(round(total_cash_down, 2))
                        amount_financed = compute_amount_financed(structure, sale_price)
                        if amount_financed <= 0:
                            continue
                        payment = build_payment(amount_financed, apr, term, structure.cash_down.total if structure.cash_down else 0.0)
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
                        approval_estimate = self._approval_predictor.estimate(approval_request)
                        if request.constraints.allowed_tiers and approval_estimate.recommended_tier not in request.constraints.allowed_tiers:
                            continue
                        close_probability = self._estimate_close_probability(
                            request,
                            structure,
                            sale_price,
                            payment,
                            total_cash_down,
                            approval_estimate.probability,
                        )
                        payment_delta = abs(payment.monthly_payment - self._target_payment(request))
                        gross = estimate_gross(structure, sale_price, payment, vehicle_cost_basis)
                        identifier = str(uuid4())
                        attributes = {
                            "term": float(term),
                            "sale_price": sale_price,
                            "cash_down": total_cash_down,
                            "close_probability": close_probability,
                            "approval_probability": approval_estimate.probability,
                            "gross": gross.total,
                            "payment_delta": payment_delta,
                        }
                        candidates.append(
                            CandidateScore(
                                identifier=identifier,
                                label=f"{term} mo | ${payment.monthly_payment:,.0f}/mo",
                                structure=structure,
                                payment=payment,
                                gross=gross,
                                approval=approval_estimate,
                                close_probability=close_probability,
                                payment_delta=payment_delta,
                                score=0.0,
                                attributes=attributes,
                            )
                        )
        if not candidates:
            raise ValueError("No viable deal structures satisfied the provided constraints")

        self._score_candidates(candidates, request)
        ranked = sorted(candidates, key=lambda c: c.score, reverse=True)
        recommended = ranked[0]
        alternatives = self._build_alternatives(ranked)
        insights, warnings = self._build_insights(recommended, request, ranked)
        trace_id = str(uuid4())

        return OptimizationResponse(
            worksheet_id=request.worksheet_id or "generated",
            version_id=request.version_id,
            recommended_structure=recommended.structure,
            projected_gross=recommended.gross,
            insights=insights,
            warnings=warnings,
            alternatives=alternatives,
            ml_trace_id=trace_id,
        )

    def _determine_term_grid(
        self,
        base_term: int,
        goals: OptimizationGoals,
        constraints: OptimizationConstraints,
    ) -> Sequence[int]:
        candidates = {base_term, 60, 72, 84}
        if goals.maximum_term:
            candidates.add(goals.maximum_term)
        if constraints.max_term:
            candidates.add(constraints.max_term)
        if constraints.min_term:
            candidates.add(constraints.min_term)
        filtered = [term for term in sorted(candidates) if term >= 36]
        return filtered

    def _determine_rebate_options(self, structure: DealStructure) -> Sequence[float]:
        if not structure.cash_down or not structure.cash_down.manufacturer_rebate:
            return [1.0]
        return [1.0, 0.0]

    def _is_term_allowed(self, term: int, constraints: OptimizationConstraints, goals: OptimizationGoals) -> bool:
        if constraints.min_term and term < constraints.min_term:
            return False
        if constraints.max_term and term > constraints.max_term:
            return False
        if goals.maximum_term and term > goals.maximum_term:
            return False
        return True

    def _clamp_cash_down(self, value: float, constraints: OptimizationConstraints) -> float:
        if constraints.min_cash_down is not None and value < constraints.min_cash_down:
            return constraints.min_cash_down
        if constraints.max_cash_down is not None and value > constraints.max_cash_down:
            return constraints.max_cash_down
        return value

    def _cash_within_constraints(self, value: float, constraints: OptimizationConstraints) -> bool:
        if constraints.min_cash_down is not None and value < constraints.min_cash_down:
            return False
        if constraints.max_cash_down is not None and value > constraints.max_cash_down:
            return False
        return True

    def _apply_product_constraints(
        self,
        structure: DealStructure,
        constraints: OptimizationConstraints,
        goals: OptimizationGoals,
    ) -> None:
        if not structure.backend_products:
            return
        banned = {code.upper() for code in (constraints.banned_products or [])}
        preserve = {code.upper() for code in (goals.preserve_products or [])}
        if not banned:
            return
        filtered = []
        for product in structure.backend_products:
            code = product.code.upper()
            if code in preserve or code not in banned:
                filtered.append(product)
        structure.backend_products = filtered

    def _target_payment(self, request: OptimizationRequest) -> float:
        if request.goals.target_payment:
            return request.goals.target_payment
        lender_target = (
            request.structure.lender.target_payment
            if request.structure.lender and request.structure.lender.target_payment
            else None
        )
        return lender_target or request.current_payment.monthly_payment

    def _estimate_close_probability(
        self,
        request: OptimizationRequest,
        structure: DealStructure,
        sale_price: float,
        payment: PaymentCalculation,
        cash_down: float,
        approval_probability: float,
    ) -> float:
        competitive_payment_delta = (payment.monthly_payment - self._target_payment(request)) / max(
            self._target_payment(request), 1.0
        )
        price_delta = (sale_price - request.structure.pricing.sale_price) / max(request.structure.pricing.sale_price, 1.0)
        site_visits = int(np.clip(request.customer_profile.credit_score / 60, 1, 18))
        vehicle_views = int(np.clip(request.customer_profile.credit_score / 45, 1, 20))
        email_opens = int(np.clip(request.customer_profile.credit_score / 90, 1, 12))
        sms_replies = int(np.clip(cash_down / 1000.0 * 2, 0, 6))
        calls = int(np.clip(approval_probability * 10, 1, 8))
        time_in_deal = int(np.clip(12 + (1 - approval_probability) * 20, 5, 40))
        win_rate = float(np.clip(0.45 + approval_probability * 0.4, 0.4, 0.92))
        day_of_month = int(np.clip(18 + np.sin(self._rng.uniform(0, np.pi)) * 8, 1, 30))

        close_request = ClosePredictionRequest(
            deal_id=request.deal_id,
            worksheet_id=request.worksheet_id,
            customer_profile=request.customer_profile,
            structure=structure,
            engagement=EngagementMetrics(
                site_visits=site_visits,
                vehicle_views=vehicle_views,
                email_opens=email_opens,
                sms_replies=sms_replies,
                calls=calls,
            ),
            competitive_context=CompetitiveContext(
                payment_delta=float(round(competitive_payment_delta, 3)),
                price_delta=float(round(price_delta, 3)),
            ),
            time_in_deal_days=time_in_deal,
            salesperson_win_rate=win_rate,
            day_of_month=day_of_month,
        )
        estimate = self._close_predictor.estimate(close_request)
        return estimate.probability

    def _score_candidates(self, candidates: List[CandidateScore], request: OptimizationRequest) -> None:
        gross_values = [candidate.gross.total for candidate in candidates]
        payment_deltas = [candidate.payment_delta for candidate in candidates]
        gross_min, gross_range = normalize(gross_values)
        payment_min, payment_range = normalize(payment_deltas)

        base_weights = self._determine_weights(request)
        for candidate in candidates:
            gross_score = (candidate.gross.total - gross_min) / gross_range
            payment_score = (candidate.payment_delta - payment_min) / payment_range
            score = (
                base_weights["gross"] * gross_score
                + base_weights["close"] * candidate.close_probability
                + base_weights["approval"] * candidate.approval.probability
                - base_weights["payment"] * payment_score
            )
            candidate.score = float(score)
            candidate.attributes.update(
                {
                    "gross_score": gross_score,
                    "payment_score": payment_score,
                    "weighted_score": candidate.score,
                }
            )

    def _determine_weights(self, request: OptimizationRequest) -> Dict[str, float]:
        weights = {"gross": 0.35, "close": 0.25, "approval": 0.25, "payment": 0.15}
        if request.goals.minimum_gross:
            weights["gross"] += 0.05
            weights["payment"] -= 0.02
        if request.goals.target_payment:
            weights["payment"] += 0.05
            weights["gross"] -= 0.03
        if request.goals.lender_preference:
            weights["approval"] += 0.04
            weights["close"] -= 0.02
        total = sum(weights.values())
        for key in weights:
            weights[key] = max(weights[key] / total, 0.05)
        return weights

    def _build_alternatives(self, ranked: List[CandidateScore]) -> List[AlternativeStructure]:
        top_candidates = ranked[:5]
        labeled = []
        for candidate in top_candidates:
            labeled.append(
                AlternativeStructure(
                    id=candidate.identifier,
                    label=candidate.label,
                    structure=candidate.structure,
                    payment=candidate.payment,
                    gross=candidate.gross,
                    probability_of_close=float(round(candidate.close_probability, 3)),
                    notes=self._describe_candidate(candidate),
                )
            )
        return labeled

    def _describe_candidate(self, candidate: CandidateScore) -> str:
        pieces = [
            f"Score {candidate.score:.3f}",
            f"Close {candidate.close_probability:.2%}",
            f"Approval {candidate.approval.probability:.2%}",
            f"Gross ${candidate.gross.total:,.0f}",
        ]
        return " | ".join(pieces)

    def _build_insights(
        self,
        recommended: CandidateScore,
        request: OptimizationRequest,
        ranked: List[CandidateScore],
    ) -> Tuple[List[str], List[str]]:
        insights = [
            f"Recommended payment {recommended.payment.monthly_payment:,.2f} vs target {self._target_payment(request):,.2f}",
            f"Projected total gross {recommended.gross.total:,.0f}",
            f"Approval odds {recommended.approval.probability:.1%}",
        ]
        warnings: List[str] = []
        if request.goals.minimum_gross and recommended.gross.total < request.goals.minimum_gross:
            warnings.append("Recommended structure below minimum gross goal")
        if ranked[0].payment.monthly_payment > self._target_payment(request) * 1.05:
            warnings.append("Payment relief limited by constraints")
        if request.constraints.allowed_tiers and recommended.approval.recommended_tier not in request.constraints.allowed_tiers:
            warnings.append("Best-scoring structure conflicts with allowed credit tiers")
        return insights, warnings
