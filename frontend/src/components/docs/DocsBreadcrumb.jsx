import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * DocsBreadcrumb - Breadcrumb Navigation
 *
 * Features:
 * - Shows current location in docs hierarchy
 * - Clickable navigation path
 * - Compact, clean design
 */

const DocsBreadcrumb = ({ activePage }) => {
  // Parse breadcrumb from activePage path
  const parts = activePage.split('/');
  const breadcrumbs = parts.map((part, index) => {
    const path = parts.slice(0, index + 1).join('/');
    // Convert kebab-case to Title Case
    const title = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      id: path,
      title,
      isLast: index === parts.length - 1
    };
  });

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Home className="w-4 h-4 text-muted-foreground" />

      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span
            className={
              crumb.isLast
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground cursor-pointer'
            }
          >
            {crumb.title}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default DocsBreadcrumb;
