from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import Field

from ..utils.pydantic import CamelModel


class DealStatus(str, Enum):
    WORKING = "WORKING"
    PENCILED = "PENCILED"
    SUBMITTED = "SUBMITTED"
    CLOSED = "CLOSED"
    LOST = "LOST"


class CreditTier(str, Enum):
    TIER_1 = "TIER_1"
    TIER_2 = "TIER_2"
    TIER_3 = "TIER_3"
    TIER_4 = "TIER_4"
    TIER_5 = "TIER_5"
    TIER_6 = "TIER_6"


class ResidenceType(str, Enum):
    OWN = "OWN"
    RENT = "RENT"
    LEASE = "LEASE"
    FAMILY = "FAMILY"
    MILITARY = "MILITARY"
    OTHER = "OTHER"


class Recommendation(str, Enum):
    STRONG = "STRONG"
    MODERATE = "MODERATE"
    WEAK = "WEAK"
    DO_NOT_SUBMIT = "DO_NOT_SUBMIT"


class CounterOutcome(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"


class FeeLine(CamelModel):
    code: str
    label: str
    amount: float
    taxable: Optional[bool] = None


class BackendProduct(CamelModel):
    code: str
    name: str
    price: float
    cost: Optional[float] = None
    term_months: Optional[int] = Field(default=None, ge=0)


class TaxLine(CamelModel):
    jurisdiction: str
    rate: float
    amount: float


class DealPricing(CamelModel):
    msrp: Optional[float] = Field(default=None, ge=0)
    sale_price: float = Field(alias="salePrice")
    dealer_discounts: Optional[List[FeeLine]] = None
    accessories: Optional[List[FeeLine]] = None


class TradeVehicle(CamelModel):
    allowance: Optional[float] = None
    payoff: Optional[float] = None
    equity: Optional[float] = None
    description: Optional[str] = None


class TradeDetails(CamelModel):
    allowance: Optional[float] = None
    payoff: Optional[float] = None
    equity: Optional[float] = None
    description: Optional[str] = None
    vehicle: Optional["VehicleInfo"] = None


class CashDown(CamelModel):
    customer_cash: Optional[float] = None
    manufacturer_rebate: Optional[float] = None
    trade_equity: Optional[float] = None
    total: float


class LenderPreferences(CamelModel):
    preferred_lender_id: Optional[str] = None
    backup_lender_id: Optional[str] = None
    max_term: Optional[int] = Field(default=None, ge=0)
    min_term: Optional[int] = Field(default=None, ge=0)
    target_payment: Optional[float] = Field(default=None, ge=0)


class DealStructure(CamelModel):
    pricing: DealPricing
    trade: Optional[TradeDetails] = None
    cash_down: Optional[CashDown] = None
    fees: List[FeeLine]
    taxes: List[TaxLine]
    backend_products: Optional[List[BackendProduct]] = None
    lender: Optional[LenderPreferences] = None


class VehicleInfo(CamelModel):
    id: Optional[str] = None
    vin: str
    stock_number: Optional[str] = None
    year: int
    make: str
    model: str
    trim: Optional[str] = None
    mileage: Optional[float] = None
    type: Optional[str] = Field(default=None, pattern="^(NEW|USED|CERTIFIED)$")
    msrp: Optional[float] = None
    sale_price: Optional[float] = None
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None


class CustomerProfile(CamelModel):
    id: Optional[str] = None
    first_name: str
    last_name: str
    email: Optional[str] = None
    credit_score: int
    credit_tier: CreditTier
    residence_type: ResidenceType
    residence_duration_months: Optional[int] = None
    monthly_income: Optional[float] = None
    employment_status: Optional[str] = None
    employer_name: Optional[str] = None
    debt_to_income_ratio: Optional[float] = None
    has_co_buyer: Optional[bool] = None


class PaymentCalculation(CamelModel):
    amount_financed: float
    apr: float
    term_months: int
    monthly_payment: float
    due_at_signing: Optional[float] = None


class GrossCalculation(CamelModel):
    front_end: float
    back_end: float
    finance_reserve: Optional[float] = None
    doc_fee: Optional[float] = None
    pack: Optional[float] = None
    total: float


class OptimizationGoals(CamelModel):
    target_payment: Optional[float] = None
    minimum_gross: Optional[float] = None
    maximum_term: Optional[int] = None
    preserve_products: Optional[List[str]] = None
    lender_preference: Optional[str] = None


class OptimizationConstraints(CamelModel):
    max_term: Optional[int] = None
    min_term: Optional[int] = None
    min_cash_down: Optional[float] = None
    max_cash_down: Optional[float] = None
    allowed_tiers: Optional[List[CreditTier]] = None
    residence_type: Optional[ResidenceType] = None
    banned_products: Optional[List[str]] = None


class AlternativeStructure(CamelModel):
    id: str
    label: str
    structure: DealStructure
    payment: PaymentCalculation
    gross: GrossCalculation
    probability_of_close: Optional[float] = None
    notes: Optional[str] = None


class OptimizationRequest(CamelModel):
    deal_id: str
    worksheet_id: Optional[str] = None
    version_id: Optional[str] = None
    structure: DealStructure
    customer_profile: CustomerProfile
    vehicle: VehicleInfo
    current_payment: PaymentCalculation
    goals: OptimizationGoals
    constraints: OptimizationConstraints
    scoring_override: Optional[Dict[str, float]] = Field(default=None, alias="scoringOverride")


class OptimizationResponse(CamelModel):
    worksheet_id: str
    version_id: Optional[str] = None
    recommended_structure: DealStructure
    projected_gross: Optional[GrossCalculation] = None
    insights: List[str]
    warnings: List[str]
    alternatives: List[AlternativeStructure]
    ml_trace_id: str = Field(alias="mlTraceId")


class CounterCustomerInput(CamelModel):
    customer_concern: str
    requested_payment: Optional[float] = None
    requested_term: Optional[int] = None
    requested_cash_down: Optional[float] = None
    requested_apr: Optional[float] = None
    notes: Optional[str] = None


class CounterAnalysisRequest(CamelModel):
    deal_id: str
    worksheet_id: str
    version_id: Optional[str] = None
    customer_input: CounterCustomerInput
    structure: DealStructure
    current_payment: PaymentCalculation
    customer_profile: CustomerProfile


class CounterOption(CamelModel):
    id: str
    label: str
    structure: DealStructure
    payment: PaymentCalculation
    gross: GrossCalculation
    probability_of_close: Optional[float] = None
    notes: Optional[str] = None
    rebuttal_script: Optional[str] = None


class CounterAnalysisResponse(CamelModel):
    summary: str
    options: List[CounterOption]
    recommendation: Optional[str] = None
    recommended_option_id: Optional[str] = None
    confidence: Optional[float] = None
    outcome: Optional[CounterOutcome] = None
    ml_trace_id: str = Field(alias="mlTraceId")


class Stipulation(CamelModel):
    code: str
    description: str
    required: bool
    category: Optional[str] = None
    documents: Optional[List[str]] = None


class ApprovalPredictionRequest(CamelModel):
    deal_id: str
    worksheet_id: Optional[str] = None
    version_id: Optional[str] = None
    lender_id: str
    structure: DealStructure
    customer_profile: CustomerProfile
    vehicle: VehicleInfo
    payment: PaymentCalculation


class ApprovalPrediction(CamelModel):
    deal_id: str
    worksheet_id: Optional[str] = None
    version_id: Optional[str] = None
    lender_id: str
    lender_name: str
    approval_probability: float
    recommended_tier: CreditTier
    estimated_rate: Optional[float] = None
    estimated_reserve: Optional[float] = None
    strengths: List[str]
    weaknesses: List[str]
    stipulations: List[Stipulation]
    recommendation: Recommendation
    ml_trace_id: str = Field(alias="mlTraceId")


class EngagementMetrics(CamelModel):
    site_visits: int
    vehicle_views: int
    email_opens: int
    sms_replies: int
    calls: int


class CompetitiveContext(CamelModel):
    payment_delta: float
    price_delta: float


class ClosePredictionRequest(CamelModel):
    deal_id: str
    worksheet_id: Optional[str] = None
    customer_profile: CustomerProfile
    structure: DealStructure
    engagement: EngagementMetrics
    competitive_context: CompetitiveContext
    time_in_deal_days: int
    salesperson_win_rate: float
    day_of_month: int


class ClosePrediction(CamelModel):
    deal_id: str
    worksheet_id: Optional[str] = None
    probability: float
    horizon_days: int
    influencing_factors: List[str]
    ml_trace_id: str = Field(alias="mlTraceId")


class ModelMetadata(CamelModel):
    name: str
    version: str
    trained_at: datetime
    feature_names: List[str]


TradeDetails.model_rebuild()
DealStructure.model_rebuild()
AlternativeStructure.model_rebuild()
CounterOption.model_rebuild()
OptimizationRequest.model_rebuild()
