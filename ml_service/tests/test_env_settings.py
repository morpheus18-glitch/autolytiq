import os
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

SERVICE_ROOT = Path(__file__).resolve().parents[1]
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

# Provide a lightweight Celery stub so importing workers.celery_app
# does not require the full dependency graph during tests.
if "celery" not in sys.modules:
    class _CeleryStub:
        def __init__(self, *args, **kwargs):
            self.args = args
            self.kwargs = kwargs
            self.conf = SimpleNamespace(update=lambda **_: None)

        def start(self) -> None:  # pragma: no cover - convenience stub
            return None

    schedules_ns = SimpleNamespace(crontab=lambda *args, **kwargs: (args, kwargs))
    sys.modules["celery"] = SimpleNamespace(Celery=_CeleryStub, schedules=schedules_ns)
    sys.modules["celery.schedules"] = schedules_ns

# Provide minimal required environment before importing settings modules
os.environ.setdefault("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
os.environ.setdefault("JWT_SECRET", "test-secret")

from config.env import Settings  # noqa: E402
from workers import celery_app  # noqa: E402


def _base_required_env() -> dict[str, str]:
    return {
        "NODE_ENV": "production",
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/db",
        "JWT_SECRET": "super-secret-key",
    }


def test_settings_allow_missing_optional_fields():
    settings = Settings(**_base_required_env())

    assert settings.SENDGRID_API_KEY is None
    assert settings.TWILIO_ACCOUNT_SID is None
    assert settings.PEXELS_API_KEY is None
    assert settings.AWS_ACCESS_KEY_ID is None
    assert settings.S3_BUCKET is None
    assert settings.REDIS_URL is None


def test_settings_require_integrations_for_self_hosted():
    with pytest.raises(ValueError) as exc_info:
        Settings(**{**_base_required_env(), "DEPLOY_MODE": "self_hosted"})

    message = str(exc_info.value)
    for key in [
        "SENDGRID_API_KEY",
        "TWILIO_ACCOUNT_SID",
        "PEXELS_API_KEY",
        "AWS_ACCESS_KEY_ID",
        "S3_BUCKET",
    ]:
        assert key in message


def test_celery_falls_back_to_memory_backend(monkeypatch, caplog):
    caplog.set_level("WARNING")
    monkeypatch.setattr(celery_app, "ENV", SimpleNamespace(REDIS_URL=None))

    redis_url = celery_app._redis_url()

    assert redis_url == "memory://"
    assert "in-memory Celery broker" in caplog.text


def test_celery_uses_configured_redis_url(monkeypatch):
    expected_url = "redis://localhost:6379/0"
    monkeypatch.setattr(celery_app, "ENV", SimpleNamespace(REDIS_URL=expected_url))

    redis_url = celery_app._redis_url()

    assert redis_url == expected_url
