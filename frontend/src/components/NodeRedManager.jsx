import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from './ui';
import {
  Workflow, Play, Pause, RefreshCw, Download, Upload, GitBranch,
  Terminal, Code, Copy, Eye, Settings, Zap, CheckCircle2,
  XCircle, Clock, Activity, HardDrive, Cpu, Package, FileCode,
  ExternalLink, ArrowRight, Box, Layers, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NodeRedManager = ({ API_BASE, toast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState(null);
  const [flows, setFlows] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [activeFlows, setActiveFlows] = useState(0);

  useEffect(() => {
    fetchStatus();
    fetchFlows();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:1880');
      setStatus({
        connected: response.ok,
        uptime: 'Running',
        version: '3.1.x'
      });
    } catch (error) {
      setStatus({ connected: false, error: error.message });
    }
  };

  const fetchFlows = async () => {
    // Mock data - in production, you'd fetch from Node-RED API
    setFlows([
      {
        id: 'flow1',
        label: 'Device Telemetry Processing',
        status: 'running',
        nodes: 12,
        lastModified: '2024-01-14T10:30:00',
        description: 'Processes MQTT telemetry and stores in InfluxDB'
      },
      {
        id: 'flow2',
        label: 'Alert Notifications',
        status: 'running',
        nodes: 8,
        lastModified: '2024-01-14T09:15:00',
        description: 'Monitors thresholds and sends alerts'
      },
      {
        id: 'flow3',
        label: 'Data Aggregation',
        status: 'stopped',
        nodes: 15,
        lastModified: '2024-01-13T14:22:00',
        description: 'Aggregates sensor data every 5 minutes'
      }
    ]);
    setActiveFlows(2);
  };

  const nodeCategories = [
    { name: 'Input', count: 45, color: 'text-blue-400' },
    { name: 'Output', count: 38, color: 'text-green-400' },
    { name: 'Function', count: 62, color: 'text-purple-400' },
    { name: 'Social', count: 12, color: 'text-pink-400' },
    { name: 'Storage', count: 18, color: 'text-orange-400' },
    { name: 'Analysis', count: 24, color: 'text-cyan-400' },
  ];

  const quickActions = [
    {
      title: 'Import Flow',
      description: 'Import flow from JSON',
      icon: Upload,
      action: () => toast({ title: 'Import', description: 'Flow import dialog would open' })
    },
    {
      title: 'Export Flows',
      description: 'Export all flows as JSON',
      icon: Download,
      action: () => toast({ title: 'Export', description: 'Flows exported successfully' })
    },
    {
      title: 'Deploy All',
      description: 'Deploy all modified flows',
      icon: Zap,
      action: () => toast({ title: 'Deploy', description: 'Flows deployed successfully', variant: 'success' })
    },
    {
      title: 'View Logs',
      description: 'Open Node-RED logs',
      icon: Terminal,
      action: () => {}
    }
  ];

  const recentActivity = [
    { time: '10:32', action: 'Flow deployed', flow: 'Device Telemetry Processing', user: 'System' },
    { time: '10:15', action: 'Node added', flow: 'Alert Notifications', user: 'Admin' },
    { time: '09:48', action: 'Flow created', flow: 'Data Aggregation', user: 'Admin' },
    { time: '09:30', action: 'Settings updated', flow: 'Global', user: 'Admin' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Workflow className="w-7 h-7 text-[#3DB60F]" />
            Node-RED Manager
          </h2>
          <p className="text-muted-foreground mt-1">Visual workflow automation and orchestration</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={status?.connected ? 'bg-[#3DB60F]/20 text-[#3DB60F] border-[#3DB60F]/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}>
            {status?.connected ? 'Running' : 'Stopped'}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-[#3DB60F] to-green-500" asChild>
            <a href="http://localhost:1880" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Editor
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Flows</p>
                <p className="text-2xl font-bold text-foreground mt-1">{flows.length}</p>
              </div>
              <Workflow className="w-8 h-8 text-[#3DB60F]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Flows</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activeFlows}</p>
              </div>
              <Play className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Nodes</p>
                <p className="text-2xl font-bold text-foreground mt-1">{flows.reduce((acc, f) => acc + f.nodes, 0)}</p>
              </div>
              <Box className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Status</p>
                <p className="text-2xl font-bold text-foreground mt-1">{status?.uptime || 'N/A'}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flows">Flows</TabsTrigger>
          <TabsTrigger value="nodes">Node Library</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
                <CardDescription>Common Node-RED operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={action.action}
                  >
                    <action.icon className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Node Categories */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Node Library</CardTitle>
                <CardDescription>Available node categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {nodeCategories.map((cat, i) => (
                    <div key={i} className="p-3 bg-secondary/50 rounded border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-sm">{cat.name}</span>
                        <Badge className={`${cat.color} bg-transparent border-current`}>
                          {cat.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flow Status */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Flow Status Overview</CardTitle>
              <CardDescription>Current state of all flows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flows.map((flow) => (
                  <div key={flow.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded border border-border">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${flow.status === 'running' ? 'bg-[#3DB60F]' : 'bg-slate-600'} animate-pulse`} />
                      <div>
                        <div className="font-semibold text-foreground">{flow.label}</div>
                        <div className="text-sm text-muted-foreground">{flow.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {flow.nodes} nodes
                      </Badge>
                      <Badge className={flow.status === 'running' ? 'bg-[#3DB60F]/20 text-[#3DB60F] border-[#3DB60F]/50' : 'bg-muted text-muted-foreground'}>
                        {flow.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flows Tab */}
        <TabsContent value="flows" className="space-y-4">
          {flows.map((flow) => (
            <Card key={flow.id} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Workflow className="w-5 h-5 text-[#3DB60F]" />
                      <h3 className="text-lg font-semibold text-foreground">{flow.label}</h3>
                      <Badge className={flow.status === 'running' ? 'bg-[#3DB60F]/20 text-[#3DB60F]' : 'bg-muted text-muted-foreground'}>
                        {flow.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{flow.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Box className="w-4 h-4" />
                        {flow.nodes} nodes
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Modified: {new Date(flow.lastModified).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {flow.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Code className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Installed Node Packages</CardTitle>
              <CardDescription>Node-RED palette modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'node-red-dashboard', version: '3.6.0', nodes: 15, description: 'Dashboard UI nodes' },
                  { name: 'node-red-contrib-influxdb', version: '0.6.1', nodes: 5, description: 'InfluxDB integration' },
                  { name: 'node-red-contrib-telegrambot', version: '15.1.8', nodes: 8, description: 'Telegram bot nodes' },
                ].map((pkg, i) => (
                  <div key={i} className="p-4 bg-secondary/50 rounded border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#3DB60F]" />
                          <span className="font-semibold text-foreground">{pkg.name}</span>
                          <Badge variant="outline" className="text-xs">{pkg.version}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                      </div>
                      <Badge className="bg-[#3DB60F]/20 text-[#3DB60F]">{pkg.nodes} nodes</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>Flow modifications and deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-secondary/50 rounded border border-border">
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <div className="flex-1">
                      <div className="text-foreground text-sm">{activity.action}</div>
                      <div className="text-muted-foreground text-xs">{activity.flow}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">{activity.user}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NodeRedManager;
