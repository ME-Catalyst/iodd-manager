import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Button, Badge, Input, Label,
  Alert, AlertDescription,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Switch, Separator
} from './ui';
import {
  Play, StopCircle, Settings, RefreshCw, AlertTriangle, CheckCircle2,
  XCircle, Wifi, Database, Workflow, LineChart, Server, Activity,
  AlertCircle, Terminal, Zap, Shield, Info, Edit2, Save, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ServicesAdmin = ({ API_BASE, toast }) => {
  const [services, setServices] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [configDialog, setConfigDialog] = useState(false);
  const [tempConfig, setTempConfig] = useState({});

  // Service icons mapping
  const serviceIcons = {
    mosquitto: Wifi,
    influxdb: Database,
    nodered: Workflow,
    grafana: LineChart
  };

  useEffect(() => {
    loadServicesData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadServicesData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadServicesData = async () => {
    try {
      const [statusRes, conflictsRes, healthRes] = await Promise.all([
        axios.get(`${API_BASE}/api/services/status`, { timeout: 10000 }),
        axios.get(`${API_BASE}/api/services/conflicts`, { timeout: 10000 }),
        axios.get(`${API_BASE}/api/services/health`, { timeout: 10000 })
      ]);

      setServices(statusRes.data);
      setConflicts(conflictsRes.data);
      setHealth(healthRes.data);
    } catch (error) {
      console.error('Failed to load services data:', error);
      toast({
        title: 'Error',
        description: `Failed to load services: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleStartService = async (serviceId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/services/${serviceId}/start`);
      toast({
        title: 'Success',
        description: response.data.message
      });
      await loadServicesData();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to start service';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStopService = async (serviceId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/services/${serviceId}/stop`);
      toast({
        title: 'Success',
        description: response.data.message
      });
      await loadServicesData();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to stop service';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestartService = async (serviceId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/services/${serviceId}/restart`);
      toast({
        title: 'Success',
        description: response.data.message
      });
      await loadServicesData();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to restart service';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const openConfigDialog = (serviceId, service) => {
    setEditingService(serviceId);
    setTempConfig({
      port: service.port,
      enabled: service.enabled,
      auto_start: service.auto_start
    });
    setConfigDialog(true);
  };

  const handleSaveConfig = async () => {
    if (!editingService) return;

    setLoading(true);
    try {
      await axios.put(`${API_BASE}/api/services/${editingService}/config`, tempConfig);
      toast({
        title: 'Success',
        description: 'Configuration updated successfully'
      });
      setConfigDialog(false);
      await loadServicesData();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update configuration';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (service) => {
    if (service.running) {
      return <Badge className="bg-green-600 text-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />Running</Badge>;
    }
    if (service.error) {
      return <Badge className="bg-red-600 text-foreground"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground">Stopped</Badge>;
  };

  const getHealthColor = (health) => {
    if (!health) return 'muted';
    switch (health.health) {
      case 'healthy': return 'green-600';
      case 'degraded': return 'yellow-600';
      case 'critical': return 'red-600';
      default: return 'muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Service Management</h2>
          <p className="text-muted-foreground mt-1">Manage application services and monitor their status</p>
        </div>
        <Button onClick={loadServicesData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Health Status */}
      {health && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold text-${getHealthColor(health)}`}>
                  {health.running}/{health.total_services}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Running</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{health.enabled}</div>
                <div className="text-sm text-muted-foreground mt-1">Enabled</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">{health.errors}</div>
                <div className="text-sm text-muted-foreground mt-1">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{health.port_conflicts}</div>
                <div className="text-sm text-muted-foreground mt-1">Conflicts</div>
              </div>
              <div className="text-center">
                <Badge className={`text-lg px-4 py-2 bg-${getHealthColor(health)}`}>
                  {health.health.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Port Conflicts Alert */}
      {conflicts.length > 0 && (
        <Alert className="bg-red-900/20 border-red-600">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Port Conflicts Detected</div>
            <div className="space-y-1">
              {conflicts.map((conflict, idx) => (
                <div key={idx} className="text-sm">
                  Port <span className="font-mono font-bold">{conflict.port}</span> is in use by{' '}
                  <span className="font-semibold">{conflict.process_name}</span> (PID: {conflict.pid})
                  {conflict.service && ` - Required by ${conflict.service}`}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {Object.entries(services).map(([serviceId, service]) => {
            const IconComponent = serviceIcons[serviceId] || Server;

            return (
              <motion.div
                key={serviceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={`bg-card border-border ${service.error ? 'border-red-600' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${service.running ? 'bg-green-600/20' : 'bg-muted'}`}>
                          <IconComponent className={`w-6 h-6 ${service.running ? 'text-green-400' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-foreground">{service.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Terminal className="w-3 h-3" />
                            <span className="font-mono text-xs">{serviceId}</span>
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(service)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Service Info */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Port</div>
                          <div className="font-mono font-semibold text-foreground">{service.port}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Process ID</div>
                          <div className="font-mono font-semibold text-foreground">{service.pid || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Auto Start</div>
                          <div className="font-semibold text-foreground">{service.auto_start ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Enabled</div>
                          <div className="font-semibold text-foreground">{service.enabled ? 'Yes' : 'No'}</div>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="flex flex-wrap gap-2">
                        {service.port_available ? (
                          <Badge variant="outline" className="text-green-400 border-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Port Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-400 border-red-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Port Conflict
                          </Badge>
                        )}

                        {service.executable_found ? (
                          <Badge variant="outline" className="text-green-400 border-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Executable Found
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-400 border-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Installed
                          </Badge>
                        )}

                        {service.config_valid && (
                          <Badge variant="outline" className="text-green-400 border-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Config Valid
                          </Badge>
                        )}
                      </div>

                      {/* Error Message */}
                      {service.error && (
                        <Alert className="bg-red-900/20 border-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <AlertDescription className="text-sm">{service.error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Port Conflict Details */}
                      {service.port_conflict && (
                        <Alert className="bg-yellow-900/20 border-yellow-600">
                          <AlertCircle className="w-4 h-4" />
                          <AlertDescription className="text-sm">
                            Port {service.port_conflict.port} is in use by <strong>{service.port_conflict.process_name}</strong> (PID: {service.port_conflict.pid})
                          </AlertDescription>
                        </Alert>
                      )}

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {service.running ? (
                          <>
                            <Button
                              onClick={() => handleStopService(serviceId)}
                              variant="destructive"
                              size="sm"
                              disabled={loading}
                              className="flex-1"
                            >
                              <StopCircle className="w-4 h-4 mr-2" />
                              Stop
                            </Button>
                            <Button
                              onClick={() => handleRestartService(serviceId)}
                              variant="outline"
                              size="sm"
                              disabled={loading}
                              className="flex-1"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Restart
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleStartService(serviceId)}
                            variant="default"
                            size="sm"
                            disabled={loading || !service.executable_found}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        )}
                        <Button
                          onClick={() => openConfigDialog(serviceId, service)}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configDialog} onOpenChange={setConfigDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Configure {editingService && services[editingService]?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update service configuration. Changes require a service restart to take effect.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="port" className="text-foreground">Port Number</Label>
              <Input
                id="port"
                type="number"
                min="1"
                max="65535"
                value={tempConfig.port}
                onChange={(e) => setTempConfig({ ...tempConfig, port: parseInt(e.target.value) })}
                className="mt-1 bg-secondary border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Port range: 1-65535. Ensure the port is not in use by another application.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enabled" className="text-foreground">Enabled</Label>
                <p className="text-xs text-muted-foreground">Allow this service to be managed</p>
              </div>
              <Switch
                id="enabled"
                checked={tempConfig.enabled}
                onCheckedChange={(checked) => setTempConfig({ ...tempConfig, enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_start" className="text-foreground">Auto Start</Label>
                <p className="text-xs text-muted-foreground">Start service automatically on system boot</p>
              </div>
              <Switch
                id="auto_start"
                checked={tempConfig.auto_start}
                onCheckedChange={(checked) => setTempConfig({ ...tempConfig, auto_start: checked })}
              />
            </div>

            {editingService && services[editingService]?.running && tempConfig.port !== services[editingService]?.port && (
              <Alert className="bg-yellow-900/20 border-yellow-600">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  The service must be stopped before changing the port.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Info className="w-5 h-5" />
            Service Management Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Port Conflicts:</strong> If a port is in use, you can either stop the conflicting process or change the service port in the configuration.
            </div>
            <div>
              <strong className="text-foreground">Installation:</strong> Services marked as "Not Installed" need to be installed on your system before they can be started.
            </div>
            <div>
              <strong className="text-foreground">Portable Operation:</strong> Configure ports to avoid conflicts with existing applications on your system. All services can run on custom ports.
            </div>
            <div>
              <strong className="text-foreground">Auto Start:</strong> Enable auto-start for services you want to run automatically when the system boots.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesAdmin;
