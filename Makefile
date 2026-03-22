.PHONY: help install dev build test lint format migrate db-upgrade db-downgrade clean docker-up docker-down

help:
	@echo "Maiki - Available Commands:"
	@echo "  make install        - Install Python dependencies"
	@echo "  make dev            - Run development server"
	@echo "  make build          - Build Docker images"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linting"
	@echo "  make format         - Format code"
	@echo "  make migrate        - Create new migration"
	@echo "  make db-upgrade     - Run database migrations"
	@echo "  make db-downgrade   - Rollback migration"
	@echo "  make docker-up      - Start Docker containers"
	@echo "  make docker-down    - Stop Docker containers"
	@echo "  make clean          - Clean up"

# Development
install:
	cd backend && pip install -r requirements.txt
	cd frontend/web && npm install

dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	cd backend && uvicorn app.main:app --reload &
	cd frontend/web && npm run dev

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

docker-logs:
	docker-compose logs -f

# Database
migrate:
	cd backend && alembic revision --autogenerate -m "$(msg)"

db-upgrade:
	cd backend && alembic upgrade head

db-downgrade:
	cd backend && alembic downgrade -1

db-reset:
	cd backend && alembic downgrade base && alembic upgrade head

# Testing
test:
	cd backend && pytest --cov=app --cov-report=term-missing

test-watch:
	cd backend && ptw

# Code Quality
lint:
	cd backend && flake8 app
	cd backend && mypy app

format:
	cd backend && black app
	cd backend && isort app
	cd frontend/web && npx prettier --write "src/**/*.{ts,tsx}"

# Security
security-check:
	cd backend && bandit -r app

# Deployment
deploy-staging:
	@echo "Deploying to staging..."
	# Add deployment commands here

deploy-production:
	@echo "Deploying to production..."
	# Add deployment commands here

# Maintenance
clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name ".DS_Store" -delete
	rm -rf backend/.pytest_cache
	rm -rf frontend/web/.next
	rm -rf frontend/web/node_modules

# Setup
setup-env:
	cp backend/.env.example backend/.env
	@echo "Created .env file. Please edit with your configuration."

seed-db:
	cd backend && python scripts/seed_data.py

# Health Checks
health-backend:
	curl http://localhost:8000/health

health-frontend:
	curl http://localhost:3000

# Documentation
docs:
	cd backend && python -m mkdocs serve

api-docs:
	@echo "Open http://localhost:8000/docs"
