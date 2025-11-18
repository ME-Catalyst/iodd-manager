# Documentation Fix Checklist

Quick reference for fixing documentation issues identified in Phase 3 review.

---

## 🔴 CRITICAL FIXES (Do First - 4 hours)

### 1. Fix MQTT Documentation
**File:** `/home/user/GreenStack/frontend/src/content/docs/user-guide/Features.jsx`
**Line:** ~411

**Change:**
```diff
- Current Limitations section:
- - MQTT broker integration (not yet implemented)
+ Feature List:
+ - ✅ MQTT broker integration with 10 REST endpoints + WebSocket streaming
```

**Additional locations to update:**
- Add MQTT to feature highlights
- Update API Overview with MQTT endpoints (10 total)

---

### 2. Standardize API Endpoint Counts
**Files to update:**
- `frontend/src/content/docs/api/Overview.jsx`
- `frontend/src/content/docs/api/Endpoints.jsx`
- `frontend/src/content/docs/developer/Overview.jsx`

**Actual counts (verified from codebase):**
```yaml
Total Endpoints: 129 (not 142)

By Category:
  - Main API (api.py): 42 endpoints
  - EDS Routes: 17 endpoints
  - Admin Routes: 15 endpoints
  - Tickets: 12 endpoints
  - PQA Routes: 12 endpoints (NEW - not documented)
  - MQTT: 10 endpoints
  - Theme: 7 endpoints
  - Services: 7 endpoints
  - Config Export: 5 endpoints
  - Search: 2 endpoints
```

**Action:** Update all endpoint count references to use these verified numbers

---

### 3. Fix Rate Limiting Documentation
**Files to update:**
- `api/Overview.jsx:405`
- `api/Endpoints.jsx:285-290`
- `api/Authentication.jsx`

**Standardize to:**
```markdown
## Rate Limiting

Greenstack does not include built-in rate limiting by default. For production
deployments, implement rate limiting at the reverse proxy level (Nginx, Traefik).

**Recommended Limits:**
- Upload endpoints: 10 requests/minute
- General endpoints: 100-1000 requests/minute (adjust based on capacity)
```

**Remove:**
- All claims of "100 requests per minute" built-in limits
- Conflicting rate limit headers examples

---

### 4. Standardize Version Requirements
**Files to update:**
- `frontend/src/content/docs/user-guide/Troubleshooting.jsx`

**Change at line ~99:**
```diff
- Python 3.8+ required
+ Python 3.10+ required
```

**Change at line ~189:**
```diff
- Node.js 16+ required
+ Node.js 18+ required
```

**Verify these files already say Python 3.10+ and Node.js 18+ (correct):**
- ✅ QuickStart.jsx
- ✅ Installation.jsx
- ✅ WindowsInstallation.jsx

---

## 🟡 HIGH PRIORITY (Next 4 hours)

### 5. Fix Health Endpoint URL
**Files to update:**
- `Installation.jsx:249`
- `WebInterface.jsx:632`
- Any other references to health check

**Change:**
```diff
- http://localhost:8000/health
+ http://localhost:8000/api/health
```

---

### 6. Fix API Endpoint URLs
**File:** `DeviceManagement.jsx:144`

**Change:**
```diff
- /api/iodds/upload
+ /api/iodd/upload
```

**Action:** Search all docs for `/api/iodds/` (plural) and verify against actual routes

---

### 7. Complete Git Clone Command
**File:** `QuickStart.jsx:156`

**Change:**
```diff
- git clone ...
+ git clone https://github.com/ME-Catalyst/greenstack.git
+ cd greenstack
```

---

### 8. Fix Internal Links
**Files with broken links:**
- `WebInterface.jsx:782`
- Various component documentation pages

**Pattern to fix:**
```diff
- href="/components/theme-system"
+ href="/docs/components/theme-system"
```

**Action:** Search for `href="/components/` and add `/docs/` prefix
**Action:** Search for `href="/api/` and verify they have `/docs/` prefix where needed

---

### 9. Verify Docker Image Reference
**Files to check:**
- `QuickStart.jsx`
- `DockerSetup.jsx:125`
- `DockerDeployment.jsx`

**Action:**
1. Check if `ghcr.io/me-catalyst/greenstack:latest` exists
2. If not, either:
   - Publish image to GHCR, OR
   - Update to correct registry, OR
   - Change to local build instructions

---

### 10. Fix docker-compose Reference
**File:** `DockerSetup.jsx:158`

**Action:**
- Verify `docker-compose.iot.yml` exists in repository
- If not, remove reference or create the file

---

## 🟢 MEDIUM PRIORITY (4-6 hours)

### 11. Fix Environment Variable Name
**File:** `DockerSetup.jsx:286`

**Change:**
```diff
- DATABASE_URL=postgresql://...
+ IODD_DATABASE_URL=postgresql://...
```

---

### 12. Update CORS Configuration Example
**File:** `DockerSetup.jsx:224`

**Verify matches:** `src/config.py:70`

Should be:
```bash
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

---

### 13. Add PQA API Documentation
**Files to update:**
- `api/Overview.jsx`
- `api/Endpoints.jsx`

**Add new category:**
```markdown
## Parser Quality Assurance (PQA)
**Endpoint:** `/api/pqa`
**Count:** 12 endpoints

Advanced parser diagnostics and quality assurance tools for EDS/IODD parsing.
```

---

### 14. Clarify Port Usage
**Files to update:**
- All getting started guides

**Add clear explanation:**
```markdown
## Port Configuration

Greenstack uses different ports depending on how you start it:

- **Backend API:** Always port 8000
- **Frontend (via start.py):** Port 3000 (default)
- **Frontend (Vite dev):** Port 5173 (when running `npm run dev`)

Use port 3000 when running `python start.py` (recommended).
Use port 5173 when developing frontend separately with `npm run dev`.
```

---

### 15. Fix Backend Start Command
**File:** `Installation.jsx:233`

**Change:**
```diff
- python -m src.api
+ python start.py
```

OR keep if intentional:
```bash
# From project root:
python start.py

# OR directly:
cd src && python api.py
```

---

## 🔵 LOW PRIORITY / ENHANCEMENTS (8+ hours)

### 16. Add Missing Information
- [ ] Export format verification (JSON, XML, CSV support)
- [ ] Database table count verification
- [ ] Component count verification (claims 35+)
- [ ] Add screenshots to user guides
- [ ] Add video tutorials
- [ ] Create architecture diagrams

### 17. Verify All Component Pages Exist
Check these pages referenced in Overview.jsx:
- [ ] `/docs/components/button`
- [ ] `/docs/components/card`
- [ ] `/docs/components/dialog`
- [ ] `/docs/components/theme-manager`

### 18. Add Node.js Engine Requirement
**File:** `frontend/package.json`

**Add:**
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

---

## 🔧 AUTOMATION TASKS

### Set Up Link Checker
```bash
npm install -g broken-link-checker
blc http://localhost:5173/docs -ro --exclude "localhost:8000"
```

### Set Up Pre-commit Hook
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Check for common doc issues
grep -r "api/iodds" frontend/src/content/docs/ && echo "❌ Found plural /api/iodds/ - should be singular" && exit 1
grep -r "/health\"" frontend/src/content/docs/ | grep -v "/api/health" && echo "❌ Found /health without /api/ prefix" && exit 1
echo "✅ Documentation checks passed"
```

### Generate Endpoint List
Add to CI/CD:
```python
# scripts/generate_endpoint_list.py
from fastapi.routing import APIRoute
from src.api import app

for route in app.routes:
    if isinstance(route, APIRoute):
        print(f"{route.methods} {route.path}")
```

---

## VERIFICATION COMMANDS

After making changes, run these tests:

```bash
# 1. Check for broken links (start dev server first)
npm run dev &
sleep 10
blc http://localhost:5173/docs -ro

# 2. Check for common mistakes
cd frontend/src/content/docs
grep -r "/api/iodds/" .  # Should return nothing (use singular)
grep -r "http://localhost:8000/health\"" . | grep -v "/api/health"  # Should return nothing
grep -r "Python 3.8" .  # Should return nothing (use 3.10+)
grep -r "Node.js 16" .  # Should return nothing (use 18+)

# 3. Verify endpoint counts match
python scripts/count_endpoints.py

# 4. Test installation instructions
# (Run in clean Docker container or VM)
```

---

## SIGN-OFF CHECKLIST

Before marking documentation as complete:

- [ ] All CRITICAL fixes completed
- [ ] All HIGH priority fixes completed
- [ ] Link checker passes 100%
- [ ] Code examples tested on clean install
- [ ] Version requirements verified
- [ ] API endpoint counts match reality
- [ ] Internal links work
- [ ] No conflicting information
- [ ] Git clone command works
- [ ] Docker commands work
- [ ] Health check endpoints correct

---

**Last Updated:** November 18, 2025
**Review By:** Documentation Team
**Estimated Total Time:** 16-20 hours for all fixes
