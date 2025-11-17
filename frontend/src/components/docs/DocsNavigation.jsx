import React, { useState } from 'react';
import {
  Book, BookOpen, Code, Wrench, Rocket, Settings, HelpCircle,
  ChevronRight, ChevronDown, Search, FileText, Package, Server,
  Palette, Shield, Database, Cloud, Terminal, Layout
} from 'lucide-react';
import { ScrollArea } from '../ui';

/**
 * DocsNavigation - Left Sidebar Navigation Tree
 *
 * Features:
 * - Hierarchical navigation structure
 * - Collapsible sections
 * - Active page highlighting
 * - Category icons
 * - Smooth scrolling
 */

// Navigation structure with icons
const navigationStructure = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    children: [
      { id: 'getting-started/quick-start', title: 'Quick Start', icon: Zap },
      { id: 'getting-started/installation', title: 'Installation', icon: Package },
      { id: 'getting-started/windows-installation', title: 'Windows Setup', icon: Terminal },
      { id: 'getting-started/docker', title: 'Docker Setup', icon: Cloud },
    ]
  },
  {
    id: 'user-guide',
    title: 'User Guide',
    icon: BookOpen,
    children: [
      { id: 'user-guide/web-interface', title: 'Web Interface', icon: Layout },
      { id: 'user-guide/device-management', title: 'Device Management', icon: Server },
      { id: 'user-guide/configuration', title: 'Configuration', icon: Settings },
      { id: 'user-guide/features', title: 'Features', icon: Sparkles },
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    children: [
      { id: 'api/overview', title: 'Overview', icon: FileText },
      { id: 'api/authentication', title: 'Authentication', icon: Shield },
      { id: 'api/endpoints', title: 'Endpoints', icon: Server },
      { id: 'api/errors', title: 'Error Handling', icon: AlertCircle },
    ]
  },
  {
    id: 'components',
    title: 'Components',
    icon: Palette,
    children: [
      { id: 'components/gallery', title: 'Component Gallery', icon: Grid },
      { id: 'components/theme-system', title: 'Theme System', icon: Palette },
      { id: 'components/ui-components', title: 'UI Components', icon: Box },
    ]
  },
  {
    id: 'developer',
    title: 'Developer',
    icon: Wrench,
    children: [
      { id: 'developer/architecture', title: 'Architecture', icon: Database },
      { id: 'developer/backend', title: 'Backend Development', icon: Server },
      { id: 'developer/frontend', title: 'Frontend Development', icon: Code },
      { id: 'developer/testing', title: 'Testing', icon: CheckCircle },
      { id: 'developer/contributing', title: 'Contributing', icon: GitBranch },
    ]
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: Cloud,
    children: [
      { id: 'deployment/production', title: 'Production', icon: Server },
      { id: 'deployment/docker', title: 'Docker', icon: Package },
      { id: 'deployment/monitoring', title: 'Monitoring', icon: Activity },
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: HelpCircle,
    children: [
      { id: 'troubleshooting/common-issues', title: 'Common Issues', icon: AlertTriangle },
      { id: 'troubleshooting/debugging', title: 'Debugging', icon: Bug },
      { id: 'troubleshooting/faq', title: 'FAQ', icon: HelpCircle },
    ]
  },
];

const NavItem = ({ item, activePage, onNavigate, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = item.icon || FileText;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activePage === item.id;
  const isParentActive = hasChildren && item.children.some(child => child.id === activePage);

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
          isActive
            ? 'bg-brand-green/10 text-brand-green font-medium'
            : isParentActive
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
        }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {!hasChildren && level > 0 && (
          <span className="flex-shrink-0 w-4" />
        )}
        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-green' : ''}`} />
        <span className="flex-1 text-left truncate">{item.title}</span>
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children.map(child => (
            <NavItem
              key={child.id}
              item={child}
              activePage={activePage}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DocsNavigation = ({ activePage, onNavigate }) => {
  const [searchFocus, setSearchFocus] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Book className="w-5 h-5 text-brand-green" />
          <h2 className="font-semibold text-foreground">Documentation</h2>
        </div>

        {/* Search hint */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            searchFocus
              ? 'border-brand-green bg-brand-green/5'
              : 'border-border bg-surface hover:bg-surface-hover'
          }`}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1">Search docs...</span>
          <kbd className="px-2 py-0.5 text-xs font-mono bg-background border border-border rounded">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Navigation Tree */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-6">
          {navigationStructure.map(section => (
            <div key={section.id}>
              <NavItem
                item={section}
                activePage={activePage}
                onNavigate={onNavigate}
                level={0}
              />
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Greenstack Documentation</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default DocsNavigation;
