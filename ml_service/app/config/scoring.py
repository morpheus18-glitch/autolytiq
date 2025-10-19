from __future__ import annotations

import copy
import os
import threading
from pathlib import Path
from typing import Any, Dict

import yaml
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

_DEFAULT_CONFIG = Path(__file__).resolve().parents[3] / "ml_backend/config/scoring.yaml"
_CONFIG_PATH = Path(os.getenv("SCORING_CONFIG_PATH") or _DEFAULT_CONFIG).resolve()
_lock = threading.RLock()
_current: Dict[str, Any] | None = None
_observer: Observer | None = None


def _normalize_weights(config: Dict[str, Any]) -> None:
    objectives = config.get("objectives") or {}
    weights = [
        float(objectives.get("gross_weight", 0.0)),
        float(objectives.get("close_weight", 0.0)),
        float(objectives.get("approval_weight", 0.0)),
        float(objectives.get("payment_weight", 0.0)),
    ]
    total = sum(weights)
    if abs(total - 1.0) <= 1e-6:
        return
    if abs(total - 100.0) <= 1e-6:
        for key in ("gross_weight", "close_weight", "approval_weight", "payment_weight"):
            if key in objectives:
                objectives[key] = float(objectives[key]) / 100.0
        return
    if total > 0:
        for key in ("gross_weight", "close_weight", "approval_weight", "payment_weight"):
            if key in objectives:
                objectives[key] = float(objectives[key]) / total


def _load() -> Dict[str, Any]:
    with _CONFIG_PATH.open("r", encoding="utf-8") as fh:
        config = yaml.safe_load(fh) or {}
    if not isinstance(config, dict):
        raise ValueError("Scoring configuration must be a mapping")
    _normalize_weights(config)
    return config


def get_config() -> Dict[str, Any]:
    global _current
    with _lock:
        if _current is None:
            _current = _load()
        return copy.deepcopy(_current)


class _ConfigHandler(FileSystemEventHandler):
    def on_modified(self, event):  # type: ignore[override]
        if event.is_directory:
            return
        if Path(event.src_path).resolve() != _CONFIG_PATH:
            return
        try:
            config = _load()
        except Exception as exc:  # pragma: no cover - defensive logging
            print(f"[scoring] reload failed: {exc}")
            return
        with _lock:
            global _current
            _current = config
        print(f"[scoring] reloaded {_CONFIG_PATH}")


def start_watcher() -> None:
    global _observer
    with _lock:
        if _observer is not None:
            return
        observer = Observer()
        handler = _ConfigHandler()
        observer.schedule(handler, _CONFIG_PATH.parent, recursive=False)
        observer.daemon = True
        observer.start()
        _observer = observer


__all__ = ["get_config", "start_watcher"]
