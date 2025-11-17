# GreenStack Documentation

**Version 2.0+** | **Status: Production Ready** | [GitHub Repository](https://github.com/ME-Catalyst/greenstack)

---

## 📚 Documentation Overview

This is the complete documentation for GreenStack, an intelligent device management platform for IO-Link (IODD) and EtherNet/IP (EDS) device configurations.

```
┌──────────────────────────────────────────────────────────────────┐
│  GreenStack Documentation Structure                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  👤 Users              │  👨‍💻 Developers         │  🏗️ Architecture   │
│  • Quick Start         │  • API Reference      │  • System Design  │
│  • User Features       │  • Code Guide         │  • Data Flow      │
│  • Configuration       │  • Best Practices     │  • Frontend       │
│  • Troubleshooting     │  • Contributing       │  • UX Features    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started (5 Minutes)

**New to GreenStack?** Start here:

1. **[Quick Start Guide](user/getting-started/quick-start.md)** ⚡
   Get running in 5 minutes with step-by-step instructions

2. **[Installation Guide](user/getting-started/installation.md)** 📦
   Detailed installation for Windows, macOS, and Linux (or use PyPI/Docker!)

3. **[User Features Guide](user/USER_FEATURES.md)** ✨
   Comprehensive 600+ line guide covering all features (theme, shortcuts, analytics)

4. **[Configuration Guide](user/CONFIGURATION.md)** ⚙️
   Configure ports, storage, logging, and security

---

## 👤 User Documentation

### Getting Started
- **[Quick Start (5 min)](user/getting-started/quick-start.md)** - Install and run your first import
- **[Installation Guide](user/getting-started/installation.md)** - Detailed setup instructions
- **[Windows Installation](user/getting-started/windows-installation.md)** 🪟 - Complete Windows 10/11 guide with setup.bat
- **[Docker Setup](user/getting-started/docker.md)** - Run with Docker containers

### User Guides
- **[User Manual](user/USER_MANUAL.md)** - Complete feature guide
- **[User Features Guide](user/USER_FEATURES.md)** ⭐ NEW - 600+ line comprehensive guide covering theme system, keyboard shortcuts, analytics dashboard, device management, search, comparison, export, ticket system, IoT integration, tips & best practices
- **[Web Interface Guide](user/user-guide/web-interface.md)** - Dashboard, library, and device management
- **[Configuration Reference](user/CONFIGURATION.md)** - All configuration options explained
- **[GUI Features](user/GUI_DOCUMENTATION.md)** - Interactive interface documentation
- **[Visual Features](user/VISUAL_FEATURES.md)** - 3D visualizations and charts

### Advanced Features
- **[Nested ZIP Import](user/NESTED_ZIP_IMPORT.md)** - Import packages with multiple devices
- **[Command Line Interface](user/user-guide/cli.md)** - CLI commands and scripts
- **[API Usage](user/user-guide/api.md)** - Using the REST API

---

## 👨‍💻 Developer Documentation

### Core References
- **[Developer Reference](developer/DEVELOPER_REFERENCE.md)** - Architecture, API, database, conventions
- **[API Endpoints Reference](developer/API_ENDPOINTS.md)** ⭐ NEW - Complete REST API reference with all endpoints, request/response formats, examples
- **[API Specification](developer/API_SPECIFICATION.md)** - Complete REST API documentation
- **[Best Practices](developer/BEST_PRACTICES.md)** - UI generation and development patterns

### Guides
- **[Development Setup](developer/developer-guide/setup.md)** - Environment configuration
- **[Code Quality](developer/developer-guide/code-quality.md)** - Linting, formatting, testing
- **[Testing Guide](developer/developer-guide/testing.md)** - Writing and running tests
- **[Contributing Guide](developer/developer-guide/contributing.md)** - How to contribute

### API & Database
- **[API Overview](developer/api/overview.md)** - API architecture and design
- **[API Endpoints](developer/api/endpoints.md)** - All available endpoints
- **[API Errors](developer/api/errors.md)** - Error codes and handling
- **[Database Schema](developer/database/schema.md)** - Tables and relationships
- **[Database Migrations](developer/database/migrations.md)** - Schema versioning

### Feature Documentation
- **[Interactive Menus](developer/ENHANCED_MENUS_SUMMARY.md)** - Menu system implementation
- **[Config Page Guide](developer/CONFIG_PAGE_DEVELOPER_GUIDE.md)** - Building configuration UIs

---

## 🏗️ Architecture Documentation

- **[System Architecture](architecture/ARCHITECTURE.md)** ⭐ UPDATED - High-level system design with 13 Mermaid diagrams, new User Experience Features section (theme, keyboard shortcuts, analytics), updated frontend stack
- **[Frontend Architecture](architecture/FRONTEND_ARCHITECTURE.md)** ⭐ NEW - Complete React 18 frontend architecture (400+ lines) - component design, state management, theme system, keyboard shortcuts, analytics, styling, performance
- **[Technology Stack](architecture/ARCHITECTURE.md#technology-stack)** - Backend, frontend, database
- **[Data Flow](architecture/ARCHITECTURE.md#data-flow)** - Request/response patterns

---

## 🔧 Troubleshooting

- **[Troubleshooting Guide](troubleshooting/TROUBLESHOOTING.md)** - Common issues and solutions
  - Installation issues
  - Runtime errors
  - Import problems
  - Performance issues
  - Database errors
  - API issues

---

## 📋 Project Information

### Essential Files
- **[README](/README.md)** - Project overview and quick start
- **[LICENSE](/LICENSE.md)** - MIT License © ME-Catalyst 2025
- **[CHANGELOG](/CHANGELOG.md)** - Version history and changes
- **[CONTRIBUTING](/CONTRIBUTING.md)** - How to contribute to the project

### Project Management
- **[Cleanup Summary](project/CLEANUP_SUMMARY.md)** - Recent codebase improvements

---

## 🎯 Documentation by Task

### I want to...

**Install and run Greenstack**
→ [Quick Start Guide](user/getting-started/quick-start.md)

**Import my first IODD file**
→ [Quick Start - First Import](user/getting-started/quick-start.md#your-first-iodd-import)

**Configure for production**
→ [Configuration Guide](user/CONFIGURATION.md) + [Production Deployment](deployment/production.md)

**Use the REST API**
→ [API Specification](developer/API_SPECIFICATION.md)

**Contribute code**
→ [Contributing Guide](/CONTRIBUTING.md)

**Understand the architecture**
→ [Architecture Documentation](architecture/ARCHITECTURE.md)

**Fix an error**
→ [Troubleshooting Guide](troubleshooting/TROUBLESHOOTING.md)

---

## 📊 Documentation Standards

This documentation follows these principles:

✅ **Clear Structure** - Organized by audience (users, developers, architects)  
✅ **Progressive Disclosure** - Start simple, get detailed as needed  
✅ **Examples Everywhere** - Code samples, screenshots, and diagrams  
✅ **Search-Friendly** - Clear headings and consistent formatting  
✅ **Up-to-Date** - Updated with each release

---

## 🆘 Getting Help

**Found an issue?** [Report it on GitHub](https://github.com/ME-Catalyst/greenstack/issues)

**Have a question?** Check the [Troubleshooting Guide](troubleshooting/TROUBLESHOOTING.md)

**Want to contribute?** See [Contributing Guide](/CONTRIBUTING.md)

---

<div align="center">

**Made with ❤️ by the GreenStack Team**

**Version 2.0+** | **Latest Features:**
🎨 Theme System • ⌨️ Keyboard Shortcuts • 📊 Analytics Dashboard • 🎯 EDS Support

[GitHub](https://github.com/ME-Catalyst/greenstack) • [Issues](https://github.com/ME-Catalyst/greenstack/issues) • [CHANGELOG](../CHANGELOG.md)

</div>
