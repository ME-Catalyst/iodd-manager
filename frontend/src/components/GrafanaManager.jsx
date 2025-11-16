import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label } from './ui';
import {
  BarChart3, LineChart, Activity, Download, Upload, RefreshCw,
  Eye, Copy, ExternalLink, Settings, Users, Database, Folder,
  Play, Pause, Plus, Trash2, Edit, Star, Clock, TrendingUp,
  Grid, Layers, Code, FileText, CheckCircle2, AlertCircle, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GrafanaManager = ({ API_BASE, toast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchStatus();
    fetchDashboards();
    fetchDatasources();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      setStatus({
        connected: response.ok,
        version: '10.2.x',
        uptime: 'Running'
      });
    } catch (error) {
      setStatus({ connected: false, error: error.message });
    }
  };

  const fetchDashboards = async () => {
    // Mock data - in production, you'd fetch from Grafana API
    setDashboards([
      {
        id: 1,
        title: 'Device Telemetry Overview',
        folder: 'IoT Monitoring',
        tags: ['devices', 'telemetry'],
        starred: true,
        panels: 12,
        lastViewed: '2024-01-14T10:30:00'
      },
      {
        id: 2,
        title: 'System Performance',
        folder: 'System',
        tags: ['performance', 'metrics'],
        starred: false,
        panels: 8,
        lastViewed: '2024-01-14T09:15:00'
      },
      {
        id: 3,
        title: 'Alert Dashboard',
        folder: 'Monitoring',
        tags: ['alerts', 'notifications'],
        starred: true,
        panels: 6,
        lastViewed: '2024-01-13T14:22:00'
      }
    ]);
  };

  const fetchDatasources = async () => {
    setDatasources([
      {
        id: 1,
        name: 'InfluxDB-IoT',
        type: 'influxdb',
        status: 'healthy',
        url: 'http://influxdb:8086',
        database: 'iodd_telemetry'
      },
      {
        id: 2,
        name: 'PostgreSQL-Main',
        type: 'postgres',
        status: 'healthy',
        url: 'postgres:5432',
        database: 'greenstack'
      }
    ]);
  };

  const quickDashboards = [
    {
      title: 'Device Telemetry',
      description: 'Real-time device metrics',
      icon: Activity,
      url: '/d/telemetry/device-telemetry',
      panels: 12
    },
    {
      title: 'System Health',
      description: 'Infrastructure monitoring',
      icon: Gauge,
      url: '/d/system/system-health',
      panels: 8
    },
    {
      title: 'Network Traffic',
      description: 'MQTT & network stats',
      icon: TrendingUp,
      url: '/d/network/network-traffic',
      panels: 6
    },
    {
      title: 'Alerts Overview',
      description: 'Active alerts and history',
      icon: AlertCircle,
      url: '/d/alerts/alerts-overview',
      panels: 5
    }
  ];

  const recentActivity = [
    { time: '10:32', action: 'Dashboard viewed', item: 'Device Telemetry Overview', user: 'admin' },
    { time: '10:15', action: 'Dashboard created', item: 'New Alert Dashboard', user: 'admin' },
    { time: '09:48', action: 'Data source added', item: 'InfluxDB-IoT', user: 'admin' },
    { time: '09:30', action: 'Alert rule updated', item: 'High Temperature', user: 'admin' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#3DB60F]" />
            Grafana Manager
          </h2>
          <p className="text-muted-foreground mt-1">Visualization and analytics platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={status?.connected ? 'bg-[#3DB60F]/20 text-[#3DB60F] border-[#3DB60F]/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}>
            {status?.connected ? 'Online' : 'Offline'}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-[#3DB60F] to-green-500" asChild>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Grafana
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
                <p className="text-muted-foreground text-sm">Dashboards</p>
                <p className="text-2xl font-bold text-foreground mt-1">{dashboards.length}</p>
              </div>
              <Grid className="w-8 h-8 text-[#3DB60F]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Data Sources</p>
                <p className="text-2xl font-bold text-foreground mt-1">{datasources.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Alerts</p>
                <p className="text-2xl font-bold text-foreground mt-1">0</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Version</p>
                <p className="text-2xl font-bold text-foreground mt-1">{status?.version || 'N/A'}</p>
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
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="datasources">Data Sources</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Access Dashboards */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Access</CardTitle>
                <CardDescription>Frequently used dashboards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickDashboards.map((dash, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    asChild
                  >
                    <a href={`http://localhost:3001${dash.url}`} target="_blank" rel="noopener noreferrer">
                      <dash.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">{dash.title}</div>
                        <div className="text-xs text-muted-foreground">{dash.description}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">{dash.panels} panels</Badge>
                    </a>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Data Sources Status */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Data Sources</CardTitle>
                <CardDescription>Connection status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {datasources.map((ds) => (
                  <div key={ds.id} className="p-3 bg-secondary/50 rounded border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#3DB60F]" />
                        <span className="font-semibold text-foreground">{ds.name}</span>
                      </div>
                      <Badge className={ds.status === 'healthy' ? 'bg-[#3DB60F]/20 text-[#3DB60F]' : 'bg-red-500/20 text-red-400'}>
                        {ds.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Type: {ds.type}</div>
                      <div className="text-xs truncate">URL: {ds.url}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Starred Dashboards */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Starred Dashboards
              </CardTitle>
              <CardDescription>Your favorite dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {dashboards.filter(d => d.starred).map((dash) => (
                  <div key={dash.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded border border-border">
                    <div className="flex items-center gap-4">
                      <Grid className="w-5 h-5 text-[#3DB60F]" />
                      <div>
                        <div className="font-semibold text-foreground">{dash.title}</div>
                        <div className="text-sm text-muted-foreground">{dash.folder} • {dash.panels} panels</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`http://localhost:3001/d/${dash.id}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboards Tab */}
        <TabsContent value="dashboards" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search dashboards..."
              className="max-w-md bg-background border-border text-foreground"
            />
            <Button className="bg-gradient-to-r from-[#3DB60F] to-green-500">
              <Plus className="w-4 h-4 mr-2" />
              New Dashboard
            </Button>
          </div>

          {dashboards.map((dash) => (
            <Card key={dash.id} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {dash.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                      <h3 className="text-lg font-semibold text-foreground">{dash.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Folder className="w-4 h-4" />
                        {dash.folder}
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        {dash.panels} panels
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(dash.lastViewed).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {dash.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`http://localhost:3001/d/${dash.id}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
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

        {/* Data Sources Tab */}
        <TabsContent value="datasources" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Configured Data Sources</h3>
            <Button className="bg-gradient-to-r from-[#3DB60F] to-green-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Data Source
            </Button>
          </div>

          {datasources.map((ds) => (
            <Card key={ds.id} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Database className="w-6 h-6 text-[#3DB60F]" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{ds.name}</h3>
                        <p className="text-sm text-muted-foreground">{ds.type.toUpperCase()}</p>
                      </div>
                      <Badge className={ds.status === 'healthy' ? 'bg-[#3DB60F]/20 text-[#3DB60F] border-[#3DB60F]/50' : 'bg-red-500/20 text-red-400'}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {ds.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">URL:</span>
                        <span className="text-foreground ml-2 font-mono">{ds.url}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Database:</span>
                        <span className="text-foreground ml-2 font-mono">{ds.database}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>Dashboard and system activity log</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-secondary/50 rounded border border-border">
                    <div className="text-sm text-muted-foreground w-16">{activity.time}</div>
                    <Activity className="w-4 h-4 text-[#3DB60F]" />
                    <div className="flex-1">
                      <div className="text-foreground text-sm">{activity.action}</div>
                      <div className="text-muted-foreground text-xs">{activity.item}</div>
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

export default GrafanaManager;
