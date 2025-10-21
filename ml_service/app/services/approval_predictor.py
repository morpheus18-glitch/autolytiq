from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
from joblib import dump, load
from lightgbm import LGBMClassifier
from numpy.random import default_rng
from sklearn.linear_model import LogisticRegression

from ..config.scoring import get_config
from ..schemas.desking import (
    ApprovalPrediction,
    ApprovalPredictionRequest,
    CreditTier,
    ModelMetadata,
    Recommendation,
    ResidenceType,
    Stipulation,
)
RANDOM_SEED = 31


@dataclass(frozen=True)
class ApprovalEstimate:
    probability: float
    recommended_tier: CreditTier
    estimated_rate: float
    estimated_reserve: float
    strengths: List[str]
    weaknesses: List[str]
    stipulations: List[Stipulation]
    recommendation: Recommendation


class ApprovalPredictor:
    """Gradient boosted approval model with Platt scaling calibration."""

    def __init__(self, model_registry: Path | str = "models") -> None:
        self._rng = default_rng(RANDOM_SEED)
        self._registry_path = Path(model_registry)
        self._registry_path.mkdir(parents=True, exist_ok=True)
        self._model_dir = self._registry_path / "approval_predictor"
        self._model_dir.mkdir(parents=True, exist_ok=True)
        self._model_path = self._model_dir / "model.joblib"
        self._calibrator_path = self._model_dir / "calibrator.joblib"
        self._metadata_path = self._model_dir / "metadata.json"
        self._feature_names = [
            "credit_score",
            "dti",
            "pti",
            "ltv",
            "vehicle_age",
            "tier_index",
            "lender_prior",
        ]
        self._lender_priors = self._load_lender_priors()
        self._model = None
        self._calibrator: LogisticRegression | None = None
        self._metadata: ModelMetadata | None = None
        self._load_or_initialize()

    def _load_lender_priors(self) -> Dict[str, float]:
        return {
            "ALLY": 0.82,
            "CHASE": 0.78,
            "SANTANDER": 0.71,
            "CAPITAL_ONE": 0.69,
            "US_BANK": 0.75,
            "GM_FINANCIAL": 0.77,
        }

    def _load_or_initialize(self) -> None:
        if self._model_path.exists() and self._calibrator_path.exists() and self._metadata_path.exists():
            self._model = load(self._model_path)
            self._calibrator = load(self._calibrator_path)
            with self._metadata_path.open("r", encoding="utf-8") as fh:
                metadata_raw = json.load(fh)
            self._metadata = ModelMetadata(**metadata_raw)
            return
        self._train_default_model()

    def _train_default_model(self) -> None:
        rng = self._rng
        sample_size = 1200
        credit_scores = rng.normal(680, 60, sample_size).clip(500, 840)
        income = rng.lognormal(mean=8.5, sigma=0.35, size=sample_size)
        payment = rng.normal(520, 140, sample_size).clip(250, 1500)
        apr = rng.normal(5.2, 2.0, sample_size).clip(1.9, 16.5)
        ltv = rng.normal(0.97, 0.08, sample_size).clip(0.6, 1.35)
        vehicle_age = rng.integers(0, 9, sample_size)
        tier_index = rng.integers(0, len(list(CreditTier)), sample_size)
        lender_prior = rng.choice(list(self._lender_priors.values()), sample_size)

        pti = payment / np.maximum(income / 12.0, 1.0)
        dti = 0.28 * pti + rng.normal(0.22, 0.05, sample_size)

        logits = (
            2.4
            + 0.008 * (credit_scores - 650)
            - 2.2 * np.maximum(pti - 0.18, 0)
            - 1.4 * np.maximum(dti - 0.42, 0)
            - 1.8 * np.maximum(ltv - 1.05, 0)
            - 0.12 * vehicle_age
            + 1.6 * lender_prior
            - 0.15 * tier_index
            - 0.035 * (apr - 5.0)
        )
        probability = 1 / (1 + np.exp(-logits))
        approvals = rng.binomial(1, probability)

        features = np.column_stack(
            [credit_scores, dti, pti, ltv, vehicle_age, tier_index, lender_prior]
        )

        model = LGBMClassifier(
            n_estimators=220,
            learning_rate=0.08,
            max_depth=-1,
            num_leaves=31,
            min_child_samples=12,
            subsample=0.9,
            colsample_bytree=0.8,
            random_state=RANDOM_SEED,
        )
        model.fit(features, approvals)

        base_scores = model.predict_proba(features)[:, 1].reshape(-1, 1)
        calibrator = LogisticRegression(max_iter=500)
        calibrator.fit(base_scores, approvals)

        metadata = ModelMetadata(
            name="lgbm_approval_predictor",
            version="1.0.0",
            trained_at=datetime.utcnow(),
            feature_names=self._feature_names,
        )

        dump(model, self._model_path)
        dump(calibrator, self._calibrator_path)
        with self._metadata_path.open("w", encoding="utf-8") as fh:
            json.dump(metadata.model_dump(mode="json"), fh)

        self._model = model
        self._calibrator = calibrator
        self._metadata = metadata

    def _fetch_lender_prior(self, lender_id: str) -> float:
        key = lender_id.upper().replace(" ", "_")
        return self._lender_priors.get(key, 0.65)

    def _tier_index(self, tier: CreditTier) -> int:
        return list(CreditTier).index(tier)

    def _build_features(
        self,
        request: ApprovalPredictionRequest,
        lender_prior: float,
    ) -> np.ndarray:
        structure = request.structure
        sale_price = structure.pricing.sale_price
        msrp = request.vehicle.msrp or sale_price
        amount_financed = request.payment.amount_financed
        cash_total = structure.cash_down.total if structure.cash_down else 0.0
        trade_equity = (structure.trade.equity or 0.0) if structure.trade else 0.0
        ltv = (amount_financed - trade_equity + cash_total) / max(msrp, 1.0)

        monthly_income = request.customer_profile.monthly_income or 5500.0
        pti = request.payment.monthly_payment / max(monthly_income, 1.0)
        dti = request.customer_profile.debt_to_income_ratio
        if dti is None:
            revolving = 0.28 * pti
            mortgage = 0.12 if request.customer_profile.residence_type == ResidenceType.RENT else 0.18
            dti = revolving + mortgage

        vehicle_age = max(datetime.utcnow().year - request.vehicle.year, 0)
        tier_index = self._tier_index(request.customer_profile.credit_tier)

        features = np.array(
            [
                float(request.customer_profile.credit_score),
                float(dti),
                float(pti),
                float(ltv),
                float(vehicle_age),
                float(tier_index),
                float(lender_prior),
            ]
        )
        return features

    def _calibrate(self, raw_probability: float) -> float:
        if self._calibrator is None:
            return raw_probability
        score = np.array(raw_probability).reshape(-1, 1)
        calibrated = self._calibrator.predict_proba(score)[0, 1]
        return float(np.clip(calibrated, 0.01, 0.995))

    def _assess_strengths(self, request: ApprovalPredictionRequest, probability: float) -> Tuple[List[str], List[str]]:
        strengths: List[str] = []
        weaknesses: List[str] = []
        profile = request.customer_profile
        payment = request.payment
        structure = request.structure

        pti = payment.monthly_payment / max(profile.monthly_income or 5000.0, 1.0)
        dti = profile.debt_to_income_ratio or pti + 0.18
        ltv = payment.amount_financed / max(request.vehicle.msrp or structure.pricing.sale_price, 1.0)

        if profile.credit_score >= 700:
            strengths.append("Strong credit score profile")
        else:
            weaknesses.append("Fair credit profile requires compensating factors")
        if pti <= 0.18:
            strengths.append("Payment-to-income within preferred band")
        else:
            weaknesses.append("Payment consumes larger share of income")
        if dti <= 0.42:
            strengths.append("Debt load manageable for lender overlays")
        else:
            weaknesses.append("Debt-to-income exceeds prime guidelines")
        if ltv <= 1.0:
            strengths.append("Equity position supports advance")
        else:
            weaknesses.append("High advance amount may require proof of income")
        if probability > 0.75:
            strengths.append("Historical win rate with lender is high")
        elif probability < 0.45:
            weaknesses.append("Consider backup lender or restructure")
        return strengths, weaknesses

    def _build_stipulations(self, probability: float, request: ApprovalPredictionRequest) -> List[Stipulation]:
        stipulations: List[Stipulation] = []
        if probability < 0.6:
            stipulations.append(
                Stipulation(code="POI", description="Proof of income - last 2 paystubs", required=True)
            )
        if request.payment.amount_financed > 45000:
            stipulations.append(
                Stipulation(code="INS", description="Proof of full coverage insurance", required=True)
            )
        if request.vehicle.mileage and request.vehicle.mileage > 60000:
            stipulations.append(
                Stipulation(code="SMOG", description="Vehicle inspection / smog certificate", required=False)
            )
        if not stipulations:
            stipulations.append(
                Stipulation(code="VERBAL", description="Verbal employment verification", required=False)
            )
        return stipulations

    def _derive_recommendation(self, probability: float) -> Recommendation:
        if probability >= 0.75:
            return Recommendation.STRONG
        if probability >= 0.6:
            return Recommendation.MODERATE
        if probability >= 0.45:
            return Recommendation.WEAK
        return Recommendation.DO_NOT_SUBMIT

    def estimate(self, request: ApprovalPredictionRequest) -> ApprovalEstimate:
        lender_prior = self._fetch_lender_prior(request.lender_id)
        features = self._build_features(request, lender_prior)
        if self._model is None:
            raise RuntimeError("Approval model has not been initialized")
        base_probability = float(self._model.predict_proba(features.reshape(1, -1))[0, 1])
        calibrated = self._calibrate(base_probability)
        config = get_config()
        clip_cfg = config.get("normalization", {}).get("approval_probability", {})
        clip_min = float(clip_cfg.get("clip_min", 0.0)) / 100.0
        clip_max = float(clip_cfg.get("clip_max", 100.0)) / 100.0
        calibrated = float(np.clip(calibrated, clip_min, clip_max))

        estimated_rate = max(2.49, request.payment.apr * (1.0 + (1 - calibrated) * 0.25))
        estimated_reserve = float(max(request.payment.monthly_payment * 0.03 * calibrated, 0.0))
        strengths, weaknesses = self._assess_strengths(request, calibrated)
        stipulations = self._build_stipulations(calibrated, request)
        recommendation = self._derive_recommendation(calibrated)

        tiers = list(CreditTier)
        tier_index = min(int(math.floor((1.0 - calibrated) * len(tiers))), len(tiers) - 1)
        recommended_tier = tiers[tier_index]

        return ApprovalEstimate(
            probability=calibrated,
            recommended_tier=recommended_tier,
            estimated_rate=float(round(estimated_rate, 3)),
            estimated_reserve=float(round(estimated_reserve, 2)),
            strengths=strengths,
            weaknesses=weaknesses,
            stipulations=stipulations,
            recommendation=recommendation,
        )

    def predict(self, request: ApprovalPredictionRequest, ml_trace_id: str) -> ApprovalPrediction:
        estimate = self.estimate(request)
        lender_name = request.lender_id.replace("_", " ").title()
        return ApprovalPrediction(
            deal_id=request.deal_id,
            worksheet_id=request.worksheet_id,
            version_id=request.version_id,
            lender_id=request.lender_id,
            lender_name=lender_name.title(),
            approval_probability=float(round(estimate.probability, 4)),
            recommended_tier=estimate.recommended_tier,
            estimated_rate=estimate.estimated_rate,
            estimated_reserve=estimate.estimated_reserve,
            strengths=estimate.strengths,
            weaknesses=estimate.weaknesses,
            stipulations=estimate.stipulations,
            recommendation=estimate.recommendation,
            ml_trace_id=ml_trace_id,
        )
