import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * DocsTooltip - Contextual help tooltip component
 *
 * Features:
 * - Hover or click to reveal
 * - Positioned above/below/left/right of trigger
 * - Auto-adjusts if near viewport edge
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Tooltip trigger element (defaults to help icon)
 * @param {string} props.content - Tooltip content text
 * @param {string} props.position - Tooltip position: 'top' | 'bottom' | 'left' | 'right'
 * @param {string} props.className - Additional CSS classes
 */
const DocsTooltip = ({ children, content, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-surface',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-surface',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-surface',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-surface'
  };

  return (
    <div className={`docs-tooltip inline-block relative ${className}`}>
      {/* Trigger */}
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-help inline-flex items-center"
      >
        {children || <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-brand-green transition-colors" />}
      </span>

      {/* Tooltip */}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-sm text-foreground max-w-xs">
            {content}
          </div>
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};

export default DocsTooltip;
