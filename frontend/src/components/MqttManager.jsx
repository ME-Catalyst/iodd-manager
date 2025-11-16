import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Badge } from './ui';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  Radio,
  Database,
  Users,
  MessageSquare,
  PlayCircle,
  StopCircle,
  Trash2,
  Download,
  Copy,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
  Terminal,
  Clock,
  TrendingUp,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MqttManager = ({ API_BASE, toast }) => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [brokerStatus, setBrokerStatus] = useState(null);
  const [clients, setClients] = useState([]);
  const [topics, setTopics] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Publisher State
  const [publishTopic, setPublishTopic] = useState('devices/test-001/telemetry');
  const [publishMessage, setPublishMessage] = useState(JSON.stringify({
    parameter: "Temperature",
    value: 25.4,
    unit: "°C",
    timestamp: new Date().toISOString()
  }, null, 2));
  const [publishQos, setPublishQos] = useState(0);
  const [publishRetain, setPublishRetain] = useState(false);

  // Subscriber State
  const [subscribeTopic, setSubscribeTopic] = useState('devices/#');
  const [subscribeQos, setSubscribeQos] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);

  // Filters
  const [messageFilter, setMessageFilter] = useState('');
  const [showSystemTopics, setShowSystemTopics] = useState(false);

  // WebSocket for real-time monitoring
  const wsRef = useRef(null);

  useEffect(() => {
    fetchBrokerStatus();
    fetchClients();
    fetchTopics();

    // Fetch status every 5 seconds
    const interval = setInterval(() => {
      fetchBrokerStatus();
      if (activeTab === 'clients') fetchClients();
      if (activeTab === 'topics') fetchTopics();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const fetchBrokerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mqtt/status`);
      if (response.ok) {
        const data = await response.json();
        setBrokerStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch broker status:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mqtt/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mqtt/topics`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const publishMqttMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/mqtt/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: publishTopic,
          message: publishMessage,
          qos: publishQos,
          retain: publishRetain
        })
      });

      if (response.ok) {
        toast({
          title: 'Message Published',
          description: `Published to ${publishTopic}`,
          variant: 'success'
        });

        // Add to local messages for display
        addMessage({
          topic: publishTopic,
          payload: publishMessage,
          qos: publishQos,
          retain: publishRetain,
          timestamp: new Date().toISOString(),
          direction: 'outgoing'
        });
      } else {
        throw new Error('Failed to publish message');
      }
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mqtt/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: subscribeTopic,
          qos: subscribeQos
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        toast({
          title: 'Subscribed',
          description: `Listening to ${subscribeTopic}`,
          variant: 'success'
        });

        // Connect WebSocket for receiving messages
        connectWebSocket();
      }
    } catch (error) {
      toast({
        title: 'Subscribe Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/mqtt/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: subscribeTopic })
      });

      if (response.ok) {
        setIsSubscribed(false);
        if (wsRef.current) {
          wsRef.current.close();
        }
        toast({
          title: 'Unsubscribed',
          description: `Stopped listening to ${subscribeTopic}`,
          variant: 'default'
        });
      }
    } catch (error) {
      toast({
        title: 'Unsubscribe Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8000/ws/mqtt`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addMessage({
        topic: data.topic,
        payload: data.payload,
        qos: data.qos,
        timestamp: data.timestamp,
        direction: 'incoming'
      });
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, { ...message, id: Date.now() + Math.random() }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
      variant: 'default'
    });
  };

  const downloadMessages = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mqtt-messages-${new Date().toISOString()}.json`;
    a.click();
  };

  const filteredMessages = messages.filter(msg => {
    if (!showSystemTopics && msg.topic.startsWith('$SYS/')) return false;
    if (messageFilter && !msg.topic.toLowerCase().includes(messageFilter.toLowerCase())) return false;
    return true;
  });

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Broker Status</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {brokerStatus?.status === 'running' ? (
                    <span className="flex items-center gap-2">
                      <Wifi className="w-6 h-6 text-green-500" />
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <WifiOff className="w-6 h-6 text-red-500" />
                      Offline
                    </span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected Clients</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {brokerStatus?.clients || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Topics</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {brokerStatus?.topics || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Messages/sec</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {brokerStatus?.messages_per_sec || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broker Configuration */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Broker Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">MQTT Port</p>
              <p className="text-foreground font-mono mt-1">{brokerStatus?.mqtt_port || '1883'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">WebSocket Port</p>
              <p className="text-foreground font-mono mt-1">{brokerStatus?.ws_port || '9001'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">TLS Port</p>
              <p className="text-foreground font-mono mt-1">{brokerStatus?.tls_port || '8883'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Authentication</p>
              <p className="text-foreground flex items-center gap-2 mt-1">
                {brokerStatus?.auth_enabled ? (
                  <>
                    <Lock className="w-4 h-4 text-green-500" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-yellow-500" />
                    <span>Disabled</span>
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Connections</p>
              <p className="text-foreground font-mono mt-1">{brokerStatus?.max_connections || 'Unlimited'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Persistence</p>
              <p className="text-foreground flex items-center gap-2 mt-1">
                {brokerStatus?.persistence ? (
                  <>
                    <Database className="w-4 h-4 text-green-500" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span>Disabled</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-800/50 hover:border-blue-600/50 transition-all cursor-pointer"
          onClick={() => setActiveTab('publish')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Publish Message</p>
                <p className="text-sm text-muted-foreground">Send MQTT messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-800/50 hover:border-purple-600/50 transition-all cursor-pointer"
          onClick={() => setActiveTab('subscribe')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Radio className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Subscribe to Topics</p>
                <p className="text-sm text-muted-foreground">Monitor messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-800/50 hover:border-green-600/50 transition-all cursor-pointer"
          onClick={() => setActiveTab('clients')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">View Clients</p>
                <p className="text-sm text-muted-foreground">Connected devices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Publish Tab Component
  const PublishTab = () => (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Send className="w-5 h-5" />
            Publish MQTT Message
          </CardTitle>
          <CardDescription>Send messages to MQTT topics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Topic</label>
            <input
              type="text"
              value={publishTopic}
              onChange={(e) => setPublishTopic(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="devices/test-001/telemetry"
            />
            <p className="text-xs text-muted-foreground mt-1">Use + for single-level wildcard, # for multi-level wildcard</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Message (JSON)</label>
            <textarea
              value={publishMessage}
              onChange={(e) => setPublishMessage(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder='{"parameter": "Temperature", "value": 25.4}'
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Quality of Service (QoS)</label>
              <select
                value={publishQos}
                onChange={(e) => setPublishQos(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value={0}>QoS 0 - At most once</option>
                <option value={1}>QoS 1 - At least once</option>
                <option value={2}>QoS 2 - Exactly once</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="retain"
                checked={publishRetain}
                onChange={(e) => setPublishRetain(e.target.checked)}
                className="w-4 h-4 bg-secondary border-border rounded"
              />
              <label htmlFor="retain" className="text-sm text-muted-foreground">
                Retain Message
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={publishMqttMessage}
              disabled={loading || !publishTopic || !publishMessage}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Publishing...' : 'Publish Message'}
            </Button>

            <Button
              onClick={() => {
                setPublishMessage(JSON.stringify({
                  parameter: "Temperature",
                  value: Math.round(Math.random() * 50 + 20),
                  unit: "°C",
                  timestamp: new Date().toISOString()
                }, null, 2));
              }}
              variant="outline"
              className="border-border text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Message Templates */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Quick Templates</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPublishTopic('devices/test-001/telemetry');
                  setPublishMessage(JSON.stringify({
                    parameter: "Temperature",
                    value: 25.4,
                    unit: "°C",
                    timestamp: new Date().toISOString()
                  }, null, 2));
                }}
                className="border-border text-foreground justify-start"
              >
                Telemetry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPublishTopic('devices/test-001/status');
                  setPublishMessage(JSON.stringify({
                    state: "connected",
                    timestamp: new Date().toISOString()
                  }, null, 2));
                }}
                className="border-border text-foreground justify-start"
              >
                Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPublishTopic('devices/test-001/register');
                  setPublishMessage(JSON.stringify({
                    device_type: "IO-Link",
                    vendor: "Balluff",
                    product: "BSP B050-EV006-A00S11-S49",
                    timestamp: new Date().toISOString()
                  }, null, 2));
                }}
                className="border-border text-foreground justify-start"
              >
                Registration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Subscribe Tab Component
  const SubscribeTab = () => (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Subscribe to Topics
          </CardTitle>
          <CardDescription>Monitor incoming MQTT messages in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Topic Pattern</label>
              <input
                type="text"
                value={subscribeTopic}
                onChange={(e) => setSubscribeTopic(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="devices/#"
                disabled={isSubscribed}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">QoS</label>
              <select
                value={subscribeQos}
                onChange={(e) => setSubscribeQos(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isSubscribed}
              >
                <option value={0}>QoS 0</option>
                <option value={1}>QoS 1</option>
                <option value={2}>QoS 2</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            {!isSubscribed ? (
              <Button
                onClick={handleSubscribe}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
            ) : (
              <Button
                onClick={handleUnsubscribe}
                variant="destructive"
                className="flex-1"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Listening
              </Button>
            )}
          </div>

          {/* Common Topic Patterns */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Common Patterns</p>
            <div className="flex flex-wrap gap-2">
              {['devices/#', 'devices/+/telemetry', 'devices/+/status', '$SYS/#'].map((pattern) => (
                <Badge
                  key={pattern}
                  variant="outline"
                  className="cursor-pointer border-border text-foreground hover:border-cyan-500"
                  onClick={() => !isSubscribed && setSubscribeTopic(pattern)}
                >
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Monitor */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Message Monitor
              <Badge variant={isSubscribed ? "default" : "secondary"} className="ml-2">
                {isSubscribed ? 'Active' : 'Stopped'}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className="text-muted-foreground"
              >
                {autoScroll ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadMessages}
                className="text-muted-foreground"
                disabled={messages.length === 0}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="text-muted-foreground"
                disabled={messages.length === 0}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={messageFilter}
                onChange={(e) => setMessageFilter(e.target.value)}
                placeholder="Filter by topic..."
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSystemTopics(!showSystemTopics)}
              className={showSystemTopics ? 'border-cyan-500 text-cyan-400' : 'border-border text-muted-foreground'}
            >
              <Filter className="w-4 h-4 mr-2" />
              $SYS
            </Button>
          </div>

          {/* Messages List */}
          <div className="bg-background rounded-lg p-4 h-[500px] overflow-y-auto font-mono text-sm">
            {filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-xs mt-1">Subscribe to a topic to see messages</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.direction === 'incoming' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded border ${
                        msg.direction === 'incoming'
                          ? 'bg-blue-900/20 border-blue-800/50'
                          : 'bg-green-900/20 border-green-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={msg.direction === 'incoming' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {msg.direction === 'incoming' ? 'IN' : 'OUT'}
                          </Badge>
                          <span className="text-cyan-400 text-xs">{msg.topic}</span>
                          <Badge variant="outline" className="text-xs border-border">
                            QoS {msg.qos}
                          </Badge>
                          {msg.retain && (
                            <Badge variant="outline" className="text-xs border-yellow-700 text-yellow-400">
                              Retained
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(msg.payload)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <pre className="text-foreground text-xs overflow-x-auto whitespace-pre-wrap break-all">
                        {typeof msg.payload === 'string'
                          ? msg.payload
                          : JSON.stringify(JSON.parse(msg.payload), null, 2)}
                      </pre>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Clients Tab Component
  const ClientsTab = () => (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" />
              Connected Clients
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchClients}
              className="text-muted-foreground"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No clients connected</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.map((client, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-semibold">{client.client_id}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {client.ip_address} • Connected since {new Date(client.connected_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Messages Sent</p>
                      <p className="text-sm text-foreground font-mono">{client.messages_sent || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Messages Received</p>
                      <p className="text-sm text-foreground font-mono">{client.messages_received || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Subscriptions</p>
                      <p className="text-sm text-foreground font-mono">{client.subscriptions || 0}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Topics Tab Component
  const TopicsTab = () => (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Active Topics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTopics}
              className="text-muted-foreground"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active topics</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-secondary/50 rounded-lg border border-border hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-foreground font-mono text-sm">{topic.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Subscribers</p>
                        <p className="text-sm text-foreground font-mono">{topic.subscribers || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Messages</p>
                        <p className="text-sm text-foreground font-mono">{topic.messages || 0}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSubscribeTopic(topic.name);
                          setActiveTab('subscribe');
                        }}
                        className="text-cyan-400"
                      >
                        Subscribe
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MQTT Broker Manager</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor Eclipse Mosquitto MQTT broker</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={brokerStatus?.status === 'running' ? 'default' : 'destructive'}
            className={
              brokerStatus?.status === 'running'
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-red-500/20 text-red-400 border-red-500/50'
            }
          >
            {brokerStatus?.status === 'running' ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Broker Online
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Broker Offline
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'publish', label: 'Publish', icon: Send },
            { id: 'subscribe', label: 'Subscribe', icon: Radio },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'topics', label: 'Topics', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'publish' && <PublishTab />}
          {activeTab === 'subscribe' && <SubscribeTab />}
          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'topics' && <TopicsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MqttManager;
