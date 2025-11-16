import React, { useState, useEffect } from 'react';
import { Wifi, AlertCircle, Loader2, Network, Link } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Badge } from './ui';
import axios from 'axios';

/**
 * Ports Section Component
 * Displays port definitions (communication interfaces) for an EDS file
 */
const PortsSection = ({ edsId }) => {
  const [portsData, setPortsData] = useState({ ports: [], total_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!edsId) return;

    const fetchPorts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/eds/${edsId}/ports`);
        setPortsData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch ports:', err);
        setError('Failed to load ports');
      } finally {
        setLoading(false);
      }
    };

    fetchPorts();
  }, [edsId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-muted-foreground">Loading ports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-400">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  if (portsData.total_count === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No port definitions found in this EDS file.</p>
        <p className="text-sm mt-2">
          Ports define communication interfaces like TCP, Ethernet, and other network protocols.
        </p>
      </div>
    );
  }

  // Group ports by type
  const portsByType = portsData.ports.reduce((acc, port) => {
    const type = port.port_type || 'Unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(port);
    return acc;
  }, {});

  const getPortTypeColor = (portType) => {
    const type = (portType || '').toLowerCase();
    if (type.includes('tcp') || type.includes('ethernet')) return 'blue';
    if (type.includes('udp')) return 'purple';
    if (type.includes('serial')) return 'green';
    if (type.includes('can')) return 'orange';
    return 'slate';
  };

  const getPortTypeIcon = (portType) => {
    const type = (portType || '').toLowerCase();
    if (type.includes('tcp') || type.includes('ethernet') || type.includes('udp')) {
      return <Wifi className="w-5 h-5" />;
    }
    if (type.includes('link')) {
      return <Link className="w-5 h-5" />;
    }
    return <Network className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {Object.entries(portsByType).map(([portType, ports]) => {
        const color = getPortTypeColor(portType);
        const icon = getPortTypeIcon(portType);

        return (
          <div key={portType}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`text-${color}-400`}>
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {portType} Ports
              </h3>
              <Badge className={`bg-${color}-900/50 text-${color}-300 border-${color}-700`}>
                {ports.length}
              </Badge>
            </div>

            <div className="grid gap-4">
              {ports.map((port) => (
                <Card
                  key={port.id}
                  className={`bg-card border-border hover:border-${color}-700/50 transition-colors`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-foreground text-base flex items-center gap-2">
                          <span className={`font-mono text-${color}-300`}>
                            Port {port.port_number}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span>{port.port_name}</span>
                        </CardTitle>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground border-border"
                      >
                        #{port.port_number}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Port Type</div>
                        <div className={`font-mono text-${color}-300`}>
                          {port.port_type || 'N/A'}
                        </div>
                      </div>
                      {port.link_number !== null && port.link_number !== undefined && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Link Number</div>
                          <div className="font-mono text-foreground">
                            {port.link_number}
                          </div>
                        </div>
                      )}
                    </div>

                    {port.port_path && (
                      <div className="bg-secondary/50 rounded p-2">
                        <div className="text-xs text-muted-foreground mb-1">Port Path</div>
                        <div className="font-mono text-xs text-cyan-300">
                          {port.port_path}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Info Footer */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <div className="text-sm text-foreground">
          <strong className="text-blue-300">Ports</strong> define the communication
          interfaces available on the device, including protocol type, addressing,
          and link information for network connectivity.
        </div>
      </div>
    </div>
  );
};

export default PortsSection;
