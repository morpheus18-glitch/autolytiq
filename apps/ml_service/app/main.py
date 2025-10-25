from __future__ import annotations

import logging
from functools import lru_cache
from time import perf_counter
from typing import Any, Dict, List, Optional
from uuid import uuid4

import numpy as np
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request, Response
from pydantic import BaseModel, ConfigDict, Field
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

from config.env import ENV

LOGGER = logging.getLogger("ml_service")
logging.basicConfig(
    level=ENV.LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

SERVICE_TOKEN = ENV.ML_SERVICE_TOKEN
if not SERVICE_TOKEN:
    LOGGER.warning("ML_SERVICE_TOKEN not set, defaulting to development token")
    SERVICE_TOKEN = "dev-ml-token"


class LeadMetadata(BaseModel):
    model_config = ConfigDict(extra="allow")

    leadId: str = Field(..., alias="id")
    status: Optional[str] = None
    source: Optional[str] = None
    priority: Optional[str] = None
    rating: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    createdAt: Optional[str] = None
    assignedToId: Optional[str] = None
    ownerId: Optional[str] = None
    latestScore: Optional[int] = None
    stage: Optional[str] = None


class ActivityAggregate(BaseModel):
    model_config = ConfigDict(extra="allow")

    emailOpens: int = 0
    emailClicks: int = 0
    calls: int = 0
    sms: int = 0
    websiteVisits: int = 0
    meetings: int = 0
    inboundResponses: int = 0
    totalInteractions: int = 0
    last7DayInteractions: int = 0
    previous7DayInteractions: int = 0


class TimetableInsights(BaseModel):
    model_config = ConfigDict(extra="allow")

    daysInPipeline: float = 0.0
    hoursSinceLastActivity: Optional[float] = None
    lastInteractionDays: Optional[float] = None
    nextActionAt: Optional[str] = None
    upcomingAppointmentInHours: Optional[float] = None
    engagementMomentum: Optional[float] = None


class BudgetSignals(BaseModel):
    model_config = ConfigDict(extra="allow")

    hasBudget: bool = False
    estimatedBudget: Optional[float] = None
    tradeIn: bool = False
    financingInterest: bool = False
    priority: Optional[str] = None
    rating: Optional[int] = None


class SimilaritySignals(BaseModel):
    model_config = ConfigDict(extra="allow")

    score: float = 0.0
    sampleSize: int = 0
    sourceMatchRate: float = 0.0
    priorityMatchRate: float = 0.0
    tagOverlapRate: float = 0.0


class LeadFeaturePayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    leadId: str
    requestId: Optional[str] = None
    tenantId: Optional[str] = None
    metadata: LeadMetadata
    activities: ActivityAggregate
    timetable: TimetableInsights
    budgetSignals: BudgetSignals
    similarity: SimilaritySignals


class LeadScoreFactors(BaseModel):
    metric: str
    score: float
    weight: float
    reason: str


class LeadScoreResponse(BaseModel):
    score: int
    engagementScore: float
    urgencyScore: float
    qualificationScore: float
    behaviorScore: float
    factors: List[LeadScoreFactors]
    confidence: float
    requestId: str


class NextActionRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    leadId: str
    prompt: str
    requestId: Optional[str] = None
    tenantId: Optional[str] = None
    channel: Optional[str] = None
    context: Optional[LeadFeaturePayload] = None


class NextActionRecommendation(BaseModel):
    title: str
    description: str
    channel: str
    cadences: List[str]


class NextActionResponse(BaseModel):
    requestId: str
    primary: NextActionRecommendation
    alternates: List[NextActionRecommendation]
    why: List[str]
    talkTracks: List[Dict[str, Any]]


class TranscriptMessage(BaseModel):
    speaker: str
    text: str
    timestamp: Optional[str] = None


class SentimentRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    requestId: Optional[str] = None
    tenantId: Optional[str] = None
    text: Optional[str] = None
    messages: Optional[List[TranscriptMessage]] = None


class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    keyPhrases: List[str]
    requestId: str


class LeadSnapshot(BaseModel):
    leadId: str
    score: int
    engagementScore: float
    urgencyScore: float
    similarityScore: float
    daysInPipeline: float
    lastInteractionDays: Optional[float]


LEAD_CACHE: Dict[str, LeadSnapshot] = {}

REQUEST_COUNTER = Counter(
    'ml_service_requests_total',
    'Total HTTP requests served by the ML service',
    ['method', 'route', 'status_code'],
)
REQUEST_DURATION = Histogram(
    'ml_service_request_duration_seconds',
    'Latency of ML service HTTP requests',
    ['method', 'route', 'status_code'],
    buckets=[0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
)


def _resolve_request_id(request: Request) -> str:
    header_request_id = request.headers.get("x-request-id") or request.headers.get("X-Request-ID")
    request_id = header_request_id or getattr(request.state, "request_id", None)
    if not request_id:
        request_id = str(uuid4())
        request.state.request_id = request_id
    return request_id


def verify_token(authorization: str = Header(...)) -> None:
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ", 1)[1]
    if token != SERVICE_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _weighted_normalize(value: float, scale: float) -> float:
    if scale <= 0:
        return 0.0
    return float(np.tanh(value / scale) * 100.0)


def _compute_engagement(activities: ActivityAggregate) -> float:
    raw = (
        activities.emailOpens * 2
        + activities.emailClicks * 4
        + activities.calls * 6
        + activities.sms * 3
        + activities.websiteVisits * 3
        + activities.meetings * 8
        + activities.inboundResponses * 5
    )
    trend_bonus = 0.0
    if activities.previous7DayInteractions:
        delta = activities.last7DayInteractions - activities.previous7DayInteractions
        trend_bonus = np.clip(delta / max(activities.previous7DayInteractions, 1), -0.25, 0.5) * 20
    elif activities.last7DayInteractions > 0:
        trend_bonus = 10.0
    engagement = _weighted_normalize(raw, 40.0) + trend_bonus
    return float(np.clip(engagement, 0.0, 100.0))


def _compute_urgency(timetable: TimetableInsights, similarity: SimilaritySignals) -> float:
    if timetable.hoursSinceLastActivity is None:
        idle_penalty = 15.0
    else:
        idle_penalty = np.clip(timetable.hoursSinceLastActivity / 12.0, 0.0, 6.0) * 5

    momentum = timetable.engagementMomentum or 0.0
    base = 50.0 + (5.0 - np.clip((timetable.upcomingAppointmentInHours or 120.0) / 24.0, 0.0, 5.0)) * 8
    similarity_boost = similarity.score * 20.0
    urgency = base + similarity_boost + momentum - idle_penalty
    return float(np.clip(urgency, 0.0, 100.0))


def _compute_qualification(budget: BudgetSignals, metadata: LeadMetadata) -> float:
    priority_weight = {
        "LOW": 40.0,
        "MEDIUM": 55.0,
        "HIGH": 70.0,
        "HOT": 80.0,
    }
    base = priority_weight.get((metadata.priority or "").upper(), 50.0)
    if metadata.rating is not None:
        base = 0.7 * base + 0.3 * np.clip(metadata.rating, 0, 100)

    budget_component = 0.0
    if budget.hasBudget and budget.estimatedBudget:
        budget_component = np.clip(np.log10(max(budget.estimatedBudget, 1)) * 12, 0, 25)
    trade_bonus = 8.0 if budget.tradeIn else 0.0
    finance_bonus = 5.0 if budget.financingInterest else 0.0
    qualification = base + budget_component + trade_bonus + finance_bonus
    return float(np.clip(qualification, 0.0, 100.0))


def _compute_behavior(activities: ActivityAggregate, similarity: SimilaritySignals, metadata: LeadMetadata) -> float:
    interaction_ratio = 0.0
    if activities.totalInteractions:
        interaction_ratio = activities.inboundResponses / activities.totalInteractions
    proactive_score = _weighted_normalize(activities.totalInteractions, 60.0)
    inbound_bonus = np.clip(interaction_ratio, 0.0, 1.0) * 25.0
    loyalty_bonus = 5.0 if "returning" in {tag.lower() for tag in metadata.tags} else 0.0
    behavior = proactive_score + inbound_bonus + similarity.score * 30.0 + loyalty_bonus
    return float(np.clip(behavior, 0.0, 100.0))


class PredictiveModel:
    def __init__(self) -> None:
        self.model = None
        self.model_ready = False
        model_path = ENV.MODEL_PATH
        if model_path:
            try:
                from joblib import load  # type: ignore

                self.model = load(model_path)
                self.model_ready = True
                LOGGER.info("Loaded predictive model from %s", model_path)
            except Exception as exc:  # pragma: no cover - optional path
                LOGGER.warning("Failed to load predictive model: %s", exc)

    def predict(self, features: np.ndarray) -> Optional[float]:
        if not self.model_ready or self.model is None:
            return None
        try:
            proba = self.model.predict_proba(features.reshape(1, -1))[0, 1]
            return float(np.clip(proba * 100.0, 0.0, 100.0))
        except Exception as exc:  # pragma: no cover - optional path
            LOGGER.error("Model inference failed: %s", exc)
            return None


class HeuristicLeadScorer:
    def __init__(self) -> None:
        self.predictive_model = PredictiveModel()

    def score(self, payload: LeadFeaturePayload) -> LeadScoreResponse:
        engagement = _compute_engagement(payload.activities)
        urgency = _compute_urgency(payload.timetable, payload.similarity)
        qualification = _compute_qualification(payload.budgetSignals, payload.metadata)
        behavior = _compute_behavior(payload.activities, payload.similarity, payload.metadata)

        features_vector = np.array([engagement, urgency, qualification, behavior, payload.similarity.score * 100])
        model_score = self.predictive_model.predict(features_vector)

        weights = np.array([0.34, 0.27, 0.22, 0.17])
        heuristic_score = float(np.dot(weights, np.array([engagement, urgency, qualification, behavior])))
        combined_score = model_score if model_score is not None else heuristic_score
        final_score = int(np.clip(combined_score, 0.0, 100.0))

        confidence = float(
            np.clip(
                0.45
                + payload.similarity.score * 0.35
                + np.clip(payload.activities.totalInteractions / 20.0, 0.0, 1.0) * 0.2,
                0.2,
                0.95,
            )
        )

        factors = [
            LeadScoreFactors(
                metric="engagement",
                score=float(round(engagement, 2)),
                weight=weights[0],
                reason=(
                    "Strong prospect engagement across channels"
                    if engagement > 65
                    else "Limited recent engagement from lead"
                ),
            ),
            LeadScoreFactors(
                metric="urgency",
                score=float(round(urgency, 2)),
                weight=weights[1],
                reason=(
                    "Active deal momentum with upcoming milestones"
                    if urgency > 60
                    else "Consider re-engaging to restore urgency"
                ),
            ),
            LeadScoreFactors(
                metric="qualification",
                score=float(round(qualification, 2)),
                weight=weights[2],
                reason=(
                    "Budget signals align with inventory"
                    if qualification > 65
                    else "Limited qualification indicators captured"
                ),
            ),
            LeadScoreFactors(
                metric="behavior",
                score=float(round(behavior, 2)),
                weight=weights[3],
                reason=(
                    "Lead is responsive and mirrors won-deal patterns"
                    if behavior > 60
                    else "Behavioral signals below target cohort"
                ),
            ),
        ]

        request_id = payload.requestId or str(uuid4())
        snapshot = LeadSnapshot(
            leadId=payload.leadId,
            score=final_score,
            engagementScore=float(round(engagement, 2)),
            urgencyScore=float(round(urgency, 2)),
            similarityScore=float(round(payload.similarity.score, 4)),
            daysInPipeline=payload.timetable.daysInPipeline,
            lastInteractionDays=payload.timetable.lastInteractionDays,
        )
        LEAD_CACHE[payload.leadId] = snapshot

        return LeadScoreResponse(
            score=final_score,
            engagementScore=float(round(engagement, 2)),
            urgencyScore=float(round(urgency, 2)),
            qualificationScore=float(round(qualification, 2)),
            behaviorScore=float(round(behavior, 2)),
            factors=factors,
            confidence=float(round(confidence, 3)),
            requestId=request_id,
        )


@lru_cache(maxsize=1)
def get_scorer() -> HeuristicLeadScorer:
    return HeuristicLeadScorer()


from .config.scoring import start_watcher as start_scoring_watcher
from .routers.desking import router as desking_router


app = FastAPI(title="Autolytiq ML Service", version="1.0.0")


@app.middleware("http")
async def instrument_requests(request: Request, call_next):  # type: ignore[override]
    if request.url.path == "/metrics":
        return await call_next(request)

    start = perf_counter()
    response = await call_next(request)
    elapsed = perf_counter() - start

    route = request.scope.get("route")
    route_path = getattr(route, "path", request.url.path)
    labels = {
        "method": request.method,
        "route": route_path,
        "status_code": str(response.status_code),
    }
    REQUEST_COUNTER.labels(**labels).inc()
    REQUEST_DURATION.labels(**labels).observe(elapsed)
    response.headers["X-Process-Time"] = f"{elapsed:.6f}"
    return response
start_scoring_watcher()

app.include_router(desking_router, dependencies=[Depends(verify_token)])


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid4())
    request.state.request_id = request_id
    start = perf_counter()
    try:
        response = await call_next(request)
    except HTTPException:
        LOGGER.exception("Request failed", extra={"request_id": request_id})
        raise
    except Exception as exc:  # pragma: no cover - unexpected path
        LOGGER.exception("Unhandled error: %s", exc, extra={"request_id": request_id})
        raise
    finally:
        duration_ms = (perf_counter() - start) * 1000
        LOGGER.info(
            "Request %s %s completed in %.2fms", request.method, request.url.path, duration_ms
        )
    response.headers["X-Request-Id"] = request_id
    return response


@app.post("/score-lead", response_model=LeadScoreResponse)
async def score_lead(
    payload: LeadFeaturePayload,
    request: Request,
    response: Response,
    _: None = Depends(verify_token),
):
    scorer = get_scorer()
    result = scorer.score(payload)
    response.headers["X-Request-Id"] = result.requestId
    return result


def _build_primary_recommendation(payload: LeadFeaturePayload, channel: Optional[str]) -> NextActionRecommendation:
    channel_choice = channel or ("call" if payload.activities.calls >= payload.activities.sms else "sms")
    cadence = [
        "Day 0: Personal outreach",
        "Day 2: Value reinforcement",
        "Day 4: Offer test drive",
    ]
    description = (
        "Schedule a focused conversation around the vehicle configuration "
        "and secure a concrete next step."
    )
    return NextActionRecommendation(
        title="Connect to confirm buying timeline",
        description=description,
        channel=channel_choice,
        cadences=cadence,
    )


def _build_alternates(payload: LeadFeaturePayload) -> List[NextActionRecommendation]:
    alternates: List[NextActionRecommendation] = []
    alternates.append(
        NextActionRecommendation(
            title="Send financing options summary",
            description="Provide personalized financing paths anchored to the lead's budget signals.",
            channel="email",
            cadences=["Send financing summary", "Follow with SMS reminder in 24h"],
        )
    )
    alternates.append(
        NextActionRecommendation(
            title="Invite for showroom visit",
            description="Offer a tailored visit highlighting vehicles that match their interests.",
            channel="call",
            cadences=["Call to invite", "Send calendar hold", "Confirm day before"],
        )
    )
    if payload.budgetSignals.tradeIn:
        alternates.append(
            NextActionRecommendation(
                title="Evaluate trade-in remotely",
                description="Collect trade-in details to fast-track the appraisal before the visit.",
                channel="sms",
                cadences=["Share trade-in form", "Schedule appraisal review"],
            )
        )
    return alternates


def _build_talk_tracks(payload: LeadFeaturePayload, recommendation: NextActionRecommendation) -> List[Dict[str, Any]]:
    openers = [
        "I'd love to lock in a time that works for you to review the build we discussed.",
        "We just received availability that matches what you were looking for—let's hold it for you.",
    ]
    value_props = [
        "We can pre-qualify financing so pick-up is seamless.",
        "Our appraisal team can value your trade before you arrive, saving you time on-site.",
    ]
    if payload.similarity.score > 0.6:
        value_props.append("Similar buyers closed within a week after this step—you're right on track.")

    return [
        {
            "channel": recommendation.channel,
            "opening": openers[0],
            "keyPoints": value_props,
            "closing": "Does early afternoon tomorrow fit to button this up?",
        },
        {
            "channel": "email",
            "opening": openers[1],
            "keyPoints": value_props[:2],
            "closing": "Reply with a preferred window and I'll send the confirmation instantly.",
        },
    ]


@app.post("/next-action", response_model=NextActionResponse)
async def next_action(
    request_body: NextActionRequest,
    request: Request,
    response: Response,
    _: None = Depends(verify_token),
):
    context = request_body.context
    if context is None:
        raise HTTPException(status_code=400, detail="context payload is required")

    primary = _build_primary_recommendation(context, request_body.channel)
    alternates = _build_alternates(context)
    why_statements = [
        "Engagement momentum indicates the lead is expecting timely follow-up.",
        "Budget alignment and qualification signals support a direct close strategy.",
        "Historical wins with similar profiles close fastest with proactive scheduling.",
    ]
    talk_tracks = _build_talk_tracks(context, primary)

    request_id = request_body.requestId or _resolve_request_id(request)
    response.headers["X-Request-Id"] = request_id
    return NextActionResponse(
        requestId=request_id,
        primary=primary,
        alternates=alternates,
        why=why_statements,
        talkTracks=talk_tracks,
    )


_POSITIVE_TERMS = {
    "thanks",
    "great",
    "excited",
    "perfect",
    "appreciate",
    "love",
    "awesome",
    "glad",
    "excellent",
    "amazing",
}
_NEGATIVE_TERMS = {
    "frustrated",
    "upset",
    "angry",
    "delay",
    "problem",
    "issue",
    "concern",
    "confused",
    "disappointed",
    "worried",
}
_STOP_WORDS = {
    "the",
    "and",
    "with",
    "that",
    "from",
    "have",
    "this",
    "about",
    "would",
    "could",
    "should",
}


def _extract_phrases(text: str) -> List[str]:
    tokens = [token.strip(".,!?").lower() for token in text.split()]
    candidates = [token for token in tokens if len(token) > 4 and token not in _STOP_WORDS]
    unique: List[str] = []
    for token in candidates:
        if token not in unique:
            unique.append(token)
        if len(unique) >= 5:
            break
    return unique


def _sentiment_from_text(text: str) -> float:
    lowered = text.lower()
    positives = sum(1 for term in _POSITIVE_TERMS if term in lowered)
    negatives = sum(1 for term in _NEGATIVE_TERMS if term in lowered)
    if positives == negatives:
        return 0.0
    return float(positives - negatives)


@app.post("/sentiment-analysis", response_model=SentimentResponse)
async def sentiment_analysis(
    request_body: SentimentRequest,
    request: Request,
    response: Response,
    _: None = Depends(verify_token),
):
    content_fragments: List[str] = []
    if request_body.text:
        content_fragments.append(request_body.text)
    if request_body.messages:
        content_fragments.extend(message.text for message in request_body.messages if message.text)

    if not content_fragments:
        raise HTTPException(status_code=400, detail="No text provided for sentiment analysis")

    aggregate = " ".join(content_fragments)
    raw_score = _sentiment_from_text(aggregate)
    normalized = np.clip(raw_score / 5.0, -1.0, 1.0)
    if normalized > 0.1:
        sentiment = "POSITIVE"
    elif normalized < -0.1:
        sentiment = "NEGATIVE"
    else:
        sentiment = "NEUTRAL"

    confidence = float(np.clip(abs(normalized), 0.3, 0.95))
    key_phrases = _extract_phrases(aggregate)
    request_id = request_body.requestId or _resolve_request_id(request)

    response.headers["X-Request-Id"] = request_id
    return SentimentResponse(
        sentiment=sentiment,
        confidence=float(round(confidence, 3)),
        keyPhrases=key_phrases,
        requestId=request_id,
    )


@app.get("/close-probability")
async def close_probability(
    request: Request,
    response: Response,
    _: None = Depends(verify_token),
    lead_id: str = Query(..., alias="leadId"),
    score: Optional[float] = Query(None),
    engagement_score: Optional[float] = Query(None, alias="engagementScore"),
    days_in_pipeline: Optional[float] = Query(None, alias="daysInPipeline"),
    last_interaction_days: Optional[float] = Query(None, alias="lastInteractionDays"),
    similarity: Optional[float] = Query(None),
):
    snapshot = LEAD_CACHE.get(lead_id)
    effective_score = score or (snapshot.score if snapshot else 55.0)
    effective_engagement = engagement_score or (snapshot.engagementScore if snapshot else 40.0)
    effective_similarity = similarity or (snapshot.similarityScore if snapshot else 0.4)
    effective_days = days_in_pipeline or (snapshot.daysInPipeline if snapshot else 21.0)
    effective_last_interaction = last_interaction_days or (snapshot.lastInteractionDays or 5.0)

    recency_factor = np.clip((14.0 - effective_last_interaction) / 14.0, 0.0, 1.0)
    momentum_factor = np.clip(1.0 - np.tanh(max(effective_days - 30.0, 0.0) / 30.0), 0.2, 1.0)

    probability = (
        0.45 * (effective_score / 100.0)
        + 0.25 * (effective_engagement / 100.0)
        + 0.2 * effective_similarity
        + 0.1 * recency_factor
    ) * momentum_factor
    probability = float(np.clip(probability, 0.05, 0.97))

    horizon = 28.0 - (effective_engagement / 100.0) * 10.0 - recency_factor * 5.0
    horizon -= effective_similarity * 4.0
    horizon += np.clip(effective_days - 14.0, 0.0, 21.0) * 0.2
    horizon_days = int(np.clip(round(horizon), 7, 45))

    request_id = _resolve_request_id(request)
    response.headers["X-Request-Id"] = request_id
    return {
        "probability": float(round(probability, 3)),
        "horizonDays": horizon_days,
        "requestId": request_id,
    }


@app.get("/health")
async def healthcheck() -> Dict[str, Any]:
    return {"ok": True}


@app.get("/metrics")
async def metrics_endpoint() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=ENV.PORT, reload=False)
