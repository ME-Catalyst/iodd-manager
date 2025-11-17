/**
 * Documentation Content Registry
 *
 * Central registry for all documentation pages
 * Provides metadata for navigation, search, and rendering
 *
 * Uses React.lazy for code splitting and performance optimization
 */

import { lazy } from 'react';

// Lazy load all documentation components
const QuickStart = lazy(() => import('./getting-started/QuickStart'));
const Installation = lazy(() => import('./getting-started/Installation'));
const WindowsInstallation = lazy(() => import('./getting-started/WindowsInstallation'));
const DockerSetup = lazy(() => import('./getting-started/DockerSetup'));
const Features = lazy(() => import('./user-guide/Features'));
const DeviceManagement = lazy(() => import('./user-guide/DeviceManagement'));
const Configuration = lazy(() => import('./user-guide/Configuration'));
const WebInterface = lazy(() => import('./user-guide/WebInterface'));
const Troubleshooting = lazy(() => import('./user-guide/Troubleshooting'));
const ApiOverview = lazy(() => import('./api/Overview'));
const ApiEndpoints = lazy(() => import('./api/Endpoints'));
const ApiAuthentication = lazy(() => import('./api/Authentication'));
const ApiErrors = lazy(() => import('./api/Errors'));
const ComponentsOverview = lazy(() => import('./components/Overview'));
const ComponentsGallery = lazy(() => import('./components/Gallery'));
const ComponentsThemeSystem = lazy(() => import('./components/ThemeSystem'));
const ComponentsUIComponents = lazy(() => import('./components/UIComponents'));
const DeveloperOverview = lazy(() => import('./developer/Overview'));
const DeveloperArchitecture = lazy(() => import('./developer/Architecture'));
const DeveloperTesting = lazy(() => import('./developer/Testing'));
const DeveloperContributing = lazy(() => import('./developer/Contributing'));
const BackendDevelopment = lazy(() => import('./developer/Backend'));
const FrontendDevelopment = lazy(() => import('./developer/Frontend'));
const ArchitectureOverview = lazy(() => import('./architecture/Overview'));
const ProductionGuide = lazy(() => import('./deployment/ProductionGuide'));
const DockerDeployment = lazy(() => import('./deployment/DockerDeployment'));
const MonitoringLogging = lazy(() => import('./deployment/MonitoringLogging'));
const CommonIssues = lazy(() => import('./troubleshooting/CommonIssues'));
const DebuggingGuide = lazy(() => import('./troubleshooting/DebuggingGuide'));
const FAQ = lazy(() => import('./troubleshooting/FAQ'));

// Import metadata synchronously (metadata is lightweight)
export { metadata as quickStartMeta } from './getting-started/QuickStart';
export { metadata as installationMeta } from './getting-started/Installation';
export { metadata as windowsInstallationMeta } from './getting-started/WindowsInstallation';
export { metadata as dockerSetupMeta } from './getting-started/DockerSetup';
export { metadata as featuresMeta } from './user-guide/Features';
export { metadata as deviceManagementMeta } from './user-guide/DeviceManagement';
export { metadata as configurationMeta } from './user-guide/Configuration';
export { metadata as webInterfaceMeta } from './user-guide/WebInterface';
export { metadata as troubleshootingMeta } from './user-guide/Troubleshooting';
export { metadata as apiOverviewMeta } from './api/Overview';
export { metadata as apiEndpointsMeta } from './api/Endpoints';
export { metadata as apiAuthenticationMeta } from './api/Authentication';
export { metadata as apiErrorsMeta } from './api/Errors';
export { metadata as componentsOverviewMeta } from './components/Overview';
export { metadata as componentsGalleryMeta } from './components/Gallery';
export { metadata as componentsThemeSystemMeta } from './components/ThemeSystem';
export { metadata as componentsUIComponentsMeta } from './components/UIComponents';
export { metadata as developerOverviewMeta } from './developer/Overview';
export { metadata as developerArchitectureMeta } from './developer/Architecture';
export { metadata as developerTestingMeta } from './developer/Testing';
export { metadata as developerContributingMeta } from './developer/Contributing';
export { metadata as backendDevelopmentMeta } from './developer/Backend';
export { metadata as frontendDevelopmentMeta } from './developer/Frontend';
export { metadata as architectureOverviewMeta } from './architecture/Overview';
export { metadata as productionGuideMeta } from './deployment/ProductionGuide';
export { metadata as dockerDeploymentMeta } from './deployment/DockerDeployment';
export { metadata as monitoringLoggingMeta } from './deployment/MonitoringLogging';
export { metadata as commonIssuesMeta } from './troubleshooting/CommonIssues';
export { metadata as debuggingGuideMeta } from './troubleshooting/DebuggingGuide';
export { metadata as faqMeta } from './troubleshooting/FAQ';

// Import metadata for registry
import { metadata as quickStartMeta } from './getting-started/QuickStart';
import { metadata as installationMeta } from './getting-started/Installation';
import { metadata as windowsInstallationMeta } from './getting-started/WindowsInstallation';
import { metadata as dockerSetupMeta } from './getting-started/DockerSetup';
import { metadata as featuresMeta } from './user-guide/Features';
import { metadata as deviceManagementMeta } from './user-guide/DeviceManagement';
import { metadata as configurationMeta } from './user-guide/Configuration';
import { metadata as webInterfaceMeta } from './user-guide/WebInterface';
import { metadata as troubleshootingMeta } from './user-guide/Troubleshooting';
import { metadata as apiOverviewMeta } from './api/Overview';
import { metadata as apiEndpointsMeta } from './api/Endpoints';
import { metadata as apiAuthenticationMeta } from './api/Authentication';
import { metadata as apiErrorsMeta } from './api/Errors';
import { metadata as componentsOverviewMeta } from './components/Overview';
import { metadata as componentsGalleryMeta } from './components/Gallery';
import { metadata as componentsThemeSystemMeta } from './components/ThemeSystem';
import { metadata as componentsUIComponentsMeta } from './components/UIComponents';
import { metadata as developerOverviewMeta } from './developer/Overview';
import { metadata as developerArchitectureMeta } from './developer/Architecture';
import { metadata as developerTestingMeta } from './developer/Testing';
import { metadata as developerContributingMeta } from './developer/Contributing';
import { metadata as backendDevelopmentMeta } from './developer/Backend';
import { metadata as frontendDevelopmentMeta } from './developer/Frontend';
import { metadata as architectureOverviewMeta } from './architecture/Overview';
import { metadata as productionGuideMeta } from './deployment/ProductionGuide';
import { metadata as dockerDeploymentMeta } from './deployment/DockerDeployment';
import { metadata as monitoringLoggingMeta } from './deployment/MonitoringLogging';
import { metadata as commonIssuesMeta } from './troubleshooting/CommonIssues';
import { metadata as debuggingGuideMeta } from './troubleshooting/DebuggingGuide';
import { metadata as faqMeta } from './troubleshooting/FAQ';

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

  'getting-started/installation': {
    component: Installation,
    metadata: installationMeta,
    previous: {
      id: 'getting-started/quick-start',
      title: 'Quick Start'
    },
    next: {
      id: 'user-guide/web-interface',
      title: 'Web Interface Guide'
    }
  },

  'getting-started/windows-installation': {
    component: WindowsInstallation,
    metadata: windowsInstallationMeta,
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
    component: DockerSetup,
    metadata: dockerSetupMeta,
    previous: {
      id: 'getting-started/windows-installation',
      title: 'Windows Installation'
    },
    next: {
      id: 'user-guide/features',
      title: 'Features Overview'
    }
  },

  'user-guide/features': {
    component: Features,
    metadata: featuresMeta,
    previous: {
      id: 'getting-started/docker',
      title: 'Docker Setup'
    },
    next: {
      id: 'user-guide/device-management',
      title: 'Device Management'
    }
  },

  'user-guide/device-management': {
    component: DeviceManagement,
    metadata: deviceManagementMeta,
    previous: {
      id: 'user-guide/features',
      title: 'Features Overview'
    },
    next: {
      id: 'user-guide/web-interface',
      title: 'Web Interface Guide'
    }
  },

  'user-guide/web-interface': {
    component: WebInterface,
    metadata: webInterfaceMeta,
    previous: {
      id: 'user-guide/device-management',
      title: 'Device Management'
    },
    next: {
      id: 'user-guide/configuration',
      title: 'Configuration Reference'
    }
  },

  'user-guide/configuration': {
    component: Configuration,
    metadata: configurationMeta,
    previous: {
      id: 'user-guide/web-interface',
      title: 'Web Interface Guide'
    },
    next: {
      id: 'user-guide/troubleshooting',
      title: 'Troubleshooting'
    }
  },

  'user-guide/troubleshooting': {
    component: Troubleshooting,
    metadata: troubleshootingMeta,
    previous: {
      id: 'user-guide/configuration',
      title: 'Configuration Reference'
    },
    next: {
      id: 'api/overview',
      title: 'API Overview'
    }
  },

  'api/overview': {
    component: ApiOverview,
    metadata: apiOverviewMeta,
    previous: {
      id: 'user-guide/troubleshooting',
      title: 'Troubleshooting'
    },
    next: {
      id: 'api/endpoints',
      title: 'API Endpoints Reference'
    }
  },

  'api/endpoints': {
    component: ApiEndpoints,
    metadata: apiEndpointsMeta,
    previous: {
      id: 'api/overview',
      title: 'API Overview'
    },
    next: {
      id: 'api/authentication',
      title: 'API Authentication'
    }
  },

  'api/authentication': {
    component: ApiAuthentication,
    metadata: apiAuthenticationMeta,
    previous: {
      id: 'api/endpoints',
      title: 'API Endpoints Reference'
    },
    next: {
      id: 'api/errors',
      title: 'Error Handling'
    }
  },

  'api/errors': {
    component: ApiErrors,
    metadata: apiErrorsMeta,
    previous: {
      id: 'api/authentication',
      title: 'API Authentication'
    },
    next: {
      id: 'components/overview',
      title: 'Component Gallery'
    }
  },

  'components/overview': {
    component: ComponentsOverview,
    metadata: componentsOverviewMeta,
    previous: {
      id: 'api/errors',
      title: 'Error Handling'
    },
    next: {
      id: 'components/gallery',
      title: 'Component Gallery'
    }
  },

  'components/gallery': {
    component: ComponentsGallery,
    metadata: componentsGalleryMeta,
    previous: {
      id: 'components/overview',
      title: 'Component Gallery Overview'
    },
    next: {
      id: 'components/theme-system',
      title: 'Theme System'
    }
  },

  'components/theme-system': {
    component: ComponentsThemeSystem,
    metadata: componentsThemeSystemMeta,
    previous: {
      id: 'components/gallery',
      title: 'Component Gallery'
    },
    next: {
      id: 'components/ui-components',
      title: 'UI Components Reference'
    }
  },

  'components/ui-components': {
    component: ComponentsUIComponents,
    metadata: componentsUIComponentsMeta,
    previous: {
      id: 'components/theme-system',
      title: 'Theme System'
    },
    next: {
      id: 'developer/overview',
      title: 'Developer Guide'
    }
  },

  'developer/overview': {
    component: DeveloperOverview,
    metadata: developerOverviewMeta,
    previous: {
      id: 'components/ui-components',
      title: 'UI Components Reference'
    },
    next: {
      id: 'developer/architecture',
      title: 'System Architecture'
    }
  },

  'developer/architecture': {
    component: DeveloperArchitecture,
    metadata: developerArchitectureMeta,
    previous: {
      id: 'developer/overview',
      title: 'Developer Guide'
    },
    next: {
      id: 'developer/backend',
      title: 'Backend Development'
    }
  },

  'developer/backend': {
    component: BackendDevelopment,
    metadata: backendDevelopmentMeta,
    previous: {
      id: 'developer/architecture',
      title: 'System Architecture'
    },
    next: {
      id: 'developer/frontend',
      title: 'Frontend Development'
    }
  },

  'developer/frontend': {
    component: FrontendDevelopment,
    metadata: frontendDevelopmentMeta,
    previous: {
      id: 'developer/backend',
      title: 'Backend Development'
    },
    next: {
      id: 'developer/testing',
      title: 'Testing Guide'
    }
  },

  'developer/testing': {
    component: DeveloperTesting,
    metadata: developerTestingMeta,
    previous: {
      id: 'developer/frontend',
      title: 'Frontend Development'
    },
    next: {
      id: 'developer/contributing',
      title: 'Contributing Guide'
    }
  },

  'developer/contributing': {
    component: DeveloperContributing,
    metadata: developerContributingMeta,
    previous: {
      id: 'developer/testing',
      title: 'Testing Guide'
    },
    next: {
      id: 'architecture/overview',
      title: 'Architecture Overview'
    }
  },

  'architecture/overview': {
    component: ArchitectureOverview,
    metadata: architectureOverviewMeta,
    previous: {
      id: 'developer/frontend',
      title: 'Frontend Development'
    },
    next: {
      id: 'deployment/production',
      title: 'Production Deployment'
    }
  },

  'deployment/production': {
    component: ProductionGuide,
    metadata: productionGuideMeta,
    previous: {
      id: 'architecture/overview',
      title: 'System Architecture'
    },
    next: {
      id: 'deployment/docker',
      title: 'Docker Deployment'
    }
  },

  'deployment/docker': {
    component: DockerDeployment,
    metadata: dockerDeploymentMeta,
    previous: {
      id: 'deployment/production',
      title: 'Production Deployment'
    },
    next: {
      id: 'deployment/monitoring',
      title: 'Monitoring & Logging'
    }
  },

  'deployment/monitoring': {
    component: MonitoringLogging,
    metadata: monitoringLoggingMeta,
    previous: {
      id: 'deployment/docker',
      title: 'Docker Deployment'
    },
    next: {
      id: 'troubleshooting/common-issues',
      title: 'Common Issues'
    }
  },

  'troubleshooting/common-issues': {
    component: CommonIssues,
    metadata: commonIssuesMeta,
    previous: {
      id: 'deployment/monitoring',
      title: 'Monitoring & Logging'
    },
    next: {
      id: 'troubleshooting/debugging',
      title: 'Debugging Guide'
    }
  },

  'troubleshooting/debugging': {
    component: DebuggingGuide,
    metadata: debuggingGuideMeta,
    previous: {
      id: 'troubleshooting/common-issues',
      title: 'Common Issues'
    },
    next: {
      id: 'troubleshooting/faq',
      title: 'FAQ'
    }
  },

  'troubleshooting/faq': {
    component: FAQ,
    metadata: faqMeta,
    previous: {
      id: 'troubleshooting/debugging',
      title: 'Debugging Guide'
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
