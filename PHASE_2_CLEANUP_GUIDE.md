# GreenStack Import Cleanup Guide

## Quick Start

This guide provides everything you need to clean up unused imports in the GreenStack codebase.

## Files Generated

1. **`/tmp/import_report.md`** - Comprehensive analysis report (full details)
2. **`/tmp/import_analysis.json`** - Raw analysis data (machine-readable)
3. **`/tmp/import_summary.json`** - Executive summary (JSON format)
4. **`/tmp/cleanup_script.py`** - Automated cleanup script
5. **`/tmp/analyze_imports.py`** - Analysis tool (reusable)

## Quick Statistics

- **Total Python files:** 63
- **Files with issues:** 29 (46.0%)
- **Total imports:** 455
- **Unused imports:** 61 (13.4%)
- **Safe to remove:** 47 imports
- **Duplicate/local imports:** 43 imports
- **Wildcard imports:** 0 ✅
- **Circular imports:** 0 ✅

## Step-by-Step Cleanup Process

### Step 1: Review the Analysis (5 minutes)

Read the comprehensive report:
```bash
cat /tmp/import_report.md
```

Or view the summary:
```bash
cat /tmp/import_summary.json | python3 -m json.tool
```

### Step 2: Dry Run (2 minutes)

Test the cleanup script without making changes:
```bash
python3 /tmp/cleanup_script.py --dry-run
```

### Step 3: Backup (Optional but Recommended)

Create a backup or ensure your work is committed:
```bash
cd /home/user/GreenStack
git status
git add .
git commit -m "Pre-cleanup checkpoint"
```

### Step 4: Run Automated Cleanup (1 minute)

Execute the cleanup script:
```bash
python3 /tmp/cleanup_script.py
```

This will automatically remove **47 safe-to-remove unused imports** from **25 files**.

### Step 5: Verify Changes (5 minutes)

1. Check syntax of modified files:
```bash
python3 -m py_compile /home/user/GreenStack/src/api.py
python3 -m py_compile /home/user/GreenStack/src/greenstack.py
# ... (or all modified files)
```

2. Review the changes:
```bash
git diff
```

3. Run tests:
```bash
cd /home/user/GreenStack
pytest tests/ -v
```

### Step 6: Manual Cleanup - Duplicate Imports (30-60 minutes)

The automated script doesn't handle duplicate/local imports. You'll need to manually fix these files:

#### High Priority: `/home/user/GreenStack/src/api.py`
- **Issue:** 38 duplicate local imports (sqlite3, json, io, etc.)
- **Fix:** Move all imports to the top of the file
- **Lines affected:** 540, 608, 642, 720, 826, 864, 865, 903, 998, 1065, 1136, 1177, 1218, 1266, 1316, 1349, 1423, 1459, 1497, 1537, 1586, 1587, 1646, 1690, 1725, 1765, 1806, 1843, 1897, 2029, 2054, 2087, 2088, 2089, 2136, 2172, 2173, 2203

**Example fix for api.py:**

Before (top of file):
```python
import json
import logging
import shutil
# ... other imports
```

Before (inside a function at line 608):
```python
def get_device_details(device_id: int):
    import sqlite3  # ❌ Local import
    conn = sqlite3.connect(...)
```

After (top of file):
```python
import json
import logging
import shutil
import sqlite3  # ✅ Moved to top
# ... other imports
```

After (inside function):
```python
def get_device_details(device_id: int):
    # sqlite3 import removed
    conn = sqlite3.connect(...)
```

#### Medium Priority: `/home/user/GreenStack/src/greenstack.py`
- **Issue:** 3 duplicate local imports of `json`
- **Lines affected:** 2190, 2366, 2387
- **Fix:** Remove local imports, use top-level import

#### Low Priority: Route files
- `/home/user/GreenStack/src/routes/eds_routes.py` - 1 duplicate
- `/home/user/GreenStack/src/routes/service_routes.py` - 1 duplicate

### Step 7: Review __init__.py Files (15 minutes)

Three `__init__.py` files have imports that may or may not be needed:

1. `/home/user/GreenStack/src/parsers/__init__.py`
2. `/home/user/GreenStack/src/routes/__init__.py`
3. `/home/user/GreenStack/src/utils/__init__.py`

**These are marked as unsafe to remove automatically** because they have `__all__` definitions and may be used for re-exporting.

**How to verify:**
1. Check if the imports are listed in `__all__`
2. Check if other modules import from the `__init__.py` (e.g., `from src.parsers import EDSParser`)
3. If yes, keep the imports
4. If no, they can be removed

### Step 8: Final Verification (10 minutes)

1. Run full test suite:
```bash
pytest tests/ -v --tb=short
```

2. Start the application:
```bash
cd /home/user/GreenStack
python3 -m src.start
```

3. Verify no import errors:
```bash
python3 -c "from src import api; from src import greenstack; print('✓ Imports working')"
```

### Step 9: Commit Changes

```bash
git add .
git commit -m "refactor: Remove unused imports and fix duplicate imports

- Remove 47 unused imports across 25 files
- Move duplicate local imports to top of file in api.py and greenstack.py
- Improve code clarity and maintainability
- No functional changes"
```

## Preventing Future Issues

### Option 1: Pre-commit Hooks

Install autoflake to automatically remove unused imports:

```bash
pip install autoflake pre-commit

# Create .pre-commit-config.yaml:
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/PyCQA/autoflake
    rev: v2.2.1
    hooks:
      - id: autoflake
        args: ['--remove-all-unused-imports', '--in-place', '--remove-unused-variables']
  - repo: https://github.com/PyCQA/isort
    rev: 5.12.0
    hooks:
      - id: isort
        args: ['--profile', 'black']
EOF

# Install the hooks:
pre-commit install
```

### Option 2: CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          pip install flake8 autoflake
      - name: Check for unused imports
        run: |
          autoflake --check --recursive src/ tests/
          flake8 --select=F401 src/ tests/
```

### Option 3: IDE Configuration

**VS Code settings.json:**
```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.linting.flake8Enabled": true,
  "python.linting.flake8Args": ["--select=F401"],
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

**PyCharm:**
- Settings → Editor → Inspections → Python → Unused Import → Check enabled
- Settings → Tools → Actions on Save → Optimize imports → Check enabled

## Estimated Timeline

| Phase | Time | Risk |
|-------|------|------|
| Review analysis | 5 min | None |
| Run automated cleanup | 1 min | Very low |
| Verify changes | 5 min | Low |
| Manual duplicate import fixes | 60 min | Low |
| Review __init__.py files | 15 min | Medium |
| Testing and verification | 10 min | Low |
| **Total** | **~90 min** | **Low** |

## Files Requiring Manual Attention

### High Priority (Code Smell - Duplicate Imports)
1. `/home/user/GreenStack/src/api.py` - 38 duplicate imports
2. `/home/user/GreenStack/src/greenstack.py` - 3 duplicate imports

### Medium Priority (Review Needed)
1. `/home/user/GreenStack/src/parsers/__init__.py` - 5 re-export imports
2. `/home/user/GreenStack/src/routes/__init__.py` - 8 re-export imports
3. `/home/user/GreenStack/src/utils/__init__.py` - 1 re-export import

### Low Priority
1. `/home/user/GreenStack/src/routes/eds_routes.py` - 1 duplicate import
2. `/home/user/GreenStack/src/routes/service_routes.py` - 1 duplicate import

## Troubleshooting

### Issue: Tests fail after cleanup

**Solution:**
1. Check the test output for import errors
2. Verify you didn't remove an import that's used in a dynamic way (e.g., `getattr()`, `eval()`, etc.)
3. Restore the import if needed

### Issue: Application won't start

**Solution:**
1. Check for syntax errors: `python3 -m py_compile <file>`
2. Verify all imports are available: `python3 -c "import sys; sys.path.insert(0, 'src'); import api"`
3. Check the error message for the specific missing import

### Issue: Circular import errors

**Solution:**
This analysis found no circular imports, but if you encounter them:
1. Move the import inside the function that uses it
2. Use `TYPE_CHECKING` for type hints only
3. Restructure the code to break the circular dependency

## Success Metrics

After cleanup, you should see:
- ✅ 47 fewer unused imports
- ✅ Better code organization (no local imports)
- ✅ Faster IDE performance
- ✅ Easier code review
- ✅ All tests passing
- ✅ Application starts without errors

## Contact & Support

For questions or issues with the cleanup:
1. Review the full report: `/tmp/import_report.md`
2. Check the raw analysis: `/tmp/import_analysis.json`
3. Re-run the analysis tool: `python3 /tmp/analyze_imports.py /home/user/GreenStack/src`

---

**Good luck with the cleanup! 🚀**
