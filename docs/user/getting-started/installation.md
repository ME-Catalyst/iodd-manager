# Installation

This guide will walk you through installing IODD Manager on your system.

## Prerequisites

Before installing IODD Manager, ensure you have:

- **Python 3.10 or higher** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18 or higher** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/downloads)

### Verify Prerequisites

```bash
# Check Python version
python --version
# Should output: Python 3.10.x or higher

# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check Git version
git --version
# Should output: git version 2.x.x
```

## Installation Methods

=== "Standard Installation"

    ### 1. Clone the Repository

    ```bash
    git clone https://github.com/ME-Catalyst/iodd-manager.git
    cd iodd-manager
    ```

    ### 2. Configure Environment

    ```bash
    # Copy example configuration
    cp .env.example .env

    # (Optional) Edit configuration with your preferred settings
    nano .env
    ```

    ### 3. Install Python Dependencies

    ```bash
    pip install -r requirements.txt
    ```

    ### 4. Install Frontend Dependencies

    ```bash
    cd frontend
    npm install
    cd ..
    ```

    ### 5. Run Database Migrations

    ```bash
    alembic upgrade head
    ```

    ### 6. Start the Application

    ```bash
    python start.py
    ```

    The application will:
    - Start the API server on http://localhost:8000
    - Start the frontend on http://localhost:3000
    - Automatically open your browser

=== "Docker Installation"

    See the [Docker Deployment Guide](docker.md) for containerized installation.

=== "Development Installation"

    ### 1. Clone and Enter Directory

    ```bash
    git clone https://github.com/ME-Catalyst/iodd-manager.git
    cd iodd-manager
    ```

    ### 2. Create Virtual Environment

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

    ### 3. Install Dependencies

    ```bash
    # Install Python dependencies (including dev tools)
    pip install -r requirements.txt

    # Install pre-commit hooks
    pip install pre-commit
    pre-commit install

    # Install frontend dependencies
    cd frontend && npm install && cd ..
    ```

    ### 4. Configure Environment

    ```bash
    cp .env.example .env
    # Set ENVIRONMENT=development in .env
    ```

    ### 5. Setup Database

    ```bash
    alembic upgrade head
    ```

    ### 6. Start Development Servers

    ```bash
    # Terminal 1: API server
    python api.py

    # Terminal 2: Frontend dev server
    cd frontend && npm run dev
    ```

## Post-Installation

### Verify Installation

```bash
# Check API health
curl http://localhost:8000/api/health

# Expected output:
# {"status":"healthy","database":"connected",...}
```

### Access the Application

- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Base URL**: http://localhost:8000/api

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

## Troubleshooting

### Port Already in Use

If you see "Address already in use" errors:

```bash
# Option 1: Change ports in .env
API_PORT=9000
FRONTEND_PORT=4000

# Option 2: Kill existing processes
# On Linux/Mac
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Permission Errors

Ensure directories are writable:

```bash
mkdir -p iodd_storage generated logs
chmod 755 iodd_storage generated logs
```

### Database Errors

Reset the database:

```bash
# Delete existing database
rm iodd_manager.db

# Run migrations again
alembic upgrade head
```

### Frontend Build Errors

Clear and reinstall dependencies:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Python Package Conflicts

Use a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

## Next Steps

- **[Quick Start Guide](quick-start.md)** - Learn basic usage
- **[Configuration](configuration.md)** - Customize your setup
- **[User Guide](../user-guide/web-interface.md)** - Explore features

## Uninstallation

To completely remove IODD Manager:

```bash
# Stop running processes
# Ctrl+C in terminal

# Remove directory
cd ..
rm -rf iodd-manager

# (Optional) Remove virtual environment if created
rm -rf venv
```
