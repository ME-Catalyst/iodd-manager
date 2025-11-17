# Windows Installation Guide

Complete guide for installing and running Greenstack on Windows 10/11.

---

## =€ Quick Start (Recommended for Windows Users)

The **fastest way** to get Greenstack running on Windows is using the automated setup script.

### Prerequisites

**Required:**
- Windows 10 or Windows 11
- Python 3.10+ ([Download Python](https://www.python.org/downloads/))

**Optional (for full features):**
- Node.js 18+ ([Download Node.js](https://nodejs.org/)) - Only needed for frontend development

### Step-by-Step Installation

#### Step 1: Download Greenstack

**Option A: Download ZIP (Easiest)**

1. Visit https://github.com/ME-Catalyst/greenstack
2. Click the green **"Code"** button
3. Select **"Download ZIP"**
4. Extract the ZIP file to your desired location (e.g., `C:\Projects\greenstack`)

**Option B: Clone with Git**

```cmd
git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack
```

---

#### Step 2: Install Python (If Not Installed)

1. Download Python from https://www.python.org/downloads/
2. **IMPORTANT:** Check "Add Python to PATH" during installation
3. Verify installation by opening Command Prompt and running:

```cmd
python --version
```

Expected output: `Python 3.10.x` or higher

**Troubleshooting:** If `python --version` doesn't work:
- Try `py --version` or `python3 --version`
- Reinstall Python and make sure to check "Add Python to PATH"

---

#### Step 3: Run the Setup Script

1. Open File Explorer and navigate to the `greenstack` folder
2. **Double-click** `setup.bat`

The setup script will:
```
TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPW
Q                 IODD MANAGER - QUICK SETUP                  Q
ZPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]

 Checking Python installation...
  Found: Python 3.10.11

 Installing Python dependencies...
  Dependencies installed!

Would you like to create a desktop shortcut? (y/n): y
  Desktop shortcut created!

 Launching Greenstack...

PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
  The application will start in a moment...
  " API Server: http://localhost:8000
  " Web Interface: http://localhost:5173
  " API Documentation: http://localhost:8000/docs
PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

Press Ctrl+C to stop the application
```

3. When prompted, press **`y`** to create a desktop shortcut (recommended)
4. Wait for the browser to open automatically

** Done!** Greenstack is now running.

---

#### Step 4: Access the Application

The setup script will automatically:
- Start the backend API server
- Start the frontend interface
- Open your default browser to http://localhost:5173

**If the browser doesn't open automatically:**
- Manually navigate to http://localhost:5173

**You should see:**
- Greenstack dashboard with device library
- Navigation menu on the left
- Device import button

---

## =' Manual Installation (Advanced)

For developers or users who want more control over the installation process.

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git (optional, for cloning)

### Step 1: Clone or Download

```cmd
git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack
```

### Step 2: Create Configuration

```cmd
copy .env.example .env
```

Edit `.env` with Notepad if you want to change default settings (optional).

### Step 3: Install Python Dependencies

```cmd
pip install -r requirements.txt
```

**If pip is not recognized:**
```cmd
python -m pip install -r requirements.txt
```

### Step 4: Install Frontend Dependencies (Optional)

```cmd
cd frontend
npm install
cd ..
```

**Note:** If you skip this step, you can still use the API. The frontend is built separately.

### Step 5: Initialize Database

```cmd
python -m alembic upgrade head
```

### Step 6: Start the Application

```cmd
python start.py
```

---

## =Í Desktop Shortcut

If you created a desktop shortcut during setup, you can start Greenstack by:

1. Double-clicking the **"Greenstack"** shortcut on your desktop
2. The application launches automatically

**Shortcut Details:**
- Target: `python.exe start.py`
- Start in: `C:\Path\To\greenstack`
- Icon: Python icon (or custom if configured)

**To manually create a shortcut:**
1. Right-click on `start.py`
2. Select **"Create shortcut"**
3. Move shortcut to Desktop
4. Right-click shortcut ’ **Properties**
5. In "Target" field, prefix with: `python.exe ` (with space)
   - Example: `python.exe "C:\Projects\greenstack\start.py"`

---

## =Ñ Stopping the Application

### From Command Prompt Window

Press **`Ctrl+C`** in the terminal window where Greenstack is running.

### From Task Manager

1. Press **`Ctrl+Shift+Esc`** to open Task Manager
2. Find processes:
   - `python.exe` (Greenstack backend)
   - `node.exe` (Frontend dev server, if running)
3. Right-click ’ **End Task**

### PowerShell Command

```powershell
# Stop Python processes
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Stop Node processes (if running frontend separately)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## = Troubleshooting Windows-Specific Issues

### Issue 1: "Python is not recognized"

**Problem:**
```
'python' is not recognized as an internal or external command
```

**Solutions:**

**A. Use `py` launcher instead:**
```cmd
py --version
py start.py
```

**B. Add Python to PATH:**
1. Search for "Environment Variables" in Windows Start menu
2. Click "Environment Variables" button
3. Under "System variables", find "Path"
4. Click "Edit"
5. Click "New"
6. Add Python installation path (e.g., `C:\Python310\`)
7. Add Scripts path (e.g., `C:\Python310\Scripts\`)
8. Click OK and restart Command Prompt

**C. Reinstall Python:**
- Download from python.org
- **Check "Add Python to PATH"** during installation

---

### Issue 2: Port Already in Use

**Problem:**
```
[Errno 10048] Only one usage of each socket address is normally permitted
```

**Solution:**

**A. Find and kill process using port 8000:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**B. Change the port:**
Edit `.env` file:
```
API_PORT=9000
```

Then restart:
```cmd
python start.py
```

---

### Issue 3: "pip: command not found"

**Problem:**
```
'pip' is not recognized as an internal or external command
```

**Solution:**

Use Python module syntax:
```cmd
python -m pip install -r requirements.txt
```

Or upgrade pip:
```cmd
python -m pip install --upgrade pip
```

---

### Issue 4: Permission Denied Errors

**Problem:**
```
PermissionError: [WinError 5] Access is denied
```

**Solutions:**

**A. Run Command Prompt as Administrator:**
1. Search for "cmd" or "Command Prompt"
2. Right-click ’ **Run as administrator**
3. Navigate to greenstack directory
4. Run setup.bat or python start.py

**B. Install to user directory:**
```cmd
pip install --user -r requirements.txt
```

**C. Check antivirus/firewall:**
- Temporarily disable antivirus
- Add greenstack folder to exclusions

---

### Issue 5: Browser Doesn't Open Automatically

**Problem:** Setup completes but browser doesn't launch

**Solution:**

Manually open your browser and visit:
```
http://localhost:5173
```

Or disable auto-open in `.env`:
```
AUTO_OPEN_BROWSER=false
```

---

### Issue 6: SQLite Database Locked

**Problem:**
```
sqlite3.OperationalError: database is locked
```

**Solutions:**

**A. Close all Greenstack instances:**
```cmd
taskkill /F /IM python.exe
```

**B. Delete database and recreate:**
```cmd
del greenstack.db
python -m alembic upgrade head
```

**C. Check for lingering processes:**
- Open Task Manager
- End all `python.exe` processes
- Restart Greenstack

---

### Issue 7: Frontend Won't Load

**Problem:** API works but http://localhost:5173 shows nothing

**Solutions:**

**A. Check if Node.js is installed:**
```cmd
node --version
npm --version
```

**B. Install frontend dependencies:**
```cmd
cd frontend
npm install
cd ..
```

**C. Start frontend separately:**
```cmd
cd frontend
npm run dev
```

**D. Use production build:**
```cmd
cd frontend
npm run build
cd ..
python start.py
```

---

### Issue 8: Firewall Blocking Connections

**Problem:** Can't access http://localhost:8000 or http://localhost:5173

**Solution:**

**A. Allow through Windows Firewall:**
1. Open **Windows Defender Firewall**
2. Click **"Allow an app through firewall"**
3. Click **"Change settings"**
4. Click **"Allow another app"**
5. Browse to `python.exe` location
6. Check both "Private" and "Public"
7. Click **Add**

**B. Temporarily disable firewall for testing:**
```powershell
# Run PowerShell as Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

**Remember to re-enable:**
```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

---

## =¡ Windows-Specific Tips

### Run as Background Service

Create a batch file `start-iodd-background.bat`:

```batch
@echo off
start /B python start.py
echo Greenstack started in background
echo Visit http://localhost:5173
pause
```

### Create Start Menu Shortcut

1. Press `Win+R`, type `shell:programs`
2. Create new folder "Greenstack"
3. Copy desktop shortcut into this folder
4. Greenstack now appears in Start Menu

### Run on Startup

1. Press `Win+R`, type `shell:startup`
2. Create shortcut to `setup.bat`
3. Greenstack starts automatically on login

**Recommended startup batch file** (`startup-iodd.bat`):
```batch
@echo off
cd /d "C:\Path\To\greenstack"
start /MIN python start.py
```

This starts minimized in system tray.

---

## =Ý Configuration for Windows

### Windows Paths in .env

Use forward slashes or escaped backslashes:

```env
# Good
IODD_STORAGE_PATH=./iodd_storage
IODD_STORAGE_PATH=C:/Projects/greenstack/storage

# Also works
IODD_STORAGE_PATH=C:\\Projects\\greenstack\\storage

# Avoid
IODD_STORAGE_PATH=C:\Projects\greenstack\storage
```

### Recommended Windows .env Settings

```env
# Windows-optimized configuration
ENVIRONMENT=production
DEBUG=false

API_HOST=127.0.0.1
API_PORT=8000
API_RELOAD=false

FRONTEND_PORT=5173
AUTO_OPEN_BROWSER=true

# Use absolute Windows paths
IODD_STORAGE_PATH=C:/Projects/greenstack/iodd_storage
LOG_TO_FILE=true

# Windows-friendly logging
LOG_LEVEL=INFO
```

---

## =€ Performance Optimization for Windows

### Use SSD for Database

Move database to SSD for better performance:

```env
DATABASE_URL=sqlite:///D:/FastDrive/greenstack.db
```

### Increase Worker Processes

For Windows Server or high-end PCs:

```env
API_WORKERS=4
```

### Disable Auto-Reload in Production

```env
API_RELOAD=false
```

---

## =æ Windows Package Manager (Optional)

### Install with Chocolatey

If you have [Chocolatey](https://chocolatey.org/) installed:

```cmd
# Install prerequisites
choco install python nodejs git

# Clone and setup
git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack
setup.bat
```

### Install with Scoop

If you have [Scoop](https://scoop.sh/) installed:

```cmd
# Install prerequisites
scoop install python nodejs git

# Clone and setup
git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack
setup.bat
```

---

## <¯ Next Steps

After successful installation:

1. **[Quick Start Guide](quick-start.md)** - Learn basic usage
2. **[Configuration Reference](../CONFIGURATION.md)** - Customize settings
3. **[User Manual](../USER_MANUAL.md)** - Complete feature guide
4. **[Troubleshooting](../../troubleshooting/TROUBLESHOOTING.md)** - Solve issues

---

## S Getting Help

**Still having issues?**

1. Check [Troubleshooting Guide](../../troubleshooting/TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/ME-Catalyst/greenstack/issues)
3. Create new issue with:
   - Windows version
   - Python version (`python --version`)
   - Complete error message
   - Steps to reproduce

---

## =Ë Windows Installation Checklist

- [ ] Python 3.10+ installed
- [ ] Python added to PATH
- [ ] Downloaded/cloned Greenstack
- [ ] Ran `setup.bat`
- [ ] Application started successfully
- [ ] Browser opened to http://localhost:5173
- [ ] Imported first IODD file
- [ ] Desktop shortcut created (optional)

**Installation complete!** <‰
