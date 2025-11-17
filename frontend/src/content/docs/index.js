/**
 * Documentation Content Registry
 *
 * Central registry for all documentation pages
 * Provides metadata for navigation, search, and rendering
 */

import QuickStart, { metadata as quickStartMeta } from './getting-started/QuickStart';

// Documentation Pages Registry
// Format: { 'page-id': { component, metadata, navigation } }
export const docsRegistry = {
  'getting-started/quick-start': {
    component: QuickStart,
    metadata: quickStartMeta,
    next: {
      id: 'getting-started/installation',
      title: 'Installation Guide'
    }
  },

  // Placeholder pages (will be implemented)
  'getting-started/installation': {
    component: null,
    metadata: {
      id: 'getting-started/installation',
      title: 'Installation Guide',
      description: 'Detailed installation instructions for all platforms',
      category: 'getting-started',
      keywords: ['install', 'setup', 'configure'],
    },
    previous: {
      id: 'getting-started/quick-start',
      title: 'Quick Start'
    },
    next: {
      id: 'getting-started/windows-installation',
      title: 'Windows Installation'
    }
  },

  'getting-started/windows-installation': {
    component: null,
    metadata: {
      id: 'getting-started/windows-installation',
      title: 'Windows Installation',
      description: 'Step-by-step Windows installation guide',
      category: 'getting-started',
      keywords: ['windows', 'install', 'setup'],
    },
    previous: {
      id: 'getting-started/installation',
      title: 'Installation Guide'
    },
    next: {
      id: 'getting-started/docker',
      title: 'Docker Setup'
    }
  },

  'getting-started/docker': {
    component: null,
    metadata: {
      id: 'getting-started/docker',
      title: 'Docker Setup',
      description: 'Deploy Greenstack with Docker',
      category: 'getting-started',
      keywords: ['docker', 'container', 'deployment'],
    },
    previous: {
      id: 'getting-started/windows-installation',
      title: 'Windows Installation'
    }
  },

  'user-guide/web-interface': {
    component: null,
    metadata: {
      id: 'user-guide/web-interface',
      title: 'Web Interface Guide',
      description: 'Navigate and use the Greenstack web interface',
      category: 'user-guide',
      keywords: ['ui', 'interface', 'dashboard', 'navigation'],
    }
  },

  'user-guide/device-management': {
    component: null,
    metadata: {
      id: 'user-guide/device-management',
      title: 'Device Management',
      description: 'Import, view, and manage devices',
      category: 'user-guide',
      keywords: ['device', 'import', 'eds', 'iodd', 'manage'],
    }
  },

  'user-guide/configuration': {
    component: null,
    metadata: {
      id: 'user-guide/configuration',
      title: 'Configuration Reference',
      description: 'Complete guide to Greenstack configuration options',
      category: 'user-guide',
      keywords: ['config', 'settings', 'options', 'environment'],
    }
  },

  'user-guide/features': {
    component: null,
    metadata: {
      id: 'user-guide/features',
      title: 'Features Overview',
      description: 'Explore all Greenstack features',
      category: 'user-guide',
      keywords: ['features', 'capabilities', 'analytics', 'search', 'theme'],
    }
  },

  'api/overview': {
    component: null,
    metadata: {
      id: 'api/overview',
      title: 'API Overview',
      description: 'Introduction to the Greenstack REST API',
      category: 'api-reference',
      keywords: ['api', 'rest', 'http', 'endpoints'],
    }
  },

  'api/authentication': {
    component: null,
    metadata: {
      id: 'api/authentication',
      title: 'Authentication',
      description: 'API authentication and security',
      category: 'api-reference',
      keywords: ['auth', 'security', 'token', 'api-key'],
    }
  },

  'api/endpoints': {
    component: null,
    metadata: {
      id: 'api/endpoints',
      title: 'API Endpoints',
      description: 'Complete API endpoint reference',
      category: 'api-reference',
      keywords: ['endpoints', 'routes', 'api', 'reference'],
    }
  },

  'api/errors': {
    component: null,
    metadata: {
      id: 'api/errors',
      title: 'Error Handling',
      description: 'API error codes and handling',
      category: 'api-reference',
      keywords: ['errors', 'exceptions', 'debugging'],
    }
  },

  'components/gallery': {
    component: null,
    metadata: {
      id: 'components/gallery',
      title: 'Component Gallery',
      description: 'Interactive showcase of all UI components',
      category: 'components',
      keywords: ['components', 'ui', 'library', 'showcase'],
    }
  },

  'components/theme-system': {
    component: null,
    metadata: {
      id: 'components/theme-system',
      title: 'Theme System',
      description: 'Customize Greenstack appearance with themes',
      category: 'components',
      keywords: ['theme', 'colors', 'customization', 'branding'],
    }
  },

  'components/ui-components': {
    component: null,
    metadata: {
      id: 'components/ui-components',
      title: 'UI Components',
      description: 'Reusable UI component reference',
      category: 'components',
      keywords: ['ui', 'components', 'button', 'card', 'dialog'],
    }
  },

  'developer/architecture': {
    component: null,
    metadata: {
      id: 'developer/architecture',
      title: 'System Architecture',
      description: 'Greenstack architecture and design',
      category: 'developer',
      keywords: ['architecture', 'design', 'structure', 'system'],
    }
  },

  'developer/backend': {
    component: null,
    metadata: {
      id: 'developer/backend',
      title: 'Backend Development',
      description: 'Develop and extend the backend API',
      category: 'developer',
      keywords: ['backend', 'api', 'python', 'fastapi', 'development'],
    }
  },

  'developer/frontend': {
    component: null,
    metadata: {
      id: 'developer/frontend',
      title: 'Frontend Development',
      description: 'Develop and extend the frontend',
      category: 'developer',
      keywords: ['frontend', 'react', 'ui', 'development'],
    }
  },

  'developer/testing': {
    component: null,
    metadata: {
      id: 'developer/testing',
      title: 'Testing Guide',
      description: 'Write and run tests for Greenstack',
      category: 'developer',
      keywords: ['testing', 'tests', 'pytest', 'qa'],
    }
  },

  'developer/contributing': {
    component: null,
    metadata: {
      id: 'developer/contributing',
      title: 'Contributing Guide',
      description: 'How to contribute to Greenstack',
      category: 'developer',
      keywords: ['contributing', 'contribute', 'development', 'pull-request'],
    }
  },

  'deployment/production': {
    component: null,
    metadata: {
      id: 'deployment/production',
      title: 'Production Deployment',
      description: 'Deploy Greenstack to production',
      category: 'deployment',
      keywords: ['production', 'deployment', 'hosting'],
    }
  },

  'deployment/docker': {
    component: null,
    metadata: {
      id: 'deployment/docker',
      title: 'Docker Deployment',
      description: 'Containerized deployment with Docker',
      category: 'deployment',
      keywords: ['docker', 'container', 'deployment', 'compose'],
    }
  },

  'deployment/monitoring': {
    component: null,
    metadata: {
      id: 'deployment/monitoring',
      title: 'Monitoring & Logging',
      description: 'Monitor and debug Greenstack in production',
      category: 'deployment',
      keywords: ['monitoring', 'logging', 'debugging', 'metrics'],
    }
  },

  'troubleshooting/common-issues': {
    component: null,
    metadata: {
      id: 'troubleshooting/common-issues',
      title: 'Common Issues',
      description: 'Solutions to common problems',
      category: 'troubleshooting',
      keywords: ['troubleshooting', 'issues', 'problems', 'solutions'],
    }
  },

  'troubleshooting/debugging': {
    component: null,
    metadata: {
      id: 'troubleshooting/debugging',
      title: 'Debugging Guide',
      description: 'How to debug Greenstack issues',
      category: 'troubleshooting',
      keywords: ['debugging', 'debug', 'troubleshoot', 'logs'],
    }
  },

  'troubleshooting/faq': {
    component: null,
    metadata: {
      id: 'troubleshooting/faq',
      title: 'FAQ',
      description: 'Frequently asked questions',
      category: 'troubleshooting',
      keywords: ['faq', 'questions', 'answers', 'help'],
    }
  },
};

// Export helper functions

/**
 * Get page by ID
 */
export const getPage = (pageId) => {
  return docsRegistry[pageId] || null;
};

/**
 * Get all pages in a category
 */
export const getPagesByCategory = (category) => {
  return Object.entries(docsRegistry)
    .filter(([_, page]) => page.metadata.category === category)
    .map(([id, page]) => ({ id, ...page }));
};

/**
 * Search pages
 */
export const searchPages = (query) => {
  const lowerQuery = query.toLowerCase();
  return Object.entries(docsRegistry)
    .filter(([_, page]) => {
      const { title, description, keywords = [] } = page.metadata;
      return (
        title.toLowerCase().includes(lowerQuery) ||
        description?.toLowerCase().includes(lowerQuery) ||
        keywords.some(k => k.toLowerCase().includes(lowerQuery))
      );
    })
    .map(([id, page]) => ({ id, ...page }));
};

/**
 * Get all categories
 */
export const getCategories = () => {
  const categories = new Set();
  Object.values(docsRegistry).forEach(page => {
    if (page.metadata.category) {
      categories.add(page.metadata.category);
    }
  });
  return Array.from(categories);
};

export default docsRegistry;
