import React from 'react';
import { Server, Upload, Search, Trash2, FileText, Package, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsList, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsSteps from '../../../components/docs/DocsSteps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '../../../components/ui';

export const metadata = {
  id: 'user-guide/device-management',
  title: 'Device Management',
  description: 'Managing IO-Link (IODD) and EtherNet/IP (EDS) device configurations in Greenstack',
  category: 'user-guide',
  order: 2,
  keywords: ['device management', 'iodd', 'eds', 'io-link', 'ethernet/ip', 'upload', 'configuration'],
  lastUpdated: '2025-01-17',
};

export default function DeviceManagement({ onNavigate }) {
  return (
    <DocsPage>
      <DocsHero
        title="Device Management"
        description="Upload, manage, and configure IO-Link (IODD) and EtherNet/IP (EDS) device files"
        icon={<Server className="w-12 h-12 text-brand-green" />}
      />

      {/* Overview */}
      <DocsSection title="Overview">
        <DocsParagraph>
          Greenstack provides comprehensive device management capabilities for industrial IoT devices.
          The platform supports two major industrial communication protocols with full configuration management.
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge>IO-Link</Badge>
                IODD Files
              </CardTitle>
              <CardDescription>IO Device Descriptions for IO-Link devices</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>XML-based device descriptions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>Full parameter configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>ZIP package support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>Interactive menu rendering</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge>EtherNet/IP</Badge>
                EDS Files
              </CardTitle>
              <CardDescription>Electronic Data Sheets for EtherNet/IP devices</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>INI-based configuration files</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>Assembly and module parsing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>Parameter extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>Connection configuration</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Uploading Devices */}
      <DocsSection title="Uploading Device Files" icon={<Upload />}>
        <DocsParagraph>
          Greenstack supports multiple upload methods for both IODD and EDS files, including single files,
          ZIP packages, and nested archives.
        </DocsParagraph>

        <DocsSteps
          steps={[
            {
              title: 'Navigate to Device Library',
              description: 'Access the device management interface',
              content: (
                <div>
                  <DocsParagraph>
                    From the main dashboard, click <strong>Devices</strong> in the navigation menu to access
                    the device library page.
                  </DocsParagraph>
                </div>
              )
            },
            {
              title: 'Choose Upload Method',
              description: 'Select how to upload your device files',
              content: (
                <div>
                  <DocsParagraph className="mb-3">
                    Greenstack supports three upload methods:
                  </DocsParagraph>
                  <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
                    <li><strong>Drag & Drop:</strong> Drag files or folders directly onto the upload area</li>
                    <li><strong>File Picker:</strong> Click "Choose Files" to browse your file system</li>
                    <li><strong>API Upload:</strong> Use the REST API for programmatic uploads</li>
                  </ul>
                </div>
              )
            },
            {
              title: 'Upload Files',
              description: 'Upload your IODD or EDS files',
              content: (
                <DocsCodeBlock language="bash">
{`# API Upload Example
curl -X POST http://localhost:8000/api/iodds/upload \\
  -F "file=@device.xml"

# Upload ZIP package
curl -X POST http://localhost:8000/api/iodds/upload \\
  -F "file=@device-package.zip"

# Response
{
  "status": "success",
  "device_id": 12345,
  "vendor": "IFM Electronic",
  "product_name": "IO-Link Sensor"
}`}
                </DocsCodeBlock>
              )
            },
            {
              title: 'Verify Upload',
              description: 'Confirm the device was added successfully',
              content: (
                <DocsParagraph>
                  After uploading, the device will appear in the device library with full metadata,
                  parameters, and configuration options. You can view details, export configurations,
                  or delete the device.
                </DocsParagraph>
              )
            }
          ]}
        />

        <DocsCallout type="info" title="Supported File Types">
          <ul className="list-disc ml-6 space-y-1 text-foreground">
            <li><strong>IODD Files:</strong> .xml, .zip (IO-Link Device Descriptions)</li>
            <li><strong>EDS Files:</strong> .eds, .zip (EtherNet/IP Electronic Data Sheets)</li>
            <li><strong>Archives:</strong> .zip packages with nested files and folders</li>
          </ul>
        </DocsCallout>
      </DocsSection>

      {/* Searching & Filtering */}
      <DocsSection title="Searching & Filtering Devices" icon={<Search />}>
        <DocsParagraph>
          Quickly find devices using powerful search and filtering capabilities.
        </DocsParagraph>

        <div className="my-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search by Keyword</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph className="mb-3">
                Search across device names, manufacturers, product codes, and descriptions:
              </DocsParagraph>
              <DocsCodeBlock language="javascript">
{`// Web Interface: Type in search box
"ifm sensor" → Finds all IFM sensors
"temperature" → Finds all temperature devices
"OI5000" → Finds devices with product code OI5000

// API Search
GET /api/iodds/search?query=ifm+sensor`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
                <li><strong>Manufacturer:</strong> Filter by device vendor (e.g., IFM, Balluff, Sick)</li>
                <li><strong>Device Type:</strong> Filter by protocol (IO-Link, EtherNet/IP)</li>
                <li><strong>I/O Configuration:</strong> Filter by input/output types (DI, DO, AI, AO)</li>
                <li><strong>Status:</strong> Filter by upload status, validation state</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sort & Organize</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsParagraph>
                Sort devices by name, manufacturer, upload date, or device ID. Use table or card view
                for different visualization preferences.
              </DocsParagraph>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Viewing Device Details */}
      <DocsSection title="Viewing Device Details">
        <DocsParagraph>
          Click any device to view comprehensive details including parameters, I/O configuration,
          and technical specifications.
        </DocsParagraph>

        <div className="my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Device Information Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="outline">1</Badge>
                    General Information
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Manufacturer, product name, device ID, vendor ID, description, and product URLs
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="outline">2</Badge>
                    I/O Configuration
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Digital inputs (DI), digital outputs (DO), analog inputs (AI), analog outputs (AO)
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="outline">3</Badge>
                    Parameters & Variables
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Configurable parameters with data types, ranges, access levels, and default values
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="outline">4</Badge>
                    Technical Specifications
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Communication settings, process data, diagnostics, and device capabilities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DocsCallout type="success" title="Interactive Configuration">
          <DocsParagraph>
            For IODD devices, Greenstack renders interactive configuration menus based on the device
            description, allowing you to visualize and modify parameters with real-time validation.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      {/* Exporting Configurations */}
      <DocsSection title="Exporting Device Data" icon={<FileText />}>
        <DocsParagraph>
          Export device configurations and metadata in multiple formats for integration with other systems.
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-3 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">JSON Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Full device data in JSON format for API integration
              </p>
              <DocsCodeBlock language="bash">
{`GET /api/iodds/123/export?format=json`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">XML Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Original IODD XML file with all device metadata
              </p>
              <DocsCodeBlock language="bash">
{`GET /api/iodds/123/export?format=xml`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">CSV Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Parameter list in CSV for spreadsheet analysis
              </p>
              <DocsCodeBlock language="bash">
{`GET /api/iodds/123/export?format=csv`}
              </DocsCodeBlock>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Deleting Devices */}
      <DocsSection title="Deleting Devices" icon={<Trash2 />}>
        <DocsParagraph>
          Remove devices from the library when they're no longer needed.
        </DocsParagraph>

        <DocsCallout type="warning" title="Permanent Deletion">
          <DocsParagraph>
            Deleting a device permanently removes all associated data including parameters, configurations,
            and metadata. This action cannot be undone.
          </DocsParagraph>
        </DocsCallout>

        <div className="my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delete Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-sm text-foreground mb-2">Web Interface</h5>
                  <ol className="list-decimal ml-6 text-sm text-muted-foreground space-y-1">
                    <li>Navigate to device details page</li>
                    <li>Click the "Delete" button in the actions menu</li>
                    <li>Confirm deletion in the dialog</li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-semibold text-sm text-foreground mb-2">API Method</h5>
                  <DocsCodeBlock language="bash">
{`# Delete device by ID
DELETE /api/iodds/123

# Response
{
  "status": "success",
  "message": "Device deleted successfully"
}`}
                  </DocsCodeBlock>
                </div>

                <div>
                  <h5 className="font-semibold text-sm text-foreground mb-2">Bulk Deletion</h5>
                  <p className="text-sm text-muted-foreground">
                    Select multiple devices in the library view and use the bulk delete action to remove
                    multiple devices at once.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Best Practices */}
      <DocsSection title="Best Practices">
        <div className="space-y-4 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-green" />
                Organizing Your Device Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
                <li>Use consistent naming conventions for device descriptions</li>
                <li>Upload complete ZIP packages when available (includes images, docs)</li>
                <li>Verify device details after upload to ensure correct parsing</li>
                <li>Export configurations regularly for backup purposes</li>
                <li>Remove obsolete or duplicate device entries</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-green" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
                <li>Upload devices in batches during off-peak hours for large deployments</li>
                <li>Use API uploads for automating device library updates</li>
                <li>Enable database indexing for faster search on large libraries (1000+ devices)</li>
                <li>Consider PostgreSQL over SQLite for deployments with extensive device catalogs</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
                <li><strong>Upload fails:</strong> Check file format, size limits (10MB default), and XML validation</li>
                <li><strong>Missing parameters:</strong> Ensure IODD/EDS file version is supported</li>
                <li><strong>Duplicate devices:</strong> Delete existing device before uploading new version</li>
                <li><strong>Parsing errors:</strong> Verify file encoding is UTF-8 and XML is well-formed</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Related Resources */}
      <DocsSection title="Related Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <DocsLink href="/docs/api/endpoints" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">API Endpoints</h5>
            <p className="text-sm text-muted-foreground">Complete API reference for device management</p>
          </DocsLink>

          <DocsLink href="/docs/user-guide/web-interface" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Web Interface Guide</h5>
            <p className="text-sm text-muted-foreground">Learn about the dashboard and UI features</p>
          </DocsLink>

          <DocsLink href="/docs/troubleshooting/common-issues" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Troubleshooting</h5>
            <p className="text-sm text-muted-foreground">Solutions to common device upload issues</p>
          </DocsLink>

          <DocsLink href="/docs/developer/backend" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Backend Development</h5>
            <p className="text-sm text-muted-foreground">Extend device parsing and management features</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
