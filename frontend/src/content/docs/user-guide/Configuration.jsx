import React, { useState } from 'react';
import { Settings, Shield, FileCode, AlertTriangle, CheckCircle, Code2 } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsList, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsTabs from '../../../components/docs/DocsTabs';
import DocsAccordion from '../../../components/docs/DocsAccordion';

export const metadata = {
  id: 'user-guide/configuration',
  title: 'Configuration Guide',
  description: 'Complete guide to configuring Greenstack using environment variables for different deployment scenarios',
  category: 'user-guide',
  order: 2,
  keywords: ['configuration', 'environment variables', 'env', 'settings', 'deployment', 'production', 'docker'],
  lastUpdated: '2025-01-17',
};

export default function Configuration() {
  return (
    <DocsPage>
      <DocsHero
        title="Configuration Guide"
        description="Complete guide to configuring Greenstack using environment variables for different deployment scenarios"
        icon={<Settings className="w-12 h-12 text-brand-green" />}
      />

      <DocsSection title="Overview">
        <DocsParagraph>
          Greenstack uses environment variables for configuration, providing a flexible and secure way to manage
          settings across different environments.
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="border border-border rounded-lg p-4">
            <Shield className="w-8 h-8 text-brand-green mb-3" />
            <h4 className="font-semibold text-foreground mb-1">Secure by Default</h4>
            <p className="text-sm text-muted-foreground">
              Keep secrets out of version control with environment-based configuration
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <Code2 className="w-8 h-8 text-brand-green mb-3" />
            <h4 className="font-semibold text-foreground mb-1">No Code Changes</h4>
            <p className="text-sm text-muted-foreground">
              Override default settings without modifying application code
            </p>
          </div>
        </div>

        <DocsCallout type="info" title="12-Factor App">
          <DocsParagraph>
            Greenstack follows the <DocsLink href="https://12factor.net/config" external>12-Factor App</DocsLink> methodology
            for configuration management, storing config in the environment.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Configuration Methods">
        <DocsParagraph>
          There are three ways to configure Greenstack, listed from most to least recommended:
        </DocsParagraph>

        <div className="space-y-6 my-6">
          {/* Method 1: .env File */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-brand-green/10 border-b border-border">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-brand-green" />
                  1. .env File (Recommended)
                </h4>
                <span className="text-xs px-2 py-1 bg-brand-green text-white rounded font-medium">
                  Recommended
                </span>
              </div>
            </div>
            <div className="p-4">
              <DocsParagraph>
                Create a <code>.env</code> file in the project root directory. This file is automatically loaded
                and is excluded from version control by default.
              </DocsParagraph>
              <DocsCodeBlock language="bash" className="mt-3">
{`# Copy the example file
cp .env.example .env

# Edit with your settings
nano .env`}
              </DocsCodeBlock>
              <DocsCallout type="success" title="Best Practice" className="mt-3">
                <DocsParagraph>
                  The .env file is the recommended approach for most deployments. It keeps configuration in one place
                  and makes it easy to manage different environments.
                </DocsParagraph>
              </DocsCallout>
            </div>
          </div>

          {/* Method 2: Environment Variables */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-surface/50 border-b border-border">
              <h4 className="font-semibold text-foreground">2. Environment Variables</h4>
            </div>
            <div className="p-4">
              <DocsParagraph>
                Set environment variables directly in your shell or deployment system. Useful for
                container orchestration and CI/CD pipelines.
              </DocsParagraph>
              <DocsCodeBlock language="bash" className="mt-3">
{`export API_PORT=9000
export DEBUG=false
python start.py`}
              </DocsCodeBlock>
            </div>
          </div>

          {/* Method 3: Command-Line Arguments */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-surface/50 border-b border-border">
              <h4 className="font-semibold text-foreground">3. Command-Line Arguments (Limited)</h4>
            </div>
            <div className="p-4">
              <DocsParagraph>
                Some settings can be overridden via command-line arguments for quick testing.
              </DocsParagraph>
              <DocsCodeBlock language="bash" className="mt-3">
{`python start.py --api-port 9000 --frontend-port 4000`}
              </DocsCodeBlock>
              <DocsCallout type="warning" title="Limited Support" className="mt-3">
                <DocsParagraph>
                  Not all configuration options are available via command-line. Use .env files for comprehensive configuration.
                </DocsParagraph>
              </DocsCallout>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Configuration Reference">
        <DocsParagraph>
          Complete reference of all available configuration variables organized by category.
        </DocsParagraph>

        <DocsAccordion
          items={[
            {
              title: 'Application Settings',
              content: (
                <div className="space-y-4">
                  <ConfigVar
                    name="ENVIRONMENT"
                    description="Application environment"
                    values={['development', 'production', 'testing']}
                    default="development"
                    example="ENVIRONMENT=production"
                  />
                  <ConfigVar
                    name="APP_NAME"
                    description="Application name"
                    default="Greenstack"
                  />
                  <ConfigVar
                    name="DEBUG"
                    description="Enable debug mode with detailed error messages"
                    values={['true', 'false']}
                    default="true"
                    example="DEBUG=false"
                    note="Always set to false in production for security"
                  />
                </div>
              ),
            },
            {
              title: 'API Server Settings',
              content: (
                <div className="space-y-4">
                  <ConfigVar
                    name="API_HOST"
                    description="API server host address"
                    values={['0.0.0.0 (all interfaces)', '127.0.0.1 (localhost only)']}
                    default="0.0.0.0"
                    note="Set to 127.0.0.1 in production if behind a reverse proxy"
                  />
                  <ConfigVar
                    name="API_PORT"
                    description="API server port"
                    default="8000"
                    example="API_PORT=9000"
                  />
                  <ConfigVar
                    name="API_RELOAD"
                    description="Auto-reload on code changes (development only)"
                    values={['true', 'false']}
                    default="true"
                    note="Set to false in production"
                  />
                  <ConfigVar
                    name="API_WORKERS"
                    description="Number of worker processes (production)"
                    default="1"
                    example="API_WORKERS=4"
                    note="Set to number of CPU cores in production for better performance"
                  />
                </div>
              ),
            },
            {
              title: 'Frontend Settings',
              content: (
                <div className="space-y-4">
                  <ConfigVar
                    name="FRONTEND_HOST"
                    description="Frontend server host"
                    default="0.0.0.0"
                  />
                  <ConfigVar
                    name="FRONTEND_PORT"
                    description="Frontend server port"
                    default="3000"
                    example="FRONTEND_PORT=4000"
                  />
                  <ConfigVar
                    name="AUTO_OPEN_BROWSER"
                    description="Automatically open browser on startup"
                    values={['true', 'false']}
                    default="true"
                    note="Set to false for headless server deployments"
                  />
                </div>
              ),
            },
            {
              title: 'Database Settings',
              content: (
                <div className="space-y-4">
                  <ConfigVar
                    name="IODD_DATABASE_URL"
                    description="Database connection URL"
                    format="sqlite:///path/to/database.db"
                    default="sqlite:///greenstack.db"
                  />
                  <DocsCodeBlock language="bash" title="Database URL Examples">
{`# Relative path
IODD_DATABASE_URL=sqlite:///./data/iodd.db

# Absolute path
IODD_DATABASE_URL=sqlite:////var/lib/greenstack/database.db

# In-memory (testing only)
IODD_DATABASE_URL=sqlite:///:memory:`}
                  </DocsCodeBlock>
                  <ConfigVar
                    name="AUTO_MIGRATE"
                    description="Run database migrations on startup"
                    values={['true', 'false']}
                    default="false"
                    example="AUTO_MIGRATE=true"
                  />
                </div>
              ),
            },
            {
              title: 'Storage Settings',
              content: (
                <div className="space-y-4">
                  <ConfigVar
                    name="IODD_STORAGE_DIR"
                    description="Directory for storing uploaded IODD files"
                    default="./iodd_storage"
                    example="IODD_STORAGE_DIR=/var/lib/greenstack/storage"
                  />
                  <ConfigVar
                    name="GENERATED_OUTPUT_DIR"
                    description="Directory for generated adapter files"
                    default="./generated"
                    example="GENERATED_OUTPUT_DIR=/var/lib/greenstack/output"
                  />
                  <ConfigVar
                    name="MAX_UPLOAD_SIZE"
                    description="Maximum file upload size in bytes"
                    default="10485760 (10MB)"
                    example="MAX_UPLOAD_SIZE=52428800  # 50MB"
                  />
                </div>
              ),
            },
            {
              title: 'Security Settings',
              content: (
                <div className="space-y-4">
                  <ConfigVar
                    name="CORS_ORIGINS"
                    description="Allowed CORS origins (comma-separated)"
                    default="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
                  />
                  <DocsCodeBlock language="bash" title="Production CORS Example">
{`CORS_ORIGINS=https://iodd.example.com,https://www.iodd.example.com`}
                  </DocsCodeBlock>
                  <ConfigVar
                    name="CORS_METHODS"
                    description="Allowed HTTP methods (comma-separated)"
                    default="GET,POST,DELETE,OPTIONS"
                  />
                  <ConfigVar
                    name="CORS_CREDENTIALS"
                    description="Allow credentials in CORS requests"
                    values={['true', 'false']}
                    default="true"
                  />
                  <ConfigVar
                    name="SECRET_KEY"
                    description="Secret key for JWT tokens (future use)"
                    note="Generate with: openssl rand -hex 32"
                  />
                </div>
              ),
            },
            {
              title: 'Logging Settings',
              content: (
                <div className="space-y-4">
                  <ConfigVar
                    name="LOG_LEVEL"
                    description="Minimum log level to display"
                    values={['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']}
                    default="INFO"
                    note="Use DEBUG for development, WARNING for production"
                  />
                  <ConfigVar
                    name="LOG_FORMAT"
                    description="Log output format"
                    values={['text', 'json']}
                    default="text"
                    note="Use json in production for better log parsing"
                  />
                  <ConfigVar
                    name="LOG_TO_FILE"
                    description="Write logs to file"
                    values={['true', 'false']}
                    default="false"
                  />
                  <ConfigVar
                    name="LOG_FILE_PATH"
                    description="Path to log file (when LOG_TO_FILE=true)"
                    default="./logs/greenstack.log"
                    example="LOG_FILE_PATH=/var/log/greenstack/app.log"
                  />
                  <ConfigVar
                    name="LOG_MAX_BYTES"
                    description="Maximum log file size before rotation"
                    default="10485760 (10MB)"
                  />
                  <ConfigVar
                    name="LOG_BACKUP_COUNT"
                    description="Number of rotated log files to keep"
                    default="5"
                  />
                </div>
              ),
            },
            {
              title: 'Development Settings',
              content: (
                <div className="space-y-4">
                  <ConfigVar
                    name="ENABLE_DOCS"
                    description="Enable API documentation endpoints (/docs, /redoc)"
                    values={['true', 'false']}
                    default="true"
                    note="Set to false in production to disable public API docs"
                  />
                  <ConfigVar
                    name="SHOW_ERROR_DETAILS"
                    description="Show detailed error messages in API responses"
                    values={['true', 'false']}
                    default="true"
                    note="Set to false in production to hide stack traces"
                  />
                  <ConfigVar
                    name="LOG_SQL_QUERIES"
                    description="Log all SQL queries (development/debugging)"
                    values={['true', 'false']}
                    default="false"
                  />
                </div>
              ),
            },
          ]}
          defaultOpen={0}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Configuration Examples">
        <DocsParagraph>
          Ready-to-use configuration examples for different deployment scenarios.
        </DocsParagraph>

        <DocsTabs
          tabs={[
            {
              label: 'Development',
              content: (
                <div className="space-y-3">
                  <DocsParagraph>
                    Development configuration with debug mode, auto-reload, and detailed logging.
                  </DocsParagraph>
                  <DocsCodeBlock language="bash">
{`# .env for development
ENVIRONMENT=development
DEBUG=true
API_RELOAD=true
LOG_LEVEL=DEBUG
ENABLE_DOCS=true
SHOW_ERROR_DETAILS=true
AUTO_OPEN_BROWSER=true`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              label: 'Production',
              content: (
                <div className="space-y-3">
                  <DocsParagraph>
                    Production configuration optimized for security and performance.
                  </DocsParagraph>
                  <DocsCodeBlock language="bash">
{`# .env for production
ENVIRONMENT=production
DEBUG=false
API_RELOAD=false
API_WORKERS=4
LOG_LEVEL=WARNING
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/greenstack/app.log
ENABLE_DOCS=false
SHOW_ERROR_DETAILS=false
AUTO_OPEN_BROWSER=false

# Use absolute paths
IODD_DATABASE_URL=sqlite:////var/lib/greenstack/database.db
IODD_STORAGE_DIR=/var/lib/greenstack/storage
GENERATED_OUTPUT_DIR=/var/lib/greenstack/output

# Security
CORS_ORIGINS=https://iodd.example.com
SECRET_KEY=your-production-secret-key-here`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              label: 'Docker',
              content: (
                <div className="space-y-3">
                  <DocsParagraph>
                    Docker configuration with container-specific paths and settings.
                  </DocsParagraph>
                  <DocsCodeBlock language="bash">
{`# .env for Docker
ENVIRONMENT=production
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_HOST=0.0.0.0
FRONTEND_PORT=3000

# Use container paths
IODD_DATABASE_URL=sqlite:////data/greenstack.db
IODD_STORAGE_DIR=/data/storage
GENERATED_OUTPUT_DIR=/data/generated

# Logging
LOG_TO_FILE=true
LOG_FILE_PATH=/data/logs/app.log
LOG_FORMAT=json`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              label: 'Testing',
              content: (
                <div className="space-y-3">
                  <DocsParagraph>
                    Testing configuration with in-memory database and isolated ports.
                  </DocsParagraph>
                  <DocsCodeBlock language="bash">
{`# .env.test for testing
ENVIRONMENT=testing
DEBUG=true
API_PORT=8001
FRONTEND_PORT=3001

# Use in-memory database for tests
IODD_DATABASE_URL=sqlite:///:memory:
TEST_DATABASE_URL=sqlite:///:memory:

# Skip slow tests
SKIP_SLOW_TESTS=true`}
                  </DocsCodeBlock>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Configuration Validation">
        <DocsParagraph>
          Verify your configuration is loaded correctly before deployment.
        </DocsParagraph>

        <DocsCodeBlock language="bash" title="Check Configuration" className="my-4">
{`python -c "import config; config.print_config()"`}
        </DocsCodeBlock>

        <DocsCodeBlock language="text" title="Expected Output">
{`============================================================
  Greenstack Configuration
============================================================
  environment         : development
  app_name            : Greenstack
  app_version         : 2.0.0
  debug               : True
  api_host            : 0.0.0.0
  api_port            : 8000
  frontend_port       : 3000
  database_url        : sqlite:///greenstack.db
  cors_origins        : ['http://localhost:3000', ...]
  log_level           : INFO
  enable_docs         : True
============================================================`}
        </DocsCodeBlock>
      </DocsSection>

      <DocsSection title="Security Best Practices">
        <DocsParagraph>
          Follow these security best practices to protect your Greenstack deployment.
        </DocsParagraph>

        <div className="space-y-4 my-6">
          <DocsCallout type="error" title="Never Commit .env Files">
            <DocsParagraph>
              The .env file should NEVER be committed to version control. It's already included in .gitignore:
            </DocsParagraph>
            <DocsCodeBlock language="bash" className="mt-2">
{`# .gitignore already includes:
.env
.env.local
.env.*.local`}
            </DocsCodeBlock>
          </DocsCallout>

          <DocsCallout type="warning" title="Use Strong Secret Keys">
            <DocsParagraph>
              Always generate secure random keys for production:
            </DocsParagraph>
            <DocsCodeBlock language="bash" className="mt-2">
{`# Generate SECRET_KEY
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"`}
            </DocsCodeBlock>
          </DocsCallout>

          <DocsCallout type="warning" title="Restrict CORS in Production">
            <DocsParagraph>
              Never use wildcards for CORS origins in production:
            </DocsParagraph>
            <DocsCodeBlock language="bash" className="mt-2">
{`# Bad - allows all origins
CORS_ORIGINS=*

# Good - specific domains only
CORS_ORIGINS=https://iodd.example.com,https://www.iodd.example.com`}
            </DocsCodeBlock>
          </DocsCallout>

          <DocsCallout type="warning" title="Disable Debug Mode in Production">
            <DocsCodeBlock language="bash">
{`DEBUG=false
SHOW_ERROR_DETAILS=false
ENABLE_DOCS=false`}
            </DocsCodeBlock>
          </DocsCallout>

          <DocsCallout type="success" title="Use HTTPS in Production">
            <DocsParagraph>
              Always use HTTPS for production deployments:
            </DocsParagraph>
            <DocsCodeBlock language="bash" className="mt-2">
{`# Note: https, not http
CORS_ORIGINS=https://iodd.example.com`}
            </DocsCodeBlock>
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection title="Troubleshooting">
        <DocsParagraph>
          Common configuration issues and their solutions.
        </DocsParagraph>

        <DocsAccordion
          items={[
            {
              title: 'Configuration Not Loading',
              content: (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Problem: Changes to .env file not taking effect</p>
                  <p className="text-sm text-muted-foreground">Solutions:</p>
                  <DocsList
                    items={[
                      'Restart the application completely',
                      'Check .env file location (must be in project root)',
                      'Verify no syntax errors in .env file',
                      'Check file permissions: chmod 600 .env',
                    ]}
                  />
                </div>
              ),
            },
            {
              title: 'Port Already in Use',
              content: (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Problem: "Address already in use" error</p>
                  <p className="text-sm text-muted-foreground">Solutions:</p>
                  <DocsCodeBlock language="bash" title="Option 1: Change Ports">
{`# In .env file
API_PORT=9000
FRONTEND_PORT=4000`}
                  </DocsCodeBlock>
                  <DocsCodeBlock language="bash" title="Option 2: Kill Existing Processes">
{`# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              title: 'Database Permission Errors',
              content: (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Problem: Cannot write to database file</p>
                  <p className="text-sm text-muted-foreground">Solutions:</p>
                  <DocsList
                    items={[
                      'Check directory permissions (must be writable)',
                      'Use absolute path: IODD_DATABASE_URL=sqlite:////var/lib/greenstack/db.sqlite',
                      'Ensure parent directory exists',
                      'Run with appropriate user permissions',
                    ]}
                  />
                </div>
              ),
            },
            {
              title: 'CORS Errors',
              content: (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Problem: CORS errors in browser console</p>
                  <p className="text-sm text-muted-foreground">Solutions:</p>
                  <DocsCodeBlock language="bash" title="Add Frontend URL to CORS">
{`CORS_ORIGINS=http://localhost:3000,http://localhost:5173`}
                  </DocsCodeBlock>
                  <DocsList
                    items={[
                      'Verify origin format (include protocol and port)',
                      'Check API is accessible from frontend',
                      'Restart both frontend and backend after changes',
                    ]}
                  />
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Environment Variables Priority">
        <DocsParagraph>
          Configuration is loaded in this order, with later sources overriding earlier ones:
        </DocsParagraph>

        <div className="my-6 space-y-2">
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface">
            <span className="text-2xl font-bold text-muted-foreground">1</span>
            <div>
              <p className="font-semibold text-sm text-foreground">Default values</p>
              <p className="text-xs text-muted-foreground">Hard-coded in config.py</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">↓ Overrides ↓</div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface">
            <span className="text-2xl font-bold text-muted-foreground">2</span>
            <div>
              <p className="font-semibold text-sm text-foreground">System environment variables</p>
              <p className="text-xs text-muted-foreground">Set via export or system settings</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">↓ Overrides ↓</div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface">
            <span className="text-2xl font-bold text-muted-foreground">3</span>
            <div>
              <p className="font-semibold text-sm text-foreground">.env file</p>
              <p className="text-xs text-muted-foreground">If present in project root</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">↓ Overrides ↓</div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface">
            <span className="text-2xl font-bold text-muted-foreground">4</span>
            <div>
              <p className="font-semibold text-sm text-foreground">Command-line arguments</p>
              <p className="text-xs text-muted-foreground">If supported (highest priority)</p>
            </div>
          </div>
        </div>

        <DocsCodeBlock language="bash" title="Priority Example" className="my-4">
{`# Default value in code
API_PORT=8000

# .env file
API_PORT=9000  # Overrides default

# Environment variable
export API_PORT=10000  # Overrides .env

# Command line
python start.py --api-port 11000  # Overrides all (final value)`}
        </DocsCodeBlock>
      </DocsSection>

      <DocsSection title="Further Reading">
        <DocsParagraph>
          Additional resources for configuration management:
        </DocsParagraph>

        <DocsList
          items={[
            <DocsLink href="https://github.com/theskumar/python-dotenv" external>Python-dotenv Documentation</DocsLink>,
            <DocsLink href="https://12factor.net/config" external>12-Factor App Configuration</DocsLink>,
            <DocsLink href="https://fastapi.tiangolo.com/advanced/settings/" external>FastAPI Settings Management</DocsLink>,
          ]}
          className="my-4"
        />

        <DocsCallout type="info" title="Need Help?">
          <DocsParagraph>
            For configuration issues:
          </DocsParagraph>
          <DocsList
            items={[
              'Check this documentation',
              'Validate configuration: python -c "import config; config.print_config()"',
              'Check logs for error messages',
              'Open an issue on GitHub (redact secrets!)',
            ]}
            className="mt-2"
          />
        </DocsCallout>
      </DocsSection>
    </DocsPage>
  );
}

/**
 * ConfigVar - Configuration Variable Documentation Component
 */
function ConfigVar({ name, description, values, default: defaultValue, format, example, note }) {
  return (
    <div className="border-l-4 border-brand-green pl-4 py-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <code className="text-sm font-mono font-semibold text-brand-green">{name}</code>
          <p className="text-sm text-foreground mt-1">{description}</p>

          {values && (
            <div className="mt-2">
              <span className="text-xs font-semibold text-muted-foreground">Values: </span>
              <span className="text-xs text-foreground">{values.join(', ')}</span>
            </div>
          )}

          {format && (
            <div className="mt-1">
              <span className="text-xs font-semibold text-muted-foreground">Format: </span>
              <code className="text-xs text-foreground">{format}</code>
            </div>
          )}

          {defaultValue && (
            <div className="mt-1">
              <span className="text-xs font-semibold text-muted-foreground">Default: </span>
              <code className="text-xs text-brand-green bg-surface px-1.5 py-0.5 rounded">{defaultValue}</code>
            </div>
          )}

          {example && (
            <div className="mt-2">
              <code className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded block">
                {example}
              </code>
            </div>
          )}

          {note && (
            <div className="mt-2 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground italic">{note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
