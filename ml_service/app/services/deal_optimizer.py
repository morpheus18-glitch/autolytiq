from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Sequence, Tuple
from uuid import uuid4

import numpy as np

from ..config.scoring import get_config
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
from .calculations import build_payment, compute_amount_financed, estimate_gross
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

        config = get_config()
        search_cfg = config.get("constraints", {}).get("search", {})
        global_constraints = config.get("constraints", {}).get("global", {})

        term_candidates = self._determine_term_grid(
            base_term,
            request.goals,
            request.constraints,
            search_cfg,
            global_constraints,
        )
        price_deltas = self._build_price_deltas(search_cfg)
        down_deltas = self._build_down_deltas(search_cfg)
        rebate_toggles = self._determine_rebate_options(request.structure, search_cfg)

        candidates: List[CandidateScore] = []
        for term in term_candidates:
            if not self._is_term_allowed(term, request.constraints, request.goals):
                continue
            for price_delta in price_deltas:
                sale_price = max(base_sale_price + float(price_delta), 2000.0)
                msrp_ceiling = (
                    request.vehicle.msrp
                    or request.structure.pricing.msrp
                    or sale_price
                )
                if sale_price > msrp_ceiling:
                    sale_price = msrp_ceiling
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
                        payment = build_payment(
                            amount_financed,
                            apr,
                            term,
                            structure.cash_down.total if structure.cash_down else 0.0,
                        )
                        if self._violates_global_constraints(
                            request,
                            structure,
                            payment,
                            sale_price,
                            amount_financed,
                            term,
                            global_constraints,
                        ):
                            continue
                        msrp = request.vehicle.msrp or sale_price
                        ltv_ratio = amount_financed / max(msrp, 1.0)
                        monthly_income = request.customer_profile.monthly_income or 0.0
                        pti_ratio = payment.monthly_payment / monthly_income if monthly_income else None
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
                            "ltv": float(round(ltv_ratio, 4)),
                            "pti": float(round(pti_ratio, 4)) if pti_ratio is not None else None,
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

        self._score_candidates(candidates, request, config, global_constraints)
        tie_breakers = list(config.get("policy", {}).get("tie_breakers", []))
        ranked = sorted(
            candidates,
            key=lambda candidate: self._candidate_sort_key(candidate, tie_breakers),
            reverse=True,
        )
        recommended = ranked[0]
        alternatives = self._build_alternatives(ranked)
        insights, warnings = self._build_insights(recommended, request, ranked, config)
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
        search_cfg: Dict[str, Any],
        global_constraints: Dict[str, Any],
    ) -> Sequence[int]:
        candidates = {int(base_term), 60, 72, 84}
        for candidate in search_cfg.get("term_candidates", []) or []:
            try:
                candidates.add(int(candidate))
            except (TypeError, ValueError):
                continue
        if goals.maximum_term:
            candidates.add(goals.maximum_term)
        if constraints.max_term:
            candidates.add(constraints.max_term)
        if constraints.min_term:
            candidates.add(constraints.min_term)
        allowed_terms = global_constraints.get("terms_allowed") or []
        for value in allowed_terms:
            try:
                candidates.add(int(value))
            except (TypeError, ValueError):
                continue
        filtered = [term for term in sorted(candidates) if term >= 24]
        return filtered

    def _determine_rebate_options(self, structure: DealStructure, search_cfg: Dict[str, Any]) -> Sequence[float]:
        if not search_cfg.get("consider_rebates", True):
            return [1.0]
        if not structure.cash_down or not structure.cash_down.manufacturer_rebate:
            return [1.0]
        return [1.0, 0.0]

    def _build_price_deltas(self, search_cfg: Dict[str, Any]) -> np.ndarray:
        step = max(int(search_cfg.get("price_step", 50)), 1)
        limit = max(int(search_cfg.get("price_delta_abs", 1000)), step)
        return np.arange(-limit, limit + step, step, dtype=float)

    def _build_down_deltas(self, search_cfg: Dict[str, Any]) -> np.ndarray:
        step = max(int(search_cfg.get("down_step", 500)), 1)
        span = step * 4
        deltas = np.arange(-span, span + step, step, dtype=float)
        if not search_cfg.get("consider_trade_adjustments", True):
            deltas = deltas[deltas >= 0]
        if not np.any(deltas == 0):
            deltas = np.append(deltas, 0.0)
        return np.unique(deltas)

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

    def _violates_global_constraints(
        self,
        request: OptimizationRequest,
        structure: DealStructure,
        payment: PaymentCalculation,
        sale_price: float,
        amount_financed: float,
        term: int,
        global_constraints: Dict[str, Any],
    ) -> bool:
        allowed_terms = global_constraints.get("terms_allowed") or []
        if allowed_terms:
            allowed_set = {int(value) for value in allowed_terms}
            if term not in allowed_set:
                return True

        apr_bounds = global_constraints.get("apr_bounds") or {}
        min_apr = apr_bounds.get("min")
        max_apr = apr_bounds.get("max")
        if min_apr is not None and payment.apr < float(min_apr):
            return True
        if max_apr is not None and payment.apr > float(max_apr):
            return True

        max_ltv = global_constraints.get("max_ltv")
        if max_ltv is not None:
            msrp = request.vehicle.msrp or sale_price
            if msrp > 0:
                ltv = (amount_financed / msrp) * 100
                if ltv > float(max_ltv):
                    return True

        max_pti = global_constraints.get("max_pti")
        if max_pti is not None:
            income = request.customer_profile.monthly_income
            if income and income > 0:
                pti = (payment.monthly_payment / income) * 100
                if pti > float(max_pti):
                    return True

        return False

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

    def _score_candidates(
        self,
        candidates: List[CandidateScore],
        request: OptimizationRequest,
        config: Dict[str, Any],
        global_constraints: Dict[str, Any],
    ) -> None:
        normalization_cfg = config.get("normalization", {})
        gross_cfg = normalization_cfg.get("gross", {})
        close_cfg = normalization_cfg.get("close_probability", {})
        approval_cfg = normalization_cfg.get("approval_probability", {})
        payment_cfg = normalization_cfg.get("payment", {})
        weights = self._determine_weights(request, config.get("objectives", {}))
        min_gross = float(global_constraints.get("min_gross") or 0.0)

        for candidate in candidates:
            gross_score = self._normalize_gross(candidate.gross.total, gross_cfg)
            close_score = self._normalize_probability(candidate.close_probability * 100.0, close_cfg)
            approval_score = self._normalize_probability(
                candidate.approval.probability * 100.0,
                approval_cfg,
            )
            payment_score, payment_penalty = self._normalize_payment(
                candidate.payment.monthly_payment,
                request,
                payment_cfg,
            )
            policy_penalty = 0.0
            if min_gross and candidate.gross.total < min_gross:
                policy_penalty += 0.1

            candidate.score = float(
                weights["gross"] * gross_score
                + weights["close"] * close_score
                + weights["approval"] * approval_score
                + weights["payment"] * payment_score
                - policy_penalty
            )
            candidate.attributes.update(
                {
                    "gross_score": gross_score,
                    "close_score": close_score,
                    "approval_score": approval_score,
                    "payment_score": payment_score,
                    "payment_penalty": payment_penalty,
                    "policy_penalty": policy_penalty,
                    "weighted_score": candidate.score,
                }
            )

    def _determine_weights(
        self,
        request: OptimizationRequest,
        objectives: Dict[str, Any],
    ) -> Dict[str, float]:
        weights = {
            "gross": float(objectives.get("gross_weight", 0.35)),
            "close": float(objectives.get("close_weight", 0.25)),
            "approval": float(objectives.get("approval_weight", 0.25)),
            "payment": float(objectives.get("payment_weight", 0.15)),
        }

        override = getattr(request, "scoring_override", None)
        if isinstance(override, dict):
            mapping = {
                "gross_weight": "gross",
                "close_weight": "close",
                "approval_weight": "approval",
                "payment_weight": "payment",
            }
            for key, dest in mapping.items():
                value = override.get(key)
                if value is not None:
                    weights[dest] = float(value)

        if request.goals.minimum_gross:
            weights["gross"] += 0.05
            weights["payment"] = max(weights["payment"] - 0.02, 0.0)
        if request.goals.target_payment:
            weights["payment"] += 0.05
            weights["gross"] = max(weights["gross"] - 0.03, 0.0)
        if request.goals.lender_preference:
            weights["approval"] += 0.04
            weights["close"] = max(weights["close"] - 0.02, 0.0)

        total = sum(weights.values())
        if total <= 0:
            total = 1.0
        normalized = {key: max(value / total, 0.01) for key, value in weights.items()}
        norm_total = sum(normalized.values())
        return {key: value / norm_total for key, value in normalized.items()}

    def _normalize_gross(self, value: float, cfg: Dict[str, Any]) -> float:
        baseline = float(cfg.get("baseline_avg", value))
        std = float(cfg.get("baseline_std", 1.0)) or 1.0
        clip_min = float(cfg.get("clip_min", baseline - 3 * std))
        clip_max = float(cfg.get("clip_max", baseline + 3 * std))
        lower = (clip_min - baseline) / std
        upper = (clip_max - baseline) / std
        z_score = (value - baseline) / std
        clamped = float(np.clip(z_score, lower, upper))
        return (clamped - lower) / max(upper - lower, 1e-6)

    def _normalize_probability(self, value: float, cfg: Dict[str, Any]) -> float:
        clip_min = float(cfg.get("clip_min", 0.0))
        clip_max = float(cfg.get("clip_max", 100.0))
        clamped = float(np.clip(value, clip_min, clip_max))
        return (clamped - clip_min) / max(clip_max - clip_min, 1e-6)

    def _normalize_payment(
        self,
        monthly_payment: float,
        request: OptimizationRequest,
        cfg: Dict[str, Any],
    ) -> Tuple[float, float]:
        target = request.goals.target_payment or cfg.get("target_payment")
        if target is None:
            target = monthly_payment
        target = float(target)
        soft_cap = float(cfg.get("soft_cap", target))
        hard_cap = float(cfg.get("hard_cap", soft_cap))

        if monthly_payment <= target:
            penalty = 0.0
        elif monthly_payment >= hard_cap:
            penalty = 1.0
        elif monthly_payment <= soft_cap:
            penalty = (monthly_payment - target) / max(soft_cap - target, 1e-6) * 0.5
        else:
            penalty = 0.5 + (monthly_payment - soft_cap) / max(hard_cap - soft_cap, 1e-6) * 0.5

        penalty = float(np.clip(penalty, 0.0, 1.0))
        return 1.0 - penalty, penalty

    def _candidate_sort_key(self, candidate: CandidateScore, tie_breakers: Sequence[str]) -> Tuple[float, ...]:
        key_components: List[float] = [candidate.score]
        for breaker in tie_breakers:
            match breaker:
                case "max_approval_probability":
                    key_components.append(candidate.approval.probability)
                case "max_gross":
                    key_components.append(candidate.gross.total)
                case "min_payment":
                    key_components.append(-candidate.payment.monthly_payment)
                case _:
                    continue
        return tuple(key_components)

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
        config: Dict[str, Any],
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
        policy_warnings = config.get("policy", {}).get("warnings", {})
        low_gross_threshold = policy_warnings.get("low_gross_threshold")
        if low_gross_threshold is not None and recommended.gross.total < float(low_gross_threshold):
            warnings.append("Projected gross falls below policy threshold")
        high_payment_threshold = policy_warnings.get("high_payment_threshold")
        if high_payment_threshold is not None and recommended.payment.monthly_payment > float(high_payment_threshold):
            warnings.append("Monthly payment exceeds policy warning threshold")
        risky_threshold = policy_warnings.get("risky_profile_threshold")
        if risky_threshold is not None and recommended.approval.probability < float(risky_threshold):
            warnings.append("Approval probability below comfort threshold")
        return insights, warnings
