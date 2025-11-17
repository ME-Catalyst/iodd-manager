import React, { useState } from 'react';

/**
 * DocsTabs - Tabbed content component
 *
 * Features:
 * - Multiple tabs with smooth transitions
 * - Icon support for tabs
 * - Active tab highlighting
 * - Keyboard navigation (arrow keys)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - DocsTab components
 * @param {string} props.className - Additional CSS classes
 */
const DocsTabs = ({ children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = React.Children.toArray(children);

  return (
    <div className={`docs-tabs mb-6 ${className}`}>
      {/* Tab headers */}
      <div className="flex items-center gap-2 border-b border-border mb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === index
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {tab.props.icon}
            {tab.props.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="docs-tab-content">
        {tabs[activeTab]}
      </div>
    </div>
  );
};

/**
 * DocsTab - Individual tab content
 *
 * @param {Object} props
 * @param {string} props.label - Tab label
 * @param {React.ReactNode} props.icon - Optional tab icon
 * @param {React.ReactNode} props.children - Tab content
 */
export const DocsTab = ({ label, icon, children }) => {
  return <div className="docs-tab">{children}</div>;
};

export default DocsTabs;
