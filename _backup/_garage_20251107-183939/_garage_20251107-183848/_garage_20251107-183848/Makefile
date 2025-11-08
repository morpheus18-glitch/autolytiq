COMPOSE ?= docker compose

.PHONY: up down logs rebuild

up:
$(COMPOSE) up -d

down:
$(COMPOSE) down

logs:
$(COMPOSE) logs -f

rebuild:
$(COMPOSE) up -d --build --force-recreate
