import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Network, Wifi, Shield, Activity, Info, Server, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui';

/**
 * NetworkConfigTab - Displays advanced EDS network configuration
 * Includes DLR, TCP/IP, Ethernet, QoS, and LLDP settings
 */
const NetworkConfigTab = ({ selectedEds, API_BASE }) => {
  const [networkConfig, setNetworkConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['dlr', 'tcpip', 'ethernet']));

  useEffect(() => {
    const fetchNetworkConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE}/api/eds/${selectedEds.id}/network-config`);
        setNetworkConfig(response.data);
      } catch (err) {
        console.error('Failed to fetch network configuration:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkConfig();
  }, [API_BASE, selectedEds.id]);

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading network configuration...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <div className="text-error">Failed to load network configuration: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const hasAnyConfig = networkConfig && (
    networkConfig.dlr_config ||
    networkConfig.tcpip_interface ||
    networkConfig.ethernet_link ||
    networkConfig.qos_config ||
    networkConfig.lldp_management
  );

  if (!hasAnyConfig) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">No Network Configuration</h3>
          <p className="text-muted-foreground">
            This device does not have advanced network configuration sections (DLR, TCP/IP, QoS, etc.)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* DLR Configuration */}
      {networkConfig.dlr_config && (
        <Card className="bg-card border-border">
          <CardHeader
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('dlr')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-success" />
                <div>
                  <CardTitle className="text-foreground text-lg">DLR (Device Level Ring)</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">
                    Ring network topology configuration
                  </CardDescription>
                </div>
              </div>
              {expandedSections.has('dlr') ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {expandedSections.has('dlr') && (
            <CardContent className="border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Object Name"
                  value={networkConfig.dlr_config.object_name}
                />
                <InfoField
                  label="Class Code"
                  value={networkConfig.dlr_config.object_class_code ? `0x${networkConfig.dlr_config.object_class_code.toString(16).toUpperCase()}` : null}
                />
                <InfoField
                  label="Network Topology"
                  value={networkConfig.dlr_config.network_topology !== null ? (networkConfig.dlr_config.network_topology === 0 ? 'Linear' : 'Ring') : null}
                  badge={networkConfig.dlr_config.network_topology === 1}
                />
                <InfoField
                  label="Switch Enabled"
                  value={networkConfig.dlr_config.enable_switch}
                  boolean
                />
                <InfoField
                  label="Beacon Interval"
                  value={networkConfig.dlr_config.beacon_interval}
                  suffix="µs"
                />
                <InfoField
                  label="Beacon Timeout"
                  value={networkConfig.dlr_config.beacon_timeout}
                  suffix="µs"
                />
                <InfoField
                  label="VLAN ID"
                  value={networkConfig.dlr_config.vlan_id}
                />
                <InfoField
                  label="Revision"
                  value={networkConfig.dlr_config.revision}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* TCP/IP Interface */}
      {networkConfig.tcpip_interface && (
        <Card className="bg-card border-border">
          <CardHeader
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('tcpip')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Network className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-foreground text-lg">TCP/IP Interface</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">
                    IP stack configuration and settings
                  </CardDescription>
                </div>
              </div>
              {expandedSections.has('tcpip') ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {expandedSections.has('tcpip') && (
            <CardContent className="border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Object Name"
                  value={networkConfig.tcpip_interface.object_name}
                />
                <InfoField
                  label="Class Code"
                  value={networkConfig.tcpip_interface.object_class_code ? `0x${networkConfig.tcpip_interface.object_class_code.toString(16).toUpperCase()}` : null}
                />
                <InfoField
                  label="Host Name"
                  value={networkConfig.tcpip_interface.host_name}
                />
                <InfoField
                  label="Interface Config"
                  value={networkConfig.tcpip_interface.interface_config}
                />
                <InfoField
                  label="TTL Value"
                  value={networkConfig.tcpip_interface.ttl_value}
                />
                <InfoField
                  label="Multicast Config"
                  value={networkConfig.tcpip_interface.mcast_config}
                />
                <InfoField
                  label="ACD Enabled"
                  value={networkConfig.tcpip_interface.select_acd}
                  boolean
                />
                <InfoField
                  label="Encapsulation Timeout"
                  value={networkConfig.tcpip_interface.encap_timeout}
                  suffix="ms"
                />
                <InfoField
                  label="Revision"
                  value={networkConfig.tcpip_interface.revision}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Ethernet Link */}
      {networkConfig.ethernet_link && (
        <Card className="bg-card border-border">
          <CardHeader
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('ethernet')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-secondary" />
                <div>
                  <CardTitle className="text-foreground text-lg">Ethernet Link</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">
                    Physical Ethernet interface properties
                  </CardDescription>
                </div>
              </div>
              {expandedSections.has('ethernet') ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {expandedSections.has('ethernet') && (
            <CardContent className="border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Object Name"
                  value={networkConfig.ethernet_link.object_name}
                />
                <InfoField
                  label="Class Code"
                  value={networkConfig.ethernet_link.object_class_code ? `0x${networkConfig.ethernet_link.object_class_code.toString(16).toUpperCase()}` : null}
                />
                <InfoField
                  label="Interface Speed"
                  value={networkConfig.ethernet_link.interface_speed}
                  suffix="Mbps"
                />
                <InfoField
                  label="Interface Flags"
                  value={networkConfig.ethernet_link.interface_flags ? `0x${networkConfig.ethernet_link.interface_flags.toString(16).toUpperCase()}` : null}
                />
                <InfoField
                  label="Physical Address (MAC)"
                  value={networkConfig.ethernet_link.physical_address}
                  mono
                />
                <InfoField
                  label="Interface Label"
                  value={networkConfig.ethernet_link.interface_label}
                />
                <InfoField
                  label="Revision"
                  value={networkConfig.ethernet_link.revision}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* QoS Configuration */}
      {networkConfig.qos_config && (
        <Card className="bg-card border-border">
          <CardHeader
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('qos')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-warning" />
                <div>
                  <CardTitle className="text-foreground text-lg">QoS (Quality of Service)</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">
                    Traffic prioritization and DSCP settings
                  </CardDescription>
                </div>
              </div>
              {expandedSections.has('qos') ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {expandedSections.has('qos') && (
            <CardContent className="border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Object Name"
                  value={networkConfig.qos_config.object_name}
                />
                <InfoField
                  label="Class Code"
                  value={networkConfig.qos_config.object_class_code ? `0x${networkConfig.qos_config.object_class_code.toString(16).toUpperCase()}` : null}
                />
                <InfoField
                  label="QoS Tag Enable"
                  value={networkConfig.qos_config.qos_tag_enable}
                  boolean
                />
                <InfoField
                  label="DSCP Urgent"
                  value={networkConfig.qos_config.dscp_urgent}
                />
                <InfoField
                  label="DSCP Scheduled"
                  value={networkConfig.qos_config.dscp_scheduled}
                />
                <InfoField
                  label="DSCP High"
                  value={networkConfig.qos_config.dscp_high}
                />
                <InfoField
                  label="DSCP Low"
                  value={networkConfig.qos_config.dscp_low}
                />
                <InfoField
                  label="DSCP Explicit"
                  value={networkConfig.qos_config.dscp_explicit}
                />
                <InfoField
                  label="Revision"
                  value={networkConfig.qos_config.revision}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* LLDP Management */}
      {networkConfig.lldp_management && (
        <Card className="bg-card border-border">
          <CardHeader
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('lldp')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-brand-green" />
                <div>
                  <CardTitle className="text-foreground text-lg">LLDP Management</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">
                    Link Layer Discovery Protocol configuration
                  </CardDescription>
                </div>
              </div>
              {expandedSections.has('lldp') ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {expandedSections.has('lldp') && (
            <CardContent className="border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Object Name"
                  value={networkConfig.lldp_management.object_name}
                />
                <InfoField
                  label="Class Code"
                  value={networkConfig.lldp_management.object_class_code ? `0x${networkConfig.lldp_management.object_class_code.toString(16).toUpperCase()}` : null}
                />
                <InfoField
                  label="Message TX Interval"
                  value={networkConfig.lldp_management.msg_tx_interval}
                  suffix="seconds"
                />
                <InfoField
                  label="Message TX Hold"
                  value={networkConfig.lldp_management.msg_tx_hold}
                />
                <InfoField
                  label="Chassis ID Subtype"
                  value={networkConfig.lldp_management.chassis_id_subtype}
                />
                <InfoField
                  label="Chassis ID"
                  value={networkConfig.lldp_management.chassis_id}
                  mono
                />
                <InfoField
                  label="Port ID Subtype"
                  value={networkConfig.lldp_management.port_id_subtype}
                />
                <InfoField
                  label="Port ID"
                  value={networkConfig.lldp_management.port_id}
                  mono
                />
                <InfoField
                  label="Revision"
                  value={networkConfig.lldp_management.revision}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Object Metadata */}
      {networkConfig.object_metadata && networkConfig.object_metadata.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-secondary" />
              CIP Object Metadata
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Common Industrial Protocol object information
            </CardDescription>
          </CardHeader>
          <CardContent className="border-t border-border pt-4">
            <div className="space-y-3">
              {networkConfig.object_metadata.map((obj, index) => (
                <div key={index} className="p-3 bg-secondary/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{obj.section_name}</span>
                    {obj.object_class_code && (
                      <Badge className="bg-secondary text-foreground font-mono text-xs">
                        Class 0x{obj.object_class_code.toString(16).toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {obj.object_name && (
                      <div>
                        <span className="text-muted-foreground">Object:</span>
                        <span className="ml-2 text-foreground">{obj.object_name}</span>
                      </div>
                    )}
                    {obj.revision !== null && (
                      <div>
                        <span className="text-muted-foreground">Revision:</span>
                        <span className="ml-2 text-foreground">{obj.revision}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * InfoField - Reusable component for displaying field information
 */
const InfoField = ({ label, value, suffix, boolean, badge, mono }) => {
  if (value === null || value === undefined) {
    return (
      <div className="p-3 bg-surface rounded-lg border border-border">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-sm text-muted-foreground italic">Not configured</div>
      </div>
    );
  }

  let displayValue = value;

  if (boolean) {
    displayValue = (
      <div className="flex items-center gap-2">
        {value ? (
          <>
            <Check className="w-4 h-4 text-success" />
            <span className="text-success">Enabled</span>
          </>
        ) : (
          <>
            <X className="w-4 h-4 text-error" />
            <span className="text-error">Disabled</span>
          </>
        )}
      </div>
    );
  } else {
    displayValue = (
      <span className={mono ? 'font-mono' : ''}>
        {value}{suffix ? ` ${suffix}` : ''}
      </span>
    );
  }

  return (
    <div className="p-3 bg-surface rounded-lg border border-border">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm text-foreground flex items-center gap-2">
        {displayValue}
        {badge && <Badge className="bg-success/20 text-success text-xs">Active</Badge>}
      </div>
    </div>
  );
};

export default NetworkConfigTab;
