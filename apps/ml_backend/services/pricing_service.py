"""Pricing insights service built on the existing vehicle pricing pipeline."""

from __future__ import annotations

import logging
import sqlite3
from statistics import median
from typing import Any, Dict

from utils.data_storage import DataStorage
from pipeline.run_pipeline import VehiclePricingPipeline


class PricingInsightsService:
    """Provides enriched pricing analytics using the trained pipeline model."""

    def __init__(self, pipeline: VehiclePricingPipeline, data_storage: DataStorage) -> None:
        self.pipeline = pipeline
        self.data_storage = data_storage
        self.logger = logging.getLogger(self.__class__.__name__)

    def predict_price(self, vehicle_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Predict vehicle price and return enriched analytics."""
        prediction = self.pipeline.get_real_time_prediction(vehicle_payload)
        if not prediction or prediction.get("error"):
            raise ValueError(prediction.get("error", "Unable to generate prediction"))

        predicted_price = float(prediction["predicted_price"])
        confidence_interval = self._build_confidence(prediction, predicted_price)
        market_comparison = self._build_market_comparison(vehicle_payload)
        days_to_sell = self._estimate_days_to_sell(predicted_price, market_comparison)
        optimal_range = self._build_optimal_range(predicted_price, confidence_interval)
        recommendation = self._generate_recommendation(predicted_price, market_comparison)

        enriched = {
            "predicted_price": round(predicted_price, 2),
            "confidence_interval": confidence_interval,
            "market_comparison": market_comparison,
            "pricing_recommendation": recommendation,
            "predicted_days_to_sell": days_to_sell,
            "optimal_price_range": optimal_range,
            "model_version": prediction.get("model_version"),
            "prediction_timestamp": prediction.get("prediction_timestamp"),
            "market_insights": prediction.get("market_insights", {}),
        }
        return enriched

    # ------------------------------------------------------------------
    def _build_confidence(self, prediction: Dict[str, Any], predicted_price: float) -> Dict[str, float]:
        interval = prediction.get("confidence_interval") or {}
        lower = float(interval.get("lower_bound", predicted_price * 0.9))
        upper = float(interval.get("upper_bound", predicted_price * 1.1))
        confidence = float(interval.get("confidence_level", 0.95))
        return {
            "lower": round(lower, 2),
            "upper": round(upper, 2),
            "confidence": confidence,
        }

    def _build_market_comparison(self, vehicle: Dict[str, Any]) -> Dict[str, Any]:
        make = (vehicle.get("make") or "").strip().lower()
        model = (vehicle.get("model") or "").strip().lower()
        year = int(vehicle.get("year", 0))

        query = """
            SELECT price, mileage,
                   julianday('now') - julianday(scraped_at) AS days_on_market
            FROM vehicle_listings
            WHERE LOWER(make) = ?
              AND LOWER(model) = ?
              AND year BETWEEN ? AND ?
              AND price IS NOT NULL
        """
        prices = []
        days_on_market = []

        with sqlite3.connect(self.data_storage.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(query, (make, model, year - 1, year + 1))
            for price, mileage, days in cursor.fetchall():
                if price is not None:
                    prices.append(float(price))
                if days is not None:
                    days_on_market.append(float(days))

            trend = self._determine_price_trend(cursor, make, model)

        if not prices:
            average_price = 0.0
            median_price = 0.0
            comparable_count = 0
        else:
            average_price = sum(prices) / len(prices)
            median_price = median(prices)
            comparable_count = len(prices)

        avg_days = sum(days_on_market) / len(days_on_market) if days_on_market else 0.0

        return {
            "average_market_price": round(average_price, 2),
            "median_market_price": round(median_price, 2),
            "comparable_count": comparable_count,
            "days_on_market_avg": round(avg_days, 1),
            "price_trend": trend,
        }

    def _determine_price_trend(self, cursor: sqlite3.Cursor, make: str, model: str) -> str:
        trend_query = """
            SELECT strftime('%Y-%m', scraped_at) AS month, AVG(price)
            FROM vehicle_listings
            WHERE LOWER(make) = ?
              AND LOWER(model) = ?
              AND scraped_at >= datetime('now', '-90 days')
            GROUP BY month
            ORDER BY month DESC
            LIMIT 2
        """
        cursor.execute(trend_query, (make, model))
        rows = cursor.fetchall()
        if len(rows) < 2:
            return "stable"

        current_avg = rows[0][1] or 0
        previous_avg = rows[1][1] or 0
        if previous_avg == 0:
            return "stable"

        change = (current_avg - previous_avg) / previous_avg
        if change > 0.03:
            return "trending_up"
        if change < -0.03:
            return "trending_down"
        return "stable"

    def _estimate_days_to_sell(self, predicted_price: float, market_data: Dict[str, Any]) -> int:
        market_average = market_data.get("average_market_price") or predicted_price
        if market_average == 0:
            return 35

        ratio = predicted_price / market_average
        base_days = 35
        if ratio > 1.1:
            base_days *= 1.45
        elif ratio > 1.03:
            base_days *= 1.2
        elif ratio < 0.95:
            base_days *= 0.75
        elif ratio < 0.9:
            base_days *= 0.6

        avg_days = market_data.get("days_on_market_avg") or base_days
        blended = (base_days + avg_days) / 2
        return max(7, int(round(blended)))

    def _build_optimal_range(self, predicted_price: float, confidence: Dict[str, float]) -> Dict[str, float]:
        lower_bound = max(confidence["lower"], predicted_price * 0.94)
        upper_bound = min(confidence["upper"], predicted_price * 1.08)
        return {
            "min": round(lower_bound, 2),
            "optimal": round(predicted_price, 2),
            "max": round(upper_bound, 2),
        }

    def _generate_recommendation(self, predicted_price: float, market_data: Dict[str, Any]) -> str:
        average_market = market_data.get("average_market_price") or predicted_price
        if average_market == 0:
            return "Insufficient comparable data. Price based on model estimate."

        ratio = predicted_price / average_market
        if ratio >= 1.12:
            return "Price is notably above market. Consider a targeted discount strategy."
        if ratio >= 1.03:
            return "Slightly above market. Highlight premium reconditioning and warranty value."
        if ratio <= 0.9:
            return "Significantly below market. Expect rapid turn but validate gross targets."
        if ratio <= 0.97:
            return "Competitive position. Monitor lead volume and adjust if supply tightens."
        return "Aligned with market. Maintain pricing and review in the next pricing cycle."
