# Code Quality Standards

Maintaining high code quality through automated tools and best practices.

## Overview

IODD Manager uses multiple tools to ensure code quality:

- **Black**: Code formatting
- **Ruff**: Fast Python linting
- **Pylint**: Comprehensive linting
- **MyPy**: Static type checking
- **Bandit**: Security scanning
- **Pytest**: Testing framework
- **ESLint**: JavaScript linting
- **Prettier**: JavaScript/CSS formatting

## Quick Commands

```bash
# Format all code
make format

# Run all linters
make lint

# Type check
make type-check

# Run all checks
make check

# Fix auto-fixable issues
make fix
```

## Python Code Quality

### Black - Code Formatting

**Configuration** (`pyproject.toml`):

```toml
[tool.black]
line-length = 100
target-version = ['py310']
include = '\.pyi?$'
```

**Usage:**

```bash
# Format all files
black .

# Check without modifying
black --check .

# Format specific file
black api.py

# Show diff
black --diff api.py
```

**Pre-commit**: Automatically formats on commit.

### Ruff - Fast Linting

**Configuration** (`pyproject.toml`):

```toml
[tool.ruff]
line-length = 100
target-version = "py310"

select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "C",   # flake8-comprehensions
    "B",   # flake8-bugbear
    "UP",  # pyupgrade
]

ignore = [
    "E501",  # line too long (handled by black)
    "B008",  # do not perform function calls in argument defaults
]
```

**Usage:**

```bash
# Lint all files
ruff check .

# Auto-fix issues
ruff check --fix .

# Watch mode
ruff check --watch .

# Output format
ruff check --output-format=json .
```

**Common Issues:**

```python
# F401: Imported but unused
import os  # Remove if not used

# E402: Module level import not at top
# Fix: Move imports to top

# F841: Local variable assigned but never used
result = calculate()  # Use 'result' or prefix with '_'
_result = calculate()  # OK - indicates intentionally unused
```

### MyPy - Type Checking

**Configuration** (`pyproject.toml`):

```toml
[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
```

**Usage:**

```bash
# Type check all files
mypy .

# Check specific file
mypy api.py

# Strict mode
mypy --strict iodd_manager.py

# Show error codes
mypy --show-error-codes .
```

**Type Hints Best Practices:**

```python
from typing import List, Dict, Optional, Union, Any

# Function annotations
def get_device(
    vendor_id: int,
    device_id: int,
    include_params: bool = False
) -> Optional[Dict[str, Any]]:
    """Type hints for all parameters and return value"""
    pass

# Variable annotations
devices: List[Dict[str, Any]] = []
config: Dict[str, Union[str, int]] = {}
result: Optional[str] = None

# Class attributes
class Device:
    vendor_id: int
    device_id: int
    name: Optional[str] = None

    def __init__(self, vendor_id: int, device_id: int) -> None:
        self.vendor_id = vendor_id
        self.device_id = device_id
```

### Pylint - Comprehensive Linting

**Configuration** (`.pylintrc`):

Key settings:

- Max line length: 100
- Good variable names: Allow 1-2 char names in specific contexts
- Disabled checks: C0114 (missing module docstring in tests)

**Usage:**

```bash
# Lint all files
pylint *.py

# Lint with score
pylint --score=y api.py

# Generate report
pylint --output-format=text *.py > pylint_report.txt

# JSON format (for CI)
pylint --output-format=json api.py
```

**Common Issues and Fixes:**

```python
# C0116: Missing function docstring
# Fix: Add docstring
def calculate():
    """Calculate result."""
    pass

# R0913: Too many arguments (>5)
# Fix: Use dataclass or config object
from dataclasses import dataclass

@dataclass
class DeviceConfig:
    vendor_id: int
    device_id: int
    # ... more fields

def configure_device(config: DeviceConfig):
    pass

# W0613: Unused argument
# Fix: Prefix with underscore if required by interface
def callback(_unused_arg, data):
    process(data)
```

### Bandit - Security Scanning

**Configuration** (`pyproject.toml`):

```toml
[tool.bandit]
exclude_dirs = ["tests/", "venv/"]
tests = ["B201", "B301"]
skips = ["B101", "B601"]
```

**Usage:**

```bash
# Scan all files
bandit -r .

# Exclude tests
bandit -r . -x tests/

# Specific confidence level
bandit -r . -lll  # Only high confidence

# JSON output
bandit -r . -f json -o bandit_report.json
```

**Common Security Issues:**

```python
# B608: Possible SQL injection (use parameterized queries)
# Bad
cursor.execute(f"SELECT * FROM devices WHERE id = {device_id}")

# Good
cursor.execute("SELECT * FROM devices WHERE id = ?", (device_id,))

# B201: Flask app with debug=True
# Fix: Use environment variable
app.run(debug=config.DEBUG)  # False in production

# B303: Use of insecure MD5
# Fix: Use SHA256 or better
import hashlib
hashlib.sha256(data).hexdigest()
```

## Frontend Code Quality

### ESLint - JavaScript Linting

**Configuration** (`frontend/.eslintrc.cjs`):

```javascript
module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
  },
}
```

**Usage:**

```bash
cd frontend

# Lint all files
npm run lint

# Auto-fix
npm run lint -- --fix

# Check specific file
npx eslint src/App.jsx
```

**Common Issues:**

```javascript
// react-hooks/exhaustive-deps: Missing dependency
useEffect(() => {
  fetchData(deviceId);
}, []); // Add deviceId to dependency array
// Fix:
}, [deviceId]);

// no-unused-vars: Variable declared but never used
const unusedVar = 123; // Remove or use

// react/jsx-key: Missing key prop
{devices.map(device => <DeviceCard device={device} />)}
// Fix:
{devices.map(device => <DeviceCard key={device.id} device={device} />)}
```

### Prettier - Code Formatting

**Configuration** (`frontend/.prettierrc`):

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Usage:**

```bash
cd frontend

# Format all files
npm run format

# Check formatting
npm run format -- --check

# Format specific file
npx prettier --write src/App.jsx
```

## Pre-commit Hooks

Automated checks run on `git commit`.

**Configuration** (`.pre-commit-config.yaml`):

```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]

  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.6
    hooks:
      - id: bandit
        args: [-lll]

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|json|css|md)$
```

**Setup:**

```bash
pip install pre-commit
pre-commit install
```

**Usage:**

```bash
# Run on all files
pre-commit run --all-files

# Run specific hook
pre-commit run black --all-files

# Skip hooks (not recommended)
git commit --no-verify
```

## CI/CD Quality Checks

GitHub Actions runs all quality checks automatically.

**Workflow** (`.github/workflows/ci.yml` excerpt):

```yaml
python-quality:
  steps:
    - name: Black
      run: black --check .

    - name: Ruff
      run: ruff check .

    - name: Pylint
      run: pylint *.py

    - name: MyPy
      run: mypy .

    - name: Bandit
      run: bandit -r . -lll

frontend-quality:
  steps:
    - name: ESLint
      run: cd frontend && npm run lint

    - name: Prettier
      run: cd frontend && npm run format -- --check
```

## Code Review Checklist

### For Reviewers

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] New code has tests
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling appropriate
- [ ] Logging added where needed

### For Contributors

Before submitting PR:

- [ ] `make check` passes
- [ ] `pytest` passes with coverage > 80%
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow guidelines

## Best Practices

### Code Organization

```python
# Good structure
"""Module docstring."""

import standard_library
import third_party_library

import local_module

# Constants
MAX_SIZE = 1000

# Classes
class MyClass:
    """Class docstring."""
    pass

# Functions
def my_function():
    """Function docstring."""
    pass

# Main guard
if __name__ == "__main__":
    main()
```

### Error Handling

```python
# Good - Specific exceptions
try:
    device = get_device(vendor_id, device_id)
except DeviceNotFoundError as e:
    logger.error(f"Device not found: {e}")
    return None
except DatabaseError as e:
    logger.critical(f"Database error: {e}")
    raise

# Bad - Bare except
try:
    device = get_device(vendor_id, device_id)
except:
    pass
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# Good - Appropriate levels
logger.debug("Parsing device ID: %s", device_id)
logger.info("Device imported successfully: %s", device_name)
logger.warning("Parameter missing default value: %s", param_name)
logger.error("Failed to parse IODD: %s", error)
logger.critical("Database connection lost")

# Use lazy formatting
logger.info("Device %s imported", device_id)  # Not formatted unless logged

# Bad - String formatting
logger.info(f"Device {device_id} imported")  # Always formatted
```

### Performance

```python
# Good - List comprehension
squares = [x**2 for x in range(1000)]

# Bad - Inefficient loop
squares = []
for x in range(1000):
    squares.append(x**2)

# Good - Generator for large datasets
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield process_line(line)

# Good - Use appropriate data structures
device_lookup = {(d.vendor_id, d.device_id): d for d in devices}  # O(1) lookup
```

## Metrics and Goals

### Code Quality Metrics

- **Test Coverage**: > 80%
- **Pylint Score**: > 9.0/10
- **MyPy Coverage**: 100% (all files type-checked)
- **Security Issues**: 0 high/critical

### Continuous Monitoring

```bash
# Generate quality report
pylint --output-format=text *.py | tail -n 5
# Your code has been rated at 9.45/10

pytest --cov=. --cov-report=term
# TOTAL coverage: 87%

mypy .
# Success: no issues found in 15 source files

bandit -r . -lll
# No issues identified.
```

## Tools Integration

### VS Code

Install extensions:

- Python (Microsoft)
- Pylance
- Ruff
- ESLint
- Prettier

### PyCharm

Enable:

- Settings → Tools → Python Integrated Tools → pytest
- Settings → Editor → Inspections → Python
- Settings → Tools → External Tools → Add Black, Ruff

## Next Steps

- **[Setup Guide](setup.md)** - Configure development environment
- **[Architecture](architecture.md)** - Understand the codebase
- **[Testing](testing.md)** - Write quality tests
- **[Contributing](contributing.md)** - Contribution guidelines
