import React from 'react';

/**
 * DocsParagraph - Enhanced paragraph component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Paragraph content
 * @param {string} props.className - Additional CSS classes
 */
export const DocsParagraph = ({ children, className = '' }) => {
  return (
    <p className={`text-foreground leading-relaxed mb-4 ${className}`}>
      {children}
    </p>
  );
};

/**
 * DocsList - Styled list component (ul/ol)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - List items
 * @param {boolean} props.ordered - Whether list is ordered (ol) or unordered (ul)
 * @param {string} props.className - Additional CSS classes
 */
export const DocsList = ({ children, ordered = false, className = '' }) => {
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag className={`text-foreground mb-4 space-y-2 ${ordered ? 'list-decimal' : 'list-disc'} list-inside ${className}`}>
      {children}
    </ListTag>
  );
};

/**
 * DocsTable - Responsive table component with sorting support
 *
 * @param {Object} props
 * @param {Array} props.headers - Table headers
 * @param {Array} props.rows - Table rows (array of arrays)
 * @param {string} props.className - Additional CSS classes
 */
export const DocsTable = ({ headers, rows, className = '' }) => {
  return (
    <div className={`docs-table overflow-x-auto mb-6 ${className}`}>
      <table className="min-w-full border border-border rounded-lg overflow-hidden">
        <thead className="bg-surface">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-background">
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-surface/30'}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-foreground border-b border-border"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * DocsLink - External link component with icon
 *
 * @param {Object} props
 * @param {string} props.href - Link URL
 * @param {React.ReactNode} props.children - Link text
 * @param {boolean} props.external - Whether link is external (opens in new tab)
 * @param {string} props.className - Additional CSS classes
 */
export const DocsLink = ({ href, children, external = true, className = '' }) => {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`text-brand-green hover:text-brand-green-hover underline decoration-brand-green/30 hover:decoration-brand-green transition-colors ${className}`}
    >
      {children}
    </a>
  );
};

/**
 * DocsInternalLink - Internal navigation link
 *
 * @param {Object} props
 * @param {string} props.to - Internal path
 * @param {React.ReactNode} props.children - Link text
 * @param {string} props.className - Additional CSS classes
 */
export const DocsInternalLink = ({ to, children, className = '' }) => {
  const handleClick = (e) => {
    e.preventDefault();
    // This will be handled by the DocsViewer navigation
    window.dispatchEvent(new CustomEvent('docs-navigate', { detail: { path: to } }));
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={`text-brand-green hover:text-brand-green-hover underline decoration-brand-green/30 hover:decoration-brand-green transition-colors ${className}`}
    >
      {children}
    </a>
  );
};
