import React from 'react';
import { Package, Download, Terminal, CheckCircle, AlertCircle, Code } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsTabs, { DocsTab } from '../../../components/docs/DocsTabs';
import DocsSteps, { DocsStep } from '../../../components/docs/DocsSteps';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsLink } from '../../../components/docs/DocsText';
import DocsFlowchart from '../../../components/docs/DocsFlowchart';

export const metadata = {
  id: 'getting-started/installation',
  title: 'Installation Guide',
  description: 'Install Greenstack on your system using pip, Docker, or from source',
  category: 'getting-started',
  order: 2,
  keywords: ['installation', 'install', 'setup', 'pip', 'docker', 'python', 'deploy'],
  lastUpdated: '2025-01-16',
};

export default function Installation() {
  return (
    <DocsPage>
      <DocsHero
        title="Installation Guide"
        description="Install Greenstack on your system using pip, Docker, or from source"
        icon={<Download className="w-12 h-12 text-brand-green" />}
      />

      <DocsSection title="System Requirements">
        <DocsParagraph>
          Before installing Greenstack, ensure your system meets the following requirements:
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-brand-green" />
              Backend Requirements
            </h4>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Python 3.10 or higher</li>
              <li>• pip package manager</li>
              <li>• 512MB RAM minimum (1GB recommended)</li>
              <li>• 500MB disk space</li>
            </ul>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Code className="w-5 h-5 text-brand-green" />
              Frontend Requirements (Development)
            </h4>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Node.js 18 or higher</li>
              <li>• npm or yarn package manager</li>
              <li>• Modern web browser</li>
              <li>• 1GB RAM for build process</li>
            </ul>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Installation Methods">
        <DocsTabs>
          <DocsTab label="PyPI Package" icon={<Package className="w-4 h-4" />}>
            <DocsParagraph>
              The easiest way to install Greenstack is using pip from PyPI:
            </DocsParagraph>

            <DocsCodeBlock language="bash" copy>
{`# Install Greenstack
pip install greenstack

# Verify installation
greenstack --version`}
            </DocsCodeBlock>

            <DocsCallout type="tip" title="Virtual Environment Recommended">
              <DocsParagraph>
                We recommend using a virtual environment to avoid conflicts with other Python packages:
              </DocsParagraph>
              <DocsCodeBlock language="bash" copy>
{`python -m venv greenstack-env
source greenstack-env/bin/activate  # On Windows: greenstack-env\\Scripts\\activate
pip install greenstack`}
              </DocsCodeBlock>
            </DocsCallout>

            <DocsSteps>
              <DocsStep number={1} title="Create Virtual Environment">
                <DocsParagraph>
                  Create an isolated Python environment for Greenstack:
                </DocsParagraph>
                <DocsCodeBlock language="bash">
{`python -m venv greenstack-env`}
                </DocsCodeBlock>
              </DocsStep>

              <DocsStep number={2} title="Activate Environment">
                <DocsParagraph>
                  Activate the virtual environment:
                </DocsParagraph>
                <DocsCodeBlock language="bash">
{`# Linux/macOS
source greenstack-env/bin/activate

# Windows
greenstack-env\\Scripts\\activate`}
                </DocsCodeBlock>
              </DocsStep>

              <DocsStep number={3} title="Install Greenstack">
                <DocsParagraph>
                  Install Greenstack and its dependencies:
                </DocsParagraph>
                <DocsCodeBlock language="bash">
{`pip install greenstack`}
                </DocsCodeBlock>
              </DocsStep>

              <DocsStep number={4} title="Run Greenstack">
                <DocsParagraph>
                  Start the Greenstack server:
                </DocsParagraph>
                <DocsCodeBlock language="bash">
{`greenstack-api`}
                </DocsCodeBlock>
              </DocsStep>
            </DocsSteps>
          </DocsTab>

          <DocsTab label="Docker" icon={<Package className="w-4 h-4" />}>
            <DocsParagraph>
              Deploy Greenstack using Docker for a containerized, production-ready setup:
            </DocsParagraph>

            <DocsCodeBlock language="bash" copy>
{`# Pull the latest image
docker pull ghcr.io/me-catalyst/greenstack:latest

# Run Greenstack
docker run -d \\
  -p 8000:8000 \\
  -v greenstack-data:/data \\
  --name greenstack \\
  ghcr.io/me-catalyst/greenstack:latest`}
            </DocsCodeBlock>

            <DocsCallout type="info" title="Docker Compose">
              <DocsParagraph>
                For a complete IoT platform with Grafana, InfluxDB, and Node-RED:
              </DocsParagraph>
              <DocsCodeBlock language="bash" copy>
{`# Download docker-compose.yml
wget https://raw.githubusercontent.com/ME-Catalyst/greenstack/main/docker-compose.iot.yml

# Start all services
docker-compose -f docker-compose.iot.yml up -d`}
              </DocsCodeBlock>
            </DocsCallout>

            <DocsSection title="Docker Environment Variables">
              <DocsParagraph>
                Configure Greenstack using environment variables:
              </DocsParagraph>
              <DocsCodeBlock language="bash">
{`docker run -d \\
  -p 8000:8000 \\
  -e ENVIRONMENT=production \\
  -e DEBUG=false \\
  -e API_PORT=8000 \\
  -e IODD_DATABASE_URL=sqlite:////data/iodd_manager.db \\
  -v greenstack-data:/data \\
  ghcr.io/me-catalyst/greenstack:latest`}
              </DocsCodeBlock>
            </DocsSection>
          </DocsTab>

          <DocsTab label="From Source" icon={<Code className="w-4 h-4" />}>
            <DocsParagraph>
              Install Greenstack from source for development or customization:
            </DocsParagraph>

            <DocsCodeBlock language="bash" copy>
{`# Clone the repository
git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack

# Run setup script
./scripts/setup.sh  # Linux/macOS
# or
.\\scripts\\setup.bat  # Windows`}
            </DocsCodeBlock>

            <DocsSection title="Manual Setup from Source">
              <DocsSteps>
                <DocsStep number={1} title="Clone Repository">
                  <DocsCodeBlock language="bash">
{`git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack`}
                  </DocsCodeBlock>
                </DocsStep>

                <DocsStep number={2} title="Install Backend Dependencies">
                  <DocsCodeBlock language="bash">
{`pip install -r requirements.txt`}
                  </DocsCodeBlock>
                </DocsStep>

                <DocsStep number={3} title="Initialize Database">
                  <DocsCodeBlock language="bash">
{`alembic upgrade head`}
                  </DocsCodeBlock>
                </DocsStep>

                <DocsStep number={4} title="Install Frontend Dependencies (Optional)">
                  <DocsParagraph>
                    For development with hot reload:
                  </DocsParagraph>
                  <DocsCodeBlock language="bash">
{`cd frontend
npm install
npm run dev`}
                  </DocsCodeBlock>
                </DocsStep>

                <DocsStep number={5} title="Start Backend Server">
                  <DocsCodeBlock language="bash">
{`# In the root directory
python -m src.api`}
                  </DocsCodeBlock>
                </DocsStep>
              </DocsSteps>
            </DocsSection>
          </DocsTab>
        </DocsTabs>
      </DocsSection>

      <DocsSection title="Post-Installation">
        <DocsParagraph>
          After installation, verify that Greenstack is running correctly:
        </DocsParagraph>

        <DocsCallout type="success" title="Verify Installation">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open your browser to <DocsLink href="http://localhost:8000/docs" external={false}>http://localhost:8000/docs</DocsLink></li>
            <li>You should see the FastAPI interactive documentation</li>
            <li>Navigate to <DocsLink href="http://localhost:5173" external={false}>http://localhost:5173</DocsLink> for the web interface (if running from source)</li>
            <li>Check the API health endpoint: <DocsLink href="http://localhost:8000/api/health" external={false}>http://localhost:8000/api/health</DocsLink></li>
          </ol>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Troubleshooting">
        <DocsCallout type="warning" title="Common Issues">
          <DocsParagraph>
            If you encounter issues during installation:
          </DocsParagraph>
          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
            <li>Ensure Python 3.10+ is installed: <code className="text-xs bg-surface px-1 py-0.5 rounded">python --version</code></li>
            <li>Update pip: <code className="text-xs bg-surface px-1 py-0.5 rounded">pip install --upgrade pip</code></li>
            <li>Check port 8000 is not in use by another application</li>
            <li>On Windows, run terminal as Administrator if permission errors occur</li>
          </ul>
        </DocsCallout>

        <DocsParagraph>
          For more help, see the <DocsLink href="/docs/troubleshooting/common-issues" external={false}>Troubleshooting Guide</DocsLink> or <DocsLink href="https://github.com/ME-Catalyst/greenstack/issues">open an issue on GitHub</DocsLink>.
        </DocsParagraph>
      </DocsSection>

      <DocsSection title="Installation Process Overview">
        <DocsParagraph>
          Here's a visual overview of the typical installation process:
        </DocsParagraph>

        <DocsFlowchart.Container
          title="Greenstack Installation Flow"
          description="Step-by-step installation process from requirements to running application"
        >
          <DocsFlowchart.Step type="start" title="Start" description="Begin installation" />

          <DocsFlowchart.Connector />

          <DocsFlowchart.Step type="process" title="Check Requirements" description="Python 3.10+, pip, Node.js (optional)" />

          <DocsFlowchart.Connector />

          <DocsFlowchart.Step type="decision" title="Method?" description="Choose installation method" />

          <DocsFlowchart.Branch>
            <DocsFlowchart.Path label="pip" variant="success">
              <DocsFlowchart.Step type="process" title="Install with pip" description="pip install greenstack" />
              <DocsFlowchart.Connector />
              <DocsFlowchart.Step type="success" title="Ready" description="Run greenstack-api" />
            </DocsFlowchart.Path>

            <DocsFlowchart.Path label="Docker" variant="success">
              <DocsFlowchart.Step type="process" title="Pull Docker Image" description="docker pull ghcr.io/..." />
              <DocsFlowchart.Connector />
              <DocsFlowchart.Step type="success" title="Ready" description="Run container" />
            </DocsFlowchart.Path>

            <DocsFlowchart.Path label="Source" variant="success">
              <DocsFlowchart.Step type="process" title="Clone Repository" description="git clone ..." />
              <DocsFlowchart.Connector />
              <DocsFlowchart.Step type="process" title="Install Dependencies" description="pip install -r requirements.txt" />
              <DocsFlowchart.Connector />
              <DocsFlowchart.Step type="success" title="Ready" description="Run python api.py" />
            </DocsFlowchart.Path>
          </DocsFlowchart.Branch>

          <DocsFlowchart.Connector />

          <DocsFlowchart.Step type="process" title="Access Application" description="Open http://localhost:8000" />

          <DocsFlowchart.Connector />

          <DocsFlowchart.Step type="end" title="Complete" description="Installation successful!" />
        </DocsFlowchart.Container>
      </DocsSection>

      <DocsSection title="Next Steps">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/docs/getting-started/quick-start" className="border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <CheckCircle className="w-8 h-8 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground mb-1">Quick Start</h4>
            <p className="text-sm text-muted-foreground">Get up and running in 5 minutes</p>
          </a>

          <a href="/docs/user-guide/configuration" className="border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <Terminal className="w-8 h-8 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground mb-1">Configuration</h4>
            <p className="text-sm text-muted-foreground">Configure Greenstack for your needs</p>
          </a>

          <a href="/docs/user-guide/web-interface" className="border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <Code className="w-8 h-8 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground mb-1">Web Interface</h4>
            <p className="text-sm text-muted-foreground">Learn about the web UI features</p>
          </a>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
