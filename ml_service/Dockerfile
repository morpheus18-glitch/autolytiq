# syntax=docker/dockerfile:1.6

FROM python:3.11-slim AS wheels
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /build

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY ml_service/requirements.txt ./requirements.txt
COPY ml_service/requirements-worker.txt ./requirements-worker.txt

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip setuptools wheel
RUN pip wheel --wheel-dir=/wheels -r requirements.txt
RUN pip wheel --wheel-dir=/wheels -r requirements-worker.txt

FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=wheels /opt/venv /opt/venv
COPY --from=wheels /wheels /wheels
COPY ml_service/requirements.txt ./requirements.txt

ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir --find-links=/wheels -r requirements.txt
RUN rm -rf /wheels

COPY ml_service /app

RUN groupadd --system app && useradd --system --gid app --create-home app
RUN chown -R app:app /app
USER app

ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${UVICORN_PORT}/health || exit 1

CMD [
  "uvicorn",
  "app.main:app",
  "--host",
  "0.0.0.0",
  "--port",
  "8000"
]
