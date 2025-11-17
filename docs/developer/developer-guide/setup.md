# Developer Setup

Set up your development environment to contribute to Greenstack.

## Prerequisites

Ensure you have the required tools installed:

- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code, PyCharm, or your preference

## Quick Setup

```bash
# 1. Clone repository
git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Install pre-commit hooks
pip install pre-commit
pre-commit install

# 5. Install frontend dependencies
cd frontend
npm install
cd ..

# 6. Create environment file
cp .env.example .env
# Edit .env: Set ENVIRONMENT=development, DEBUG=true

# 7. Initialize database
alembic upgrade head

# 8. Verify installation
make test
```

## Development Environment

### Python Environment

**Create virtual environment:**

```bash
python -m venv venv
source venv/bin/activate
```

**Install dependencies:**

```bash
# Production dependencies
pip install -r requirements.txt

# Development tools (included in requirements.txt)
# - pytest: Testing framework
# - black: Code formatter
# - ruff: Linter
# - mypy: Type checker
# - bandit: Security scanner
# - pre-commit: Git hooks
```

**Verify installation:**

```bash
python --version  # Should be 3.10+
pip list | grep -E "fastapi|sqlalchemy|pytest"
```

### Frontend Environment

**Install Node.js dependencies:**

```bash
cd frontend
npm install

# Verify installation
npm list --depth=0
```

**Frontend dependencies:**

- React 18.2
- Vite 4.5
- Three.js (3D visualization)
- Framer Motion (animations)
- Lucide React (icons)
- Nivo (charts)

### IDE Configuration

#### VS Code

**Recommended Extensions:**

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens"
  ]
}
```

**Settings** (`.vscode/settings.json`):

```json
{
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.rulers": [100]
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

#### PyCharm

**Configure interpreter:**

1. File → Settings → Project → Python Interpreter
2. Add Interpreter → Virtualenv Environment
3. Select `venv/bin/python`

**Enable tools:**

1. Settings → Tools → Python Integrated Tools
2. Default test runner: pytest
3. Type checker: mypy

**Code style:**

1. Settings → Editor → Code Style → Python
2. Line length: 100
3. Use Black code style

## Code Quality Tools

### Pre-commit Hooks

Pre-commit hooks run automatically on `git commit`.

**Install:**

```bash
pip install pre-commit
pre-commit install
```

**Manual run:**

```bash
# Run on all files
pre-commit run --all-files

# Run specific hook
pre-commit run black --all-files
pre-commit run ruff --all-files
```

**Hooks configured:**

- **Black**: Code formatting
- **Ruff**: Linting
- **MyPy**: Type checking
- **Bandit**: Security scanning
- **Prettier**: Frontend formatting
- **ESLint**: Frontend linting

### Makefile Commands

Convenient development commands:

```bash
# Format code
make format

# Lint code
make lint

# Type check
make type-check

# Run tests
make test

# Test with coverage
make coverage

# Run all checks
make check

# Clean artifacts
make clean

# Run dev servers
make dev
```

### Manual Tool Usage

**Black** (code formatting):

```bash
# Format all Python files
black .

# Check without modifying
black --check .

# Format specific file
black api.py
```

**Ruff** (linting):

```bash
# Lint all files
ruff check .

# Auto-fix issues
ruff check --fix .

# Lint specific file
ruff check api.py
```

**MyPy** (type checking):

```bash
# Type check all files
mypy .

# Check specific file
mypy api.py

# Strict mode
mypy --strict api.py
```

**Pylint** (advanced linting):

```bash
# Lint all files
pylint *.py

# Lint specific file
pylint api.py

# Generate report
pylint --output-format=text *.py > pylint_report.txt
```

**Bandit** (security scanning):

```bash
# Scan all files
bandit -r .

# Exclude tests
bandit -r . -x tests/

# Output to file
bandit -r . -f json -o bandit_report.json
```

### Frontend Tools

**ESLint** (JavaScript linting):

```bash
cd frontend

# Lint all files
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Prettier** (code formatting):

```bash
cd frontend

# Format all files
npm run format

# Check formatting
npm run format -- --check
```

## Running Development Servers

### Option 1: Integrated (Recommended)

Run both API and frontend together:

```bash
# Start both servers
python start.py

# Or use Makefile
make dev
```

**Servers start:**

- API: http://localhost:8000
- Frontend: http://localhost:3000
- Browser opens automatically

### Option 2: Separate Terminals

Run servers independently:

**Terminal 1 - API Server:**

```bash
# Development mode (auto-reload)
python api.py

# Or with Uvicorn directly
uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend Dev Server:**

```bash
cd frontend
npm run dev
```

**Access:**

- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

## Database Management

### Initialize Database

```bash
# Run migrations
alembic upgrade head

# Check current version
alembic current

# View migration history
alembic history
```

### Create New Migration

```bash
# Auto-generate migration
alembic revision --autogenerate -m "Add new column"

# Create empty migration
alembic revision -m "Custom migration"

# Edit migration file
# Located in: alembic/versions/xxx_add_new_column.py
```

### Reset Database

```bash
# Delete database
rm greenstack.db

# Recreate with migrations
alembic upgrade head

# Or use development script
python -c "from greenstack import init_db; init_db()"
```

### Inspect Database

```bash
# Using sqlite3
sqlite3 greenstack.db

# List tables
.tables

# Describe table
.schema devices

# Query data
SELECT * FROM devices LIMIT 10;

# Exit
.exit
```

## Testing

### Run Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_api.py

# Run specific test
pytest tests/test_api.py::test_upload_iodd_file

# Run with markers
pytest -m unit
pytest -m integration

# Verbose output
pytest -v

# Show print statements
pytest -s
```

### Test with Coverage

```bash
# Run with coverage
pytest --cov=. --cov-report=html

# View HTML report
open htmlcov/index.html

# Terminal report
pytest --cov=. --cov-report=term-missing
```

### Watch Mode

```bash
# Install pytest-watch
pip install pytest-watch

# Run in watch mode
ptw
```

## Debugging

### Python Debugging

**Using pdb:**

```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Or use built-in (Python 3.7+)
breakpoint()
```

**Using VS Code:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["api:app", "--reload"],
      "jinja": true
    },
    {
      "name": "Python: Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal"
    },
    {
      "name": "Python: Pytest",
      "type": "python",
      "request": "launch",
      "module": "pytest",
      "args": ["${file}"]
    }
  ]
}
```

### Frontend Debugging

**Browser DevTools:**

1. Open DevTools (F12)
2. Sources tab → Set breakpoints
3. Console tab → View logs

**React DevTools:**

Install browser extension:

- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## Environment Configuration

### Development .env

```bash
# Application
ENVIRONMENT=development
DEBUG=true

# API
API_HOST=127.0.0.1
API_PORT=8000
API_RELOAD=true

# Frontend
FRONTEND_PORT=3000
AUTO_OPEN_BROWSER=true

# Database
IODD_DATABASE_URL=sqlite:///./greenstack.db

# Storage
IODD_STORAGE_DIR=./iodd_storage
GENERATED_OUTPUT_DIR=./generated

# Logging
LOG_LEVEL=DEBUG
LOG_TO_FILE=false

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000

# Features
ENABLE_DOCS=true
ENABLE_3D_VISUALIZATION=true
```

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -ti:8000

# Kill process
kill -9 $(lsof -ti:8000)
```

### Module Not Found

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Locked

```bash
# Close all connections
pkill -f python

# Remove lock files
rm greenstack.db-shm
rm greenstack.db-wal
```

### Frontend Build Errors

```bash
cd frontend

# Clear cache
rm -rf node_modules dist .vite

# Reinstall
npm install

# Rebuild
npm run build
```

## Next Steps

- **[Architecture](architecture.md)** - Understand the codebase
- **[Testing Guide](testing.md)** - Write tests
- **[Contributing](contributing.md)** - Contribution guidelines
- **[Code Quality](code-quality.md)** - Standards and best practices
