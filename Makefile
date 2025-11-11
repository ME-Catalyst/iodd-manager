.PHONY: help install format lint type-check test clean pre-commit

help:
	@echo "IODD Manager - Development Commands"
	@echo "===================================="
	@echo ""
	@echo "Setup:"
	@echo "  make install        - Install all dependencies (Python + Frontend)"
	@echo "  make pre-commit     - Install pre-commit hooks"
	@echo ""
	@echo "Code Quality:"
	@echo "  make format         - Format code with black and prettier"
	@echo "  make lint           - Run all linters (ruff, pylint, eslint)"
	@echo "  make type-check     - Run mypy type checking"
	@echo "  make security       - Run security checks with bandit"
	@echo "  make check          - Run format + lint + type-check + security"
	@echo ""
	@echo "Testing:"
	@echo "  make test           - Run all tests with pytest"
	@echo "  make test-cov       - Run tests with coverage report"
	@echo ""
	@echo "Running:"
	@echo "  make run            - Start the full application"
	@echo "  make run-api        - Start API server only"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          - Remove build artifacts and cache files"

# ============================================================================
# Installation
# ============================================================================

install:
	@echo "Installing Python dependencies..."
	pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ All dependencies installed"

pre-commit:
	@echo "Installing pre-commit..."
	pip install pre-commit
	pre-commit install
	@echo "✓ Pre-commit hooks installed"

# ============================================================================
# Code Quality
# ============================================================================

format:
	@echo "Formatting Python code with black..."
	black iodd_manager.py api.py start.py
	@echo "Formatting frontend code with prettier..."
	cd frontend && npx prettier --write "**/*.{js,jsx,json,css,md}"
	@echo "✓ Code formatted"

lint:
	@echo "Running ruff..."
	ruff check iodd_manager.py api.py start.py
	@echo "Running pylint..."
	pylint iodd_manager.py api.py start.py || true
	@echo "Running eslint..."
	cd frontend && npx eslint "**/*.{js,jsx}" || true
	@echo "✓ Linting complete"

type-check:
	@echo "Running mypy type checking..."
	mypy iodd_manager.py api.py start.py
	@echo "✓ Type checking complete"

security:
	@echo "Running bandit security checks..."
	bandit -c pyproject.toml -r iodd_manager.py api.py start.py
	@echo "✓ Security check complete"

check: format lint type-check security
	@echo "✓ All quality checks passed"

# ============================================================================
# Testing
# ============================================================================

test:
	@echo "Running tests..."
	pytest tests/ -v
	@echo "✓ Tests complete"

test-cov:
	@echo "Running tests with coverage..."
	pytest tests/ -v --cov=. --cov-report=html --cov-report=term
	@echo "✓ Coverage report generated in htmlcov/"

# ============================================================================
# Running
# ============================================================================

run:
	@echo "Starting IODD Manager..."
	python start.py

run-api:
	@echo "Starting API server..."
	python api.py

# ============================================================================
# Maintenance
# ============================================================================

clean:
	@echo "Cleaning build artifacts..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.db" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf htmlcov/
	rm -rf dist/
	rm -rf build/
	@echo "✓ Cleanup complete"
