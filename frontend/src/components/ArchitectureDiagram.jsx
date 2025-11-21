import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Database, Globe, Monitor, MessageSquare, HardDrive,
  Workflow, BarChart3, Shield, Cloud, Users, Cpu, Radio,
  ArrowRight, ArrowDown, ArrowLeftRight, Zap, Activity,
  Box, Layers, FileCode, Clock, Bell, Lock, Network
} from 'lucide-react';

// Architecture layers and components
const ARCHITECTURE = {
  clients: {
    name: 'Client Layer',
    color: '#8b5cf6',
    components: [
      { id: 'web', name: 'Web Browser', icon: Globe, desc: 'React SPA with real-time updates' },
      { id: 'api-client', name: 'API Clients', icon: FileCode, desc: 'REST API consumers' },
      { id: 'mqtt-client', name: 'MQTT Clients', icon: Radio, desc: 'IoT device publishers' },
    ]
  },
  gateway: {
    name: 'Gateway Layer',
    color: '#06b6d4',
    components: [
      { id: 'nginx', name: 'Nginx Proxy', icon: Shield, desc: 'Reverse proxy & SSL termination' },
      { id: 'cors', name: 'CORS', icon: Lock, desc: 'Cross-origin protection' },
      { id: 'rate-limit', name: 'Rate Limiter', icon: Activity, desc: 'SlowAPI rate limiting' },
    ]
  },
  application: {
    name: 'Application Layer',
    color: '#10b981',
    components: [
      { id: 'fastapi', name: 'FastAPI Server', icon: Zap, desc: 'Async REST API with OpenAPI' },
      { id: 'celery', name: 'Celery Workers', icon: Clock, desc: 'Background task processing' },
      { id: 'mqtt-bridge', name: 'MQTT Bridge', icon: MessageSquare, desc: 'MQTT-to-API bridge service' },
      { id: 'device-shadow', name: 'Device Shadow', icon: Box, desc: 'Digital twin service' },
    ]
  },
  processing: {
    name: 'Processing Layer',
    color: '#f59e0b',
    components: [
      { id: 'iodd-parser', name: 'IODD Parser', icon: FileCode, desc: 'IO-Link XML parsing & validation' },
      { id: 'eds-parser', name: 'EDS Parser', icon: FileCode, desc: 'EtherNet/IP EDS parsing' },
      { id: 'pqa', name: 'PQA Engine', icon: BarChart3, desc: 'Parsing quality assessment' },
      { id: 'flow-gen', name: 'Flow Generator', icon: Workflow, desc: 'Node-RED flow generation' },
    ]
  },
  data: {
    name: 'Data Layer',
    color: '#ef4444',
    components: [
      { id: 'sqlite', name: 'SQLite/PostgreSQL', icon: Database, desc: 'Primary relational database' },
      { id: 'redis', name: 'Redis Cache', icon: HardDrive, desc: 'Caching & message queue' },
      { id: 'influxdb', name: 'InfluxDB', icon: Activity, desc: 'Time-series telemetry data' },
      { id: 'file-storage', name: 'File Storage', icon: HardDrive, desc: 'IODD/EDS file storage' },
    ]
  },
  observability: {
    name: 'Observability Layer',
    color: '#ec4899',
    components: [
      { id: 'prometheus', name: 'Prometheus', icon: BarChart3, desc: 'Metrics collection' },
      { id: 'grafana', name: 'Grafana', icon: Monitor, desc: 'Dashboards & visualization' },
      { id: 'jaeger', name: 'Jaeger', icon: Network, desc: 'Distributed tracing' },
      { id: 'sentry', name: 'Sentry', icon: Bell, desc: 'Error tracking & APM' },
    ]
  },
};

// Data flow connections
const DATA_FLOWS = [
  { from: 'web', to: 'nginx', label: 'HTTPS', type: 'request' },
  { from: 'mqtt-client', to: 'mqtt-bridge', label: 'MQTT', type: 'event' },
  { from: 'nginx', to: 'fastapi', label: 'HTTP', type: 'request' },
  { from: 'fastapi', to: 'celery', label: 'Tasks', type: 'async' },
  { from: 'fastapi', to: 'iodd-parser', label: 'Parse', type: 'process' },
  { from: 'fastapi', to: 'sqlite', label: 'SQL', type: 'data' },
  { from: 'fastapi', to: 'redis', label: 'Cache', type: 'data' },
  { from: 'mqtt-bridge', to: 'influxdb', label: 'Write', type: 'data' },
  { from: 'prometheus', to: 'fastapi', label: 'Scrape', type: 'metrics' },
  { from: 'grafana', to: 'prometheus', label: 'Query', type: 'metrics' },
];

const LayerComponent = ({ component, layerColor, isSelected, onClick, index }) => {
  const Icon = component.icon;

  return (
    <motion.div
      className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-offset-2 ring-offset-background' : ''
      }`}
      style={{
        backgroundColor: `${layerColor}10`,
        borderColor: isSelected ? layerColor : `${layerColor}40`,
        '--ring-color': layerColor,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        scale: 1.05,
        borderColor: layerColor,
        boxShadow: `0 4px 20px ${layerColor}30`
      }}
      onClick={() => onClick(component)}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${layerColor}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: layerColor }} />
        </div>
        <span className="font-medium text-sm text-foreground">{component.name}</span>
      </div>
    </motion.div>
  );
};

const ArchitectureDiagram = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [viewMode, setViewMode] = useState('layers'); // 'layers' or 'flow'

  const layers = Object.entries(ARCHITECTURE);

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">System Architecture</h3>
          <span className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded-full">
            Interactive
          </span>
        </div>
        <div className="flex items-center gap-2 p-1 bg-surface rounded-lg">
          {['layers', 'flow'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-brand-green text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'layers' ? 'Layer View' : 'Data Flow'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Diagram */}
      <div className="relative bg-gradient-to-br from-surface/50 to-background rounded-2xl border border-border p-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full">
            <defs>
              <pattern id="arch-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#arch-grid)" />
          </svg>
        </div>

        {viewMode === 'layers' ? (
          /* Layers View */
          <div className="relative space-y-4">
            {layers.map(([layerId, layer], layerIndex) => (
              <motion.div
                key={layerId}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: layerIndex * 0.1 }}
              >
                {/* Layer Label */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: layer.color }}
                  >
                    {layer.name}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Layer Components */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-6">
                  {layer.components.map((comp, compIndex) => (
                    <LayerComponent
                      key={comp.id}
                      component={comp}
                      layerColor={layer.color}
                      isSelected={selectedComponent?.id === comp.id}
                      onClick={setSelectedComponent}
                      index={layerIndex * 4 + compIndex}
                    />
                  ))}
                </div>

                {/* Arrow to next layer */}
                {layerIndex < layers.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowDown className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          /* Data Flow View */
          <div className="relative min-h-[500px]">
            {/* Flow visualization with SVG connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                </marker>
              </defs>
              {/* Animated flow lines would go here */}
            </svg>

            {/* Simplified flow diagram */}
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column - Inputs */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Inputs</h4>
                {['clients', 'gateway'].map((layerId) => {
                  const layer = ARCHITECTURE[layerId];
                  return (
                    <div key={layerId} className="space-y-2">
                      {layer.components.map((comp, i) => (
                        <motion.div
                          key={comp.id}
                          className="p-3 rounded-lg border"
                          style={{
                            backgroundColor: `${layer.color}10`,
                            borderColor: `${layer.color}30`
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <comp.icon className="w-4 h-4" style={{ color: layer.color }} />
                            <span className="text-sm font-medium">{comp.name}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Center Column - Processing */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Processing</h4>
                {['application', 'processing'].map((layerId) => {
                  const layer = ARCHITECTURE[layerId];
                  return (
                    <div key={layerId} className="space-y-2">
                      {layer.components.map((comp, i) => (
                        <motion.div
                          key={comp.id}
                          className="p-3 rounded-lg border relative"
                          style={{
                            backgroundColor: `${layer.color}10`,
                            borderColor: `${layer.color}30`
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          {/* Connection lines */}
                          <div className="absolute -left-8 top-1/2 w-8 h-px bg-border" />
                          <div className="absolute -right-8 top-1/2 w-8 h-px bg-border" />

                          <div className="flex items-center gap-2">
                            <comp.icon className="w-4 h-4" style={{ color: layer.color }} />
                            <span className="text-sm font-medium">{comp.name}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Right Column - Storage & Observability */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Storage & Monitoring</h4>
                {['data', 'observability'].map((layerId) => {
                  const layer = ARCHITECTURE[layerId];
                  return (
                    <div key={layerId} className="space-y-2">
                      {layer.components.map((comp, i) => (
                        <motion.div
                          key={comp.id}
                          className="p-3 rounded-lg border"
                          style={{
                            backgroundColor: `${layer.color}10`,
                            borderColor: `${layer.color}30`
                          }}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <comp.icon className="w-4 h-4" style={{ color: layer.color }} />
                            <span className="text-sm font-medium">{comp.name}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flow arrows */}
            <div className="absolute top-1/2 left-1/3 transform -translate-y-1/2">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-6 h-6 text-brand-green" />
              </motion.div>
            </div>
            <div className="absolute top-1/2 right-1/3 transform -translate-y-1/2">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
              >
                <ArrowRight className="w-6 h-6 text-brand-green" />
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Component Details */}
      <AnimatePresence>
        {selectedComponent && (
          <motion.div
            className="p-4 rounded-xl bg-surface/50 border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center gap-3">
              <selectedComponent.icon className="w-6 h-6 text-brand-green" />
              <div>
                <h4 className="font-semibold text-foreground">{selectedComponent.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedComponent.desc}</p>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Architecture Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {layers.map(([layerId, layer]) => (
          <div
            key={layerId}
            className="flex items-center gap-2 p-2 rounded-lg bg-surface/30"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: layer.color }}
            />
            <span className="text-xs text-muted-foreground">{layer.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
