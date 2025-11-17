# Contributing to Greenstack

Thank you for your interest in contributing to Greenstack! This guide will help you get started.

## Quick Links

- **Repository**: [https://github.com/ME-Catalyst/greenstack](https://github.com/ME-Catalyst/greenstack)
- **Issues**: [Report bugs or request features](https://github.com/ME-Catalyst/greenstack/issues)

## Ways to Contribute

### 1. Report Bugs

Found a bug? Please create an issue with:

- **Clear title**: "Bug: Unable to parse IODD files with..."
- **Description**: What happened vs. what you expected
- **Steps to reproduce**: Numbered list of steps
- **Environment**: OS, Python version, browser
- **Logs/Screenshots**: Error messages or screenshots

**Example:**

```markdown
**Bug**: Upload fails for files with non-ASCII characters

**Environment**:
- OS: Ubuntu 22.04
- Python: 3.10.8
- Browser: Chrome 120

**Steps to Reproduce**:
1. Navigate to upload page
2. Select IODD file with filename "Gerät.xml"
3. Click upload
4. Error appears: "Invalid filename"

**Expected**: File should upload successfully
**Actual**: Upload fails with error

**Logs**:
```
UnicodeDecodeError: 'ascii' codec can't decode byte...
```
```

### 2. Request Features

Have an idea? Create a feature request:

- **Clear title**: "Feature: Add PostgreSQL support"
- **Use case**: Why is this needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other approaches considered

### 3. Improve Documentation

Documentation improvements are always welcome:

- Fix typos or clarify instructions
- Add examples
- Improve code comments
- Write tutorials
- Translate documentation

### 4. Submit Code

See the [Development Workflow](#development-workflow) section below.

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/greenstack.git
cd greenstack

# Add upstream remote
git remote add upstream https://github.com/ME-Catalyst/greenstack.git
```

### 2. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 3. Set Up Development Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Set up configuration
cp .env.example .env
# Edit .env as needed

# Initialize database
alembic upgrade head

# Run tests to verify setup
pytest
```

### 4. Make Changes

- Write clean, readable code
- Follow the [Code Style Guide](#code-style-guide)
- Add tests for new functionality
- Update documentation as needed
- Commit frequently with clear messages

### 5. Test Your Changes

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run linters
make lint

# Run formatters
make format

# Run all checks
make check
```

### 6. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add feature: PostgreSQL support

- Implement PostgreSQL database adapter
- Add connection pooling
- Update configuration options
- Add tests for PostgreSQL operations

Closes #123"
```

**Commit Message Format:**

```
<type>: <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

**Example:**

```
feat: Add PostgreSQL database support

Implement PostgreSQL as an alternative to SQLite:
- Add SQLAlchemy PostgreSQL engine
- Update connection string handling
- Add environment variable: POSTGRES_URL
- Maintain backward compatibility with SQLite

This enables deployment in production environments
that require PostgreSQL for scalability.

Closes #123
Refs #45
```

### 7. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then create a pull request on GitHub:

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit the PR

**Pull Request Template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated documentation
- [ ] Followed code style guidelines
- [ ] No new warnings introduced
- [ ] Commit messages are clear

## Related Issues
Closes #123
Refs #45

## Screenshots (if applicable)
```

### 8. Code Review

- Respond to feedback promptly
- Make requested changes
- Push updates to the same branch
- Request re-review when ready

### 9. After Merge

```bash
# Switch to main
git checkout main

# Pull latest changes
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name

# Push updated main to your fork
git push origin main
```

## Code Style Guide

### Python Code Style

#### Follow PEP 8

```python
# Good
def calculate_temperature(raw_value: int, scale: float = 0.1) -> float:
    """
    Calculate temperature from raw value.

    Args:
        raw_value: Raw sensor value
        scale: Scale factor (default: 0.1)

    Returns:
        Temperature in degrees Celsius
    """
    return raw_value * scale

# Bad
def calc_temp(v, s=0.1):
    return v*s
```

#### Use Type Hints

```python
# Good
from typing import List, Dict, Optional

def get_devices(vendor_id: Optional[int] = None) -> List[Dict[str, Any]]:
    pass

# Bad
def get_devices(vendor_id=None):
    pass
```

#### Docstrings

Use Google-style docstrings:

```python
def import_iodd(file_path: str, validate: bool = True) -> bool:
    """
    Import IODD file into database.

    Args:
        file_path: Path to IODD XML file
        validate: Whether to validate before import (default: True)

    Returns:
        True if import successful, False otherwise

    Raises:
        FileNotFoundError: If file doesn't exist
        ValidationError: If IODD file is invalid

    Example:
        >>> manager = IODDManager()
        >>> success = manager.import_iodd("device.xml")
        >>> print(success)
        True
    """
    pass
```

#### Naming Conventions

```python
# Classes: PascalCase
class DeviceManager:
    pass

# Functions/Variables: snake_case
def get_device_info():
    device_name = "Sensor"

# Constants: UPPER_SNAKE_CASE
MAX_UPLOAD_SIZE = 10485760
DEFAULT_TIMEOUT = 30

# Private: Leading underscore
def _internal_helper():
    pass

_private_variable = 42
```

### JavaScript/React Code Style

#### Use Modern JavaScript

```javascript
// Good - Arrow functions, const/let
const calculateTemperature = (rawValue, scale = 0.1) => {
  return rawValue * scale;
};

// Bad - Old style
var calculateTemperature = function(rawValue, scale) {
  scale = scale || 0.1;
  return rawValue * scale;
}
```

#### React Functional Components

```javascript
// Good
import React, { useState, useEffect } from 'react';

export const DeviceList = ({ devices, onSelect }) => {
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // Effect logic
  }, [devices]);

  return (
    <div className="device-list">
      {devices.map(device => (
        <DeviceCard
          key={device.id}
          device={device}
          onClick={() => onSelect(device)}
        />
      ))}
    </div>
  );
};

// Bad - Class components for new code
class DeviceList extends React.Component {
  // ...
}
```

#### Component Naming

```javascript
// Components: PascalCase
const DeviceCard = () => { ... };

// Hooks: camelCase with 'use' prefix
const useDeviceData = () => { ... };

// Utilities: camelCase
const formatDate = (date) => { ... };

// Constants: UPPER_SNAKE_CASE
const MAX_DEVICES = 100;
```

## Testing Requirements

### All Code Must Have Tests

```python
# When adding a new function
def new_feature():
    pass

# Add corresponding test
def test_new_feature():
    result = new_feature()
    assert result is not None
```

### Test Coverage

- **New features**: 90%+ coverage
- **Bug fixes**: Add test that reproduces bug
- **Refactoring**: Maintain or improve coverage

### Test Types

```python
# Unit tests - Fast, isolated
@pytest.mark.unit
def test_parse_device_id():
    parser = IODDParser()
    device_id = parser.parse_device_id(xml_content)
    assert device_id == 67890

# Integration tests - Test interactions
@pytest.mark.integration
def test_api_upload_and_retrieve(test_client):
    # Upload file
    response = test_client.post("/api/iodd/upload", ...)
    # Retrieve device
    device = test_client.get("/api/devices/12345/67890")

# Mark slow tests
@pytest.mark.slow
def test_batch_import_large_dataset():
    # Long-running test
    pass
```

## Documentation Requirements

### Code Comments

```python
# Good - Explain WHY, not WHAT
def calculate_checksum(data: bytes) -> int:
    # Use CRC32 for backward compatibility with legacy devices
    return zlib.crc32(data)

# Bad - Obvious comments
def add(a, b):
    # Add a and b
    return a + b
```

### Update Documentation

When adding features, update:

- **README.md**: If it affects getting started
- **API docs**: For new endpoints
- **User guide**: For new user-facing features
- **Developer guide**: For architectural changes
- **CHANGELOG.md**: Always document changes

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass: `pytest`
- [ ] Linters pass: `make lint`
- [ ] Code formatted: `make format`
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts with main

### PR Description

Provide:

1. **What** changed
2. **Why** it changed
3. **How** to test it
4. **Screenshots** (for UI changes)
5. **Breaking changes** (if any)

### PR Size

- Keep PRs focused and small
- One feature/fix per PR
- Split large features into multiple PRs

### Review Process

- At least one approval required
- All CI checks must pass
- Address all review comments
- No unresolved conversations

## Communication

### Be Respectful

- Assume good intentions
- Provide constructive feedback
- Accept feedback gracefully
- Focus on code, not people

### Ask Questions

- No question is too simple
- Use GitHub Discussions for general questions
- Use issues for specific problems
- Tag maintainers if urgent

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in CHANGELOG.md

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- **GitHub Issues**: [Report issues](https://github.com/ME-Catalyst/greenstack/issues)

## Next Steps

- **[Setup Guide](setup.md)** - Set up development environment
- **[Architecture](architecture.md)** - Understand the codebase
- **[Testing Guide](testing.md)** - Write tests
- **[Code Quality](code-quality.md)** - Standards and best practices

Thank you for contributing to Greenstack! 🚀
