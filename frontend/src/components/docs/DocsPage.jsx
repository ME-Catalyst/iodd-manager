import React from 'react';

/**
 * DocsPage - Main wrapper component for documentation pages
 *
 * Provides consistent layout, spacing, and structure for all documentation content.
 * Handles responsive layout and ensures proper typography scaling.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.className - Additional CSS classes
 */
const DocsPage = ({ children, className = '' }) => {
  return (
    <div className={`docs-page w-full ${className}`}>
      <article className="prose prose-slate dark:prose-invert max-w-none">
        {children}
      </article>
    </div>
  );
};

export default DocsPage;
