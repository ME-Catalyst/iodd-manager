# GreenStack

<div align="center">

**Intelligent device management platform with a complete Industrial IoT foundation**

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com/ME-Catalyst/greenstack/actions)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE.md)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.2-61dafb)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688)](https://fastapi.tiangolo.com/)

[Features](#features) •
[Quick Start](#quick-start) •
[Documentation](#documentation) •
[Contributing](#contributing) •
[License](#license)

</div>

---

## Overview

GreenStack is an intelligent device management platform built on a rock-solid Industrial IoT foundation. Currently managing IO-Link (IODD) and EtherNet/IP (EDS) device configurations, it provides a modern web interface for device catalog management. The platform includes an integrated IoT stack with MQTT broker, Grafana dashboards, Node-RED workflows, and InfluxDB storage - a complete foundation ready for future device connectivity and real-time monitoring capabilities.

## Features

### Device Configuration Management
- 🎯 **IO-Link (IODD) Support** - Full import, parsing, and management of IODD XML files and packages
- ⚡ **EtherNet/IP (EDS) Support** - Complete EDS file parsing with assemblies, modules, and parameters
- 📦 **Multi-File Import** - Support for single files, ZIP packages, and nested archives
- 📊 **Interactive Configuration** - Full menu rendering with parameter controls and validation

### Industrial IoT Foundation (Forward-Looking)
- 📡 **MQTT Broker** - Integrated Eclipse Mosquitto ready for device messaging
- 📈 **Grafana Dashboards** - Pre-configured for future telemetry visualization
- 🔄 **Node-RED Workflows** - Visual programming platform for automation
- 💾 **InfluxDB Storage** - Time-series database ready for IoT data streams

### Modern Architecture
- 🚀 **REST API** - Full-featured FastAPI backend with OpenAPI documentation
- 🖥️ **Modern Web UI** - React-based dashboard with Tailwind CSS and Framer Motion
- 💾 **Database Storage** - SQLite/PostgreSQL with Alembic migrations
- 🐳 **Docker Ready** - Complete containerized deployment with docker-compose
- 🔒 **Security** - CORS configuration, input validation, SQL injection protection
- 🧪 **Comprehensive Testing** - 65+ tests with pytest

### User Experience
- 🎨 **Dark/Light Theme** - System preference detection with manual toggle, localStorage persistence
- ⌨️ **Keyboard Shortcuts** - Navigation (h/d/s/c/a), actions (Ctrl+U, Ctrl+Shift+T, Ctrl+R), help (Shift+?)
- 📊 **Analytics Dashboard** - Rich visualizations with Chart.js (manufacturer distribution, I/O analysis, parameter insights)
- 🎯 **Responsive Design** - Optimized for desktop and mobile devices

## Quick Start

### 📦 PyPI Package (Recommended)

```bash
pip install greenstack
greenstack-api
```

Access the application at http://localhost:8000

### 🐳 Docker

```bash
docker pull ghcr.io/me-catalyst/greenstack:latest
docker run -d -p 8000:8000 -v greenstack-data:/data ghcr.io/me-catalyst/greenstack:latest
```

Access the application at http://localhost:8000

### 🪟 Windows Source Install

**Double-click `setup.bat`** and you're done!

### 🐧 Linux / 🍎 macOS Source Install

```bash
git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack
chmod +x setup.sh
./setup.sh
```

**Access the application:**
- Web Interface: http://localhost:5173
- API Documentation: http://localhost:8000/docs

## Documentation

📚 **Complete in-platform documentation system with 28 comprehensive pages!**

Access all documentation directly in the web interface at http://localhost:5173 → Click **"Docs"**

### 📖 In-Platform Documentation (28 Pages)

**Getting Started** (4 pages)
- Quick Start Guide, Installation, Windows Setup, Docker

**User Guides** (3 pages)
- Web Interface Tour, Configuration Reference, Troubleshooting

**API Documentation** (4 pages)
- Overview, Endpoints Reference, Authentication, Error Handling

**Component Gallery** (4 pages)
- Overview, Interactive Gallery, Theme System, UI Components

**Developer Guides** (6 pages)
- Overview, Architecture (with 8 Mermaid diagrams), Backend, Frontend, Testing, Contributing

**Operations** (2 pages)
- Docker Deployment, Monitoring & Logging

**Support Resources** (3 pages)
- Common Issues, Debugging Guide, FAQ (30+ questions)

**Features:**
- 🎨 11 interactive Mermaid diagrams
- 💻 100+ code examples with syntax highlighting
- 🔍 Searchable sidebar navigation
- 📱 Responsive design
- 🌙 Dark theme optimized
- ⚡ Fast page navigation with React lazy loading

### 🔧 API Documentation
- **OpenAPI/Swagger**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- Interactive API testing and documentation

### 📝 GitHub Documentation
- **[Contributing Guide](docs/CONTRIBUTING.md)** - Development workflow and standards
- **[Changelog](docs/CHANGELOG.md)** - Version history and release notes
- **[License](LICENSE.md)** - MIT License details

### 📦 Component READMEs
- **[Frontend Development](frontend/README.md)** - React app development
- **[Database Migrations](alembic/README.md)** - Schema migrations with Alembic
- **[Testing](tests/README.md)** - Running and writing tests
- **[Test Data](test-data/README.md)** - Sample files and test concepts

## Technology Stack

**Backend:** Python 3.10+, FastAPI, SQLAlchemy, Alembic, Pydantic, lxml
**Frontend:** React 18, Vite, Tailwind CSS, Radix UI, Three.js
**Database:** SQLite / PostgreSQL
**Development:** pytest, Black, Ruff, MyPy, ESLint, GitHub Actions

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for:

- Development setup and workflow
- Code style guidelines and standards
- Testing requirements
- Pull request process

## Support

- 📖 **Documentation**: Launch the app and click "Docs" in the navigation
- 🔧 **API Docs**: http://localhost:8000/docs
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ME-Catalyst/greenstack/issues)

## License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

**Copyright © ME-Catalyst 2025**

> **No Warranty or Liability** – Provided "as-is," without warranty of any kind.

## Acknowledgments

- **IO-Link Consortium** - For the IODD specification
- **FastAPI** - Modern web framework
- **React Team** - UI library
- **Contributors** - Everyone who has contributed to this project

---

<div align="center">

![GitHub Stars](https://img.shields.io/github/stars/ME-Catalyst/greenstack?style=social)
![GitHub Issues](https://img.shields.io/github/issues/ME-Catalyst/greenstack)

[⬆ back to top](#greenstack)

</div>
