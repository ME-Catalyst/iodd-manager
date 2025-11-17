import React from 'react';
import DocsHeading from './DocsHeading';

/**
 * DocsSection - Content section component with optional heading
 *
 * Provides consistent spacing and structure for content sections.
 * Automatically generates anchor links for section headings.
 *
 * @param {Object} props
 * @param {string} props.title - Section title (optional)
 * @param {React.ReactNode} props.children - Section content
 * @param {string} props.id - Anchor ID for linking (auto-generated from title if not provided)
 * @param {string} props.className - Additional CSS classes
 */
const DocsSection = ({ title, children, id, className = '' }) => {
  // Auto-generate ID from title if not provided
  const sectionId = id || (title ? title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : undefined);

  return (
    <section className={`docs-section mb-8 ${className}`} id={sectionId}>
      {title && (
        <DocsHeading level={2} id={sectionId}>
          {title}
        </DocsHeading>
      )}
      <div className="docs-section-content">
        {children}
      </div>
    </section>
  );
};

export default DocsSection;
