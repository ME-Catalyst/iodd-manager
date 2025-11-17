# Greenstack Frontend

Modern React-based web interface for the IODD Management System.

## Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Three.js / React Three Fiber** - 3D visualizations
- **Nivo** - Data visualization charts
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Main dashboard component
│   ├── index.css             # Global styles with Tailwind
│   └── components/
│       └── ui.jsx            # Reusable UI components
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── package.json              # Dependencies and scripts
├── .eslintrc.cjs             # ESLint configuration
├── .prettierrc               # Prettier configuration
└── index.vue.html.bak        # Archived Vue.js implementation
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# or
yarn install
```

### Development

```bash
# Start development server (http://localhost:3000)
npm run dev

# Start with API proxy
npm run dev
# API requests to /api/* will be proxied to http://localhost:8000
```

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Features

### Dashboard Tabs

1. **Overview** - System statistics and device summary
2. **Devices** - Device management and detailed view
3. **Generator** - Platform-specific adapter generation
4. **Analytics** - Charts and visualizations

### Key Capabilities

- **Device Management**
  - Upload IODD files (XML or IODD packages)
  - View device parameters and process data
  - Delete devices
  - Export original IODD files

- **Adapter Generation**
  - Generate Node-RED nodes
  - Download generated adapters as ZIP
  - Support for multiple platforms (planned)

- **Visualizations**
  - 3D device representations
  - Network topology graphs
  - Statistical charts (line, radar, heatmap)
  - Real-time metrics

- **User Experience**
  - Dark mode optimized UI
  - Responsive design
  - Drag-and-drop file uploads
  - Code syntax highlighting
  - Toast notifications
  - Keyboard shortcuts

## API Integration

The frontend communicates with the Python FastAPI backend at `http://localhost:8000`.

### API Proxy

Vite development server includes a proxy configuration that forwards `/api/*` requests to the backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

### API Endpoints Used

- `GET /api/health` - Health check
- `GET /api/stats` - System statistics
- `GET /api/iodd` - List all devices
- `GET /api/iodd/{device_id}` - Get device details
- `POST /api/iodd/upload` - Upload IODD file
- `DELETE /api/iodd/{device_id}` - Delete device
- `POST /api/generate/adapter` - Generate adapter
- `GET /api/generate/platforms` - List supported platforms
- `GET /api/generate/{device_id}/{platform}/download` - Download adapter

## Component Library

### UI Components (`src/components/ui.jsx`)

The UI components are built on top of Radix UI primitives and styled with Tailwind CSS:

- **Layout**: Card, Separator, ScrollArea
- **Forms**: Button, Input, Label, Select
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Overlays**: Dialog, Sheet, Tooltip, DropdownMenu
- **Navigation**: Tabs

### Usage Example

```jsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Info</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => console.log('Clicked')}>
          Click Me
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Path Aliases

The project uses Vite path aliases for cleaner imports:

```javascript
// Instead of
import { Button } from '../../../components/ui';

// Use
import { Button } from '@/components/ui';
```

Configured in `vite.config.js`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

## Build Optimization

The production build is optimized with code splitting:

- `react-vendor` - React and ReactDOM
- `3d-vendor` - Three.js and React Three Fiber
- `ui-vendor` - Framer Motion and Lucide icons
- `chart-vendor` - Nivo chart libraries

This ensures smaller initial bundle sizes and better caching.

## Migration from Vue.js

The previous Vue.js implementation has been archived as `index.vue.html.bak`.

**Reasons for migrating to React:**

1. **Ecosystem** - Larger React ecosystem with more libraries
2. **Type Safety** - Better TypeScript support
3. **Performance** - Optimized rendering with React 18
4. **Developer Experience** - Modern tooling with Vite
5. **Component Library** - Rich ecosystem of Radix UI components
6. **3D Support** - Mature React Three Fiber integration

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Change port in vite.config.js or use environment variable
PORT=3001 npm run dev
```

### API Connection Issues

Ensure the backend is running:

```bash
cd ..
python api.py
```

### Build Errors

Clear cache and reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Module Not Found

Check that path aliases are configured correctly in `vite.config.js`.

## Contributing

See the root [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

### Frontend-Specific Guidelines

1. Use functional components with hooks
2. Follow the Airbnb React/JSX Style Guide
3. Write components in `src/components/`
4. Use Tailwind CSS for styling (avoid inline styles)
5. Add PropTypes or TypeScript for type checking
6. Test components before committing

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/)
- [Nivo Documentation](https://nivo.rocks/)

## License

MIT - See [LICENSE](../LICENSE) for details.
