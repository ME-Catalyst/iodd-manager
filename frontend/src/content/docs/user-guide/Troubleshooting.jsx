import React from 'react';
import { AlertCircle, Wrench, Bug, Database, Server, Code, HelpCircle } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsList, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsAccordion from '../../../components/docs/DocsAccordion';

export const metadata = {
  id: 'user-guide/troubleshooting',
  title: 'Troubleshooting Guide',
  description: 'Solutions to common issues and problems when using Greenstack',
  category: 'user-guide',
  order: 4,
  keywords: ['troubleshooting', 'errors', 'problems', 'issues', 'debugging', 'help', 'support'],
  lastUpdated: '2025-01-17',
};

export default function Troubleshooting() {
  return (
    <DocsPage>
      <DocsHero
        title="Troubleshooting Guide"
        description="Solutions to common issues and problems when using Greenstack"
        icon={<Wrench className="w-12 h-12 text-brand-green" />}
      />

      <DocsSection title="Quick Diagnostics">
        <DocsParagraph>
          Before diving into specific issues, run these quick diagnostic checks:
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-green" />
              Backend Health
            </h5>
            <DocsCodeBlock language="bash">
{`# Check if API is running
curl http://localhost:8000/health

# Should return: {"status": "ok"}`}
            </DocsCodeBlock>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-brand-green" />
              Frontend Status
            </h5>
            <DocsCodeBlock language="bash">
{`# Check if frontend is running
curl http://localhost:3000

# Open browser to: http://localhost:3000`}
            </DocsCodeBlock>
          </div>
        </div>

        <DocsCallout type="tip" title="Browser Developer Tools">
          <DocsParagraph>
            Press <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono mx-1">F12</kbd> in
            your browser to open DevTools. Check the Console tab for JavaScript errors and the Network tab for failed
            API requests.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Installation Issues">
        <DocsParagraph>
          Common problems during installation and initial setup.
        </DocsParagraph>

        <DocsAccordion
          items={[
            {
              title: 'Python Version Error',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        Getting <code>SyntaxError</code> or "Python 3.8+ required" message
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Solution">
                    <DocsCodeBlock language="bash">
{`# Check your Python version
python --version

# Should be 3.8 or higher
# If not, download from python.org

# On systems with multiple Python versions
python3 --version
python3.8 --version

# Create virtual environment with specific version
python3.8 -m venv venv`}
                    </DocsCodeBlock>
                  </DocsCallout>

                  <DocsCallout type="warning" title="Windows Users">
                    <DocsParagraph>
                      Make sure to check "Add Python to PATH" during installation, or manually add it to your
                      environment variables.
                    </DocsParagraph>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Dependency Installation Fails',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        <code>pip install</code> commands failing with errors
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Solution">
                    <DocsCodeBlock language="bash">
{`# Upgrade pip first
python -m pip install --upgrade pip

# Install with verbose output to see what's failing
pip install -r requirements.txt -v

# If still failing, try installing packages individually
pip install fastapi uvicorn sqlalchemy`}
                    </DocsCodeBlock>
                  </DocsCallout>

                  <DocsCallout type="warning" title="Windows: Visual C++ Build Tools">
                    <DocsParagraph>
                      Some packages require C++ compiler. Download and install from:{' '}
                      <DocsLink href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" external>
                        Visual C++ Build Tools
                      </DocsLink>
                    </DocsParagraph>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Frontend Dependencies Fail',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        <code>npm install</code> errors in frontend directory
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Solution">
                    <DocsCodeBlock language="bash">
{`# Clear npm cache
npm cache clean --force

# Delete existing dependencies
rm -rf node_modules package-lock.json

# Try install again
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps`}
                    </DocsCodeBlock>
                  </DocsCallout>

                  <DocsCallout type="tip" title="Node.js Version">
                    <DocsParagraph>
                      Greenstack requires Node.js 16+. Check with <code>node --version</code>. Download from{' '}
                      <DocsLink href="https://nodejs.org" external>nodejs.org</DocsLink> if needed.
                    </DocsParagraph>
                  </DocsCallout>
                </div>
              ),
            },
          ]}
          defaultOpen={0}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Runtime Errors">
        <DocsParagraph>
          Issues that occur when running the application.
        </DocsParagraph>

        <DocsAccordion
          items={[
            {
              title: 'Port Already in Use',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        "Address already in use" error when starting backend or frontend
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Solution 1: Find and Kill Process">
                    <DocsCodeBlock language="bash" title="Linux/macOS">
{`# Find process using port 8000 (backend)
lsof -i :8000

# Kill the process
kill -9 <PID>

# For frontend (port 3000)
lsof -i :3000
kill -9 <PID>`}
                    </DocsCodeBlock>

                    <DocsCodeBlock language="bash" title="Windows">
{`# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (use PID from output)
taskkill /PID <PID> /F`}
                    </DocsCodeBlock>
                  </DocsCallout>

                  <DocsCallout type="success" title="Solution 2: Use Different Ports">
                    <DocsCodeBlock language="bash">
{`# In .env file
API_PORT=8001
FRONTEND_PORT=3001

# Or via environment variables
API_PORT=8001 python start.py`}
                    </DocsCodeBlock>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Database Locked Error',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        "database is locked" error during operations
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="warning" title="Cause">
                    <DocsParagraph>
                      SQLite can only handle one write operation at a time. This error occurs when multiple processes
                      try to write simultaneously.
                    </DocsParagraph>
                  </DocsCallout>

                  <DocsCallout type="success" title="Solution">
                    <DocsCodeBlock language="bash">
{`# Stop all running instances
# Kill any Python processes

# Delete the database (will lose data!)
rm greenstack.db

# Reinitialize database
python -c "from src.api import init_db; init_db()"`}
                    </DocsCodeBlock>
                  </DocsCallout>

                  <DocsCallout type="tip" title="Production Recommendation">
                    <DocsParagraph>
                      For production deployments with concurrent users, consider using PostgreSQL instead of SQLite.
                      See <DocsLink href="/docs/user-guide/configuration" external={false}>Configuration Guide</DocsLink> for
                      database setup.
                    </DocsParagraph>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'CORS Error in Browser',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        Browser console shows "CORS policy: No 'Access-Control-Allow-Origin' header"
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Solution">
                    <DocsParagraph>
                      Add your frontend URL to the CORS_ORIGINS configuration:
                    </DocsParagraph>
                    <DocsCodeBlock language="bash" className="mt-2">
{`# In .env file
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000

# Include the exact URL shown in your browser address bar`}
                    </DocsCodeBlock>
                    <DocsParagraph className="mt-2">
                      After changing CORS settings, restart the backend server.
                    </DocsParagraph>
                  </DocsCallout>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Import Issues">
        <DocsParagraph>
          Problems when importing IODD files or ZIP packages.
        </DocsParagraph>

        <DocsAccordion
          items={[
            {
              title: 'Failed to Parse IODD File',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        Import fails with XML parsing error
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="warning" title="Common Causes">
                    <DocsList
                      items={[
                        'Invalid XML syntax (unclosed tags, special characters)',
                        'Missing required IODD elements',
                        'Unsupported IODD version',
                        'File corruption during download/transfer',
                      ]}
                    />
                  </DocsCallout>

                  <DocsCallout type="success" title="Solution Steps">
                    <div className="space-y-2">
                      <p className="text-sm text-foreground"><strong>1. Validate XML Syntax</strong></p>
                      <DocsParagraph>
                        Use an online XML validator to check for syntax errors
                      </DocsParagraph>

                      <p className="text-sm text-foreground mt-3"><strong>2. Check Backend Logs</strong></p>
                      <DocsCodeBlock language="bash">
{`# View detailed error messages
tail -f logs/greenstack.log

# Or if logs directory doesn't exist
python api.py  # Errors will print to console`}
                      </DocsCodeBlock>

                      <p className="text-sm text-foreground mt-3"><strong>3. Test with Different File</strong></p>
                      <DocsParagraph>
                        Try importing a known-good IODD file to isolate whether the issue is with the file or the system
                      </DocsParagraph>
                    </div>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'ZIP Import Fails',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        ZIP file rejected or only partially imported
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Requirements Checklist">
                    <DocsList
                      items={[
                        'ZIP must contain at least one .xml file with IODD extension',
                        'ZIP must not be password-protected',
                        'ZIP must not be corrupted',
                        'For nested ZIPs, maximum 1 level deep',
                        'File size under MAX_UPLOAD_SIZE (default 10MB)',
                      ]}
                    />
                  </DocsCallout>

                  <DocsCallout type="success" title="Verify ZIP Integrity">
                    <DocsCodeBlock language="bash">
{`# Test ZIP file (Linux/macOS)
unzip -t filename.zip

# Windows
7z t filename.zip

# Should show "Everything is Ok"`}
                    </DocsCodeBlock>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Nested ZIP Not Detected',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        Nested ZIP treated as single device instead of multiple devices
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="info" title="Nested ZIP Requirements">
                    <DocsList
                      items={[
                        'Parent ZIP must contain ONLY other ZIP files (no loose IODD files)',
                        'Each child ZIP must be a valid IODD package',
                        'Maximum 1 level of nesting supported',
                        'File must have .zip extension',
                      ]}
                    />
                  </DocsCallout>

                  <DocsCallout type="success" title="Check Detection">
                    <DocsCodeBlock language="bash">
{`# Backend logs will show nested ZIP detection
# Look for messages like:
# "Detected nested ZIP with X child packages"

tail -f logs/greenstack.log`}
                    </DocsCodeBlock>
                  </DocsCallout>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Web Interface Issues">
        <DocsParagraph>
          Problems specific to the web interface and browser.
        </DocsParagraph>

        <DocsAccordion
          items={[
            {
              title: 'Device Not Found Error',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        Device appears in list but details fail to load with 404 error
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Solutions">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">1. Refresh the Page</p>
                        <p className="text-sm text-muted-foreground">
                          Press F5 or Ctrl+R to reload. Sometimes the cache is stale.
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">2. Check Database Integrity</p>
                        <DocsCodeBlock language="bash">
{`sqlite3 greenstack.db "PRAGMA integrity_check;"`}
                        </DocsCodeBlock>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">3. Re-import Device</p>
                        <p className="text-sm text-muted-foreground">
                          Delete the problematic device and import the IODD file again
                        </p>
                      </div>
                    </div>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Images Not Displaying',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        Device images show as broken or missing
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="warning" title="Possible Causes">
                    <DocsList
                      items={[
                        'IODD file doesn\'t contain embedded images',
                        'Asset extraction failed during import',
                        'Incorrect MIME type in IODD',
                        'Browser blocking mixed content (HTTP/HTTPS)',
                      ]}
                    />
                  </DocsCallout>

                  <DocsCallout type="success" title="Solution">
                    <DocsCodeBlock language="bash">
{`# Check if assets were extracted
sqlite3 greenstack.db "SELECT COUNT(*) FROM iodd_assets WHERE device_id = X;"

# Re-import device to extract assets again
# Use the web interface to delete and re-upload the IODD`}
                    </DocsCodeBlock>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Interactive Controls Not Working',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        Parameter controls in Menus tab don't respond to input
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Troubleshooting Steps">
                    <DocsList
                      items={[
                        'Check if parameter is read-only (access rights: "ro")',
                        'Verify parameter has a valid datatype defined',
                        'Open browser console (F12) and check for JavaScript errors',
                        'Try a different browser (Chrome, Firefox, Edge)',
                        'Clear browser cache and reload the page',
                      ]}
                    />
                  </DocsCallout>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Performance Issues">
        <DocsAccordion
          items={[
            {
              title: 'Slow Device Import',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        Import takes several minutes for large IODD files
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="warning" title="Common Causes">
                    <DocsList
                      items={[
                        'Large IODD XML files (>10MB)',
                        'Many parameters (>1000)',
                        'Slow disk I/O',
                        'Complex nested menu structures',
                      ]}
                    />
                  </DocsCallout>

                  <DocsCallout type="success" title="Optimizations">
                    <DocsList
                      items={[
                        'Use SSD for database storage instead of HDD',
                        'Import files one at a time instead of batch',
                        'Increase MAX_UPLOAD_SIZE if timeout occurs',
                        'Consider PostgreSQL for better performance with large datasets',
                      ]}
                    />
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Web Interface Slow/Laggy',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        UI freezes, lags, or is unresponsive
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Quick Fixes">
                    <DocsList
                      items={[
                        'Close browser DevTools if open',
                        'Clear browser cache (Ctrl+Shift+Delete)',
                        'Close other browser tabs',
                        'Disable browser extensions',
                        'Check system resources (CPU, RAM)',
                      ]}
                    />
                  </DocsCallout>

                  <DocsCallout type="tip" title="Production Build">
                    <DocsParagraph>
                      For better performance, use a production build instead of development mode:
                    </DocsParagraph>
                    <DocsCodeBlock language="bash" className="mt-2">
{`cd frontend
npm run build

# Serve the production build
npx serve -s dist -l 3000`}
                    </DocsCodeBlock>
                  </DocsCallout>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="API Issues">
        <DocsAccordion
          items={[
            {
              title: '500 Internal Server Error',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        API returns 500 status code
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Debugging Steps">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">1. Check Backend Logs</p>
                        <DocsCodeBlock language="bash">
{`tail -f logs/greenstack.log`}
                        </DocsCodeBlock>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">2. Enable Debug Mode</p>
                        <DocsCodeBlock language="bash">
{`# In .env file
DEBUG=true
SHOW_ERROR_DETAILS=true

# Restart API server`}
                        </DocsCodeBlock>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">3. Test API with curl</p>
                        <DocsCodeBlock language="bash">
{`curl -v http://localhost:8000/api/health`}
                        </DocsCodeBlock>
                      </div>
                    </div>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Slow API Response',
              content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Problem</p>
                      <p className="text-sm text-muted-foreground">
                        API requests taking more than 5 seconds
                      </p>
                    </div>
                  </div>

                  <DocsCallout type="success" title="Optimizations">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">Add Database Indexes</p>
                        <DocsCodeBlock language="sql">
{`CREATE INDEX idx_device_vendor ON iodd_devices(vendor_id);
CREATE INDEX idx_params_device ON parameters(device_id);
CREATE INDEX idx_device_name ON iodd_devices(product_name);`}
                        </DocsCodeBlock>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">Use PostgreSQL</p>
                        <DocsParagraph>
                          For production deployments, PostgreSQL provides better performance than SQLite for
                          concurrent operations and large datasets.
                        </DocsParagraph>
                      </div>
                    </div>
                  </DocsCallout>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Getting Help">
        <DocsParagraph>
          When reporting issues or asking for help, include this diagnostic information:
        </DocsParagraph>

        <div className="my-6 space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-green" />
              System Information
            </h5>
            <DocsCodeBlock language="bash">
{`# Collect system information
python --version
node --version
npm --version

# Operating system
uname -a  # Linux/macOS
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"  # Windows`}
            </DocsCodeBlock>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bug className="w-5 h-5 text-brand-green" />
              Error Logs
            </h5>
            <DocsCodeBlock language="bash">
{`# Backend logs (last 100 lines)
tail -n 100 logs/greenstack.log

# Frontend console errors
# Open browser DevTools (F12) -> Console tab
# Screenshot any red error messages

# Database information
sqlite3 greenstack.db "SELECT COUNT(*) FROM iodd_devices;"
sqlite3 greenstack.db "PRAGMA integrity_check;"`}
            </DocsCodeBlock>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-3">Enable Debug Mode</h5>
            <DocsCodeBlock language="bash">
{`# Backend - add to .env
DEBUG=true
LOG_LEVEL=DEBUG
SHOW_ERROR_DETAILS=true

# Frontend - add to .env
VITE_DEBUG=true

# Restart both servers after changes`}
            </DocsCodeBlock>
          </div>
        </div>

        <DocsCallout type="info" title="Report Issues">
          <DocsParagraph>
            Found a bug? Report it on our{' '}
            <DocsLink href="https://github.com/ME-Catalyst/greenstack/issues" external>
              GitHub Issues
            </DocsLink>{' '}
            page with the diagnostic information above (remember to redact any sensitive data like API keys).
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Known Issues & Limitations">
        <DocsParagraph>
          Current limitations and known issues in Greenstack:
        </DocsParagraph>

        <div className="my-6 space-y-3">
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-sm font-semibold text-foreground">Nested ZIP Files</p>
            <p className="text-sm text-muted-foreground">
              Only 1 level of ZIP nesting is currently supported. Deeply nested ZIPs will not be fully extracted.
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-sm font-semibold text-foreground">SQLite Concurrency</p>
            <p className="text-sm text-muted-foreground">
              SQLite has limited support for concurrent writes. For production with multiple users, use PostgreSQL.
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-sm font-semibold text-foreground">Large IODD Files</p>
            <p className="text-sm text-muted-foreground">
              Very large IODD files (&gt;50MB) may timeout during import. Consider splitting or increasing timeout limits.
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-sm font-semibold text-foreground">Browser Compatibility</p>
            <p className="text-sm text-muted-foreground">
              Tested on Chrome, Firefox, and Edge (latest versions). Some features may not work on older browsers.
            </p>
          </div>
        </div>

        <DocsCallout type="success" title="Planned Improvements">
          <DocsParagraph>
            Check our{' '}
            <DocsLink href="https://github.com/ME-Catalyst/greenstack/milestones" external>
              GitHub Milestones
            </DocsLink>{' '}
            for planned fixes and improvements to these limitations.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Additional Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <DocsLink href="/docs/user-guide/configuration" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Configuration Guide</h5>
            <p className="text-sm text-muted-foreground">Learn how to configure Greenstack properly</p>
          </DocsLink>

          <DocsLink href="/docs/api/overview" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">API Documentation</h5>
            <p className="text-sm text-muted-foreground">Understand the API endpoints and responses</p>
          </DocsLink>

          <DocsLink href="/docs/getting-started/installation" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Installation Guide</h5>
            <p className="text-sm text-muted-foreground">Step-by-step installation instructions</p>
          </DocsLink>

          <DocsLink href="https://github.com/ME-Catalyst/greenstack" external className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">GitHub Repository</h5>
            <p className="text-sm text-muted-foreground">Source code and issue tracker</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
