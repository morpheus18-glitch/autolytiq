from __future__ import annotations

from uuid import uuid4


def generate_trace_id() -> str:
    """Generate a deterministic-format trace identifier for ML service calls."""

    return uuid4().hex
