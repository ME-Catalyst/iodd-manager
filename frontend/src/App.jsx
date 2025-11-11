import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  Button, Badge, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Alert, AlertDescription, AlertTitle,
  Progress, Skeleton, ScrollArea, Separator,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
  Toast, ToastAction, Toaster, useToast,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui';
import {
  Upload, Download, FileCode, Cpu, Settings, Trash2, Eye, Code2, 
  Activity, Database, Package, Zap, ChevronRight, Search, Filter,
  BarChart3, PieChart, TrendingUp, AlertCircle, CheckCircle,
  Copy, ExternalLink, Maximize2, Minimize2, RefreshCw, Plus,
  Layers, Box, Gauge, Terminal, Globe, Lock, Unlock, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box as Box3D, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';

// 3D Device Visualization Component
const Device3D = ({ deviceData }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      <Box3D
        ref={meshRef}
        args={[2, 3, 0.5]}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={hovered ? '#00d4ff' : '#667eea'}
          speed={2}
          distort={0.3}
          radius={1}
        />
      </Box3D>
      <Text
        position={[0, -2, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {deviceData?.product_name || 'IO-Link Device'}
      </Text>
    </group>
  );
};

// Network Visualization Component
const NetworkGraph = ({ nodes, connections }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <Sphere key={node.id} position={[x, 0, z]} args={[0.3]}>
            <meshStandardMaterial color={node.color || '#00d4ff'} />
          </Sphere>
        );
      })}
      {connections.map((conn, i) => (
        <line key={i}>
          <bufferGeometry />
          <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
        </line>
      ))}
    </group>
  );
};

// Main Dashboard Component
const IODDDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [stats, setStats] = useState({
    total_devices: 0,
    total_parameters: 0,
    total_generated: 0,
    adapters_by_platform: {}
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const { toast } = useToast();

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDevices();
    fetchStats();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd`);
      setDevices(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch devices',
        variant: 'destructive',
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post(
        `${API_BASE}/api/iodd/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      toast({
        title: 'Success',
        description: `Device "${response.data.product_name}" imported successfully`,
      });

      fetchDevices();
      fetchStats();
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.detail || 'Failed to upload IODD file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const generateAdapter = async (deviceId, platform) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/generate/adapter`, {
        device_id: deviceId,
        platform: platform
      });
      
      setGeneratedCode(response.data);
      toast({
        title: 'Adapter Generated',
        description: `${platform} adapter generated successfully`,
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate adapter',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart data preparation
  const activityData = useMemo(() => [
    {
      id: 'devices',
      color: '#00d4ff',
      data: [
        { x: 'Mon', y: 2 },
        { x: 'Tue', y: 4 },
        { x: 'Wed', y: 3 },
        { x: 'Thu', y: 5 },
        { x: 'Fri', y: 2 },
        { x: 'Sat', y: 3 },
        { x: 'Sun', y: 4 }
      ]
    },
    {
      id: 'adapters',
      color: '#51cf66',
      data: [
        { x: 'Mon', y: 1 },
        { x: 'Tue', y: 2 },
        { x: 'Wed', y: 4 },
        { x: 'Thu', y: 3 },
        { x: 'Fri', y: 2 },
        { x: 'Sat', y: 5 },
        { x: 'Sun', y: 3 }
      ]
    }
  ], []);

  const radarData = useMemo(() => [
    { platform: 'Node-RED', devices: stats.adapters_by_platform['node-red'] || 0 },
    { platform: 'Python', devices: stats.adapters_by_platform['python'] || 0 },
    { platform: 'MQTT', devices: stats.adapters_by_platform['mqtt'] || 0 },
    { platform: 'OPC UA', devices: stats.adapters_by_platform['opcua'] || 0 },
    { platform: 'REST', devices: stats.adapters_by_platform['rest'] || 0 }
  ], [stats]);

  const filteredDevices = useMemo(() => {
    let filtered = devices;
    
    if (searchQuery) {
      filtered = filtered.filter(device =>
        device.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterPlatform !== 'all') {
      // Filter by platform if needed
    }
    
    return filtered;
  }, [devices, searchQuery, filterPlatform]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-8 h-8 text-cyan-400" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    IODD Manager Pro
                  </h1>
                </div>
                <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                  v2.0
                </Badge>
              </div>

              <nav className="flex items-center space-x-6">
                {['dashboard', 'devices', 'generator', 'analytics'].map((view) => (
                  <Button
                    key={view}
                    variant={activeView === view ? 'default' : 'ghost'}
                    onClick={() => setActiveView(view)}
                    className="capitalize"
                  >
                    {view}
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium text-cyan-100">
                        Total Devices
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stats.total_devices}</div>
                      <div className="flex items-center mt-2 text-cyan-200">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">+12% from last week</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium text-green-100">
                        Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stats.total_parameters}</div>
                      <div className="flex items-center mt-2 text-green-200">
                        <Database className="w-4 h-4 mr-1" />
                        <span className="text-sm">Across all devices</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium text-purple-100">
                        Generated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stats.total_generated}</div>
                      <div className="flex items-center mt-2 text-purple-200">
                        <Package className="w-4 h-4 mr-1" />
                        <span className="text-sm">Adapters created</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium text-orange-100">
                        Platforms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">5</div>
                      <div className="flex items-center mt-2 text-orange-200">
                        <Layers className="w-4 h-4 mr-1" />
                        <span className="text-sm">Supported targets</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Activity Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveLine
                          data={activityData}
                          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                          xScale={{ type: 'point' }}
                          yScale={{ type: 'linear', min: 0, max: 'auto' }}
                          curve="catmullRom"
                          axisTop={null}
                          axisRight={null}
                          axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                          }}
                          axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                          }}
                          colors={{ scheme: 'paired' }}
                          pointSize={8}
                          pointColor={{ theme: 'background' }}
                          pointBorderWidth={2}
                          pointBorderColor={{ from: 'serieColor' }}
                          enableArea={true}
                          areaOpacity={0.1}
                          theme={{
                            axis: {
                              ticks: {
                                text: { fill: '#94a3b8' }
                              }
                            },
                            grid: {
                              line: { stroke: '#334155', strokeWidth: 1 }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">3D Device Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                          <ambientLight intensity={0.5} />
                          <pointLight position={[10, 10, 10]} />
                          <Device3D deviceData={selectedDevice} />
                          <OrbitControls enableZoom={false} />
                        </Canvas>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button
                        className="h-24 flex-col space-y-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 border-cyan-500/50"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="w-6 h-6" />
                        <span>Upload IODD</span>
                      </Button>
                      
                      <Button
                        className="h-24 flex-col space-y-2 bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border-green-500/50"
                        onClick={() => setActiveView('generator')}
                      >
                        <Zap className="w-6 h-6" />
                        <span>Generate</span>
                      </Button>
                      
                      <Button
                        className="h-24 flex-col space-y-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border-purple-500/50"
                        onClick={() => setActiveView('devices')}
                      >
                        <Eye className="w-6 h-6" />
                        <span>View Devices</span>
                      </Button>
                      
                      <Button
                        className="h-24 flex-col space-y-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border-orange-500/50"
                        onClick={fetchStats}
                      >
                        <RefreshCw className="w-6 h-6" />
                        <span>Refresh</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeView === 'devices' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search devices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
                    />
                  </div>
                  
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Filter by platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="node-red">Node-RED</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="mqtt">MQTT</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </div>

                {/* Devices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDevices.map((device) => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-slate-800/50 backdrop-blur border-slate-700 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg text-white">
                                {device.product_name}
                              </CardTitle>
                              <CardDescription className="text-slate-400">
                                {device.manufacturer}
                              </CardDescription>
                            </div>
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                              v{device.iodd_version}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Device ID:</span>
                              <span className="text-white font-mono">{device.device_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Vendor ID:</span>
                              <span className="text-white font-mono">{device.vendor_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Imported:</span>
                              <span className="text-white">
                                {new Date(device.import_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <Separator className="my-4 bg-slate-700" />
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                              onClick={() => setSelectedDevice(device)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                              onClick={() => generateAdapter(device.id, 'node-red')}
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              Generate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'generator' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">Adapter Generator</CardTitle>
                    <CardDescription className="text-slate-400">
                      Generate custom adapters for your IO-Link devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-300">Select Device</Label>
                        <Select onValueChange={(value) => setSelectedDevice(devices.find(d => d.id === parseInt(value)))}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue placeholder="Choose a device..." />
                          </SelectTrigger>
                          <SelectContent>
                            {devices.map((device) => (
                              <SelectItem key={device.id} value={device.id.toString()}>
                                {device.product_name} ({device.device_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">Target Platform</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['node-red', 'python', 'mqtt', 'opcua'].map((platform) => (
                            <Button
                              key={platform}
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-cyan-500"
                              onClick={() => selectedDevice && generateAdapter(selectedDevice.id, platform)}
                              disabled={!selectedDevice || (platform !== 'node-red')}
                            >
                              {platform === 'node-red' && <Box className="w-4 h-4 mr-2" />}
                              {platform === 'python' && <Code2 className="w-4 h-4 mr-2" />}
                              {platform === 'mqtt' && <Cloud className="w-4 h-4 mr-2" />}
                              {platform === 'opcua' && <Globe className="w-4 h-4 mr-2" />}
                              <span className="capitalize">{platform.replace('-', ' ')}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {generatedCode && (
                  <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Generated Code</CardTitle>
                      <CardDescription className="text-slate-400">
                        Review and download your generated adapter
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue={Object.keys(generatedCode.files)[0]}>
                        <TabsList className="bg-slate-700/50">
                          {Object.keys(generatedCode.files).map((filename) => (
                            <TabsTrigger key={filename} value={filename}>
                              {filename}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {Object.entries(generatedCode.files).map(([filename, content]) => (
                          <TabsContent key={filename} value={filename}>
                            <div className="relative">
                              <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-2 right-2 z-10"
                                onClick={() => navigator.clipboard.writeText(content)}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </Button>
                              <ScrollArea className="h-96 rounded-lg">
                                <SyntaxHighlighter
                                  language={filename.endsWith('.js') ? 'javascript' : 'json'}
                                  style={atomDark}
                                  customStyle={{
                                    background: '#1e293b',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                  }}
                                >
                                  {content}
                                </SyntaxHighlighter>
                              </ScrollArea>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                      
                      <div className="flex space-x-4 mt-6">
                        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                          <Download className="w-4 h-4 mr-2" />
                          Download Package
                        </Button>
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Deploy to Node-RED
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {activeView === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Platform Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveRadar
                          data={radarData}
                          keys={['devices']}
                          indexBy="platform"
                          maxValue="auto"
                          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                          curve="linearClosed"
                          borderWidth={2}
                          borderColor={{ from: 'color' }}
                          gridLevels={5}
                          gridShape="circular"
                          gridLabelOffset={16}
                          enableDots={true}
                          dotSize={8}
                          dotColor={{ theme: 'background' }}
                          dotBorderWidth={2}
                          dotBorderColor={{ from: 'color' }}
                          enableDotLabel={true}
                          dotLabel="value"
                          dotLabelYOffset={-12}
                          colors={{ scheme: 'paired' }}
                          fillOpacity={0.25}
                          blendMode="multiply"
                          animate={true}
                          theme={{
                            axis: {
                              ticks: {
                                text: { fill: '#94a3b8' }
                              }
                            },
                            grid: {
                              line: { stroke: '#334155', strokeWidth: 1 }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Network Topology</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                          <ambientLight intensity={0.5} />
                          <pointLight position={[10, 10, 10]} />
                          <NetworkGraph
                            nodes={devices.map(d => ({ id: d.id, color: '#00d4ff' }))}
                            connections={[]}
                          />
                          <OrbitControls enableZoom={false} />
                        </Canvas>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Hidden File Input */}
        <input
          id="file-upload"
          type="file"
          accept=".xml,.iodd"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white">Processing...</p>
                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} className="w-48" />
                )}
              </div>
            </Card>
          </div>
        )}

        <Toaster />
      </div>
    </TooltipProvider>
  );
};

export default IODDDashboard;
