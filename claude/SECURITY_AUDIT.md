# Security Audit Report

**Date:** 2025-11-12
**Repository:** ME-Catalyst/iodd-manager
**Version:** 2.0.0
**Auditor:** Claude Code (Sonnet 4.5)

---

## Executive Summary

A comprehensive security audit was performed on the IODD Manager codebase using automated security tools:
- **pip-audit** for Python dependency vulnerabilities
- **Bandit** for Python code security issues
- **npm audit** for frontend dependency vulnerabilities

### Overall Risk Level: 🟡 **MEDIUM**

**Critical Findings:** 1
**High Severity:** 16
**Medium Severity:** 6
**Low Severity:** 10

---

## 1. Python Dependency Vulnerabilities

### 🔴 Critical: ECDSA Timing Attack (GHSA-wj6h-64fc-37mp)

**Package:** `ecdsa@0.19.1`
**Severity:** HIGH
**CWE:** Not specified
**Status:** No planned fix

**Description:**
python-ecdsa has been found to be subject to a Minerva timing attack on the P-256 curve. Using the `ecdsa.SigningKey.sign_digest()` API function and timing signatures an attacker can leak the internal nonce which may allow for private key discovery.

**Affected Operations:**
- ECDSA signatures
- Key generation
- ECDH operations

**Impact:**
- ECDSA signature verification is unaffected
- Side channel attacks are out of scope for the python-ecdsa project
- No fix is currently planned

**Recommendation:**
- **Short-term:** Accept the risk if ECDSA operations are not used in sensitive contexts
- **Long-term:** Consider migrating to `cryptography` library which has better side-channel attack protection
- **Immediate:** Audit usage of `python-jose` to verify if ECDSA signatures are actually used
- Note: This vulnerability comes from `python-jose[cryptography]>=3.3.0` dependency

**Used by:** `python-jose[cryptography]` (JWT authentication library)

---

## 2. Python Code Security Issues (Bandit)

**Scan Results:**
- Total lines scanned: 2,204
- Total issues: 16
- High severity: 1
- Medium severity: 5
- Low severity: 10

### 🔴 High Severity Issues

#### H1: Subprocess with shell=True (B602)

**Location:** `start.py:136`

```python
frontend_process = subprocess.Popen(
    f'cd "{self.frontend_dir}" && npm run dev',
    env=env,
    shell=True  # Security issue
)
```

**Risk:** Command injection vulnerability
**CWE:** CWE-78 (OS Command Injection)
**Likelihood:** Medium (if environment variables are user-controlled)

**Recommendation:**
```python
# Safer approach - use array form without shell
frontend_process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    cwd=self.frontend_dir,
    env=env
)
```

---

### 🟡 Medium Severity Issues

#### M1: Binding to All Interfaces (B104)

**Locations:**
- `config.py:31` - `API_HOST = os.getenv('API_HOST', '0.0.0.0')`
- `config.py:40` - `FRONTEND_HOST = os.getenv('FRONTEND_HOST', '0.0.0.0')`

**Risk:** Service accessible from all network interfaces
**CWE:** CWE-605 (Multiple Binds to Same Port)

**Recommendation:**
- Development: Keep `0.0.0.0` for convenience
- Production: Use `127.0.0.1` and put behind reverse proxy (nginx/Apache)
- Update `.env.example` to reflect this guidance

---

#### M2: XML ElementTree Vulnerabilities (B405, B314)

**Locations:**
- `iodd_manager.py:15` - Import statement
- `iodd_manager.py:133` - `ET.fromstring(xml_content)`

**Risk:** XML External Entity (XXE) attacks, XML bombs
**CWE:** CWE-20 (Improper Input Validation)

**Current Code:**
```python
import xml.etree.ElementTree as ET
self.root = ET.fromstring(xml_content)
```

**Recommendation:**
```python
from defusedxml import ElementTree as ET
# or
import defusedxml.ElementTree as ET
```

**Action Items:**
1. Add `defusedxml>=0.7.1` to requirements.txt
2. Replace all `xml.etree.ElementTree` imports
3. Test IODD parsing with defusedxml to ensure compatibility

---

#### M3: Missing Request Timeout (B113)

**Location:** `start.py:88`

```python
response = requests.get(f'http://localhost:{self.api_port}/api/health')
```

**Risk:** Potential denial of service, hanging connections
**CWE:** CWE-400 (Uncontrolled Resource Consumption)

**Recommendation:**
```python
response = requests.get(
    f'http://localhost:{self.api_port}/api/health',
    timeout=5  # 5 second timeout
)
```

---

#### M4: Permissive File Permissions (B103)

**Location:** `start.py:191`

```python
os.chmod(shortcut_path, 0o755)
```

**Risk:** Executable files writable by group
**CWE:** CWE-732 (Incorrect Permission Assignment)

**Recommendation:**
```python
os.chmod(shortcut_path, 0o750)  # Remove group write
```

---

### 🟢 Low Severity Issues

#### L1-L6: Subprocess Usage (B404, B603, B607)

**Locations:** Multiple in `start.py`

**Risk:** Subprocess module inherently risky
**Recommendation:** Already using `subprocess.run()` and `subprocess.Popen()` correctly in most cases. Consider adding input validation if paths come from user input.

---

#### L7-L8: Try/Except/Pass (B110)

**Locations:**
- `iodd_manager.py:630`
- `start.py:90`

**Risk:** Silent error suppression
**Recommendation:**
```python
except Exception as e:
    logger.warning(f"Failed to clean up: {e}")
```

---

## 3. Frontend Dependency Vulnerabilities

### 🔴 High Severity (15 vulnerabilities)

#### V1: d3-color ReDoS Vulnerability

**Package:** `d3-color <3.1.0`
**Severity:** HIGH
**Advisory:** GHSA-36jr-mh4h-2g58

**Affected Packages:**
- `@nivo/core@0.83.0` and all @nivo/* packages
- `@nivo/colors`, `@nivo/heatmap`, `@nivo/line`, `@nivo/radar`
- `d3-scale`, `d3-interpolate`, `d3-scale-chromatic`

**Impact:** Regular Expression Denial of Service (ReDoS)

**Fix Available:** Breaking change to `@nivo/*@0.99.0`

**Recommendation:**
```bash
# Test in development first
npm install @nivo/core@latest @nivo/heatmap@latest @nivo/line@latest @nivo/radar@latest
# Check for breaking changes in migration guide
```

**Risk Assessment:**
- Medium likelihood (requires malicious input to color parsing)
- High impact if exploited (DoS)
- Affects data visualization features

---

### 🟡 Moderate Severity (5 vulnerabilities)

#### V2: esbuild SSRF in Development Server

**Package:** `esbuild <=0.24.2`
**Severity:** MODERATE
**Advisory:** GHSA-67mh-4wv8-2f99

**Impact:** Development server can proxy requests to arbitrary destinations

**Fix Available:** Via `vite@7.2.2` (breaking change)

**Recommendation:**
- Development only - low risk
- Update Vite when ready to test breaking changes
- Do not expose development server to untrusted networks

---

#### V3: PrismJS DOM Clobbering

**Package:** `prismjs <1.30.0`
**Severity:** MODERATE
**Advisory:** GHSA-x7hr-w5r2-h6wg

**Affected:** `react-syntax-highlighter@15.5.0`

**Fix Available:** Via `react-syntax-highlighter@16.1.0` (breaking change)

**Recommendation:**
```bash
npm install react-syntax-highlighter@latest
# Test syntax highlighting functionality
```

---

## 4. Security Best Practices Assessment

### ✅ Strengths

1. **CORS Configuration:**
   - Properly configured with specific origins
   - Not using wildcard (`*`)
   - Credentials properly controlled

2. **Input Validation:**
   - Pydantic models for API validation
   - File size limits enforced (10MB)
   - File extension validation

3. **SQL Injection Protection:**
   - Using SQLAlchemy with parameterized queries
   - No raw SQL string concatenation observed

4. **Authentication Framework:**
   - JWT infrastructure in place
   - Password hashing with bcrypt (passlib)
   - Currently disabled but ready to enable

5. **Secrets Management:**
   - Environment variables for configuration
   - `.env` not tracked in git
   - `.env.example` template provided

### ⚠️ Weaknesses

1. **Authentication Disabled:**
   - `ENABLE_AUTH=false` by default
   - No rate limiting implemented
   - API endpoints unprotected

2. **Development Defaults:**
   - `DEBUG=true` exposes stack traces
   - Binding to `0.0.0.0` accepts all connections
   - `SECRET_KEY` has insecure default

3. **XML Parsing:**
   - Using vulnerable `xml.etree.ElementTree`
   - Should migrate to `defusedxml`

4. **Error Handling:**
   - Some silent error suppression (`try/except/pass`)
   - Stack traces exposed when DEBUG=true

5. **Logging:**
   - No security event logging
   - No audit trail for sensitive operations

---

## 5. Recommendations Summary

### 🔴 Critical Priority (Do Immediately)

1. **Replace xml.etree.ElementTree with defusedxml**
   - Add `defusedxml>=0.7.1` to requirements.txt
   - Update all imports in `iodd_manager.py`
   - Risk: XXE attacks, XML bombs

2. **Fix subprocess shell=True usage in start.py**
   - Use array form with `cwd` parameter
   - Risk: Command injection

3. **Assess ecdsa usage**
   - Audit if ECDSA signatures are actually used
   - Consider migration strategy away from python-jose

### 🟡 High Priority (This Sprint)

4. **Add request timeouts**
   - All `requests.get()` calls should have timeout
   - Default to 5-30 seconds

5. **Update frontend dependencies**
   - Test @nivo upgrades to fix d3-color
   - Update react-syntax-highlighter
   - Risk: ReDoS, DOM clobbering

6. **Improve error handling**
   - Replace `try/except/pass` with logging
   - Add proper error messages

### 🟢 Medium Priority (Next Sprint)

7. **Security documentation**
   - Create SECURITY.md with responsible disclosure policy
   - Document authentication setup
   - Add security checklist for deployment

8. **Production configuration guide**
   - Update .env.example with production recommendations
   - Document reverse proxy setup
   - Provide nginx/Apache config examples

9. **Rate limiting**
   - Add rate limiting middleware
   - Protect upload endpoints
   - Configure per-IP limits

### 🔵 Low Priority (Backlog)

10. **Security headers**
    - Add security headers middleware
    - HSTS, CSP, X-Frame-Options, etc.

11. **Audit logging**
    - Log authentication events
    - Log file uploads/deletions
    - Log configuration changes

12. **Dependency scanning in CI**
    - Add pip-audit to CI pipeline
    - Add npm audit to CI pipeline
    - Fail on high-severity issues

---

## 6. Security Checklist for Production

Before deploying to production, ensure:

- [ ] `ENVIRONMENT=production` in .env
- [ ] `DEBUG=false`
- [ ] `SECRET_KEY` set to cryptographically random value
- [ ] `API_HOST=127.0.0.1` (use reverse proxy)
- [ ] `ENABLE_AUTH=true` (if authentication needed)
- [ ] All dependencies updated and scanned
- [ ] defusedxml implemented
- [ ] HTTPS/TLS configured
- [ ] Firewall rules configured
- [ ] Regular backups configured
- [ ] Monitoring and alerting set up
- [ ] Security headers configured in reverse proxy
- [ ] Rate limiting enabled
- [ ] Audit logging enabled

---

## 7. Compliance & Standards

**Relevant Standards:**
- OWASP Top 10 (2021)
  - A03:2021 – Injection (XML, Command)
  - A06:2021 – Vulnerable Components
  - A07:2021 – Identification and Authentication Failures

**CWE Coverage:**
- CWE-20: Improper Input Validation (XML)
- CWE-78: OS Command Injection (subprocess)
- CWE-400: Uncontrolled Resource Consumption (timeouts)
- CWE-605: Multiple Binds to Same Port (0.0.0.0)
- CWE-732: Incorrect Permission Assignment (chmod)

---

## 8. Tools & Methodology

**Automated Tools:**
- `pip-audit 2.9.0` - Python vulnerability scanning
- `bandit 1.8.6` - Python code security scanning
- `npm audit` - Node.js dependency scanning

**Manual Review:**
- Configuration file analysis
- Authentication/authorization review
- Error handling assessment
- Logging and monitoring evaluation

**Scan Commands:**
```bash
# Python dependencies
pip-audit --desc

# Python code security
bandit -c pyproject.toml -r iodd_manager.py api.py start.py config.py

# Frontend dependencies
cd frontend && npm audit --audit-level=moderate
```

---

## 9. References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/)
- [Bandit Documentation](https://bandit.readthedocs.io/)
- [defusedxml Documentation](https://github.com/tiran/defusedxml)
- [python-jose Security](https://python-jose.readthedocs.io/)

---

**Report Generated:** 2025-11-12
**Next Review:** Quarterly or after major changes
