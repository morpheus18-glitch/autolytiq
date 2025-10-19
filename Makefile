DOCKER_DIR := infrastructure/docker
COMPOSE := docker compose -f $(DOCKER_DIR)/docker-compose.yml

.PHONY: up down logs rebuild

up:
	DEPLOY_MODE=self_hosted $(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

rebuild:
	DEPLOY_MODE=self_hosted $(COMPOSE) up -d --build --force-recreate
