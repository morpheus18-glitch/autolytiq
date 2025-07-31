"""
Causal MLOps API: REST endpoints for causal graph interaction
Provides real-time causal insights and system control
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio
import logging

from .causal_core import causal_manager, CausalNodeType
from .causal_discovery import discovery_engine
from .telemetry_adapters import telemetry_orchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for API requests/responses
class CausalNodeResponse(BaseModel):
    id: str
    name: str
    node_type: str
    metrics_count: int
    last_updated: datetime

class CausalEdgeResponse(BaseModel):
    source_node_id: str
    target_node_id: str
    relation_type: str
    confidence: float
    effect_size: float
    discovery_method: str
    created_at: datetime

class CausalGraphResponse(BaseModel):
    nodes: List[CausalNodeResponse]
    edges: List[CausalEdgeResponse]
    metadata: Dict[str, Any]

class CausalInsightResponse(BaseModel):
    node_id: str
    insights: Dict[str, Any]
    causal_parents: List[Dict[str, Any]]
    causal_children: List[Dict[str, Any]]
    centrality_score: int

class DiscoveryRequest(BaseModel):
    time_range_minutes: int = 60
    confidence_threshold: float = 0.6
    force_refresh: bool = False

class CausalPredictionRequest(BaseModel):
    scenario: Dict[str, float]  # metric_name -> new_value
    prediction_horizon_minutes: int = 30

# Create API router
causal_api = APIRouter(prefix="/api/causal", tags=["causal-mlops"])

@causal_api.get("/graph", response_model=CausalGraphResponse)
async def get_causal_graph():
    """Get the current causal graph"""
    try:
        graph_data = causal_manager.graph.export_graph_data()
        
        nodes = [
            CausalNodeResponse(
                id=node["id"],
                name=node["name"],
                node_type=node["type"],
                metrics_count=node["metrics_count"],
                last_updated=datetime.fromisoformat(node["last_updated"])
            )
            for node in graph_data["nodes"]
        ]
        
        edges = [
            CausalEdgeResponse(
                source_node_id=edge["source"],
                target_node_id=edge["target"],
                relation_type=edge["relation"],
                confidence=edge["confidence"],
                effect_size=edge["effect_size"],
                discovery_method=edge["method"],
                created_at=datetime.utcnow()  # Edge creation time not stored in export
            )
            for edge in graph_data["edges"]
        ]
        
        return CausalGraphResponse(
            nodes=nodes,
            edges=edges,
            metadata=graph_data["metadata"]
        )
        
    except Exception as e:
        logger.error(f"Error getting causal graph: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve causal graph")

@causal_api.get("/nodes/{node_id}/insights", response_model=CausalInsightResponse)
async def get_node_insights(node_id: str):
    """Get comprehensive causal insights for a specific node"""
    try:
        insights = causal_manager.get_causal_insights(node_id)
        
        if not insights:
            raise HTTPException(status_code=404, detail="Node not found")
        
        return CausalInsightResponse(
            node_id=node_id,
            insights=insights["node_info"],
            causal_parents=insights["causal_parents"],
            causal_children=insights["causal_children"],
            centrality_score=insights["centrality_score"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting insights for node {node_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve node insights")

@causal_api.post("/discover")
async def trigger_causal_discovery(
    request: DiscoveryRequest,
    background_tasks: BackgroundTasks
):
    """Trigger causal discovery process"""
    try:
        # Collect recent telemetry data
        telemetry_data = await telemetry_orchestrator.collect_all_metrics(
            time_range_minutes=request.time_range_minutes
        )
        
        if telemetry_data.empty:
            raise HTTPException(status_code=400, detail="No telemetry data available")
        
        # Run causal discovery in background
        background_tasks.add_task(
            run_causal_discovery_task,
            telemetry_data,
            request.confidence_threshold
        )
        
        return {
            "message": "Causal discovery started",
            "data_points": len(telemetry_data),
            "metrics": list(telemetry_data.columns),
            "estimated_completion": "30-60 seconds"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering causal discovery: {e}")
        raise HTTPException(status_code=500, detail="Failed to start causal discovery")

async def run_causal_discovery_task(telemetry_data, confidence_threshold: float):
    """Background task for running causal discovery"""
    try:
        logger.info("Starting background causal discovery")
        
        # Update discovery engine confidence threshold
        discovery_engine.consensus_builder.confidence_threshold = confidence_threshold
        
        # Run discovery
        causal_edges = await discovery_engine.discover_causal_relationships(telemetry_data)
        
        # Update causal graph
        for edge in causal_edges:
            causal_manager.graph.add_edge(edge)
        
        logger.info(f"Completed causal discovery: {len(causal_edges)} relationships discovered")
        
    except Exception as e:
        logger.error(f"Error in causal discovery task: {e}")

@causal_api.get("/discovery/history")
async def get_discovery_history():
    """Get history of causal discovery sessions"""
    try:
        return {
            "discovery_sessions": discovery_engine.discovery_history[-10:],  # Last 10 sessions
            "total_sessions": len(discovery_engine.discovery_history)
        }
    except Exception as e:
        logger.error(f"Error getting discovery history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve discovery history")

@causal_api.get("/metrics/telemetry")
async def get_telemetry_status():
    """Get current telemetry collection status"""
    try:
        # Get recent telemetry data for status
        recent_data = telemetry_orchestrator.get_recent_data(window_minutes=5)
        
        return {
            "adapters_active": len(telemetry_orchestrator.adapters),
            "adapter_names": [adapter.get_adapter_name() for adapter in telemetry_orchestrator.adapters],
            "recent_data_points": len(recent_data),
            "available_metrics": list(recent_data.columns) if not recent_data.empty else [],
            "collection_history": telemetry_orchestrator.collection_history[-5:],  # Last 5 collections
            "last_collection": telemetry_orchestrator.collection_history[-1] if telemetry_orchestrator.collection_history else None
        }
    except Exception as e:
        logger.error(f"Error getting telemetry status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve telemetry status")

@causal_api.post("/predict/impact")
async def predict_causal_impact(request: CausalPredictionRequest):
    """Predict the causal impact of changing specific metrics"""
    try:
        predictions = {}
        
        for metric_name, new_value in request.scenario.items():
            # Find nodes affected by this metric
            affected_predictions = await predict_downstream_effects(
                metric_name, 
                new_value, 
                request.prediction_horizon_minutes
            )
            predictions[metric_name] = affected_predictions
        
        return {
            "scenario": request.scenario,
            "predictions": predictions,
            "prediction_horizon_minutes": request.prediction_horizon_minutes,
            "confidence_note": "Predictions based on learned causal relationships"
        }
        
    except Exception as e:
        logger.error(f"Error predicting causal impact: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict causal impact")

async def predict_downstream_effects(
    source_metric: str, 
    new_value: float, 
    horizon_minutes: int
) -> List[Dict[str, Any]]:
    """Predict downstream effects of changing a source metric"""
    predictions = []
    
    # Find nodes that could be affected
    for node_id, node in causal_manager.graph.nodes.items():
        if source_metric in node.metrics:
            # Find outgoing causal edges
            outgoing_edges = causal_manager.graph.get_outgoing_edges(node_id)
            
            for edge in outgoing_edges:
                target_node = causal_manager.graph.get_node(edge.target_node_id)
                if target_node:
                    # Calculate predicted impact
                    current_metric = node.get_metric(source_metric)
                    if current_metric:
                        change_magnitude = abs(new_value - current_metric.value) / current_metric.value
                        predicted_effect = change_magnitude * edge.effect_size * edge.confidence
                        
                        predictions.append({
                            "target_node": edge.target_node_id,
                            "target_name": target_node.name,
                            "predicted_change_percent": predicted_effect * 100,
                            "confidence": edge.confidence,
                            "effect_direction": "positive" if edge.effect_size > 0 else "negative",
                            "reasoning": f"Based on {edge.discovery_method} algorithm with {edge.confidence:.2f} confidence"
                        })
    
    return predictions

@causal_api.get("/health")
async def causal_system_health():
    """Get health status of the causal MLOps system"""
    try:
        graph = causal_manager.graph
        
        health_status = {
            "status": "healthy",
            "components": {
                "causal_graph": {
                    "status": "active",
                    "nodes": len(graph.nodes),
                    "edges": len(graph.edges),
                    "last_updated": graph.last_updated.isoformat()
                },
                "discovery_engine": {
                    "status": "active",
                    "algorithms": len(discovery_engine.algorithms),
                    "discovery_sessions": len(discovery_engine.discovery_history)
                },
                "telemetry_adapters": {
                    "status": "active",
                    "adapters": len(telemetry_orchestrator.adapters),
                    "last_collection": telemetry_orchestrator.collection_history[-1] if telemetry_orchestrator.collection_history else None
                }
            },
            "recommendations": []
        }
        
        # Add recommendations based on system state
        if len(graph.edges) < 5:
            health_status["recommendations"].append(
                "Consider running causal discovery - few relationships detected"
            )
        
        if not telemetry_orchestrator.collection_history:
            health_status["recommendations"].append(
                "No telemetry collection history - check adapter configuration"
            )
        
        return health_status
        
    except Exception as e:
        logger.error(f"Error checking system health: {e}")
        raise HTTPException(status_code=500, detail="Failed to check system health")

@causal_api.post("/system/reset")
async def reset_causal_system():
    """Reset the causal system (for development/testing)"""
    try:
        # Clear causal graph
        causal_manager.graph = causal_manager.graph.__class__()
        
        # Clear discovery history
        discovery_engine.discovery_history.clear()
        
        # Clear telemetry history
        telemetry_orchestrator.collection_history.clear()
        
        logger.info("Causal system reset completed")
        
        return {
            "message": "Causal system reset successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error resetting causal system: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset causal system")

# Initialize some demo data for testing
async def initialize_demo_data():
    """Initialize demo causal relationships for testing"""
    try:
        # Create demo nodes
        model_node = await causal_manager.create_ml_model_node(
            "vehicle_pricing_model",
            "Vehicle Pricing XGBoost Model",
            {"accuracy": 0.94, "latency": 0.15}
        )
        
        feature_node = await causal_manager.create_feature_node(
            "vehicle_age_feature",
            "Vehicle Age Feature",
            0.08
        )
        
        # Establish demo relationship
        await causal_manager.establish_causal_relationship(
            "vehicle_age_feature",
            "vehicle_pricing_model",
            confidence=0.85,
            effect_size=0.65,
            discovery_method="DEMO"
        )
        
        logger.info("Demo causal data initialized")
        
    except Exception as e:
        logger.error(f"Error initializing demo data: {e}")

# Initialize demo data on startup
asyncio.create_task(initialize_demo_data())