# syntax=docker/dockerfile:1.7

FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential curl \
 && rm -rf /var/lib/apt/lists/* \
 && addgroup --system --gid 1001 mlservice \
 && adduser --system --uid 1001 --gid 1001 --home /srv/app --shell /usr/sbin/nologin mlservice

WORKDIR /app

FROM base AS builder
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY ml_service/requirements.txt ml_service/requirements-worker.txt ./
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt \
 && pip install --no-cache-dir -r requirements-worker.txt
COPY ml_service /app
RUN mkdir -p /app/storage && touch /app/storage/ml.sqlite

FROM base AS runner
ENV PATH="/opt/venv/bin:$PATH" \
    PORT=8000 \
    ENVIRONMENT=production \
    ML_SERVICE_TOKEN="dev-ml-token"
WORKDIR /srv/app

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /srv/app
RUN chown -R mlservice:mlservice /srv/app

USER mlservice
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsSL http://127.0.0.1:${PORT:-8000}/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
