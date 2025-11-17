import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * DocsAccordion - Collapsible content sections
 *
 * Features:
 * - Expandable/collapsible sections
 * - Smooth animations
 * - Multiple sections can be open simultaneously
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - DocsAccordionItem components
 * @param {string} props.className - Additional CSS classes
 */
const DocsAccordion = ({ children, className = '' }) => {
  return (
    <div className={`docs-accordion space-y-2 mb-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * DocsAccordionItem - Individual accordion item
 *
 * @param {Object} props
 * @param {string} props.title - Item title
 * @param {React.ReactNode} props.children - Item content
 * @param {boolean} props.defaultOpen - Whether item is open by default
 */
export const DocsAccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-surface hover:bg-surface-hover transition-colors"
      >
        <span className="font-medium text-foreground">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-3 border-t border-border bg-background">
          {children}
        </div>
      )}
    </div>
  );
};

export default DocsAccordion;
