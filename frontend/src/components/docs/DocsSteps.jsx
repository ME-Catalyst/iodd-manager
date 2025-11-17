import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * DocsSteps - Step-by-step guide component
 *
 * Features:
 * - Numbered steps with visual connectors
 * - Clear visual hierarchy
 * - Support for titles and detailed content
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - DocsStep components
 * @param {string} props.className - Additional CSS classes
 */
const DocsSteps = ({ children, className = '' }) => {
  return (
    <div className={`docs-steps space-y-6 mb-8 ${className}`}>
      {children}
    </div>
  );
};

/**
 * DocsStep - Individual step component
 *
 * @param {Object} props
 * @param {number} props.number - Step number
 * @param {string} props.title - Step title
 * @param {React.ReactNode} props.children - Step content
 * @param {boolean} props.completed - Whether step is marked as completed
 */
export const DocsStep = ({ number, title, children, completed = false }) => {
  return (
    <div className="docs-step flex gap-4">
      {/* Step number/icon */}
      <div className="flex-shrink-0">
        {completed ? (
          <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center">
            <span className="text-sm font-semibold text-brand-green">{number}</span>
          </div>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 pt-0.5">
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <div className="text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DocsSteps;
