# Installation

This guide will walk you through installing Greenstack on your system.

---

## 🪟 Windows Users - Quick Start!

**Running on Windows?** We have a dedicated guide for you:

👉 **[Windows Installation Guide](windows-installation.md)** - Complete step-by-step instructions for Windows 10/11

Includes:
- One-click setup with `setup.bat`
- Desktop shortcut creation
- Windows-specific troubleshooting
- PATH configuration help
- Firewall and permissions guidance

---

## Prerequisites

Before installing Greenstack, ensure you have:

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

=== "PyPI Package (Recommended)"

    **Install from PyPI** - Easiest method for most users:

    ```bash
    # Install via pip
    pip install greenstack

    # Create working directory
    mkdir greenstack-workspace
    cd greenstack-workspace

    # Initialize database
    alembic upgrade head

    # Start the application
    iodd-api
    ```

    The application will start on http://localhost:8000

    **With optional dependencies:**

    ```bash
    # Install with all features
    pip install greenstack[all]

    # Or install specific extras:
    pip install greenstack[dev]       # Development tools
    pip install greenstack[docs]      # Documentation tools
    pip install greenstack[advanced]  # Advanced features
    pip install greenstack[security]  # Security features
    ```

=== "Docker (Production Ready)"

    **Run with Docker** - Best for production deployments:

    ```bash
    # Pull the latest image
    docker pull ghcr.io/me-catalyst/greenstack:latest

    # Run container
    docker run -d \
      --name greenstack \
      -p 8000:8000 \
      -v iodd-data:/data \
      ghcr.io/me-catalyst/greenstack:latest
    ```

    Access the application at http://localhost:8000

    **With Docker Compose:**

    ```bash
    # Clone repository for docker-compose.yml
    git clone https://github.com/ME-Catalyst/greenstack.git
    cd greenstack

    # Start services
    docker-compose up -d
    ```

    **Available Docker tags:**
    - `latest` - Latest stable release
    - `2.0.1` - Specific version
    - `2.0` - Latest 2.0.x release
    - `2` - Latest 2.x release

=== "From Source"

    ### 1. Clone the Repository

    ```bash
    git clone https://github.com/ME-Catalyst/greenstack.git
    cd greenstack
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


=== "Development Installation"

    ### 1. Clone and Enter Directory

    ```bash
    git clone https://github.com/ME-Catalyst/greenstack.git
    cd greenstack
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
rm greenstack.db

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
- **[Configuration](../CONFIGURATION.md)** - Customize your setup
- **[User Guide](../user-guide/web-interface.md)** - Explore features

## Uninstallation

To completely remove Greenstack:

```bash
# Stop running processes
# Ctrl+C in terminal

# Remove directory
cd ..
rm -rf greenstack

# (Optional) Remove virtual environment if created
rm -rf venv
```
