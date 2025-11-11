# Support

Get help with IODD Manager.

## Documentation

Start with the documentation:

- **[Getting Started](../getting-started/installation.md)** - Installation and setup
- **[User Guide](../user-guide/web-interface.md)** - Using IODD Manager
- **[API Documentation](../api/overview.md)** - API reference
- **[Troubleshooting](../getting-started/installation.md#troubleshooting)** - Common issues

## Community Support

### GitHub Discussions

Best for:

- General questions
- Feature discussions
- Sharing use cases
- Getting advice

**[Start a discussion](https://github.com/ME-Catalyst/iodd-manager/discussions)**

### GitHub Issues

Best for:

- Bug reports
- Feature requests
- Technical problems

**[Create an issue](https://github.com/ME-Catalyst/iodd-manager/issues)**

**Before creating an issue:**

1. Search existing issues
2. Check documentation
3. Try latest version
4. Gather debug information

**Good issue includes:**

- Clear description
- Steps to reproduce
- Expected vs. actual behavior
- Environment details
- Logs or screenshots

## Self-Service Resources

### FAQ

**Q: How do I install IODD Manager?**
A: See [Installation Guide](../getting-started/installation.md)

**Q: How do I upload an IODD file?**
A: See [Quick Start](../getting-started/quick-start.md#your-first-iodd-import)

**Q: How do I generate an adapter?**
A: See [Adapter Guide](../user-guide/adapters.md)

**Q: API returns CORS error?**
A: Check `CORS_ORIGINS` in `.env`. See [Configuration](../getting-started/configuration.md)

**Q: Database locked error?**
A: See [Troubleshooting](../getting-started/installation.md#database-errors)

**Q: How do I update IODD Manager?**
A: See [Production Deployment - Update](../deployment/production.md#update-application)

### Troubleshooting Guides

- **[Installation Issues](../getting-started/installation.md#troubleshooting)**
- **[API Errors](../api/errors.md)**
- **[Deployment Issues](../deployment/production.md#troubleshooting)**

### Video Tutorials

Coming soon! Subscribe to our [YouTube channel](https://youtube.com/iodd-manager) for tutorials.

## Professional Support

### Consulting

Need help with:

- Custom deployment
- Integration with your systems
- Training for your team
- Feature development

**Contact**: consulting@iodd-manager.example.com

### Enterprise Support

Enterprise support packages available with:

- Priority response (24-48 hours)
- Direct email/phone support
- Custom SLAs
- Architecture reviews
- Training sessions

**Contact**: enterprise@iodd-manager.example.com

## Security Issues

**Do not create public issues for security vulnerabilities.**

Report security issues privately:

- **Email**: security@iodd-manager.example.com
- **PGP Key**: Available on request

We will respond within 48 hours.

See our [Security Policy](https://github.com/ME-Catalyst/iodd-manager/security/policy) for details.

## Contributing

Want to contribute?

- **Code**: See [Contributing Guide](contributing.md)
- **Documentation**: Create PRs for doc improvements
- **Translation**: Help translate (coming soon)

## Response Times

### Community Support (Free)

- **GitHub Discussions**: Best effort, usually 1-5 days
- **GitHub Issues**: Triaged within 7 days

### Professional Support (Paid)

- **Consulting**: 24-48 hours
- **Enterprise**: Per SLA (typically 4-24 hours)

## Useful Commands

### Check Version

```bash
python -c "from config import APP_VERSION; print(APP_VERSION)"
```

### Health Check

```bash
curl http://localhost:8000/api/health
```

### View Logs

```bash
# Application logs
tail -f logs/app.log

# Service logs (systemd)
sudo journalctl -u iodd-manager -f
```

### Debug Configuration

```bash
python -c "from config import print_config; print_config()"
```

### Run Tests

```bash
pytest -v
```

## Getting Logs

When reporting issues, include relevant logs:

```bash
# API logs
tail -n 100 logs/app.log > iodd-manager-logs.txt

# System logs (if using systemd)
sudo journalctl -u iodd-manager -n 100 > system-logs.txt

# Docker logs
docker logs iodd-manager > docker-logs.txt 2>&1
```

## System Information

Include when reporting issues:

```bash
# Operating system
cat /etc/os-release

# Python version
python --version

# Node.js version
node --version

# Installed packages
pip list

# Environment
python -c "import sys; print(sys.version)"
```

## Community Resources

- **Repository**: [github.com/ME-Catalyst/iodd-manager](https://github.com/ME-Catalyst/iodd-manager)
- **Discussions**: [GitHub Discussions](https://github.com/ME-Catalyst/iodd-manager/discussions)
- **Issues**: [GitHub Issues](https://github.com/ME-Catalyst/iodd-manager/issues)
- **Twitter**: [@iodd_manager](https://twitter.com/iodd_manager) (coming soon)
- **Discord**: [Join server](https://discord.gg/iodd-manager) (coming soon)

## Feedback

Help us improve IODD Manager:

- **Feature Requests**: [Start a discussion](https://github.com/ME-Catalyst/iodd-manager/discussions/new?category=ideas)
- **Bug Reports**: [Create an issue](https://github.com/ME-Catalyst/iodd-manager/issues/new)
- **General Feedback**: Email feedback@iodd-manager.example.com

## Credits

IODD Manager is maintained by:

- **Project Lead**: ME-Catalyst
- **Contributors**: See [Contributors](https://github.com/ME-Catalyst/iodd-manager/graphs/contributors)

Special thanks to all contributors and the open-source community.

## Stay Updated

- **Watch**: Star/watch [GitHub repository](https://github.com/ME-Catalyst/iodd-manager)
- **Newsletter**: Subscribe at iodd-manager.example.com (coming soon)
- **RSS**: Follow [releases feed](https://github.com/ME-Catalyst/iodd-manager/releases.atom)

## Legal

- **License**: [MIT License](license.md)
- **Privacy**: We don't collect any user data
- **Terms**: Use at your own risk, see [License](license.md)

## Next Steps

- **[Documentation Home](../index.md)** - Browse all documentation
- **[Quick Start](../getting-started/quick-start.md)** - Get started quickly
- **[Contributing](contributing.md)** - Contribute to the project
- **[Changelog](changelog.md)** - See what's new
