import React from 'react';
import { FileCode, Database, Search, Palette, Wrench, Ticket, Server, Package } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph } from '../../../components/docs/DocsText';
import DocsTabs, { DocsTab } from '../../../components/docs/DocsTabs';
import DocsAccordion, { DocsAccordionItem } from '../../../components/docs/DocsAccordion';

export const metadata = {
  id: 'api/endpoints',
  title: 'API Endpoints Reference',
  description: 'Detailed reference for all 142 Greenstack API endpoints with request/response examples',
  category: 'api',
  order: 2,
  keywords: ['api', 'endpoints', 'reference', 'rest', 'http', 'requests'],
  lastUpdated: '2025-01-17',
};

export default function ApiEndpoints() {
  return (
    <DocsPage>
      <DocsHero
        title="API Endpoints Reference"
        description="Detailed reference for all 142 Greenstack API endpoints with request/response examples"
        icon={<FileCode className="w-12 h-12 text-brand-green" />}
      />

      <DocsSection title="Quick Reference">
        <DocsParagraph>
          All endpoints are organized by feature category. Click any category below to see detailed endpoint information.
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="border border-brand-green/30 rounded-lg p-4 bg-brand-green/5">
            <FileCode className="w-6 h-6 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground">EDS Files</h4>
            <p className="text-2xl font-bold text-brand-green">18</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <Database className="w-6 h-6 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground">Admin</h4>
            <p className="text-2xl font-bold text-brand-green">28</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <Search className="w-6 h-6 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground">Search</h4>
            <p className="text-2xl font-bold text-brand-green">6</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <Palette className="w-6 h-6 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground">Themes</h4>
            <p className="text-2xl font-bold text-brand-green">15</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <Wrench className="w-6 h-6 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground">Services</h4>
            <p className="text-2xl font-bold text-brand-green">52</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <Ticket className="w-6 h-6 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground">Tickets</h4>
            <p className="text-2xl font-bold text-brand-green">12</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <Server className="w-6 h-6 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground">MQTT</h4>
            <p className="text-2xl font-bold text-brand-green">8</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <Package className="w-6 h-6 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground">Config Export</h4>
            <p className="text-2xl font-bold text-brand-green">3</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="EDS Files API">
        <DocsParagraph>
          The EDS API provides comprehensive management of Electronic Data Sheets for EtherNet/IP devices.
        </DocsParagraph>

        <DocsAccordion>
          <DocsAccordionItem title="GET /api/eds - List All EDS Files" defaultOpen>
            <div className="space-y-4">
              <DocsParagraph>
                Retrieve a list of all imported EDS files with metadata and statistics.
              </DocsParagraph>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Request</h5>
                <DocsCodeBlock language="bash">
{`curl -X GET http://localhost:8000/api/eds`}
                </DocsCodeBlock>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Response (200 OK)</h5>
                <DocsCodeBlock language="json">
{`[
  {
    "id": 1,
    "filename": "device-config.eds",
    "vendor": "Rockwell Automation",
    "product_name": "CompactLogix 5380",
    "catalog_number": "5069-L306ER",
    "revision": "1.2",
    "upload_date": "2025-01-17T10:30:00Z",
    "assemblies_count": 12,
    "parameters_count": 156,
    "has_modules": true
  }
]`}
                </DocsCodeBlock>
              </div>
            </div>
          </DocsAccordionItem>

          <DocsAccordionItem title="POST /api/eds/upload - Upload EDS File">
            <div className="space-y-4">
              <DocsParagraph>
                Upload and parse a new EDS file or EDS package (ZIP).
              </DocsParagraph>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Request</h5>
                <DocsCodeBlock language="bash">
{`curl -X POST http://localhost:8000/api/eds/upload \\
  -F "file=@device-config.eds"`}
                </DocsCodeBlock>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Response (201 Created)</h5>
                <DocsCodeBlock language="json">
{`{
  "success": true,
  "message": "EDS file uploaded successfully",
  "file_id": 42,
  "filename": "device-config.eds",
  "parsed": true,
  "assemblies": 12,
  "parameters": 156
}`}
                </DocsCodeBlock>
              </div>

              <DocsCallout type="warning" title="File Size Limits">
                <DocsParagraph>
                  Maximum file size is 50MB for individual EDS files and 100MB for ZIP packages.
                </DocsParagraph>
              </DocsCallout>
            </div>
          </DocsAccordionItem>

          <DocsAccordionItem title="GET /api/eds/{id} - Get EDS Details">
            <div className="space-y-4">
              <DocsParagraph>
                Retrieve complete details for a specific EDS file including all parameters, assemblies, and modules.
              </DocsParagraph>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Request</h5>
                <DocsCodeBlock language="bash">
{`curl -X GET http://localhost:8000/api/eds/42`}
                </DocsCodeBlock>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Response (200 OK)</h5>
                <DocsCodeBlock language="json">
{`{
  "id": 42,
  "filename": "device-config.eds",
  "vendor": "Rockwell Automation",
  "product_name": "CompactLogix 5380",
  "assemblies": [...],
  "parameters": [...],
  "modules": [...]
}`}
                </DocsCodeBlock>
              </div>
            </div>
          </DocsAccordionItem>

          <DocsAccordionItem title="DELETE /api/eds/{id} - Delete EDS File">
            <div className="space-y-4">
              <DocsParagraph>
                Delete an EDS file and all associated data.
              </DocsParagraph>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Request</h5>
                <DocsCodeBlock language="bash">
{`curl -X DELETE http://localhost:8000/api/eds/42`}
                </DocsCodeBlock>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Response (200 OK)</h5>
                <DocsCodeBlock language="json">
{`{
  "success": true,
  "message": "EDS file deleted successfully",
  "deleted_id": 42
}`}
                </DocsCodeBlock>
              </div>
            </div>
          </DocsAccordionItem>
        </DocsAccordion>
      </DocsSection>

      <DocsSection title="Common Response Codes">
        <DocsParagraph>
          All API endpoints follow standard HTTP status codes:
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="border border-border rounded-lg p-4">
            <code className="text-brand-green font-semibold">200 OK</code>
            <p className="text-sm text-muted-foreground mt-1">Request successful</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <code className="text-brand-green font-semibold">201 Created</code>
            <p className="text-sm text-muted-foreground mt-1">Resource created successfully</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <code className="text-warning font-semibold">400 Bad Request</code>
            <p className="text-sm text-muted-foreground mt-1">Invalid request parameters</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <code className="text-warning font-semibold">404 Not Found</code>
            <p className="text-sm text-muted-foreground mt-1">Resource not found</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <code className="text-destructive font-semibold">500 Server Error</code>
            <p className="text-sm text-muted-foreground mt-1">Internal server error</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <code className="text-destructive font-semibold">422 Validation Error</code>
            <p className="text-sm text-muted-foreground mt-1">Request validation failed</p>
          </div>
        </div>

        <DocsCallout type="info" title="Error Response Format">
          <DocsParagraph>
            All error responses follow a consistent format:
          </DocsParagraph>
          <DocsCodeBlock language="json">
{`{
  "detail": "Error message describing what went wrong",
  "status_code": 400
}`}
          </DocsCodeBlock>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Rate Limiting">
        <DocsParagraph>
          API endpoints are rate-limited to ensure fair usage and system stability:
        </DocsParagraph>

        <ul className="list-disc list-inside space-y-2 text-foreground my-4">
          <li>100 requests per minute for read operations (GET)</li>
          <li>20 requests per minute for write operations (POST, PUT, DELETE)</li>
          <li>Rate limit headers are included in all responses</li>
        </ul>

        <DocsCodeBlock language="http">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642435200`}
        </DocsCodeBlock>
      </DocsSection>

      <DocsSection title="Next Steps">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/docs/api/overview" className="border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <FileCode className="w-8 h-8 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground mb-1">API Overview</h4>
            <p className="text-sm text-muted-foreground">High-level API introduction</p>
          </a>

          <a href="http://localhost:8000/docs" className="border border-border rounded-lg p-4 hover:border-brand-green transition-colors" target="_blank" rel="noopener noreferrer">
            <Server className="w-8 h-8 text-brand-green mb-2" />
            <h4 className="font-semibold text-foreground mb-1">Interactive Docs</h4>
            <p className="text-sm text-muted-foreground">Try the API with Swagger UI</p>
          </a>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
