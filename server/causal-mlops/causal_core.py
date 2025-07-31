"""
Causal-Aware MLOps System: Core Components
Production-ready causal graph infrastructure for intelligent MLOps
"""

from typing import Dict, List, Optional, Tuple, Any, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import uuid
import asyncio
import json
from enum import Enum
import numpy as np

class CausalNodeType(Enum):
    MODEL = "model"
    FEATURE = "feature"
    DATA_SOURCE = "data_source"
    PIPELINE = "pipeline"
    METRIC = "metric"
    INFRASTRUCTURE = "infrastructure"

class CausalRelationType(Enum):
    CAUSES = "causes"
    CORRELATES = "correlates"
    INHIBITS = "inhibits"
    AMPLIFIES = "amplifies"

@dataclass
class CausalMetric:
    """Individual metric within a causal node"""
    name: str
    value: float
    timestamp: datetime
    unit: str = ""
    tags: Dict[str, str] = field(default_factory=dict)

@dataclass
class CausalNode:
    """Core component in the causal graph representing any MLOps entity"""
    
    id: str
    name: str
    node_type: CausalNodeType
    metrics: Dict[str, CausalMetric] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_updated: datetime = field(default_factory=datetime.utcnow)
    
    def add_metric(self, metric: CausalMetric) -> None:
        """Add or update a metric for this node"""
        self.metrics[metric.name] = metric
        self.last_updated = datetime.utcnow()
    
    def get_metric(self, name: str) -> Optional[CausalMetric]:
        """Retrieve a specific metric"""
        return self.metrics.get(name)
    
    def get_recent_metrics(self, hours: int = 24) -> Dict[str, CausalMetric]:
        """Get metrics from the last N hours"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return {
            name: metric for name, metric in self.metrics.items()
            if metric.timestamp >= cutoff
        }

@dataclass
class CausalEdge:
    """Represents a causal relationship between two nodes"""
    
    source_node_id: str
    target_node_id: str
    relation_type: CausalRelationType
    confidence: float  # 0.0 to 1.0
    effect_size: float  # Magnitude of causal effect
    discovery_method: str  # Algorithm that discovered this relationship
    evidence: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_validated: datetime = field(default_factory=datetime.utcnow)
    validation_count: int = 0
    
    def validate(self, new_confidence: float, new_effect_size: float) -> None:
        """Update edge with new validation evidence"""
        # Weighted average with existing confidence
        weight_old = self.validation_count / (self.validation_count + 1)
        weight_new = 1 / (self.validation_count + 1)
        
        self.confidence = weight_old * self.confidence + weight_new * new_confidence
        self.effect_size = weight_old * self.effect_size + weight_new * new_effect_size
        self.validation_count += 1
        self.last_validated = datetime.utcnow()

class CausalGraph:
    """Living map of causal relationships across the entire MLOps system"""
    
    def __init__(self):
        self.nodes: Dict[str, CausalNode] = {}
        self.edges: Dict[Tuple[str, str], CausalEdge] = {}
        self.created_at = datetime.utcnow()
        self.last_updated = datetime.utcnow()
        
    def add_node(self, node: CausalNode) -> None:
        """Add a node to the causal graph"""
        self.nodes[node.id] = node
        self.last_updated = datetime.utcnow()
        
    def add_edge(self, edge: CausalEdge) -> None:
        """Add a causal relationship to the graph"""
        edge_key = (edge.source_node_id, edge.target_node_id)
        
        if edge_key in self.edges:
            # Update existing edge with new evidence
            existing_edge = self.edges[edge_key]
            existing_edge.validate(edge.confidence, edge.effect_size)
        else:
            self.edges[edge_key] = edge
            
        self.last_updated = datetime.utcnow()
    
    def get_node(self, node_id: str) -> Optional[CausalNode]:
        """Retrieve a node by ID"""
        return self.nodes.get(node_id)
    
    def get_edge(self, source_id: str, target_id: str) -> Optional[CausalEdge]:
        """Retrieve an edge between two nodes"""
        return self.edges.get((source_id, target_id))
    
    def get_incoming_edges(self, node_id: str) -> List[CausalEdge]:
        """Get all edges pointing to this node"""
        return [
            edge for (source, target), edge in self.edges.items()
            if target == node_id
        ]
    
    def get_outgoing_edges(self, node_id: str) -> List[CausalEdge]:
        """Get all edges originating from this node"""
        return [
            edge for (source, target), edge in self.edges.items()
            if source == node_id
        ]
    
    def find_causal_path(self, source_id: str, target_id: str, max_depth: int = 5) -> Optional[List[str]]:
        """Find causal path between two nodes using BFS"""
        if source_id == target_id:
            return [source_id]
        
        queue = [(source_id, [source_id])]
        visited = {source_id}
        
        while queue:
            current_node, path = queue.pop(0)
            
            if len(path) > max_depth:
                continue
                
            # Get all nodes this current node causes
            for edge in self.get_outgoing_edges(current_node):
                next_node = edge.target_node_id
                
                if next_node == target_id:
                    return path + [next_node]
                
                if next_node not in visited:
                    visited.add(next_node)
                    queue.append((next_node, path + [next_node]))
        
        return None
    
    def get_high_confidence_edges(self, min_confidence: float = 0.7) -> List[CausalEdge]:
        """Get edges above confidence threshold"""
        return [
            edge for edge in self.edges.values()
            if edge.confidence >= min_confidence
        ]
    
    def get_critical_nodes(self) -> List[str]:
        """Identify nodes with many incoming/outgoing causal relationships"""
        node_scores = {}
        
        for node_id in self.nodes.keys():
            incoming_count = len(self.get_incoming_edges(node_id))
            outgoing_count = len(self.get_outgoing_edges(node_id))
            node_scores[node_id] = incoming_count + outgoing_count
        
        # Return top 20% most connected nodes
        sorted_nodes = sorted(node_scores.items(), key=lambda x: x[1], reverse=True)
        top_count = max(1, len(sorted_nodes) // 5)
        
        return [node_id for node_id, _ in sorted_nodes[:top_count]]
    
    def export_graph_data(self) -> Dict[str, Any]:
        """Export graph in format suitable for visualization"""
        return {
            "nodes": [
                {
                    "id": node.id,
                    "name": node.name,
                    "type": node.node_type.value,
                    "metrics_count": len(node.metrics),
                    "last_updated": node.last_updated.isoformat()
                }
                for node in self.nodes.values()
            ],
            "edges": [
                {
                    "source": edge.source_node_id,
                    "target": edge.target_node_id,
                    "relation": edge.relation_type.value,
                    "confidence": edge.confidence,
                    "effect_size": edge.effect_size,
                    "method": edge.discovery_method
                }
                for edge in self.edges.values()
            ],
            "metadata": {
                "total_nodes": len(self.nodes),
                "total_edges": len(self.edges),
                "created_at": self.created_at.isoformat(),
                "last_updated": self.last_updated.isoformat()
            }
        }

class CausalGraphManager:
    """High-level manager for causal graph operations"""
    
    def __init__(self):
        self.graph = CausalGraph()
        self.node_builders = {}
        self.edge_validators = {}
        
    async def create_ml_model_node(self, model_id: str, model_name: str, metrics: Dict[str, float]) -> CausalNode:
        """Create a causal node for an ML model"""
        node = CausalNode(
            id=model_id,
            name=model_name,
            node_type=CausalNodeType.MODEL,
            metadata={
                "model_type": "ml_model",
                "deployment_status": "production"
            }
        )
        
        # Add ML-specific metrics
        for metric_name, value in metrics.items():
            causal_metric = CausalMetric(
                name=metric_name,
                value=value,
                timestamp=datetime.utcnow(),
                unit="score" if "accuracy" in metric_name else "seconds" if "latency" in metric_name else ""
            )
            node.add_metric(causal_metric)
        
        self.graph.add_node(node)
        return node
    
    async def create_feature_node(self, feature_id: str, feature_name: str, drift_score: float) -> CausalNode:
        """Create a causal node for a feature"""
        node = CausalNode(
            id=feature_id,
            name=feature_name,
            node_type=CausalNodeType.FEATURE,
            metadata={
                "feature_type": "input_feature",
                "importance": "high" if drift_score > 0.1 else "medium" if drift_score > 0.05 else "low"
            }
        )
        
        drift_metric = CausalMetric(
            name="drift_score",
            value=drift_score,
            timestamp=datetime.utcnow(),
            unit="score"
        )
        node.add_metric(drift_metric)
        
        self.graph.add_node(node)
        return node
    
    async def establish_causal_relationship(
        self, 
        source_id: str, 
        target_id: str, 
        confidence: float,
        effect_size: float,
        discovery_method: str
    ) -> CausalEdge:
        """Establish a causal relationship between two nodes"""
        edge = CausalEdge(
            source_node_id=source_id,
            target_node_id=target_id,
            relation_type=CausalRelationType.CAUSES,
            confidence=confidence,
            effect_size=effect_size,
            discovery_method=discovery_method,
            evidence={
                "statistical_significance": confidence,
                "correlation_coefficient": effect_size,
                "sample_size": 1000  # This would come from actual analysis
            }
        )
        
        self.graph.add_edge(edge)
        return edge
    
    def get_causal_insights(self, node_id: str) -> Dict[str, Any]:
        """Get comprehensive causal insights for a node"""
        node = self.graph.get_node(node_id)
        if not node:
            return {}
        
        incoming_edges = self.graph.get_incoming_edges(node_id)
        outgoing_edges = self.graph.get_outgoing_edges(node_id)
        
        return {
            "node_info": {
                "id": node.id,
                "name": node.name,
                "type": node.node_type.value,
                "metrics": {name: metric.value for name, metric in node.metrics.items()}
            },
            "causal_parents": [
                {
                    "source": edge.source_node_id,
                    "confidence": edge.confidence,
                    "effect_size": edge.effect_size,
                    "method": edge.discovery_method
                }
                for edge in incoming_edges
            ],
            "causal_children": [
                {
                    "target": edge.target_node_id,
                    "confidence": edge.confidence,
                    "effect_size": edge.effect_size,
                    "method": edge.discovery_method
                }
                for edge in outgoing_edges
            ],
            "centrality_score": len(incoming_edges) + len(outgoing_edges)
        }

# Global causal graph manager instance
causal_manager = CausalGraphManager()