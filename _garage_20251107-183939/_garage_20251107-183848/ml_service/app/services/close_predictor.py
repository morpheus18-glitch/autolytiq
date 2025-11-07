from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List

import numpy as np
from joblib import dump, load
from numpy.random import default_rng
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.isotonic import IsotonicRegression

from ..config.scoring import get_config
from ..schemas.desking import (
    ClosePrediction,
    ClosePredictionRequest,
    CompetitiveContext,
    EngagementMetrics,
)

RANDOM_SEED = 37


@dataclass(frozen=True)
class CloseEstimate:
    probability: float
    horizon_days: int
    influencing_factors: List[str]


class ClosePredictor:
    """Calibrated gradient boosting model for close probabilities."""

    def __init__(self, model_registry: Path | str = "models") -> None:
        self._rng = default_rng(RANDOM_SEED)
        self._registry_path = Path(model_registry)
        self._registry_path.mkdir(parents=True, exist_ok=True)
        self._model_dir = self._registry_path / "close_predictor"
        self._model_dir.mkdir(parents=True, exist_ok=True)
        self._model_path = self._model_dir / "model.joblib"
        self._calibrator_path = self._model_dir / "calibrator.joblib"
        self._model: GradientBoostingClassifier | None = None
        self._calibrator: IsotonicRegression | None = None
        self._load_or_initialize()

    def _load_or_initialize(self) -> None:
        if self._model_path.exists() and self._calibrator_path.exists():
            self._model = load(self._model_path)
            self._calibrator = load(self._calibrator_path)
            return
        self._train_default_model()

    def _train_default_model(self) -> None:
        rng = self._rng
        sample_size = 1800
        engagement = np.column_stack(
            [
                rng.poisson(lam=5, size=sample_size),
                rng.poisson(lam=9, size=sample_size),
                rng.poisson(lam=12, size=sample_size),
                rng.poisson(lam=3, size=sample_size),
                rng.poisson(lam=2, size=sample_size),
            ]
        )
        payment_delta = rng.normal(0.0, 0.04, sample_size)
        price_delta = rng.normal(-0.01, 0.05, sample_size)
        time_in_deal = rng.gamma(shape=2.2, scale=5.5, size=sample_size)
        win_rate = rng.uniform(0.35, 0.82, sample_size)
        day_of_month = rng.integers(1, 31, sample_size)

        base_close = 0.32 + 0.06 * (engagement[:, 0] + engagement[:, 1])
        base_close += 0.08 * win_rate
        base_close -= 0.45 * np.maximum(payment_delta, 0)
        base_close -= 0.18 * np.maximum(time_in_deal - 25, 0) / 30
        base_close += 0.2 * np.maximum(-price_delta, 0)
        base_close += 0.03 * (15 - np.abs(day_of_month - 20)) / 15
        probability = 1 / (1 + np.exp(-base_close))
        closes = rng.binomial(1, probability)

        features = np.column_stack(
            [
                engagement[:, 0],
                engagement[:, 1],
                engagement[:, 2],
                engagement[:, 3],
                engagement[:, 4],
                payment_delta,
                price_delta,
                time_in_deal,
                win_rate,
                day_of_month,
            ]
        )

        model = GradientBoostingClassifier(
            n_estimators=250,
            learning_rate=0.05,
            max_depth=3,
            random_state=RANDOM_SEED,
        )
        model.fit(features, closes)

        raw_scores = model.predict_proba(features)[:, 1]
        calibrator = IsotonicRegression(out_of_bounds="clip")
        calibrator.fit(raw_scores, closes)

        dump(model, self._model_path)
        dump(calibrator, self._calibrator_path)
        self._model = model
        self._calibrator = calibrator

    def _build_features(
        self,
        engagement: EngagementMetrics,
        competitive: CompetitiveContext,
        time_in_deal_days: int,
        win_rate: float,
        day_of_month: int,
    ) -> np.ndarray:
        return np.array(
            [
                engagement.site_visits,
                engagement.vehicle_views,
                engagement.email_opens,
                engagement.sms_replies,
                engagement.calls,
                competitive.payment_delta,
                competitive.price_delta,
                float(time_in_deal_days),
                float(win_rate),
                float(day_of_month),
            ]
        )

    def estimate(self, request: ClosePredictionRequest) -> CloseEstimate:
        if self._model is None or self._calibrator is None:
            raise RuntimeError("Close probability model not initialized")
        features = self._build_features(
            request.engagement,
            request.competitive_context,
            request.time_in_deal_days,
            request.salesperson_win_rate,
            request.day_of_month,
        )
        base_probability = float(self._model.predict_proba(features.reshape(1, -1))[0, 1])
        calibrated = float(self._calibrator.predict([base_probability])[0])
        calibrated = float(np.clip(calibrated, 0.01, 0.995))
        config = get_config()
        clip_cfg = config.get("normalization", {}).get("close_probability", {})
        clip_min = float(clip_cfg.get("clip_min", 0.0)) / 100.0
        clip_max = float(clip_cfg.get("clip_max", 100.0)) / 100.0
        calibrated = float(np.clip(calibrated, clip_min, clip_max))

        horizon_days = int(np.clip(45 - calibrated * 20 - request.engagement.sms_replies, 7, 45))
        influencing_factors = self._build_influencing_factors(request, calibrated)

        return CloseEstimate(probability=calibrated, horizon_days=horizon_days, influencing_factors=influencing_factors)

    def _build_influencing_factors(self, request: ClosePredictionRequest, probability: float) -> List[str]:
        factors: List[str] = []
        if request.engagement.site_visits + request.engagement.vehicle_views > 12:
            factors.append("High shopper engagement across channels")
        else:
            factors.append("Increase multi-channel touches to boost urgency")
        if request.competitive_context.payment_delta <= 0:
            factors.append("Offer beats market payment benchmarks")
        else:
            factors.append("Payment is above market median; consider buy-down")
        if request.time_in_deal_days > 25:
            factors.append("Deal aging suggests momentum risk")
        else:
            factors.append("Fresh deal with healthy momentum")
        if probability > 0.65:
            factors.append("Historical closing conditions favorable")
        else:
            factors.append("Reinforce value props to improve close odds")
        return factors

    def predict(self, request: ClosePredictionRequest, ml_trace_id: str) -> ClosePrediction:
        estimate = self.estimate(request)
        return ClosePrediction(
            deal_id=request.deal_id,
            worksheet_id=request.worksheet_id,
            probability=float(round(estimate.probability, 4)),
            horizon_days=estimate.horizon_days,
            influencing_factors=estimate.influencing_factors,
            ml_trace_id=ml_trace_id,
        )
