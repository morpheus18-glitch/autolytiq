"""Inventory optimization heuristics aligned with pipeline analytics."""

from __future__ import annotations

import logging
from typing import Any, Dict, List


class InventoryOptimizer:
    """Provides stocking and pricing recommendations for inventory lists."""

    def __init__(self) -> None:
        self.logger = logging.getLogger(self.__class__.__name__)

    def optimize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        inventory = payload.get("current_inventory") or []
        market_conditions = payload.get("market_conditions") or {}
        recommendations: List[Dict[str, Any]] = []
        total_profit = 0.0
        wholesale_ids: List[str] = []
        adjustments_needed = 0

        demand_multiplier = self._determine_demand_multiplier(market_conditions)

        for vehicle in inventory:
            rec = self._evaluate_vehicle(vehicle, demand_multiplier)
            recommendations.append(rec)
            if rec["action"] == "wholesale":
                wholesale_ids.append(rec["vehicle_id"])
            else:
                if rec.get("recommended_price") and vehicle.get("cost"):
                    total_profit += rec["recommended_price"] - float(vehicle.get("cost", 0))
                if rec["action"] == "discount":
                    adjustments_needed += 1

        sell_through_rate = self._estimate_sell_through(recommendations)

        return {
            "recommendations": recommendations,
            "predicted_sell_through_rate": sell_through_rate,
            "total_potential_profit": round(total_profit, 2),
            "vehicles_to_wholesale": wholesale_ids,
            "pricing_adjustments_needed": adjustments_needed,
        }

    # ------------------------------------------------------------------
    def _determine_demand_multiplier(self, market_conditions: Dict[str, Any]) -> float:
        demand_index = float(market_conditions.get("demand_index", 1.0))
        seasonal_factor = float(market_conditions.get("seasonal_factor", 1.0))
        return max(0.6, min(1.4, demand_index * seasonal_factor))

    def _evaluate_vehicle(self, vehicle: Dict[str, Any], demand_multiplier: float) -> Dict[str, Any]:
        vehicle_id = str(vehicle.get("id"))
        days_in_stock = int(vehicle.get("days_in_stock", 0) or 0)
        list_price = float(vehicle.get("list_price", 0) or 0)
        cost = float(vehicle.get("cost", 0) or 0)
        age_thresholds = (30, 60, 90)

        if days_in_stock >= age_thresholds[2]:
            return {
                "vehicle_id": vehicle_id,
                "action": "wholesale",
                "reasoning": f"Vehicle aged {days_in_stock} days – exceeds turn goals",
                "recommended_price": None,
                "discount_amount": None,
                "predicted_days_to_sell": 0,
            }

        if days_in_stock >= age_thresholds[1]:
            discount_pct = 0.12 * demand_multiplier
            target_price = list_price * (1 - discount_pct)
            return {
                "vehicle_id": vehicle_id,
                "action": "discount",
                "reasoning": "Aged inventory. Apply 12% incentive and rotate merchandising assets.",
                "recommended_price": round(target_price, 2),
                "discount_amount": round(list_price - target_price, 2),
                "predicted_days_to_sell": max(10, int(18 / demand_multiplier)),
            }

        if days_in_stock >= age_thresholds[0]:
            discount_pct = 0.06 * demand_multiplier
            target_price = list_price * (1 - discount_pct)
            return {
                "vehicle_id": vehicle_id,
                "action": "discount",
                "reasoning": "Mid-aged unit. Run targeted campaigns and review reconditioning photos.",
                "recommended_price": round(target_price, 2),
                "discount_amount": round(list_price - target_price, 2),
                "predicted_days_to_sell": max(12, int(24 / demand_multiplier)),
            }

        upside = max(list_price * (0.02 * demand_multiplier), 250)
        recommended_price = list_price + upside
        return {
            "vehicle_id": vehicle_id,
            "action": "hold",
            "reasoning": "Fresh inventory – maintain pricing and track engagement KPIs.",
            "recommended_price": round(recommended_price, 2),
            "discount_amount": 0.0,
            "predicted_days_to_sell": max(20, int(30 / demand_multiplier)),
        }

    def _estimate_sell_through(self, recommendations: List[Dict[str, Any]]) -> float:
        if not recommendations:
            return 0.0
        speedy = sum(1 for rec in recommendations if rec["action"] != "wholesale")
        sell_through = speedy / len(recommendations)
        return round(sell_through, 3)
