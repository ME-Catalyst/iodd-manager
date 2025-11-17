# Greenstack Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Python Version Error
**Problem:** `SyntaxError` or "Python 3.8+ required"

**Solution:**
```bash
python --version  # Check version
# Install Python 3.8+ from python.org
# Use python3 or python3.8 explicitly if needed
python3.8 -m venv venv
```

#### Dependency Installation Fails
**Problem:** `pip install` errors

**Solution:**
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v

# On Windows, may need Visual C++ Build Tools
# Download from: visualstudio.microsoft.com/visual-cpp-build-tools/
```

#### Frontend Dependencies Fail
**Problem:** `npm install` errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install

# Try with --legacy-peer-deps
npm install --legacy-peer-deps
```

---

### Runtime Errors

#### Port Already in Use
**Problem:** `Address already in use` error

**Solution:**
```bash
# Find process using port 8000 (backend)
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
API_PORT=8001 python api.py
```

#### Database Locked Error
**Problem:** `database is locked` error

**Solution:**
```bash
# Stop all running instances
# Delete the database file
rm greenstack.db

# Reinitialize
python start.py --init-db

# Or use PostgreSQL for better concurrency
DATABASE_URL=postgresql://user:pass@localhost/greenstack
```

#### CORS Error in Browser
**Problem:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
Check `.env` file:
```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Restart backend after changing CORS settings.

---

### Import Issues

#### "Failed to parse IODD file"
**Problem:** Import fails with parsing error

**Causes:**
- Invalid XML syntax
- Missing required IODD elements
- Unsupported IODD version

**Solution:**
1. Validate XML syntax with online validator
2. Check IODD against IO-Link specification
3. Try with different IODD file to isolate issue
4. Check backend logs for detailed error:
   ```bash
   tail -f logs/greenstack.log
   ```

#### ZIP Import Fails
**Problem:** ZIP file rejected or partially imported

**Solution:**
- Ensure ZIP contains `.xml` file with IODD extension
- Check ZIP is not password-protected
- Verify ZIP is not corrupted:
  ```bash
  unzip -t filename.zip
  ```
- For nested ZIPs, ensure only 1 level deep

#### Nested ZIP Not Detected
**Problem:** Nested ZIP treated as single device

**Solution:**
- ZIP must contain only other ZIP files (no loose files)
- Each child ZIP must be valid IODD package
- Maximum 1 level of nesting supported
- Check backend logs for detection messages

---

### Web Interface Issues

#### "Device Not Found" Error
**Problem:** Device shows in list but details fail to load

**Solution:**
1. Refresh the page
2. Check database integrity:
   ```bash
   sqlite3 greenstack.db "PRAGMA integrity_check;"
   ```
3. If corrupted, restore from backup or re-import

#### Images Not Displaying
**Problem:** Device images show as broken

**Causes:**
- Asset extraction failed during import
- IODD file doesn't contain images
- Incorrect MIME type

**Solution:**
```bash
# Check assets in database
sqlite3 greenstack.db "SELECT COUNT(*) FROM iodd_assets WHERE device_id = X;"

# Re-import device to extract assets again
```

#### Menus Tab Shows "No Items"
**Problem:** Menus tab empty when device has UI menus

**Solution:**
- Refresh page to reload config-schema
- Check if device IODD has UserInterface section
- Check browser console for errors (F12)
- Clear browser cache and reload

#### Interactive Controls Not Working
**Problem:** Parameter controls don't respond

**Solution:**
- Check if parameter is read-only (ro access)
- Verify parameter has valid datatype
- Check browser console for JavaScript errors
- Try different browser (Chrome, Firefox, Edge)

---

### Performance Issues

#### Slow Device Import
**Problem:** Import takes very long

**Causes:**
- Large IODD XML files (>10MB)
- Many parameters (>1000)
- Slow disk I/O

**Solution:**
- Use SSD for database storage
- Import files one at a time
- Increase `MAX_UPLOAD_SIZE_MB` in config
- Consider PostgreSQL for better performance

#### Web Interface Slow/Laggy
**Problem:** UI freezes or is unresponsive

**Solution:**
- Close browser dev tools
- Clear browser cache
- Reduce number of devices displayed
- Check system resources (CPU, RAM)
- Use production build instead of dev mode:
  ```bash
  cd frontend
  npm run build
  # Serve with production server
  ```

---

### Database Issues

#### Schema Migration Fails
**Problem:** Alembic migration error

**Solution:**
```bash
# Check current version
alembic current

# Downgrade and re-migrate
alembic downgrade base
alembic upgrade head

# Or reset database
rm greenstack.db
alembic upgrade head
```

#### Duplicate Device Error
**Problem:** "Device already exists" on import

**Solution:**
```bash
# Delete existing device first via UI or API
curl -X DELETE http://localhost:8000/api/iodd/{device_id}

# Or allow duplicates by modifying constraints
# (not recommended)
```

---

### API Issues

#### 500 Internal Server Error
**Problem:** API returns 500 status

**Solution:**
1. Check backend logs for stack trace
2. Enable debug mode:
   ```python
   API_RELOAD=true
   DEBUG=true
   ```
3. Test API with curl:
   ```bash
   curl -v http://localhost:8000/api/health
   ```

#### 404 Not Found
**Problem:** API endpoint returns 404

**Solution:**
- Check API is running: http://localhost:8000/docs
- Verify endpoint URL and method (GET/POST/DELETE)
- Check for typos in device ID or endpoint path
- Ensure device exists in database

#### Slow API Response
**Problem:** API requests take >5 seconds

**Solution:**
- Add database indexes:
  ```sql
  CREATE INDEX idx_device_vendor ON iodd_devices(vendor_id);
  CREATE INDEX idx_params_device ON parameters(device_id);
  ```
- Use PostgreSQL instead of SQLite
- Enable query caching
- Profile slow queries

---

### Docker Issues

#### Container Won't Start
**Problem:** `docker-compose up` fails

**Solution:**
```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Remove old containers
docker-compose down -v
docker-compose up
```

#### Can't Access Web Interface
**Problem:** localhost:5173 not responding

**Solution:**
- Check port mapping in `docker-compose.yml`
- Verify containers are running:
  ```bash
  docker-compose ps
  ```
- Check firewall rules
- Try with container IP:
  ```bash
  docker inspect greenstack_frontend_1 | grep IPAddress
  ```

---

## Getting More Help

### Diagnostic Information

When reporting issues, include:

```bash
# System info
python --version
node --version
npm --version

# Backend logs
tail -n 100 logs/greenstack.log

# Frontend console errors (F12 in browser)

# Database info
sqlite3 greenstack.db "SELECT COUNT(*) FROM iodd_devices;"

# Environment
cat .env | grep -v API_KEY
```

### Log Files

- **Backend logs:** `logs/greenstack.log`
- **Frontend logs:** Browser console (F12)
- **Database logs:** SQLite doesn't have separate logs

### Enable Debug Mode

```bash
# Backend
DEBUG=true python api.py

# Frontend
VITE_DEBUG=true npm run dev
```

---

## Known Issues

### Current Limitations

1. **Nested ZIP:** Only 1 level deep supported
2. **Concurrent Writes:** SQLite has limited concurrency
3. **File Size:** Large IODDs (>50MB) may timeout
4. **Browser Compatibility:** Tested on Chrome, Firefox, Edge (latest)
5. **Standard Variables:** Some rare standard variables may not have metadata

### Planned Fixes

See our GitHub issues and milestones for planned improvements.

---

**Still having issues?** Check:
- [GitHub Issues](https://github.com/ME-Catalyst/greenstack/issues)
- [API Documentation](../developer/API_SPECIFICATION.md)
- [Developer Reference](../developer/DEVELOPER_REFERENCE.md)
