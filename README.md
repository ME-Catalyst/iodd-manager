# GreenStack

<div align="center">

**Intelligent device management platform with a complete Industrial IoT foundation**

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com/ME-Catalyst/iodd-manager/actions)
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

→ **[PyPI Installation Guide](docs/user/getting-started/installation.md#pypi-package-recommended)**

### 🐳 Docker

```bash
docker pull ghcr.io/me-catalyst/greenstack:latest
docker run -d -p 8000:8000 -v greenstack-data:/data ghcr.io/me-catalyst/greenstack:latest
```

Access the application at http://localhost:8000

→ **[Docker Installation Guide](docs/user/getting-started/installation.md#docker-production-ready)**

### 🪟 Windows Source Install

**Double-click `setup.bat`** and you're done!

→ **[Complete Windows Installation Guide](docs/user/getting-started/windows-installation.md)**

### 🐧 Linux / 🍎 macOS Source Install

```bash
git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack
chmod +x setup.sh
./setup.sh
```

→ **[Complete Installation Guide](docs/user/getting-started/installation.md#from-source)**

**Access the application:**
- Web Interface: http://localhost:5173
- API Documentation: http://localhost:8000/docs

## Documentation

📚 **[Complete Documentation Index](docs/INDEX.md)** - Start here for all documentation

### Getting Started
- **[Quick Start Guide](docs/user/getting-started/quick-start.md)** - Get running in 5 minutes
- **[Installation Guide](docs/user/getting-started/installation.md)** - Detailed setup instructions
- **[Windows Installation](docs/user/getting-started/windows-installation.md)** - Windows-specific guide
- **[Docker Setup](docs/user/getting-started/docker.md)** - Containerized deployment

### User Guides
- **[User Manual](docs/user/USER_MANUAL.md)** - Complete feature guide
- **[Configuration Reference](docs/user/CONFIGURATION.md)** - All configuration options
- **[Web Interface Guide](docs/user/user-guide/web-interface.md)** - Dashboard and UI features
- **[Troubleshooting](docs/troubleshooting/TROUBLESHOOTING.md)** - Common issues and solutions

### Developer Documentation
- **[Developer Reference](docs/developer/DEVELOPER_REFERENCE.md)** - Architecture, API, database
- **[API Specification](docs/developer/API_SPECIFICATION.md)** - Complete REST API reference
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[System Architecture](docs/architecture/ARCHITECTURE.md)** - System design and data flows

## Technology Stack

**Backend:** Python 3.10+, FastAPI, SQLAlchemy, Alembic, Pydantic, lxml
**Frontend:** React 18, Vite, Tailwind CSS, Radix UI, Three.js
**Database:** SQLite / PostgreSQL
**Development:** pytest, Black, Ruff, MyPy, ESLint, GitHub Actions

→ **[Full Technology Stack Details](docs/architecture/ARCHITECTURE.md#technology-stack)**

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for:

- Development setup and workflow
- Code style guidelines and standards
- Testing requirements
- Pull request process

## Support

- 📖 **Documentation**: [Complete Docs](docs/INDEX.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ME-Catalyst/iodd-manager/issues)

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
