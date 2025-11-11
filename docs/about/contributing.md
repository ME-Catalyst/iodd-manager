# Contributing to IODD Manager

Thank you for your interest in contributing to IODD Manager!

## Quick Links

- **Detailed Contributing Guide**: See **[Developer Guide - Contributing](../developer-guide/contributing.md)** for comprehensive contribution guidelines
- **Repository**: [github.com/ME-Catalyst/iodd-manager](https://github.com/ME-Catalyst/iodd-manager)
- **Issues**: [Report bugs or request features](https://github.com/ME-Catalyst/iodd-manager/issues)
- **Discussions**: [Ask questions](https://github.com/ME-Catalyst/iodd-manager/discussions)

## Ways to Contribute

### 1. Report Bugs

Found a bug? [Create an issue](https://github.com/ME-Catalyst/iodd-manager/issues/new) with:

- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, Python version, etc.)
- Logs or screenshots if applicable

### 2. Request Features

Have an idea? [Start a discussion](https://github.com/ME-Catalyst/iodd-manager/discussions/new) or create a feature request with:

- Use case description
- Proposed solution
- Alternative approaches considered

### 3. Improve Documentation

Documentation improvements are always welcome:

- Fix typos or clarify instructions
- Add examples
- Write tutorials
- Improve code comments

### 4. Submit Code

See the [detailed guide](../developer-guide/contributing.md) for the complete development workflow.

**Quick start:**

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/iodd-manager.git
cd iodd-manager

# 2. Create branch
git checkout -b feature/your-feature-name

# 3. Set up development environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pre-commit install

# 4. Make changes and test
pytest
make lint

# 5. Commit and push
git commit -m "Add feature: description"
git push origin feature/your-feature-name

# 6. Create pull request
```

## Development Guidelines

### Code Style

- **Python**: Follow PEP 8, use Black formatter, type hints required
- **JavaScript**: Use Prettier, ESLint rules enforced
- **Commits**: Clear, descriptive messages following conventional commits

### Testing

- All new features must include tests
- Maintain or improve code coverage (target: 80%+)
- Run tests before submitting: `pytest`

### Documentation

- Update relevant documentation
- Add docstrings to new functions/classes
- Include examples where helpful

## Pull Request Process

1. **Create PR**: Submit pull request from your branch
2. **CI Checks**: Ensure all CI checks pass
3. **Code Review**: Address reviewer feedback
4. **Approval**: Wait for maintainer approval
5. **Merge**: PR will be merged by maintainer

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Provide constructive feedback
- Accept feedback gracefully
- Focus on what's best for the project

### Reporting Issues

Report unacceptable behavior to:

- **Email**: conduct@iodd-manager.example.com
- **GitHub**: Contact repository maintainers

## Recognition

Contributors are:

- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in CHANGELOG.md

## Development Resources

### Documentation

- **[Developer Setup](../developer-guide/setup.md)** - Set up environment
- **[Architecture](../developer-guide/architecture.md)** - Understand codebase
- **[Testing Guide](../developer-guide/testing.md)** - Write tests
- **[Code Quality](../developer-guide/code-quality.md)** - Quality standards

### Getting Help

- **GitHub Discussions**: Ask questions
- **GitHub Issues**: Report specific problems
- **Developer Chat**: Join community (coming soon)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

See [License](license.md) for details.

## First-Time Contributors

New to open source? Welcome! Here are some good first issues:

- Documentation improvements
- Adding tests
- Fixing typos
- Improving error messages

Look for issues labeled `good-first-issue` in the [issue tracker](https://github.com/ME-Catalyst/iodd-manager/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## Questions?

- **General Questions**: [GitHub Discussions](https://github.com/ME-Catalyst/iodd-manager/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/ME-Catalyst/iodd-manager/issues)
- **Security Issues**: Email security@iodd-manager.example.com
- **Other**: Contact maintainers via GitHub

## Thank You!

Your contributions make IODD Manager better for everyone. Thank you for taking the time to contribute! 🚀

## Next Steps

- **[Developer Guide - Contributing](../developer-guide/contributing.md)** - Complete contribution guide
- **[Developer Setup](../developer-guide/setup.md)** - Set up development environment
- **[Changelog](changelog.md)** - See recent changes
- **[Support](support.md)** - Get help
