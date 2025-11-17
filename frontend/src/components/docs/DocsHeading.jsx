import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

/**
 * DocsHeading - Auto-anchored heading component
 *
 * Generates headings with automatic anchor links for navigation.
 * Supports h2-h6, with hover-to-reveal link icons.
 *
 * @param {Object} props
 * @param {number} props.level - Heading level (2-6)
 * @param {React.ReactNode} props.children - Heading text
 * @param {string} props.id - Anchor ID (auto-generated from children if not provided)
 * @param {string} props.className - Additional CSS classes
 */
const DocsHeading = ({ level = 2, children, id, className = '' }) => {
  // Auto-generate ID from children if not provided
  const headingId = id || (typeof children === 'string'
    ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    : undefined);

  const HeadingTag = `h${level}`;

  const sizeClasses = {
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
    5: 'text-lg',
    6: 'text-base'
  };

  const marginClasses = {
    2: 'mt-8 mb-4',
    3: 'mt-6 mb-3',
    4: 'mt-5 mb-2',
    5: 'mt-4 mb-2',
    6: 'mt-3 mb-2'
  };

  return (
    <HeadingTag
      id={headingId}
      className={`docs-heading font-semibold text-foreground ${sizeClasses[level]} ${marginClasses[level]} ${className} group flex items-center gap-2`}
    >
      {children}
      {headingId && (
        <a
          href={`#${headingId}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-green hover:text-brand-green-hover"
          aria-label={`Link to ${children}`}
        >
          <LinkIcon className="w-5 h-5" />
        </a>
      )}
    </HeadingTag>
  );
};

export default DocsHeading;
