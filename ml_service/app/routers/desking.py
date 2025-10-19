from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, Request, Response

from ..schemas.desking import (
    ApprovalPrediction,
    ApprovalPredictionRequest,
    ClosePrediction,
    ClosePredictionRequest,
    CounterAnalysisRequest,
    CounterAnalysisResponse,
    OptimizationRequest,
    OptimizationResponse,
)
from ..services.approval_predictor import ApprovalPredictor
from ..services.close_predictor import ClosePredictor
from ..services.counter_analyzer import CounterAnalyzer
from ..services.deal_optimizer import DealOptimizer
from ..utils.tracing import generate_trace_id

MODEL_REGISTRY = Path(__file__).resolve().parents[3] / "models"

router = APIRouter(prefix="/desking", tags=["Desking"])


@lru_cache(maxsize=1)
def get_approval_predictor() -> ApprovalPredictor:
    return ApprovalPredictor(MODEL_REGISTRY)


@lru_cache(maxsize=1)
def get_close_predictor() -> ClosePredictor:
    return ClosePredictor(MODEL_REGISTRY)


@lru_cache(maxsize=1)
def get_deal_optimizer() -> DealOptimizer:
    return DealOptimizer(get_approval_predictor(), get_close_predictor())


@lru_cache(maxsize=1)
def get_counter_analyzer() -> CounterAnalyzer:
    return CounterAnalyzer(get_approval_predictor(), get_close_predictor())


@router.post("/optimize/deal", response_model=OptimizationResponse)
async def optimize_deal(request_body: OptimizationRequest, response: Response) -> OptimizationResponse:
    optimizer = get_deal_optimizer()
    result = optimizer.optimize(request_body)
    response.headers["X-ML-Trace-Id"] = result.ml_trace_id
    return result


@router.post("/analyze/counter", response_model=CounterAnalysisResponse)
async def analyze_counter(request_body: CounterAnalysisRequest, response: Response) -> CounterAnalysisResponse:
    analyzer = get_counter_analyzer()
    trace_id = generate_trace_id()
    result = analyzer.analyze(request_body, trace_id)
    response.headers["X-ML-Trace-Id"] = trace_id
    return result


@router.post("/predict/approval", response_model=ApprovalPrediction)
async def predict_approval(request_body: ApprovalPredictionRequest, response: Response) -> ApprovalPrediction:
    predictor = get_approval_predictor()
    trace_id = generate_trace_id()
    result = predictor.predict(request_body, trace_id)
    response.headers["X-ML-Trace-Id"] = trace_id
    return result


@router.post("/predict/close", response_model=ClosePrediction)
async def predict_close(request_body: ClosePredictionRequest, response: Response) -> ClosePrediction:
    predictor = get_close_predictor()
    trace_id = generate_trace_id()
    result = predictor.predict(request_body, trace_id)
    response.headers["X-ML-Trace-Id"] = trace_id
    return result
