import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Database, Globe, Cpu, Cloud, Shield, Activity,
  MessageSquare, BarChart3, GitBranch, Layers, Box, Zap,
  Code, FileCode, Terminal, Monitor, Workflow, Lock,
  Clock, Bell, HardDrive, Network, Radio, Gauge
} from 'lucide-react';

// Tech Stack Data Structure
const TECH_STACK = {
  core: {
    name: 'Core Platform',
    icon: Server,
    color: '#10b981',
    description: 'FastAPI-powered REST API with SQLAlchemy ORM',
    items: [
      { name: 'FastAPI', version: '0.100+', desc: 'High-performance async API framework' },
      { name: 'SQLAlchemy 2.0', version: '2.0+', desc: 'Modern Python ORM with async support' },
      { name: 'Pydantic', version: '2.0+', desc: 'Data validation & settings management' },
      { name: 'Alembic', version: '1.11+', desc: 'Database migrations' },
      { name: 'Uvicorn', version: '0.23+', desc: 'ASGI server' },
    ]
  },
  frontend: {
    name: 'Frontend',
    icon: Monitor,
    color: '#8b5cf6',
    description: 'React 18 SPA with modern UI components',
    items: [
      { name: 'React 18', version: '18.2+', desc: 'Component-based UI library' },
      { name: 'Vite', version: '7.2+', desc: 'Next-gen frontend build tool' },
      { name: 'TailwindCSS', version: '3.3+', desc: 'Utility-first CSS framework' },
      { name: 'Radix UI', version: 'Latest', desc: 'Accessible component primitives' },
      { name: 'Framer Motion', version: '10.16+', desc: 'Production-ready animations' },
      { name: 'Recharts', version: '3.4+', desc: 'Composable charting library' },
      { name: 'Lucide React', version: '0.290+', desc: 'Beautiful icon library' },
      { name: 'Three.js', version: '0.158+', desc: '3D graphics & visualizations' },
    ]
  },
  database: {
    name: 'Data Layer',
    icon: Database,
    color: '#06b6d4',
    description: 'Multi-database support with caching',
    items: [
      { name: 'SQLite', version: '3.x', desc: 'Default embedded database' },
      { name: 'PostgreSQL', version: '16+', desc: 'Production-grade relational DB' },
      { name: 'Redis', version: '7+', desc: 'Cache & message broker' },
      { name: 'InfluxDB', version: '2.7+', desc: 'Time-series data storage' },
    ]
  },
  messaging: {
    name: 'Messaging & IoT',
    icon: Radio,
    color: '#f59e0b',
    description: 'Industrial IoT communication protocols',
    items: [
      { name: 'MQTT', version: 'v5', desc: 'Lightweight IoT messaging protocol' },
      { name: 'Eclipse Mosquitto', version: '2.0', desc: 'MQTT broker' },
      { name: 'Paho MQTT', version: '1.6+', desc: 'Python MQTT client' },
      { name: 'WebSocket', version: 'RFC 6455', desc: 'Real-time bidirectional comms' },
    ]
  },
  background: {
    name: 'Background Jobs',
    icon: Clock,
    color: '#ec4899',
    description: 'Distributed task processing',
    items: [
      { name: 'Celery', version: '5.3+', desc: 'Distributed task queue' },
      { name: 'Flower', version: '2.0+', desc: 'Celery monitoring dashboard' },
      { name: 'Redis', version: '7+', desc: 'Message broker backend' },
    ]
  },
  observability: {
    name: 'Observability',
    icon: Activity,
    color: '#ef4444',
    description: 'Monitoring, logging & tracing',
    items: [
      { name: 'Prometheus', version: '2.48+', desc: 'Metrics collection & alerting' },
      { name: 'Grafana', version: '10.2+', desc: 'Visualization dashboards' },
      { name: 'Jaeger', version: 'Latest', desc: 'Distributed tracing' },
      { name: 'OpenTelemetry', version: '1.20+', desc: 'Telemetry instrumentation' },
      { name: 'Sentry', version: '7.100+', desc: 'Error tracking & APM' },
      { name: 'Alertmanager', version: '0.26+', desc: 'Alert routing & management' },
    ]
  },
  security: {
    name: 'Security',
    icon: Shield,
    color: '#14b8a6',
    description: 'Authentication & protection',
    items: [
      { name: 'JWT (python-jose)', version: '3.3+', desc: 'Token-based auth' },
      { name: 'Passlib + bcrypt', version: '1.7+', desc: 'Password hashing' },
      { name: 'SlowAPI', version: '0.1.9+', desc: 'Rate limiting' },
      { name: 'CORS Middleware', version: 'Built-in', desc: 'Cross-origin protection' },
    ]
  },
  devops: {
    name: 'DevOps & Deploy',
    icon: Cloud,
    color: '#6366f1',
    description: 'Containerization & orchestration',
    items: [
      { name: 'Docker', version: 'Latest', desc: 'Containerization platform' },
      { name: 'Docker Compose', version: '3.8', desc: 'Multi-container orchestration' },
      { name: 'GitHub Actions', version: 'Latest', desc: 'CI/CD workflows' },
      { name: 'Nginx', version: 'Alpine', desc: 'Reverse proxy (optional)' },
    ]
  },
  protocols: {
    name: 'Industrial Protocols',
    icon: Network,
    color: '#84cc16',
    description: 'Device description standards',
    items: [
      { name: 'IO-Link (IODD)', version: '1.0-1.1', desc: 'IO-Link device descriptions' },
      { name: 'EtherNet/IP (EDS)', version: 'ODVA', desc: 'EtherNet/IP device descriptions' },
      { name: 'lxml', version: '4.9+', desc: 'XML/XSD parsing & validation' },
      { name: 'xmlschema', version: '2.3+', desc: 'XML Schema validation' },
    ]
  },
  automation: {
    name: 'Automation',
    icon: Workflow,
    color: '#f97316',
    description: 'Workflow & flow generation',
    items: [
      { name: 'Node-RED', version: 'Latest', desc: 'Flow-based programming' },
      { name: 'Jinja2', version: '3.1+', desc: 'Template engine' },
      { name: 'Generated Flows', version: 'Custom', desc: 'Auto-generated Node-RED flows' },
    ]
  },
};

const CategoryNode = ({ category, data, isSelected, onClick, position }) => {
  const Icon = data.icon;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: position.x, top: position.y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: position.delay, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      onClick={() => onClick(category)}
    >
      <motion.div
        className={`relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
          isSelected ? 'ring-4 ring-offset-2 ring-offset-background' : ''
        }`}
        style={{
          backgroundColor: `${data.color}20`,
          borderColor: data.color,
          borderWidth: 2,
          ringColor: data.color
        }}
        animate={isSelected ? { boxShadow: `0 0 30px ${data.color}50` } : {}}
      >
        <Icon className="w-8 h-8 mb-1" style={{ color: data.color }} />
        <span className="text-xs font-medium text-center px-1 leading-tight" style={{ color: data.color }}>
          {data.name}
        </span>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
          {data.items.length}
        </span>
      </motion.div>
    </motion.div>
  );
};

const TechStackMindMap = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Calculate positions in a circular layout around center
  const categories = Object.keys(TECH_STACK);
  const centerX = 400;
  const centerY = 300;
  const radius = 220;

  const getPosition = (index, total) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle) - 48,
      y: centerY + radius * Math.sin(angle) - 48,
      delay: index * 0.1
    };
  };

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  }, [selectedCategory]);

  const selectedData = selectedCategory ? TECH_STACK[selectedCategory] : null;

  return (
    <div className="relative w-full">
      {/* Mind Map Container */}
      <div className="relative h-[650px] bg-gradient-to-br from-surface/50 to-background rounded-3xl border border-border overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {categories.map((cat, i) => {
            const pos = getPosition(i, categories.length);
            const data = TECH_STACK[cat];
            return (
              <motion.line
                key={cat}
                x1={centerX}
                y1={centerY}
                x2={pos.x + 48}
                y2={pos.y + 48}
                stroke={selectedCategory === cat ? data.color : '#333'}
                strokeWidth={selectedCategory === cat ? 3 : 1}
                strokeDasharray={selectedCategory === cat ? '0' : '5,5'}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              />
            );
          })}
        </svg>

        {/* Center Node */}
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-brand-green to-purple-500 flex flex-col items-center justify-center shadow-2xl"
          style={{ left: centerX - 64, top: centerY - 64 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
        >
          <Layers className="w-10 h-10 text-white mb-1" />
          <span className="text-white font-bold text-sm">GreenStack</span>
          <span className="text-white/70 text-xs">Tech Stack</span>
        </motion.div>

        {/* Category Nodes */}
        {categories.map((cat, i) => (
          <CategoryNode
            key={cat}
            category={cat}
            data={TECH_STACK[cat]}
            isSelected={selectedCategory === cat}
            onClick={handleCategoryClick}
            position={getPosition(i, categories.length)}
          />
        ))}

        {/* Click hint */}
        {!selectedCategory && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Click a category to explore technologies
          </motion.div>
        )}
      </div>

      {/* Selected Category Details Panel */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            className="mt-6 rounded-2xl border border-border overflow-hidden"
            style={{ borderColor: `${selectedData.color}50` }}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div
              className="p-6"
              style={{ backgroundColor: `${selectedData.color}10` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${selectedData.color}20` }}
                >
                  <selectedData.icon className="w-7 h-7" style={{ color: selectedData.color }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: selectedData.color }}>
                    {selectedData.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{selectedData.description}</p>
                </div>
              </div>
            </div>

            {/* Technologies Grid */}
            <div className="p-6 bg-surface/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedData.items.map((item, index) => (
                  <motion.div
                    key={item.name}
                    className="p-4 rounded-xl bg-background border border-border hover:border-opacity-50 transition-all cursor-default"
                    style={{
                      '--hover-color': selectedData.color,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: selectedData.color,
                      boxShadow: `0 4px 20px ${selectedData.color}20`
                    }}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-foreground">{item.name}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${selectedData.color}20`,
                          color: selectedData.color
                        }}
                      >
                        {item.version}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Categories', value: categories.length, color: '#10b981' },
          { label: 'Technologies', value: Object.values(TECH_STACK).reduce((acc, cat) => acc + cat.items.length, 0), color: '#8b5cf6' },
          { label: 'Docker Services', value: '15+', color: '#06b6d4' },
          { label: 'API Endpoints', value: '50+', color: '#f59e0b' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="p-4 rounded-xl bg-surface/50 border border-border text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TechStackMindMap;
