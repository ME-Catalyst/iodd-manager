import React from 'react';
import { Rocket, Package, Cloud, Code, CheckCircle, ArrowRight, Terminal, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Alert, AlertTitle, AlertDescription, Badge } from '../../../components/ui';

/**
 * Quick Start Documentation Page
 *
 * Demonstrates the documentation component structure
 */

export const metadata = {
  id: 'getting-started/quick-start',
  title: 'Quick Start Guide',
  description: 'Get up and running with Greenstack in 5 minutes',
  category: 'getting-started',
  order: 1,
  keywords: ['quickstart', 'setup', 'installation', 'begin', 'start'],
  lastUpdated: '2025-01-16',
  author: 'Greenstack Team'
};

const QuickStart = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-green/10 mb-4">
          <Rocket className="w-8 h-8 text-brand-green" />
        </div>
        <h1 id="quick-start-guide" className="text-4xl font-bold text-foreground mb-4">
          Quick Start Guide
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get up and running with Greenstack in just 5 minutes. Follow this guide to install and start using the platform.
        </p>
      </div>

      {/* Prerequisites */}
      <section>
        <h2 id="prerequisites" className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-brand-green" />
          Prerequisites
        </h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Python 3.10+</strong>
                  <p className="text-sm text-muted-foreground">Required for running the backend API</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Node.js 18+</strong>
                  <p className="text-sm text-muted-foreground">Optional, only needed for frontend development</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Docker</strong>
                  <p className="text-sm text-muted-foreground">Optional, for containerized deployment</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Installation Methods */}
      <section>
        <h2 id="installation" className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-green" />
          Installation
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {/* PyPI */}
          <Card className="hover:border-brand-green/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-brand-green" />
                <Badge>Recommended</Badge>
              </div>
              <CardTitle>PyPI Package</CardTitle>
              <CardDescription>Install via Python package manager</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-surface-active p-4 rounded-lg mb-4">
                <code className="text-sm font-mono text-foreground">
                  pip install greenstack<br />
                  greenstack-api
                </code>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Easiest way to get started. Installs all dependencies automatically.
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => onNavigate('getting-started/installation')}
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Docker */}
          <Card className="hover:border-brand-green/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Cloud className="w-8 h-8 text-brand-green" />
                <Badge variant="outline">Production</Badge>
              </div>
              <CardTitle>Docker</CardTitle>
              <CardDescription>Containerized deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-surface-active p-4 rounded-lg mb-4">
                <code className="text-sm font-mono text-foreground text-wrap break-all">
                  docker pull ghcr.io/me-catalyst/greenstack:latest
                </code>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Best for production deployments with full IoT stack.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('getting-started/docker')}
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Source */}
          <Card className="hover:border-brand-green/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Code className="w-8 h-8 text-brand-green" />
                <Badge variant="outline">Development</Badge>
              </div>
              <CardTitle>From Source</CardTitle>
              <CardDescription>Clone and build locally</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-surface-active p-4 rounded-lg mb-4">
                <code className="text-sm font-mono text-foreground">
                  git clone ...<br />
                  ./setup.sh
                </code>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                For development and customization.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('getting-started/installation')}
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* First Steps */}
      <section>
        <h2 id="first-steps" className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Terminal className="w-6 h-6 text-brand-green" />
          First Steps
        </h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-green text-white font-bold">
                  1
                </div>
                <CardTitle>Access the Web Interface</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Open your browser and navigate to the web interface:
              </p>
              <div className="flex items-center gap-2 p-4 bg-surface-active rounded-lg">
                <Globe className="w-5 h-5 text-brand-green" />
                <code className="text-foreground font-mono">http://localhost:5173</code>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-green text-white font-bold">
                  2
                </div>
                <CardTitle>Import Your First Device</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Navigate to the Admin Console and upload an EDS or IODD file to get started.
              </p>
              <Alert>
                <CheckCircle className="w-4 h-4 text-brand-green" />
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                  You can import single files, ZIP packages, or even nested archives.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-green text-white font-bold">
                  3
                </div>
                <CardTitle>Explore Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Check out the device catalog, search functionality, and analytics dashboard.
              </p>
              <Button onClick={() => onNavigate('user-guide/features')}>
                Explore Features
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Callout */}
      <Alert className="bg-brand-green/10 border-brand-green/50">
        <CheckCircle className="w-5 h-5 text-brand-green" />
        <AlertTitle className="text-brand-green">You're All Set!</AlertTitle>
        <AlertDescription className="text-foreground">
          Continue to the{' '}
          <button
            onClick={() => onNavigate('user-guide/web-interface')}
            className="underline font-medium text-brand-green hover:text-brand-green/80"
          >
            Web Interface Guide
          </button>
          {' '}to learn more about using Greenstack.
        </AlertDescription>
      </Alert>

      {/* Next Steps */}
      <section>
        <h3 id="next-steps" className="text-xl font-bold text-foreground mb-4">Next Steps</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:border-brand-green/50 transition-colors cursor-pointer"
                onClick={() => onNavigate('user-guide/configuration')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Configuration
                <ArrowRight className="w-5 h-5 text-brand-green" />
              </CardTitle>
              <CardDescription>
                Learn how to configure Greenstack for your needs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-brand-green/50 transition-colors cursor-pointer"
                onClick={() => onNavigate('developer/architecture')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Architecture
                <ArrowRight className="w-5 h-5 text-brand-green" />
              </CardTitle>
              <CardDescription>
                Understand the system architecture and components
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default QuickStart;
