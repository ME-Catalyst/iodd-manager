import React from 'react';
import { Shield, Key, Lock, AlertTriangle, CheckCircle, Code } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '../../../components/ui';

export const metadata = {
  id: 'api/authentication',
  title: 'API Authentication',
  description: 'Learn about API authentication, security, and access control in Greenstack',
  category: 'api-reference',
  order: 2,
  keywords: ['authentication', 'security', 'api-key', 'auth', 'cors', 'access'],
  lastUpdated: '2025-01-17',
};

export default function Authentication({ onNavigate }) {
  return (
    <DocsPage>
      <DocsHero
        title="API Authentication & Security"
        description="Understanding Greenstack's API security model and best practices"
        icon={<Shield className="w-12 h-12 text-brand-green" />}
      />

      {/* Current Status */}
      <DocsSection title="Authentication Status" icon={<Key />}>
        <DocsCallout type="info" title="Development Mode">
          <DocsParagraph>
            Greenstack currently runs in <strong>development mode</strong> with authentication disabled
            by default. This allows for easy local development and testing.
          </DocsParagraph>
        </DocsCallout>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-green" />
                Development Mode
              </CardTitle>
              <CardDescription>Default configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-foreground text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>No authentication required</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>CORS enabled for localhost</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>Easy API testing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span>Perfect for local development</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-warning" />
                Production Mode
              </CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-foreground text-sm">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                  <span>API key authentication (planned)</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                  <span>JWT tokens (planned)</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                  <span>Role-based access control (planned)</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                  <span>Rate limiting per user (planned)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* CORS Configuration */}
      <DocsSection title="CORS Configuration" icon={<Shield />}>
        <DocsParagraph>
          Cross-Origin Resource Sharing (CORS) is configured to allow requests from the frontend during development:
        </DocsParagraph>

        <DocsCodeBlock language="python">
{`# Default CORS configuration (src/config.py)
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

CORS_METHODS = ["GET", "POST", "DELETE", "OPTIONS"]
CORS_CREDENTIALS = True`}
        </DocsCodeBlock>

        <DocsParagraph className="mt-4">
          To customize CORS origins, set the <code>CORS_ORIGINS</code> environment variable:
        </DocsParagraph>

        <DocsCodeBlock language="bash">
{`# .env file
CORS_ORIGINS=http://localhost:5173,https://your-domain.com

# Or via Docker
docker run -e CORS_ORIGINS="http://localhost:5173,https://your-domain.com" ...`}
        </DocsCodeBlock>

        <DocsCallout type="warning" title="Production Security">
          <DocsParagraph>
            For production deployments, restrict CORS origins to only your trusted domains.
            Never use <code>*</code> as an origin in production.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      {/* Rate Limiting */}
      <DocsSection title="Rate Limiting">
        <DocsParagraph>
          Greenstack includes rate limiting to prevent abuse and ensure fair resource usage:
        </DocsParagraph>

        <Card className="my-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>Default</Badge>
                  <code className="px-2 py-1 bg-surface-active rounded text-sm font-mono">10 requests per minute</code>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Applied to upload endpoints (IODD/EDS file uploads)
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>Global</Badge>
                  <code className="px-2 py-1 bg-surface-active rounded text-sm font-mono">100 requests per minute</code>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Applied to general API endpoints (GET, POST, DELETE)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DocsParagraph>
          Rate limits are tracked per IP address. If exceeded, you'll receive a <code>429 Too Many Requests</code> response.
        </DocsParagraph>

        <DocsCodeBlock language="json">
{`// 429 Response
{
  "detail": "Rate limit exceeded: 10 per 1 minute"
}`}
        </DocsCodeBlock>
      </DocsSection>

      {/* Security Best Practices */}
      <DocsSection title="Security Best Practices" icon={<Lock />}>
        <Card className="my-6">
          <CardHeader>
            <CardTitle>Recommended Security Measures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Use HTTPS in Production</h4>
                  <p className="text-sm text-muted-foreground">
                    Always deploy behind a reverse proxy (Nginx/Traefik) with SSL/TLS certificates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Restrict CORS Origins</h4>
                  <p className="text-sm text-muted-foreground">
                    Only allow requests from your trusted frontend domains. Never use wildcard (*) in production.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Use Firewall Rules</h4>
                  <p className="text-sm text-muted-foreground">
                    Restrict API access to specific IP ranges or VPN networks for internal deployments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Monitor Access Logs</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable logging and monitor for unusual patterns or excessive request rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Keep Dependencies Updated</h4>
                  <p className="text-sm text-muted-foreground">
                    Regularly update Python and Node.js dependencies to patch security vulnerabilities.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DocsSection>

      {/* Input Validation */}
      <DocsSection title="Input Validation & Sanitization" icon={<Code />}>
        <DocsParagraph>
          Greenstack includes built-in protection against common security threats:
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green" />
                SQL Injection Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All database queries use SQLAlchemy ORM with parameterized queries,
                preventing SQL injection attacks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green" />
                XSS Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                React automatically escapes all rendered content, preventing cross-site scripting attacks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green" />
                File Upload Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Uploaded files are validated for type (ZIP/XML/EDS), scanned, and processed in isolated temp directories.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green" />
                Request Size Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Maximum upload size of 10MB by default, configurable via <code>MAX_UPLOAD_SIZE</code> environment variable.
              </p>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Future Authentication */}
      <DocsSection title="Future Authentication Plans">
        <DocsParagraph>
          Authentication features planned for future releases:
        </DocsParagraph>

        <DocsCallout type="info" title="Roadmap">
          <ul className="list-disc list-inside space-y-2 text-foreground">
            <li><strong>API Keys:</strong> Generate and manage API keys for programmatic access</li>
            <li><strong>JWT Tokens:</strong> Token-based authentication with expiration</li>
            <li><strong>User Management:</strong> Create users, assign roles, manage permissions</li>
            <li><strong>OAuth2:</strong> Integration with external identity providers</li>
            <li><strong>Audit Logging:</strong> Track all API access and changes</li>
            <li><strong>Two-Factor Authentication:</strong> Optional 2FA for enhanced security</li>
          </ul>
        </DocsCallout>

        <DocsParagraph className="mt-4">
          Want to contribute? See the <DocsLink href="/docs/developer/contributing" external={false} onNavigate={onNavigate}>
          Contributing Guide</DocsLink> or open an issue on <DocsLink href="https://github.com/ME-Catalyst/greenstack" external>
          GitHub</DocsLink>.
        </DocsParagraph>
      </DocsSection>

      {/* Related Resources */}
      <DocsSection title="Related Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <DocsLink href="/docs/api/overview" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">API Overview</h5>
            <p className="text-sm text-muted-foreground">Learn about the REST API structure</p>
          </DocsLink>

          <DocsLink href="/docs/api/errors" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Error Handling</h5>
            <p className="text-sm text-muted-foreground">Understand API error responses</p>
          </DocsLink>

          <DocsLink href="/docs/user-guide/configuration" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Configuration</h5>
            <p className="text-sm text-muted-foreground">Configure security settings</p>
          </DocsLink>

          <DocsLink href="/docs/deployment/production" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Production Deployment</h5>
            <p className="text-sm text-muted-foreground">Deploy securely to production</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
