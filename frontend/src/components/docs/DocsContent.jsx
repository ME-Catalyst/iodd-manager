import React from 'react';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Alert, AlertTitle, AlertDescription } from '../ui';

/**
 * DocsContent - Main Content Renderer
 *
 * Features:
 * - Renders documentation page content
 * - Previous/Next navigation
 * - Error boundaries
 * - Loading states
 */

const DocsContent = ({ page, activePage, onNavigate }) => {
  // Handle missing page
  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="w-16 h-16 text-warning mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The documentation page you're looking for doesn't exist yet.
        </p>
        <Button onClick={() => onNavigate('getting-started/quick-start')}>
          Go to Quick Start
        </Button>
      </div>
    );
  }

  const PageComponent = page.component;

  return (
    <div className="docs-content">
      {/* Render page component */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {PageComponent ? (
          <PageComponent onNavigate={onNavigate} />
        ) : (
          <Alert variant="warning">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Component Missing</AlertTitle>
            <AlertDescription>
              This page doesn't have a component defined yet.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center justify-between">
          {page.previous ? (
            <Button
              variant="ghost"
              onClick={() => onNavigate(page.previous.id)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Previous</div>
                <div className="text-sm font-medium">{page.previous.title}</div>
              </div>
            </Button>
          ) : (
            <div />
          )}

          {page.next && (
            <Button
              variant="ghost"
              onClick={() => onNavigate(page.next.id)}
              className="flex items-center gap-2"
            >
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Next</div>
                <div className="text-sm font-medium">{page.next.title}</div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Last Updated */}
      {page.metadata?.lastUpdated && (
        <div className="mt-8 text-sm text-muted-foreground text-center">
          Last updated: {page.metadata.lastUpdated}
        </div>
      )}
    </div>
  );
};

export default DocsContent;
