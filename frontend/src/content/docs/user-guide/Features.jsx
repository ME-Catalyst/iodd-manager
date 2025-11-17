import React from 'react';
import { Sparkles, Server, Globe, Database, Zap, Shield, Palette, BarChart3, Package, Code, Cloud, FileText } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsLink } from '../../../components/docs/DocsText';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '../../../components/ui';

export const metadata = {
  id: 'user-guide/features',
  title: 'Features Overview',
  description: 'Comprehensive overview of Greenstack features and capabilities',
  category: 'user-guide',
  order: 1,
  keywords: ['features', 'capabilities', 'overview', 'functionality'],
  lastUpdated: '2025-01-17',
};

export default function Features({ onNavigate }) {
  return (
    <DocsPage>
      <DocsHero
        title="Features Overview"
        description="Discover the powerful features that make Greenstack the ultimate industrial device management platform"
        icon={<Sparkles className="w-12 h-12 text-brand-green" />}
      />

      {/* Core Features */}
      <DocsSection title="Core Device Management">
        <DocsParagraph>
          Greenstack provides comprehensive device configuration management for industrial IoT protocols.
        </DocsParagraph>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 my-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-6 h-6 text-brand-green" />
                <Badge>Core</Badge>
              </div>
              <CardTitle className="text-base">IO-Link (IODD) Support</CardTitle>
              <CardDescription>Full IO-Link device description management</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• XML parsing and validation</li>
                <li>• Parameter extraction</li>
                <li>• Interactive menu rendering</li>
                <li>• Multi-language support</li>
                <li>• ZIP package handling</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-6 h-6 text-brand-green" />
                <Badge>Core</Badge>
              </div>
              <CardTitle className="text-base">EtherNet/IP (EDS) Support</CardTitle>
              <CardDescription>Complete EDS file parsing</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• INI file parsing</li>
                <li>• Assembly configuration</li>
                <li>• Module parameters</li>
                <li>• Connection data</li>
                <li>• Category organization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-6 h-6 text-brand-green" />
                <Badge>Core</Badge>
              </div>
              <CardTitle className="text-base">Multi-File Import</CardTitle>
              <CardDescription>Flexible file upload options</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Single file upload</li>
                <li>• ZIP package extraction</li>
                <li>• Nested archive support</li>
                <li>• Drag & drop interface</li>
                <li>• Bulk import capability</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Modern Web Interface */}
      <DocsSection title="Modern Web Interface">
        <DocsParagraph>
          Beautiful, responsive interface with advanced visualizations and smooth animations.
        </DocsParagraph>

        <div className="grid gap-6 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-6 h-6 text-brand-green" />
                <Badge variant="secondary">UI/UX</Badge>
              </div>
              <CardTitle className="text-base">React Dashboard</CardTitle>
              <CardDescription>Modern, interactive user interface</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• React 18 with Vite</li>
                <li>• Tailwind CSS styling</li>
                <li>• Radix UI components</li>
                <li>• Framer Motion animations</li>
                <li>• Three.js 3D visualizations</li>
                <li>• Chart.js analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-6 h-6 text-brand-green" />
                <Badge variant="secondary">UI/UX</Badge>
              </div>
              <CardTitle className="text-base">Theme System</CardTitle>
              <CardDescription>Customizable dark/light themes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 4 built-in theme presets</li>
                <li>• Custom theme creation</li>
                <li>• Dark/light mode toggle</li>
                <li>• System preference detection</li>
                <li>• Brand color preservation</li>
                <li>• localStorage persistence</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-6 h-6 text-brand-green" />
                <Badge variant="secondary">UI/UX</Badge>
              </div>
              <CardTitle className="text-base">Analytics Dashboard</CardTitle>
              <CardDescription>Rich data visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Manufacturer distribution charts</li>
                <li>• I/O configuration analysis</li>
                <li>• Parameter statistics</li>
                <li>• Device type breakdowns</li>
                <li>• Real-time metrics</li>
                <li>• Export capabilities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-brand-green" />
                <Badge variant="secondary">UI/UX</Badge>
              </div>
              <CardTitle className="text-base">Interactive Features</CardTitle>
              <CardDescription>Enhanced user experience</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Keyboard shortcuts (20+)</li>
                <li>• Search & filtering</li>
                <li>• Sort & pagination</li>
                <li>• Responsive tables</li>
                <li>• Modal dialogs</li>
                <li>• Toast notifications</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Backend & API */}
      <DocsSection title="Backend & API">
        <DocsParagraph>
          Robust FastAPI backend with comprehensive REST API and database management.
        </DocsParagraph>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 my-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-6 h-6 text-brand-green" />
                <Badge variant="outline">Backend</Badge>
              </div>
              <CardTitle className="text-base">FastAPI Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Python 3.10+</li>
                <li>• Async/await support</li>
                <li>• OpenAPI documentation</li>
                <li>• Type hints & validation</li>
                <li>• Pydantic models</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-6 h-6 text-brand-green" />
                <Badge variant="outline">Backend</Badge>
              </div>
              <CardTitle className="text-base">Database Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• SQLAlchemy ORM</li>
                <li>• SQLite / PostgreSQL</li>
                <li>• Alembic migrations</li>
                <li>• Relationship mapping</li>
                <li>• Query optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-brand-green" />
                <Badge variant="outline">Backend</Badge>
              </div>
              <CardTitle className="text-base">Security Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• CORS configuration</li>
                <li>• Input validation</li>
                <li>• SQL injection prevention</li>
                <li>• File upload limits</li>
                <li>• Request sanitization</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DocsCallout type="info" title="RESTful API">
          <DocsParagraph>
            Complete REST API with 15+ endpoints for device management, search, filtering, and export.
            Full OpenAPI/Swagger documentation available at <code>/docs</code>.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      {/* IoT Foundation */}
      <DocsSection title="Industrial IoT Foundation">
        <DocsParagraph>
          Forward-looking IoT stack ready for device connectivity and real-time monitoring.
        </DocsParagraph>

        <div className="grid gap-6 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-6 h-6 text-brand-green" />
                <Badge variant="destructive">Future</Badge>
              </div>
              <CardTitle className="text-base">MQTT Broker</CardTitle>
              <CardDescription>Eclipse Mosquitto for device messaging</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pre-configured in Docker stack</li>
                <li>• Ready for device pub/sub</li>
                <li>• TLS/SSL support ready</li>
                <li>• WebSocket support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-6 h-6 text-brand-green" />
                <Badge variant="destructive">Future</Badge>
              </div>
              <CardTitle className="text-base">Grafana Dashboards</CardTitle>
              <CardDescription>Data visualization platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pre-installed in stack</li>
                <li>• InfluxDB integration</li>
                <li>• Custom dashboard creation</li>
                <li>• Real-time monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-brand-green" />
                <Badge variant="destructive">Future</Badge>
              </div>
              <CardTitle className="text-base">Node-RED</CardTitle>
              <CardDescription>Visual workflow automation</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Flow-based programming</li>
                <li>• Device automation</li>
                <li>• Protocol conversion</li>
                <li>• Custom integrations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-6 h-6 text-brand-green" />
                <Badge variant="destructive">Future</Badge>
              </div>
              <CardTitle className="text-base">InfluxDB</CardTitle>
              <CardDescription>Time-series data storage</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Optimized for IoT data</li>
                <li>• High-performance writes</li>
                <li>• Data retention policies</li>
                <li>• Query language (InfluxQL)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DocsCallout type="success" title="Ready for Growth">
          <DocsParagraph>
            While device connectivity features are planned for future releases, the complete IoT
            infrastructure is already integrated and ready. The Docker stack includes MQTT, Grafana,
            Node-RED, and InfluxDB, providing a solid foundation for future expansion.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      {/* Developer Features */}
      <DocsSection title="Developer Experience">
        <DocsParagraph>
          Built with developer productivity and code quality in mind.
        </DocsParagraph>

        <div className="grid gap-6 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-green" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 28-page in-platform docs</li>
                <li>• OpenAPI/Swagger specs</li>
                <li>• Mermaid diagrams</li>
                <li>• Code examples</li>
                <li>• Interactive tutorials</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-green" />
                Code Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 65+ pytest tests</li>
                <li>• Black code formatting</li>
                <li>• Ruff linting</li>
                <li>• MyPy type checking</li>
                <li>• ESLint for JavaScript</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-green" />
                Deployment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Docker & docker-compose</li>
                <li>• One-click Windows setup</li>
                <li>• PyPI package available</li>
                <li>• GitHub Actions CI/CD</li>
                <li>• Container registry</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-green" />
                Development Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Hot module replacement</li>
                <li>• Auto-reload backend</li>
                <li>• Database migrations</li>
                <li>• Development server</li>
                <li>• Debug logging</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Unique Capabilities */}
      <DocsSection title="What Makes Greenstack Unique">
        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card className="border-brand-green/20">
            <CardHeader>
              <CardTitle className="text-base">All-in-One Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph className="text-sm">
                Unlike other device management tools, Greenstack combines IODD and EDS support with a
                complete IoT stack, providing everything needed for industrial device management in one platform.
              </DocsParagraph>
            </CardContent>
          </Card>

          <Card className="border-brand-green/20">
            <CardHeader>
              <CardTitle className="text-base">Modern Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph className="text-sm">
                Built with cutting-edge technologies (React 18, FastAPI, Three.js), Greenstack delivers
                performance and user experience that rivals enterprise-grade commercial solutions.
              </DocsParagraph>
            </CardContent>
          </Card>

          <Card className="border-brand-green/20">
            <CardHeader>
              <CardTitle className="text-base">Open Source & Extensible</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph className="text-sm">
                MIT licensed with clean, well-documented code. Easy to customize, extend, and integrate
                with existing systems. Active development and community contributions welcome.
              </DocsParagraph>
            </CardContent>
          </Card>

          <Card className="border-brand-green/20">
            <CardHeader>
              <CardTitle className="text-base">Production Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph className="text-sm">
                Comprehensive testing, security features, deployment options, and monitoring capabilities
                make Greenstack suitable for both development and production environments.
              </DocsParagraph>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Feature Comparison */}
      <DocsSection title="Feature Status">
        <DocsParagraph className="mb-4">
          Overview of current and planned capabilities:
        </DocsParagraph>

        <div className="overflow-x-auto">
          <table className="w-full border border-border">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Feature</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm text-foreground">IODD File Parsing</td>
                <td className="px-4 py-3 text-center"><Badge>Available</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">Full XML parsing with validation</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm text-foreground">EDS File Parsing</td>
                <td className="px-4 py-3 text-center"><Badge>Available</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">Complete INI parsing support</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm text-foreground">Web Dashboard</td>
                <td className="px-4 py-3 text-center"><Badge>Available</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">React UI with 3D visualization</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm text-foreground">REST API</td>
                <td className="px-4 py-3 text-center"><Badge>Available</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">15+ endpoints with OpenAPI docs</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm text-foreground">Device Connectivity</td>
                <td className="px-4 py-3 text-center"><Badge variant="warning">Planned</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">Real-time device communication</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm text-foreground">Authentication</td>
                <td className="px-4 py-3 text-center"><Badge variant="warning">Planned</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">API keys, JWT, OAuth2</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm text-foreground">Rate Limiting</td>
                <td className="px-4 py-3 text-center"><Badge variant="warning">Planned</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">Use reverse proxy for now</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm text-foreground">Telemetry Monitoring</td>
                <td className="px-4 py-3 text-center"><Badge variant="warning">Planned</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">Infrastructure ready (MQTT, Grafana)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* Related Resources */}
      <DocsSection title="Explore Features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
          <DocsLink href="/docs/user-guide/web-interface" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Web Interface</h5>
            <p className="text-sm text-muted-foreground">Explore the dashboard</p>
          </DocsLink>

          <DocsLink href="/docs/user-guide/device-management" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Device Management</h5>
            <p className="text-sm text-muted-foreground">Upload and manage devices</p>
          </DocsLink>

          <DocsLink href="/docs/api/overview" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">API Reference</h5>
            <p className="text-sm text-muted-foreground">Explore the REST API</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
