import React from 'react';

/**
 * DocsHero - Page header component for documentation pages
 *
 * Displays a prominent page title, description, and optional icon.
 * Provides visual hierarchy and context for documentation pages.
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description/subtitle
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {string} props.className - Additional CSS classes
 */
const DocsHero = ({ title, description, icon, className = '' }) => {
  return (
    <div className={`docs-hero mb-8 pb-6 border-b border-border ${className}`}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocsHero;
