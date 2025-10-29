# syntax=docker/dockerfile:1.7
# AutolytiQ machine learning API and workers image
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl git \
    && rm -rf /var/lib/apt/lists/*

COPY ml_service/requirements.txt ml_service/requirements-worker.txt ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt -r requirements-worker.txt

COPY ml_service/app ./app
COPY ml_service/config ./config
COPY ml_service/workers ./workers
COPY ml_service/scripts ./scripts

ENV PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT}/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
