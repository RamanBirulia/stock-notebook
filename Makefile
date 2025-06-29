# Stock Notebook Makefile
# Common development tasks for PostgreSQL-based Stock Notebook application

.DEFAULT_GOAL := help
.PHONY: help setup up down clean build test migrate seed logs status

# Configuration
COMPOSE_CMD := docker compose
BACKEND_DIR := backend
DATABASE_URL := postgresql://stock_user:stock_password@localhost:5432/stock_notebook

# Colors for output
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
RED := \033[31m
NC := \033[0m # No Color

# Help target
help: ## Show this help message
	@echo "$(BLUE)Stock Notebook Development Commands$(NC)"
	@echo "======================================"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Prerequisites:$(NC)"
	@echo "  • Docker and Docker Compose"
	@echo "  • Rust with Cargo (for backend development)"
	@echo ""
	@echo "$(YELLOW)Quick Start:$(NC)"
	@echo "  make setup    # Full development setup"
	@echo "  make up       # Start all services"
	@echo "  make seed     # Add sample data"
	@echo "  make logs     # View logs"
	@echo ""

# Development setup
setup: ## Complete development environment setup
	@echo "$(BLUE)Setting up development environment...$(NC)"
	@./scripts/dev-setup.sh
	@echo "$(GREEN)✓ Development environment ready!$(NC)"

# Docker Compose operations
up: ## Start all services
	@echo "$(BLUE)Starting services...$(NC)"
	@$(COMPOSE_CMD) up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@make status

down: ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	@$(COMPOSE_CMD) down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	@$(COMPOSE_CMD) restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

# Database operations
db-up: ## Start only PostgreSQL database
	@echo "$(BLUE)Starting PostgreSQL...$(NC)"
	@$(COMPOSE_CMD) up -d postgres
	@echo "$(GREEN)✓ PostgreSQL started$(NC)"

db-down: ## Stop PostgreSQL database
	@echo "$(BLUE)Stopping PostgreSQL...$(NC)"
	@$(COMPOSE_CMD) stop postgres
	@echo "$(GREEN)✓ PostgreSQL stopped$(NC)"

migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	@cd $(BACKEND_DIR) && sqlx migrate run --database-url "$(DATABASE_URL)" --source migrations
	@echo "$(GREEN)✓ Migrations completed$(NC)"

migrate-revert: ## Revert last database migration
	@echo "$(YELLOW)Reverting last migration...$(NC)"
	@cd $(BACKEND_DIR) && sqlx migrate revert --database-url "$(DATABASE_URL)" --source migrations
	@echo "$(GREEN)✓ Migration reverted$(NC)"

migrate-info: ## Show migration status
	@echo "$(BLUE)Migration status:$(NC)"
	@cd $(BACKEND_DIR) && sqlx migrate info --database-url "$(DATABASE_URL)" --source migrations

seed: ## Seed database with sample data
	@echo "$(BLUE)Seeding database...$(NC)"
	@./scripts/seed-db.sh
	@echo "$(GREEN)✓ Database seeded$(NC)"

seed-clear: ## Clear all data from database
	@echo "$(YELLOW)Clearing database data...$(NC)"
	@./scripts/seed-db.sh --clear-only
	@echo "$(GREEN)✓ Database cleared$(NC)"

# Backend operations
build: ## Build the backend
	@echo "$(BLUE)Building backend...$(NC)"
	@cd $(BACKEND_DIR) && cargo build
	@echo "$(GREEN)✓ Backend built$(NC)"

build-release: ## Build backend in release mode
	@echo "$(BLUE)Building backend (release)...$(NC)"
	@cd $(BACKEND_DIR) && cargo build --release
	@echo "$(GREEN)✓ Backend built (release)$(NC)"

test: ## Run backend tests
	@echo "$(BLUE)Running tests...$(NC)"
	@cd $(BACKEND_DIR) && cargo test
	@echo "$(GREEN)✓ Tests completed$(NC)"

check: ## Check backend code (clippy + fmt)
	@echo "$(BLUE)Checking code...$(NC)"
	@cd $(BACKEND_DIR) && cargo clippy -- -D warnings
	@cd $(BACKEND_DIR) && cargo fmt --check
	@echo "$(GREEN)✓ Code check passed$(NC)"

fix: ## Fix backend code formatting
	@echo "$(BLUE)Fixing code formatting...$(NC)"
	@cd $(BACKEND_DIR) && cargo fmt
	@echo "$(GREEN)✓ Code formatted$(NC)"

run: ## Run backend server locally
	@echo "$(BLUE)Starting backend server...$(NC)"
	@cd $(BACKEND_DIR) && cargo run

run-watch: ## Run backend with auto-reload (requires cargo-watch)
	@echo "$(BLUE)Starting backend with auto-reload...$(NC)"
	@cd $(BACKEND_DIR) && cargo watch -x run

# Database management
db-connect: ## Connect to PostgreSQL database
	@echo "$(BLUE)Connecting to PostgreSQL...$(NC)"
	@$(COMPOSE_CMD) exec postgres psql -U stock_user -d stock_notebook

db-backup: ## Create database backup
	@echo "$(BLUE)Creating database backup...$(NC)"
	@mkdir -p backups
	@$(COMPOSE_CMD) exec postgres pg_dump -U stock_user stock_notebook > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/ directory$(NC)"

db-restore: ## Restore database from backup (requires BACKUP_FILE variable)
	@echo "$(BLUE)Restoring database...$(NC)"
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)Error: Please specify BACKUP_FILE variable$(NC)"; \
		echo "Usage: make db-restore BACKUP_FILE=backups/backup_20240101_120000.sql"; \
		exit 1; \
	fi
	@$(COMPOSE_CMD) exec -T postgres psql -U stock_user stock_notebook < $(BACKUP_FILE)
	@echo "$(GREEN)✓ Database restored$(NC)"

# Monitoring and debugging
logs: ## Show logs from all services
	@$(COMPOSE_CMD) logs -f

logs-db: ## Show PostgreSQL logs
	@$(COMPOSE_CMD) logs -f postgres

logs-backend: ## Show backend logs
	@$(COMPOSE_CMD) logs -f backend

status: ## Show status of all services
	@echo "$(BLUE)Service Status:$(NC)"
	@$(COMPOSE_CMD) ps
	@echo ""
	@echo "$(BLUE)Available Services:$(NC)"
	@echo "  • PostgreSQL:  localhost:5432"
	@echo "  • Adminer:     http://localhost:8081"
	@echo "  • Backend:     http://localhost:8080 (when using Docker)"

health: ## Check health of services
	@echo "$(BLUE)Health Check:$(NC)"
	@echo -n "PostgreSQL: "
	@if $(COMPOSE_CMD) exec postgres pg_isready -U stock_user -d stock_notebook >/dev/null 2>&1; then \
		echo "$(GREEN)✓ Healthy$(NC)"; \
	else \
		echo "$(RED)✗ Unhealthy$(NC)"; \
	fi
	@echo -n "Backend API: "
	@if curl -s http://localhost:8080/health >/dev/null 2>&1; then \
		echo "$(GREEN)✓ Healthy$(NC)"; \
	else \
		echo "$(YELLOW)- Not running or not accessible$(NC)"; \
	fi

# Cleanup operations
clean: ## Stop services and remove containers
	@echo "$(YELLOW)Cleaning up containers...$(NC)"
	@$(COMPOSE_CMD) down
	@echo "$(GREEN)✓ Containers removed$(NC)"

clean-all: ## Stop services and remove containers + volumes (WARNING: deletes all data)
	@echo "$(RED)WARNING: This will delete all database data!$(NC)"
	@echo -n "Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]
	@$(COMPOSE_CMD) down -v
	@echo "$(GREEN)✓ Containers and volumes removed$(NC)"

clean-images: ## Remove unused Docker images
	@echo "$(BLUE)Cleaning up Docker images...$(NC)"
	@docker image prune -f
	@echo "$(GREEN)✓ Unused images removed$(NC)"

# Development utilities
install-tools: ## Install required development tools
	@echo "$(BLUE)Installing development tools...$(NC)"
	@cargo install sqlx-cli --no-default-features --features postgres
	@cargo install cargo-watch
	@echo "$(GREEN)✓ Development tools installed$(NC)"

env-check: ## Check environment configuration
	@echo "$(BLUE)Environment Check:$(NC)"
	@echo -n "Docker: "
	@if command -v docker >/dev/null 2>&1; then echo "$(GREEN)✓$(NC)"; else echo "$(RED)✗$(NC)"; fi
	@echo -n "Docker Compose: "
	@if docker compose version >/dev/null 2>&1; then echo "$(GREEN)✓$(NC)"; else echo "$(RED)✗$(NC)"; fi
	@echo -n "Rust: "
	@if command -v cargo >/dev/null 2>&1; then echo "$(GREEN)✓$(NC)"; else echo "$(RED)✗$(NC)"; fi
	@echo -n "SQLX CLI: "
	@if command -v sqlx >/dev/null 2>&1; then echo "$(GREEN)✓$(NC)"; else echo "$(YELLOW)- (run 'make install-tools')$(NC)"; fi
	@echo -n ".env file: "
	@if [ -f "$(BACKEND_DIR)/.env" ]; then echo "$(GREEN)✓$(NC)"; else echo "$(YELLOW)- (will be created by setup)$(NC)"; fi

# Documentation
docs: ## Generate and open documentation
	@echo "$(BLUE)Generating documentation...$(NC)"
	@cd $(BACKEND_DIR) && cargo doc --open

# Production-like testing
prod-build: ## Build production Docker image
	@echo "$(BLUE)Building production Docker image...$(NC)"
	@$(COMPOSE_CMD) build backend
	@echo "$(GREEN)✓ Production image built$(NC)"

prod-up: ## Start services in production mode
	@echo "$(BLUE)Starting services in production mode...$(NC)"
	@$(COMPOSE_CMD) -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production services started$(NC)"

# Aliases for common commands
start: up ## Alias for 'up'
stop: down ## Alias for 'down'
ps: status ## Alias for 'status'
