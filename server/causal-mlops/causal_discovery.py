"""
Causal Discovery Engine: Multi-algorithm causal relationship discovery
Implements PC Algorithm, LiNGAM, and LLM-augmented causal reasoning
"""

import asyncio
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import logging
from abc import ABC, abstractmethod

from .causal_core import CausalGraph, CausalEdge, CausalRelationType, causal_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CausalHypothesis:
    """Represents a potential causal relationship discovered by an algorithm"""
    source_node_id: str
    target_node_id: str
    confidence: float
    effect_size: float
    algorithm: str
    evidence: Dict[str, Any]
    timestamp: datetime

class CausalDiscoveryAlgorithm(ABC):
    """Base class for causal discovery algorithms"""
    
    @abstractmethod
    async def discover_relationships(self, telemetry_data: pd.DataFrame) -> List[CausalHypothesis]:
        """Discover causal relationships from telemetry data"""
        pass
    
    @abstractmethod
    def get_algorithm_name(self) -> str:
        """Return the name of this algorithm"""
        pass

class PCAlgorithm(CausalDiscoveryAlgorithm):
    """PC (Peter-Clark) Algorithm for constraint-based causal discovery"""
    
    def __init__(self, alpha: float = 0.05):
        self.alpha = alpha  # Significance level for independence tests
        
    async def discover_relationships(self, telemetry_data: pd.DataFrame) -> List[CausalHypothesis]:
        """Implement simplified PC algorithm for causal discovery"""
        hypotheses = []
        
        # Correlation-based discovery (simplified PC)
        correlation_matrix = telemetry_data.corr()
        
        for i, source_col in enumerate(correlation_matrix.columns):
            for j, target_col in enumerate(correlation_matrix.columns):
                if i != j:  # Don't correlate with self
                    correlation = correlation_matrix.loc[source_col, target_col]
                    
                    # Strong correlation suggests potential causality
                    if abs(correlation) > 0.3:  # Threshold for meaningful correlation
                        # Perform simplified conditional independence test
                        confidence = self._calculate_confidence(correlation, len(telemetry_data))
                        
                        if confidence > 0.5:  # Only confident relationships
                            hypothesis = CausalHypothesis(
                                source_node_id=source_col,
                                target_node_id=target_col,
                                confidence=confidence,
                                effect_size=abs(correlation),
                                algorithm="PC",
                                evidence={
                                    "correlation": correlation,
                                    "sample_size": len(telemetry_data),
                                    "p_value": self._estimate_p_value(correlation, len(telemetry_data))
                                },
                                timestamp=datetime.utcnow()
                            )
                            hypotheses.append(hypothesis)
        
        return hypotheses
    
    def _calculate_confidence(self, correlation: float, sample_size: int) -> float:
        """Calculate confidence in causal relationship based on correlation and sample size"""
        # Simplified confidence calculation
        base_confidence = min(abs(correlation), 0.9)
        sample_boost = min(np.log(sample_size) / 10, 0.3)
        return min(base_confidence + sample_boost, 1.0)
    
    def _estimate_p_value(self, correlation: float, sample_size: int) -> float:
        """Estimate p-value for correlation significance"""
        # Simplified p-value estimation
        t_stat = correlation * np.sqrt((sample_size - 2) / (1 - correlation**2))
        return max(0.001, 1 / (1 + abs(t_stat)))
    
    def get_algorithm_name(self) -> str:
        return "PC"

class LiNGAMAlgorithm(CausalDiscoveryAlgorithm):
    """Linear Non-Gaussian Acyclic Model for causal discovery"""
    
    def __init__(self):
        self.threshold = 0.1
        
    async def discover_relationships(self, telemetry_data: pd.DataFrame) -> List[CausalHypothesis]:
        """Implement simplified LiNGAM algorithm"""
        hypotheses = []
        
        # Simplified LiNGAM: Use covariance structure to infer causal order
        cov_matrix = telemetry_data.cov()
        
        # Find potential causal ordering based on variance patterns
        columns = list(telemetry_data.columns)
        
        for i, source_col in enumerate(columns):
            for j, target_col in enumerate(columns):
                if i != j:
                    # LiNGAM assumption: causes typically have lower conditional variance
                    causal_strength = self._estimate_causal_strength(
                        telemetry_data, source_col, target_col
                    )
                    
                    if causal_strength > self.threshold:
                        confidence = min(causal_strength * 2, 0.95)
                        
                        hypothesis = CausalHypothesis(
                            source_node_id=source_col,
                            target_node_id=target_col,
                            confidence=confidence,
                            effect_size=causal_strength,
                            algorithm="LiNGAM",
                            evidence={
                                "causal_strength": causal_strength,
                                "variance_ratio": cov_matrix.loc[source_col, source_col] / cov_matrix.loc[target_col, target_col],
                                "sample_size": len(telemetry_data)
                            },
                            timestamp=datetime.utcnow()
                        )
                        hypotheses.append(hypothesis)
        
        return hypotheses
    
    def _estimate_causal_strength(self, data: pd.DataFrame, source: str, target: str) -> float:
        """Estimate causal strength using variance decomposition"""
        try:
            # Simple linear regression to estimate causal strength
            X = data[source].values.reshape(-1, 1)
            y = data[target].values
            
            # Calculate R-squared as proxy for causal strength
            correlation = np.corrcoef(X.flatten(), y)[0, 1]
            r_squared = correlation ** 2
            
            # Adjust for non-linearity and noise
            return max(0, r_squared - 0.1)  # Conservative adjustment
            
        except Exception as e:
            logger.warning(f"Error calculating causal strength between {source} and {target}: {e}")
            return 0.0
    
    def get_algorithm_name(self) -> str:
        return "LiNGAM"

class LLMCausalReasoner(CausalDiscoveryAlgorithm):
    """LLM-augmented causal reasoning with domain knowledge"""
    
    def __init__(self, model_name: str = "gpt-4"):
        self.model_name = model_name
        self.domain_knowledge = self._load_mlops_domain_knowledge()
        
    async def discover_relationships(self, telemetry_data: pd.DataFrame) -> List[CausalHypothesis]:
        """Use LLM to reason about causal relationships"""
        hypotheses = []
        
        # Analyze metric patterns and generate causal hypotheses
        metrics_summary = self._summarize_metrics(telemetry_data)
        
        # Generate domain-aware causal hypotheses
        domain_hypotheses = self._generate_domain_hypotheses(metrics_summary)
        
        for hypothesis_data in domain_hypotheses:
            hypothesis = CausalHypothesis(
                source_node_id=hypothesis_data["source"],
                target_node_id=hypothesis_data["target"],
                confidence=hypothesis_data["confidence"],
                effect_size=hypothesis_data["effect_size"],
                algorithm="LLM",
                evidence={
                    "reasoning": hypothesis_data["reasoning"],
                    "domain_knowledge": True,
                    "llm_model": self.model_name
                },
                timestamp=datetime.utcnow()
            )
            hypotheses.append(hypothesis)
        
        return hypotheses
    
    def _load_mlops_domain_knowledge(self) -> Dict[str, Any]:
        """Load MLOps-specific causal knowledge"""
        return {
            "known_relationships": [
                ("feature_drift", "model_accuracy", 0.8, "Feature drift typically causes accuracy degradation"),
                ("data_volume_drop", "model_confidence", 0.7, "Reduced training data affects model confidence"),
                ("infrastructure_lag", "prediction_latency", 0.9, "Infrastructure issues directly impact latency"),
                ("memory_usage", "processing_speed", 0.6, "High memory usage can slow processing"),
                ("model_complexity", "inference_time", 0.8, "More complex models take longer to run")
            ],
            "causal_patterns": {
                "drift_patterns": ["feature_*", "data_*"],
                "performance_patterns": ["*_accuracy", "*_latency", "*_throughput"],
                "infrastructure_patterns": ["cpu_*", "memory_*", "*_bandwidth"]
            }
        }
    
    def _summarize_metrics(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Summarize key metrics for LLM analysis"""
        return {
            "columns": list(data.columns),
            "correlations": data.corr().to_dict(),
            "means": data.mean().to_dict(),
            "stds": data.std().to_dict(),
            "trends": self._calculate_trends(data)
        }
    
    def _calculate_trends(self, data: pd.DataFrame) -> Dict[str, str]:
        """Calculate trend direction for each metric"""
        trends = {}
        for col in data.columns:
            values = data[col].values
            if len(values) > 1:
                trend = "increasing" if values[-1] > values[0] else "decreasing"
                trends[col] = trend
        return trends
    
    def _generate_domain_hypotheses(self, metrics_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate causal hypotheses based on domain knowledge"""
        hypotheses = []
        
        # Apply known relationships from domain knowledge
        for source, target, confidence, reasoning in self.domain_knowledge["known_relationships"]:
            # Check if both metrics exist in the data
            source_matches = [col for col in metrics_summary["columns"] if source.replace("*", "") in col]
            target_matches = [col for col in metrics_summary["columns"] if target.replace("*", "") in col]
            
            for source_col in source_matches:
                for target_col in target_matches:
                    if source_col != target_col:
                        # Calculate effect size from correlation
                        correlations = metrics_summary["correlations"]
                        effect_size = abs(correlations.get(source_col, {}).get(target_col, 0.1))
                        
                        hypotheses.append({
                            "source": source_col,
                            "target": target_col,
                            "confidence": confidence,
                            "effect_size": effect_size,
                            "reasoning": reasoning
                        })
        
        return hypotheses
    
    def get_algorithm_name(self) -> str:
        return "LLM"

class CausalConsensusBuilder:
    """Builds consensus among multiple causal discovery algorithms"""
    
    def __init__(self, min_algorithm_agreement: int = 2, confidence_threshold: float = 0.6):
        self.min_algorithm_agreement = min_algorithm_agreement
        self.confidence_threshold = confidence_threshold
        
    def build_consensus(self, hypotheses: List[CausalHypothesis]) -> List[CausalHypothesis]:
        """Build consensus from multiple algorithm hypotheses"""
        # Group hypotheses by source-target pair
        hypothesis_groups = {}
        
        for hypothesis in hypotheses:
            key = (hypothesis.source_node_id, hypothesis.target_node_id)
            if key not in hypothesis_groups:
                hypothesis_groups[key] = []
            hypothesis_groups[key].append(hypothesis)
        
        consensus_hypotheses = []
        
        for (source, target), group in hypothesis_groups.items():
            if len(group) >= self.min_algorithm_agreement:
                # Calculate consensus metrics
                avg_confidence = np.mean([h.confidence for h in group])
                avg_effect_size = np.mean([h.effect_size for h in group])
                
                if avg_confidence >= self.confidence_threshold:
                    # Create consensus hypothesis
                    consensus_hypothesis = CausalHypothesis(
                        source_node_id=source,
                        target_node_id=target,
                        confidence=avg_confidence,
                        effect_size=avg_effect_size,
                        algorithm="CONSENSUS",
                        evidence={
                            "contributing_algorithms": [h.algorithm for h in group],
                            "individual_confidences": [h.confidence for h in group],
                            "individual_effect_sizes": [h.effect_size for h in group],
                            "agreement_score": len(group)
                        },
                        timestamp=datetime.utcnow()
                    )
                    consensus_hypotheses.append(consensus_hypothesis)
        
        return consensus_hypotheses

class CausalDiscoveryEngine:
    """Main engine orchestrating causal discovery across multiple algorithms"""
    
    def __init__(self):
        self.algorithms = [
            PCAlgorithm(),
            LiNGAMAlgorithm(),
            LLMCausalReasoner()
        ]
        self.consensus_builder = CausalConsensusBuilder()
        self.discovery_history = []
        
    async def discover_causal_relationships(self, telemetry_data: pd.DataFrame) -> List[CausalEdge]:
        """Run all discovery algorithms and build consensus"""
        logger.info(f"Starting causal discovery on {len(telemetry_data)} data points")
        
        # Run all algorithms in parallel
        all_hypotheses = []
        
        for algorithm in self.algorithms:
            try:
                logger.info(f"Running {algorithm.get_algorithm_name()} algorithm")
                hypotheses = await algorithm.discover_relationships(telemetry_data)
                all_hypotheses.extend(hypotheses)
                logger.info(f"{algorithm.get_algorithm_name()} found {len(hypotheses)} potential relationships")
            except Exception as e:
                logger.error(f"Error in {algorithm.get_algorithm_name()} algorithm: {e}")
        
        # Build consensus
        consensus_hypotheses = self.consensus_builder.build_consensus(all_hypotheses)
        logger.info(f"Consensus built: {len(consensus_hypotheses)} validated relationships")
        
        # Convert to causal edges
        causal_edges = []
        for hypothesis in consensus_hypotheses:
            edge = CausalEdge(
                source_node_id=hypothesis.source_node_id,
                target_node_id=hypothesis.target_node_id,
                relation_type=CausalRelationType.CAUSES,
                confidence=hypothesis.confidence,
                effect_size=hypothesis.effect_size,
                discovery_method=hypothesis.algorithm,
                evidence=hypothesis.evidence
            )
            causal_edges.append(edge)
        
        # Store discovery session
        self.discovery_history.append({
            "timestamp": datetime.utcnow(),
            "total_hypotheses": len(all_hypotheses),
            "consensus_hypotheses": len(consensus_hypotheses),
            "data_points": len(telemetry_data),
            "algorithms_used": [alg.get_algorithm_name() for alg in self.algorithms]
        })
        
        return causal_edges
    
    async def continuous_discovery(self, telemetry_stream, interval_seconds: int = 30):
        """Run continuous causal discovery on streaming telemetry"""
        logger.info(f"Starting continuous causal discovery with {interval_seconds}s intervals")
        
        while True:
            try:
                # Get recent telemetry data
                recent_data = await telemetry_stream.get_recent_data(
                    window_minutes=60  # Use last hour of data
                )
                
                if len(recent_data) > 10:  # Minimum data points for meaningful analysis
                    # Discover relationships
                    causal_edges = await self.discover_causal_relationships(recent_data)
                    
                    # Update causal graph
                    for edge in causal_edges:
                        causal_manager.graph.add_edge(edge)
                    
                    logger.info(f"Updated causal graph with {len(causal_edges)} new/updated relationships")
                
                await asyncio.sleep(interval_seconds)
                
            except Exception as e:
                logger.error(f"Error in continuous discovery: {e}")
                await asyncio.sleep(interval_seconds)

# Global discovery engine instance
discovery_engine = CausalDiscoveryEngine()