from __future__ import annotations

from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

import pytest

from app.schemas.desking import (
    ApprovalPredictionRequest,
    CashDown,
    CustomerProfile,
    DealPricing,
    DealStructure,
    FeeLine,
    OptimizationConstraints,
    OptimizationGoals,
    OptimizationRequest,
    PaymentCalculation,
    TaxLine,
    VehicleInfo,
    CreditTier,
    ResidenceType,
    Recommendation,
)
from app.services.approval_predictor import ApprovalEstimate
from app.services.close_predictor import CloseEstimate
from app.services.deal_optimizer import DealOptimizer


class StubApprovalPredictor:
    def estimate(self, request: ApprovalPredictionRequest) -> ApprovalEstimate:  # type: ignore[override]
        probability = max(0.25, min(0.9, 0.82 - request.payment.monthly_payment / 4500.0))
        return ApprovalEstimate(
            probability=probability,
            recommended_tier=CreditTier.TIER_2,
            estimated_rate=request.payment.apr,
            estimated_reserve=160.0,
            strengths=["Synthetic"],
            weaknesses=["Payment"],
            stipulations=[],
            recommendation=Recommendation.MODERATE,
        )


class StubClosePredictor:
    def estimate(self, request) -> CloseEstimate:  # type: ignore[override]
        base = 0.6 + min(0.25, max(-0.2, request.salesperson_win_rate - 0.5))
        penalty = max(0.0, request.competitive_context.payment_delta)
        return CloseEstimate(probability=float(max(0.1, min(0.95, base - penalty))), horizon_days=30, influencing_factors=["synthetic"])


@pytest.fixture()
def optimization_request() -> OptimizationRequest:
    structure = DealStructure(
        pricing=DealPricing(msrp=34000.0, sale_price=32800.0),
        cash_down=CashDown(customer_cash=1500.0, manufacturer_rebate=500.0, trade_equity=0.0, total=2000.0),
        fees=[FeeLine(code="DOC", label="Doc", amount=250.0)],
        taxes=[TaxLine(jurisdiction="CA", rate=0.0825, amount=1500.0)],
    )
    customer = CustomerProfile(
        first_name="Jamie",
        last_name="Driver",
        credit_score=710,
        credit_tier=CreditTier.TIER_2,
        residence_type=ResidenceType.OWN,
        monthly_income=7200.0,
    )
    vehicle = VehicleInfo(
        vin="1HGBH41JXMN109186",
        year=2023,
        make="Toyota",
        model="Camry",
    )
    current_payment = PaymentCalculation(amount_financed=29000.0, apr=6.25, term_months=72, monthly_payment=468.0)
    return OptimizationRequest(
        deal_id="deal-weights",
        worksheet_id="ws-weights",
        structure=structure,
        customer_profile=customer,
        vehicle=vehicle,
        current_payment=current_payment,
        goals=OptimizationGoals(target_payment=450.0, minimum_gross=1500.0),
        constraints=OptimizationConstraints(max_term=72, min_cash_down=500.0, max_cash_down=4000.0),
    )


def test_weight_sweep_print(optimization_request: OptimizationRequest, capsys: pytest.CaptureFixture[str]) -> None:
    optimizer = DealOptimizer(StubApprovalPredictor(), StubClosePredictor())

    base_result = optimizer.optimize(optimization_request)
    gross_override = {"gross_weight": 0.55, "close_weight": 0.2, "approval_weight": 0.15, "payment_weight": 0.1}
    close_override = {"gross_weight": 0.2, "close_weight": 0.55, "approval_weight": 0.15, "payment_weight": 0.1}

    heavy_gross_request = optimization_request.model_copy(update={"scoring_override": gross_override})
    heavy_close_request = optimization_request.model_copy(update={"scoring_override": close_override})

    gross_result = optimizer.optimize(heavy_gross_request)
    close_result = optimizer.optimize(heavy_close_request)

    print(
        "Baseline:",
        {
            "sale_price": base_result.recommended_structure.pricing.sale_price,
            "cash_down": base_result.recommended_structure.cash_down.total if base_result.recommended_structure.cash_down else 0.0,
        },
    )
    print(
        "Gross-heavy:",
        {
            "sale_price": gross_result.recommended_structure.pricing.sale_price,
            "cash_down": gross_result.recommended_structure.cash_down.total if gross_result.recommended_structure.cash_down else 0.0,
        },
    )
    print(
        "Close-heavy:",
        {
            "sale_price": close_result.recommended_structure.pricing.sale_price,
            "cash_down": close_result.recommended_structure.cash_down.total if close_result.recommended_structure.cash_down else 0.0,
        },
    )

    captured = capsys.readouterr()
    assert "Baseline" in captured.out
    assert gross_result.recommended_structure.pricing.sale_price != close_result.recommended_structure.pricing.sale_price or gross_result.recommended_structure.cash_down.total != close_result.recommended_structure.cash_down.total
