from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import sys

import numpy as np
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from ml_service.app.schemas.desking import (
    BackendProduct,
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
from ml_service.app.services.approval_predictor import ApprovalEstimate
from ml_service.app.services.close_predictor import CloseEstimate
from ml_service.app.services.deal_optimizer import DealOptimizer


@dataclass
class FakeApprovalPredictor:
    def estimate(self, request):  # type: ignore[override]
        payment = request.payment.monthly_payment
        probability = float(np.clip(0.92 - payment / 2000.0, 0.25, 0.92))
        return ApprovalEstimate(
            probability=probability,
            recommended_tier=CreditTier.TIER_2,
            estimated_rate=5.25,
            estimated_reserve=220.0,
            strengths=["Synthetic"],
            weaknesses=["High payment"],
            stipulations=[],
            recommendation=Recommendation.MODERATE,
        )


@dataclass
class FakeClosePredictor:
    def estimate(self, request):  # type: ignore[override]
        probability = float(np.clip(0.8 - max(request.competitive_context.payment_delta, 0) * 0.5, 0.1, 0.95))
        return CloseEstimate(probability=probability, horizon_days=30, influencing_factors=["synthetic"])


@pytest.fixture
def optimization_request() -> OptimizationRequest:
    structure = DealStructure(
        pricing=DealPricing(msrp=33000.0, sale_price=32000.0),
        cash_down=CashDown(customer_cash=1500.0, manufacturer_rebate=500.0, trade_equity=0.0, total=2000.0),
        fees=[FeeLine(code="DOC", label="Doc", amount=250.0)],
        taxes=[TaxLine(jurisdiction="CA", rate=0.0825, amount=1500.0)],
        backend_products=[BackendProduct(code="VSC", name="Service", price=1200.0, cost=600.0)],
    )
    customer = CustomerProfile(
        first_name="Sam",
        last_name="Driver",
        credit_score=705,
        credit_tier=CreditTier.TIER_2,
        residence_type=ResidenceType.OWN,
        monthly_income=6800.0,
    )
    vehicle = VehicleInfo(
        vin="1HGBH41JXMN109186",
        year=2022,
        make="Toyota",
        model="Camry",
    )
    current_payment = PaymentCalculation(amount_financed=28500.0, apr=6.4, term_months=72, monthly_payment=480.0)
    return OptimizationRequest(
        deal_id="deal-1",
        worksheet_id="ws-1",
        structure=structure,
        customer_profile=customer,
        vehicle=vehicle,
        current_payment=current_payment,
        goals=OptimizationGoals(target_payment=450.0, minimum_gross=1800.0),
        constraints=OptimizationConstraints(max_term=72, min_cash_down=500.0, max_cash_down=3500.0),
    )


def test_deal_optimizer_prefers_close_payment_balance(optimization_request: OptimizationRequest) -> None:
    optimizer = DealOptimizer(FakeApprovalPredictor(), FakeClosePredictor())
    result = optimizer.optimize(optimization_request)

    assert result.recommended_structure.pricing.sale_price <= optimization_request.structure.pricing.msrp
    assert result.projected_gross is not None
    assert result.projected_gross.total >= 1000
    assert result.alternatives
    assert result.alternatives[0].payment.monthly_payment <= optimization_request.current_payment.monthly_payment * 1.2
    assert any(option.probability_of_close for option in result.alternatives)


def test_optimizer_respects_term_and_cash_constraints(optimization_request: OptimizationRequest) -> None:
    optimizer = DealOptimizer(FakeApprovalPredictor(), FakeClosePredictor())
    result = optimizer.optimize(optimization_request)

    max_term = optimization_request.constraints.max_term or 96
    for option in result.alternatives:
        assert option.payment.term_months <= max_term
        if option.structure.cash_down:
            assert option.structure.cash_down.total >= optimization_request.constraints.min_cash_down
            assert option.structure.cash_down.total <= optimization_request.constraints.max_cash_down
