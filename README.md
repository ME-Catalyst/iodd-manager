# IODD Manager

<div align="center">

**A modern, full-stack industrial automation tool for managing IO-Link Device Description (IODD) files**

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com/ME-Catalyst/iodd-manager/actions)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.2-61dafb)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688)](https://fastapi.tiangolo.com/)

[Features](#features) •
[Quick Start](#quick-start) •
[Documentation](#documentation) •
[Development](#development) •
[Deployment](#deployment)

</div>

---

## Overview

IODD Manager is a comprehensive solution for importing, managing, and generating platform-specific adapters from IO-Link Device Description (IODD) files. It provides a powerful REST API backend with a modern React frontend for device management and adapter generation.

### Key Features

- 🎯 **IODD File Management** - Import, parse, and store IODD XML files and packages
- 🔌 **Adapter Generation** - Generate platform-specific code (Node-RED, Python, MQTT, OPC UA)
- 🖥️ **Modern Web UI** - React-based dashboard with 3D visualizations and analytics
- 🚀 **REST API** - Full-featured FastAPI backend with OpenAPI documentation
- 💾 **Database Migrations** - Alembic-powered schema versioning
- ⚙️ **Configuration Management** - Environment-based configuration with .env support
- 🧪 **Comprehensive Testing** - 65+ tests with pytest
- 🔒 **Security** - CORS configuration, input validation, SQL injection protection
- 📦 **Docker Ready** - Containerized deployment with docker-compose
- 🔄 **CI/CD Pipeline** - Automated testing and quality checks

## Supported Platforms

### Currently Implemented
- ✅ **Node-RED** - Generate custom Node-RED nodes with full device interface

### Planned
- 🚧 **Python** - Device driver libraries
- 🚧 **MQTT** - Bridge adapters for MQTT integration
- 🚧 **OPC UA** - Server configuration generators
- 🚧 **Modbus** - Protocol mapping generators

## Quick Start

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher (for frontend)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ME-Catalyst/iodd-manager.git
cd iodd-manager

# Create and configure environment
cp .env.example .env
# Edit .env with your preferred settings (optional - defaults work fine)

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..

# Run database migrations
alembic upgrade head

# Start the application (API + Frontend)
python start.py
```

The application will automatically:
- Start the API server on http://localhost:8000
- Start the frontend on http://localhost:3000
- Open your browser to the dashboard

### Docker Quick Start

```bash
# Using Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

## Usage

### Web Interface

The modern React dashboard provides:

- **Device Management** - Upload, view, edit, and delete IODD devices
- **Adapter Generation** - Generate platform-specific code with one click
- **Analytics Dashboard** - Visualize device statistics and trends
- **3D Visualization** - Interactive device and network topology views

Access the dashboard at http://localhost:3000 after starting the application.

### Command Line Interface

#### Import IODD Files

```bash
# Import standalone IODD XML
python iodd_manager.py import device_description.xml

# Import IODD package (.iodd)
python iodd_manager.py import sensor_package.iodd
```

#### List Devices

```bash
python iodd_manager.py list
```

#### Generate Adapters

```bash
python iodd_manager.py generate <device_id> --platform node-red --output ./generated
```

### REST API

#### Start API Server Only

```bash
python api.py
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

#### API Examples

```bash
# Upload IODD file
curl -X POST "http://localhost:8000/api/iodd/upload" \
  -F "file=@device.xml"

# List devices
curl "http://localhost:8000/api/iodd"

# Get device details
curl "http://localhost:8000/api/iodd/1"

# Generate adapter
curl -X POST "http://localhost:8000/api/generate/adapter" \
  -H "Content-Type: application/json" \
  -d '{"device_id": 1, "platform": "node-red"}'

# Download adapter
curl "http://localhost:8000/api/generate/1/node-red/download" \
  --output adapter.zip

# System health
curl "http://localhost:8000/api/health"

# Statistics
curl "http://localhost:8000/api/stats"
```

### Python API

```python
from iodd_manager import IODDManager

# Initialize manager
manager = IODDManager()

# Import IODD file
device_id = manager.import_iodd("path/to/device.xml")

# List devices
devices = manager.list_devices()

# Generate adapter
adapter_code = manager.generate_adapter(device_id, "node-red")
```

## Project Structure

```
iodd-manager/
├── api.py                      # FastAPI REST API
├── iodd_manager.py             # Core library
├── start.py                    # Application launcher
├── config.py                   # Configuration management
├── requirements.txt            # Python dependencies
├── .env.example                # Configuration template
├── alembic.ini                 # Database migration config
├── alembic/                    # Database migrations
│   ├── versions/
│   └── README.md
├── frontend/                   # React application
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Main dashboard
│   │   ├── components/        # UI components
│   │   └── index.css          # Styles
│   ├── package.json
│   └── vite.config.js
├── tests/                      # Test suite
│   ├── test_api.py
│   ├── test_parser.py
│   ├── test_storage.py
│   ├── conftest.py
│   └── fixtures/
├── docs/                       # Documentation (MkDocs)
├── Dockerfile                  # Container definition
├── docker-compose.yml          # Multi-container setup
└── .github/
    └── workflows/
        └── ci.yml              # CI/CD pipeline
```

## Configuration

IODD Manager uses environment variables for configuration. See [CONFIGURATION.md](CONFIGURATION.md) for complete details.

### Quick Configuration

```bash
# Copy example configuration
cp .env.example .env

# Edit with your preferred settings
nano .env
```

### Common Settings

```bash
# Application
ENVIRONMENT=development          # development, production, testing
DEBUG=true

# API Server
API_HOST=0.0.0.0
API_PORT=8000

# Frontend
FRONTEND_PORT=3000
AUTO_OPEN_BROWSER=true

# Database
IODD_DATABASE_URL=sqlite:///iodd_manager.db
AUTO_MIGRATE=false

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=false
```

See [.env.example](.env.example) for all 50+ available configuration options.

## Development

### Setup Development Environment

```bash
# Install development dependencies
pip install -r requirements.txt

# Install pre-commit hooks
make pre-commit

# Install frontend dependencies
cd frontend && npm install
```

### Code Quality

```bash
# Format code
make format

# Run linters
make lint

# Type checking
make type-check

# Security scan
make security

# Run all checks
make check
```

### Testing

```bash
# Run all tests
make test

# Run with coverage
make test-cov

# Run specific test file
pytest tests/test_api.py -v

# Run with markers
pytest -m unit          # Unit tests only
pytest -m "not slow"    # Skip slow tests
```

### Database Migrations

```bash
# Check current version
alembic current

# Apply migrations
alembic upgrade head

# Create new migration
alembic revision -m "add_user_table"

# Rollback migration
alembic downgrade -1
```

See [alembic/README.md](alembic/README.md) for detailed migration guide.

### Frontend Development

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Lint
npm run lint

# Format
npm run format
```

## Deployment

### Production Configuration

```bash
# .env for production
ENVIRONMENT=production
DEBUG=false
API_RELOAD=false
API_WORKERS=4
LOG_LEVEL=WARNING
LOG_TO_FILE=true
ENABLE_DOCS=false
AUTO_OPEN_BROWSER=false
```

### Docker Deployment

```bash
# Build image
docker build -t iodd-manager .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Deployment

```bash
# Install dependencies
pip install -r requirements.txt
cd frontend && npm install && npm run build && cd ..

# Run migrations
alembic upgrade head

# Start with production settings
ENVIRONMENT=production python start.py
```

## Documentation

- **[Configuration Guide](CONFIGURATION.md)** - Complete configuration reference
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (when running)
- **[Database Migrations](alembic/README.md)** - Migration guide and best practices
- **[Frontend Guide](frontend/README.md)** - Frontend architecture and development
- **[Contributing Guide](CONTRIBUTING.md)** - Development guidelines and workflow
- **[Test Documentation](tests/README.md)** - Testing guide and examples
- **[Full Documentation](https://iodd-manager.readthedocs.io)** - Complete docs (MkDocs)

## Technology Stack

### Backend
- **Python 3.10+** - Core language
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **lxml** - XML parsing
- **Jinja2** - Template engine

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Three.js** - 3D visualizations
- **Nivo** - Charts
- **Axios** - HTTP client

### Development
- **pytest** - Testing framework
- **Black** - Code formatter
- **Ruff** - Fast linter
- **MyPy** - Type checker
- **ESLint** - JavaScript linter
- **GitHub Actions** - CI/CD

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

### Quick Contribution Workflow

```bash
# Fork and clone
git clone https://github.com/yourusername/iodd-manager.git

# Create feature branch
git checkout -b feature/your-feature

# Make changes and run checks
make check
make test

# Commit and push
git commit -m "Add your feature"
git push origin feature/your-feature

# Open pull request on GitHub
```

## Testing

The project includes comprehensive tests:

- **65+ test cases** covering all major functionality
- **Unit tests** for individual components
- **Integration tests** for API endpoints
- **Fixtures** for consistent test data

```bash
# Run all tests
pytest

# With coverage report
pytest --cov=. --cov-report=html

# Specific test file
pytest tests/test_api.py -v
```

## CI/CD

Automated workflows run on every push:

- ✅ **Code Quality** - Black, Ruff, Pylint, MyPy checks
- ✅ **Security** - Bandit security scanning
- ✅ **Tests** - Full test suite with coverage
- ✅ **Frontend** - ESLint and Prettier checks
- ✅ **Build** - Verification of builds
- ✅ **Matrix Testing** - Python 3.10, 3.11, 3.12

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for pipeline details.

## Troubleshooting

### Port Already in Use

```bash
# Change ports in .env
API_PORT=9000
FRONTEND_PORT=4000
```

### Database Issues

```bash
# Reset database
rm iodd_manager.db
alembic upgrade head
```

### Frontend Build Errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Permission Errors

```bash
# Ensure directories exist and are writable
mkdir -p iodd_storage generated logs
chmod 755 iodd_storage generated logs
```

## Performance

- **API Response Time**: < 200ms average
- **File Upload**: Supports files up to 10MB (configurable)
- **Concurrent Requests**: 100+ simultaneous connections
- **Database**: Optimized with indexes on key columns

## Security

- ✅ **CORS Protection** - Configurable allowed origins
- ✅ **Input Validation** - File size, type, and content checks
- ✅ **SQL Injection Protection** - Parameterized queries
- ✅ **Path Traversal Protection** - Sanitized file paths
- ✅ **Dependency Scanning** - Automated vulnerability checks

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

> **No Warranty or Liability** – Provided "as-is," without warranty of any kind.

## Acknowledgments

- **IO-Link Consortium** - For IODD specification
- **FastAPI** - Amazing web framework
- **React Team** - For the UI library
- **Contributors** - Everyone who has contributed to this project

## Support

- 📖 **Documentation**: [Full Docs](https://iodd-manager.readthedocs.io)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ME-Catalyst/iodd-manager/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ME-Catalyst/iodd-manager/discussions)
- 📧 **Email**: support@example.com

## Roadmap

### Version 2.1 (Q1 2025)
- [ ] Python device driver generator
- [ ] MQTT bridge adapter
- [ ] Device simulation mode
- [ ] PostgreSQL support

### Version 2.2 (Q2 2025)
- [ ] OPC UA configuration generator
- [ ] Modbus mapping generator
- [ ] Authentication system
- [ ] Multi-user support

### Version 3.0 (Q3 2025)
- [ ] Cloud deployment templates
- [ ] Kubernetes manifests
- [ ] Advanced analytics
- [ ] Device provisioning

## Stats

![GitHub Stars](https://img.shields.io/github/stars/ME-Catalyst/iodd-manager?style=social)
![GitHub Forks](https://img.shields.io/github/forks/ME-Catalyst/iodd-manager?style=social)
![GitHub Issues](https://img.shields.io/github/issues/ME-Catalyst/iodd-manager)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/ME-Catalyst/iodd-manager)

---

<div align="center">

**Made with ❤️ by the IODD Manager Team**

[⬆ back to top](#iodd-manager)

</div>
