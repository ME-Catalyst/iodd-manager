# Contributing to Greenstack

Thank you for your interest in contributing to Greenstack! This guide will help you set up your development environment and understand our code quality standards.

## Development Setup

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/greenstack.git
cd greenstack

# Install dependencies
make install

# Install pre-commit hooks (recommended)
make pre-commit
```

## Code Quality Tools

We use several tools to maintain code quality:

### Python Tools

- **Black**: Automatic code formatter
- **Ruff**: Fast Python linter (replaces flake8)
- **Pylint**: Additional code quality checks
- **MyPy**: Static type checker
- **Bandit**: Security vulnerability scanner
- **Pytest**: Testing framework

### Frontend Tools

- **Prettier**: Code formatter for JavaScript/JSX
- **ESLint**: JavaScript linter with React support

## Using the Tools

### Quick Commands

```bash
# Format all code (Python + Frontend)
make format

# Run all linters
make lint

# Run type checking
make type-check

# Run security checks
make security

# Run everything at once
make check

# Run tests
make test

# Run tests with coverage
make test-cov
```

### Individual Tool Usage

#### Python Formatting with Black

```bash
# Format all Python files
black greenstack.py api.py start.py

# Check without modifying
black --check greenstack.py api.py start.py

# Format a specific file
black api.py
```

#### Python Linting with Ruff

```bash
# Lint with auto-fix
ruff check --fix greenstack.py api.py start.py

# Lint without fixing
ruff check greenstack.py api.py start.py
```

#### Python Type Checking with MyPy

```bash
# Type check all files
mypy greenstack.py api.py start.py

# Type check a specific file
mypy api.py
```

#### Security Scanning with Bandit

```bash
# Scan for security issues
bandit -c pyproject.toml -r .

# Scan with low severity threshold
bandit -c pyproject.toml -ll -r .
```

#### Frontend Formatting with Prettier

```bash
cd frontend

# Format all files
npx prettier --write "**/*.{js,jsx,json,css,md}"

# Check without modifying
npx prettier --check "**/*.{js,jsx,json,css,md}"
```

#### Frontend Linting with ESLint

```bash
cd frontend

# Lint with auto-fix
npx eslint --fix "**/*.{js,jsx}"

# Lint without fixing
npx eslint "**/*.{js,jsx}"
```

## Pre-commit Hooks

We use pre-commit hooks to automatically check code quality before each commit.

### Installing Hooks

```bash
# Install pre-commit package
pip install pre-commit

# Install the git hooks
pre-commit install
```

### Using Pre-commit

```bash
# Manually run all hooks on all files
pre-commit run --all-files

# Run on staged files only
pre-commit run

# Skip hooks for a specific commit (not recommended)
git commit --no-verify -m "message"
```

### What Gets Checked

- **File checks**: Trailing whitespace, file endings, merge conflicts
- **Python**: Black formatting, Ruff linting, MyPy type checking, Bandit security
- **Frontend**: Prettier formatting, ESLint linting
- **Security**: Private key detection, large file detection

## Code Style Guidelines

### Python

- **Line length**: 100 characters (Black default)
- **Naming**:
  - Variables/functions: `snake_case`
  - Classes: `PascalCase`
  - Constants: `UPPER_CASE`
- **Type hints**: Required for function signatures
- **Docstrings**: Required for public functions and classes
- **Imports**: Sorted with isort (handled by Ruff)

Example:

```python
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class DeviceInfo:
    """Information about an IODD device."""

    device_id: int
    product_name: str
    manufacturer: str
    parameters: Optional[List[str]] = None

def get_device(device_id: int) -> Optional[DeviceInfo]:
    """
    Retrieve device information by ID.

    Args:
        device_id: The unique device identifier

    Returns:
        DeviceInfo object if found, None otherwise
    """
    # Implementation here
    pass
```

### JavaScript/JSX

- **Line length**: 100 characters
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing commas**: ES5 style (only for multiline)
- **Arrow functions**: Preferred over function expressions
- **React**: Functional components with hooks

Example:

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeviceList = ({ onDeviceSelect }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('/api/iodd');
        setDevices(response.data);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return (
    <div>
      {loading ? <Spinner /> : <DeviceTable devices={devices} />}
    </div>
  );
};

export default DeviceList;
```

## Testing

### Writing Tests

- Place tests in the `tests/` directory
- Name test files: `test_*.py`
- Name test functions: `test_*`
- Use pytest fixtures for setup/teardown
- Aim for >70% code coverage

Example:

```python
# tests/test_parser.py
import pytest
from greenstack import IODDParser

def test_parse_valid_iodd():
    """Test parsing of valid IODD XML."""
    with open('tests/fixtures/sample.xml') as f:
        xml_content = f.read()

    parser = IODDParser(xml_content)
    profile = parser.parse()

    assert profile.device_info.product_name
    assert profile.vendor_info.id > 0

def test_parse_invalid_xml():
    """Test handling of malformed XML."""
    with pytest.raises(ValueError):
        parser = IODDParser('<invalid>')
        parser.parse()
```

### Running Tests

```bash
# Run all tests
make test

# Run with coverage
make test-cov

# Run specific test file
pytest tests/test_parser.py -v

# Run specific test
pytest tests/test_parser.py::test_parse_valid_iodd -v
```

## Pull Request Process

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make your changes**: Follow code style guidelines
3. **Run quality checks**: `make check`
4. **Run tests**: `make test`
5. **Commit your changes**: Pre-commit hooks will run automatically
6. **Push to your fork**: `git push origin feature/your-feature`
7. **Create a pull request**: Describe your changes clearly

### PR Checklist

- [ ] Code follows style guidelines (passes `make format` and `make lint`)
- [ ] Type hints added for new functions
- [ ] Tests added for new features
- [ ] All tests pass (`make test`)
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities (`make security`)
- [ ] Commit messages are clear and descriptive

## Configuration Files

### `pyproject.toml`
Central configuration for Python tools (Black, MyPy, Pytest, Coverage, Ruff, Bandit)

### `.pylintrc`
Additional Pylint-specific configuration

### `frontend/.eslintrc.cjs`
ESLint configuration for JavaScript/React

### `frontend/.prettierrc`
Prettier configuration for frontend formatting

### `.pre-commit-config.yaml`
Pre-commit hook definitions

### `Makefile`
Convenient commands for development tasks

## Getting Help

- **Issues**: Report bugs or request features via GitHub Issues
- **Questions**: Use GitHub Discussions for questions
- **Code Review**: Maintainers will review your PR and provide feedback

## License

By contributing to Greenstack, you agree that your contributions will be licensed under the MIT License.
