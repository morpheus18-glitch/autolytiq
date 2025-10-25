"""Lead scoring heuristics integrated with the pipeline stack."""

from __future__ import annotations

import logging
from typing import Any, Dict, List


class LeadScorer:
    """Scores leads based on engagement, recency, and conversion history."""

    def __init__(self) -> None:
        self.logger = logging.getLogger(self.__class__.__name__)

    def score(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        lead_score = self._calculate_base_score(payload)
        lead_score = self._apply_recency_decay(lead_score, payload.get("days_since_last_contact"))
        lead_score = max(0, min(100, lead_score))

        conversion_probability = round(min(0.95, lead_score / 100 * 0.88), 3)
        customer_intent, urgency = self._derive_intent(lead_score)
        recommended_actions = self._build_actions(lead_score, payload)
        churn_risk = self._calculate_churn_risk(payload.get("days_since_last_contact"), payload.get("form_submissions", 0))
        optimal_contact_time = self._determine_contact_window(payload)

        return {
            "lead_score": int(round(lead_score)),
            "conversion_probability": conversion_probability,
            "customer_intent": customer_intent,
            "optimal_contact_time": optimal_contact_time,
            "recommended_actions": recommended_actions,
            "churn_risk": churn_risk,
            "urgency_level": urgency,
        }

    # ------------------------------------------------------------------
    def _calculate_base_score(self, payload: Dict[str, Any]) -> float:
        weights = {
            "page_views": 1.8,
            "vehicles_viewed": 4.5,
            "time_on_site": 0.02,
            "form_submissions": 16,
            "email_opens": 2.5,
            "phone_calls": 9,
            "previous_purchases": 18,
        }
        score = 0.0
        for key, weight in weights.items():
            value = float(payload.get(key, 0) or 0)
            score += value * weight
        return score

    def _apply_recency_decay(self, score: float, days_since_last_contact: Any) -> float:
        if days_since_last_contact is None:
            return score
        days = float(days_since_last_contact)
        if days > 45:
            return score * 0.45
        if days > 21:
            return score * 0.7
        if days > 10:
            return score * 0.85
        return score

    def _derive_intent(self, score: float) -> tuple[str, str]:
        if score >= 80:
            return "High", "Hot"
        if score >= 55:
            return "Medium", "Warm"
        return "Low", "Cold"

    def _build_actions(self, score: float, payload: Dict[str, Any]) -> List[str]:
        actions: List[str] = []
        vehicles_viewed = int(payload.get("vehicles_viewed", 0) or 0)
        form_submissions = int(payload.get("form_submissions", 0) or 0)

        if score >= 80:
            actions.append("Call immediately and confirm appointment availability")
            if vehicles_viewed:
                actions.append("Send personalized walkaround video for top vehicles")
            if form_submissions == 0:
                actions.append("Offer digital retailing link to capture application")
        elif score >= 55:
            actions.append("Send tailored inventory email within 12 hours")
            actions.append("Schedule follow-up call within 24 hours")
        else:
            actions.append("Place into nurture campaign with weekly touchpoints")
            actions.append("Offer value content such as buyer guides and maintenance tips")

        return actions

    def _calculate_churn_risk(self, days_since_last_contact: Any, form_submissions: int) -> float:
        if days_since_last_contact is None:
            base = 0.2
        else:
            days = float(days_since_last_contact)
            if days > 60:
                base = 0.85
            elif days > 30:
                base = 0.55
            elif days > 14:
                base = 0.35
            else:
                base = 0.18

        if form_submissions:
            base *= 0.8
        return round(min(max(base, 0.05), 0.95), 3)

    def _determine_contact_window(self, payload: Dict[str, Any]) -> str:
        preferred_time = payload.get("preferred_contact_time")
        if preferred_time:
            return preferred_time

        high_engagement = payload.get("page_views", 0) > 10 or payload.get("vehicles_viewed", 0) > 3
        if high_engagement:
            return "Weekdays 10am-1pm or 4pm-6pm"
        return "Weekdays 11am-2pm"
