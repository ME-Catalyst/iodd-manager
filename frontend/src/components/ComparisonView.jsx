import React, { useState, useEffect } from 'react';
import { Plus, X, GitCompare, ArrowLeft, ChevronRight, Check, AlertCircle, Info } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button } from './ui';
import { getUnitInfo, formatValueWithUnit } from '../utils/iolinkUnits';
import { getAccessRightInfo, getDataTypeDisplay } from '../utils/iolinkConstants';

/**
 * Device Comparison View - Compare multiple devices side by side
 * Supports comparing different versions, vendors, or entirely different devices
 */
const ComparisonView = ({ API_BASE, onBack, initialDevices = [] }) => {
  const [selectedDevices, setSelectedDevices] = useState(initialDevices);
  const [deviceDetails, setDeviceDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [availableEds, setAvailableEds] = useState([]);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState('parameters'); // parameters, specs, all

  // Fetch available devices on mount
  useEffect(() => {
    fetchAvailableDevices();
  }, []);

  // Fetch device details when selection changes
  useEffect(() => {
    if (selectedDevices.length > 0) {
      fetchDeviceDetails();
    }
  }, [selectedDevices]);

  const fetchAvailableDevices = async () => {
    try {
      const [ioddResponse, edsResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/iodd`),
        axios.get(`${API_BASE}/api/eds`)
      ]);

      setAvailableDevices(
        ioddResponse.data.map(d => ({ ...d, type: 'IODD' }))
      );
      setAvailableEds(
        edsResponse.data.map(e => ({ ...e, type: 'EDS' }))
      );
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const fetchDeviceDetails = async () => {
    setLoading(true);
    const details = {};

    try {
      for (const device of selectedDevices) {
        if (device.type === 'IODD') {
          const response = await axios.get(`${API_BASE}/api/iodd/${device.id}`);
          details[device.id] = { ...response.data, type: 'IODD' };
        } else if (device.type === 'EDS') {
          const response = await axios.get(`${API_BASE}/api/eds/${device.id}`);
          details[device.id] = { ...response.data, type: 'EDS' };
        }
      }

      setDeviceDetails(details);
    } catch (error) {
      console.error('Failed to fetch device details:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = (device) => {
    if (selectedDevices.length >= 4) {
      alert('Maximum 4 devices can be compared at once');
      return;
    }

    if (selectedDevices.find(d => d.id === device.id && d.type === device.type)) {
      alert('Device already added');
      return;
    }

    setSelectedDevices([...selectedDevices, device]);
    setShowDeviceSelector(false);
    setSearchQuery('');
  };

  const removeDevice = (deviceToRemove) => {
    setSelectedDevices(selectedDevices.filter(
      d => !(d.id === deviceToRemove.id && d.type === deviceToRemove.type)
    ));

    const newDetails = { ...deviceDetails };
    delete newDetails[deviceToRemove.id];
    setDeviceDetails(newDetails);
  };

  const getParameterValue = (device, paramName) => {
    if (!device || !device.parameters) return null;

    // Try exact match first
    let param = device.parameters.find(p => {
      const pName = p.name || p.param_name || '';
      return pName.toLowerCase() === paramName.toLowerCase();
    });

    // If no exact match, try fuzzy matching (remove spaces, underscores, dashes)
    if (!param) {
      const normalizedParamName = paramName.toLowerCase().replace(/[\s_-]/g, '');
      param = device.parameters.find(p => {
        const pName = (p.name || p.param_name || '').toLowerCase().replace(/[\s_-]/g, '');
        return pName === normalizedParamName;
      });
    }

    return param;
  };

  const getAllParameterNames = () => {
    const nameMap = new Map(); // Use map to track unique normalized names

    Object.values(deviceDetails).forEach(device => {
      if (device.parameters) {
        device.parameters.forEach(p => {
          const rawName = p.name || p.param_name;
          if (rawName) {
            const normalized = rawName.toLowerCase().replace(/[\s_-]/g, '');
            // Store the first occurrence of each normalized name
            if (!nameMap.has(normalized)) {
              nameMap.set(normalized, rawName);
            }
          }
        });
      }
    });

    // Return sorted display names
    return Array.from(nameMap.values()).sort();
  };

  const renderParameterComparison = () => {
    const paramNames = getAllParameterNames();

    if (paramNames.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Info className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No parameters to compare</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sticky left-0 bg-secondary z-10">
                Parameter
              </th>
              {selectedDevices.map(device => (
                <th key={`${device.type}-${device.id}`} className="px-4 py-3 text-left text-sm font-semibold text-foreground min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className="truncate">
                      {device.product_name}
                    </span>
                    <button
                      onClick={() => removeDevice(device)}
                      className="ml-2 text-muted-foreground hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paramNames.map((paramName, index) => {
              const values = selectedDevices.map(device => {
                const detail = deviceDetails[device.id];
                return getParameterValue(detail, paramName);
              });

              // Check if values differ
              const allSame = values.every((v, i, arr) =>
                JSON.stringify(v?.default_value) === JSON.stringify(arr[0]?.default_value)
              );

              return (
                <tr key={index} className={`hover:bg-secondary/50 ${!allSame ? 'bg-orange-500/5' : ''}`}>
                  <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-card z-10">
                    {paramName}
                    {!allSame && (
                      <AlertCircle className="inline-block w-3 h-3 ml-2 text-orange-400" />
                    )}
                  </td>
                  {values.map((param, i) => (
                    <td key={i} className="px-4 py-3 text-sm text-foreground">
                      {param ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {param.default_value !== null && param.default_value !== undefined
                                ? (param.units ? formatValueWithUnit(param.default_value, parseInt(param.units), 2) : param.default_value)
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            {param.data_type && (
                              <span className="text-muted-foreground">
                                {getDataTypeDisplay(param.data_type)}
                              </span>
                            )}
                            {param.access_rights && (
                              <span className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                                {getAccessRightInfo(param.access_rights)?.label || param.access_rights}
                              </span>
                            )}
                          </div>
                          {(param.min_value != null || param.max_value != null) && (
                            <div className="text-xs text-muted-foreground">
                              Range: {param.min_value ?? '?'} - {param.max_value ?? '?'}
                              {param.units && ` ${getUnitInfo(parseInt(param.units))?.symbol || ''}`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSpecsComparison = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sticky left-0 bg-secondary z-10">
                Specification
              </th>
              {selectedDevices.map(device => (
                <th key={`${device.type}-${device.id}`} className="px-4 py-3 text-left text-sm font-semibold text-foreground min-w-[200px]">
                  {device.product_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr className="hover:bg-secondary/50">
              <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-card">Device Type</td>
              {selectedDevices.map((device, i) => (
                <td key={i} className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    device.type === 'EDS' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {device.type}
                  </span>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-secondary/50">
              <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-card">Vendor</td>
              {selectedDevices.map((device, i) => {
                const detail = deviceDetails[device.id];
                return (
                  <td key={i} className="px-4 py-3 text-sm text-foreground">
                    {detail?.manufacturer || detail?.vendor_name || 'N/A'}
                  </td>
                );
              })}
            </tr>
            <tr className="hover:bg-secondary/50">
              <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-card">Product Name</td>
              {selectedDevices.map((device, i) => (
                <td key={i} className="px-4 py-3 text-sm text-foreground">{device.product_name}</td>
              ))}
            </tr>
            <tr className="hover:bg-secondary/50">
              <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-card">Device/Product ID</td>
              {selectedDevices.map((device, i) => {
                const detail = deviceDetails[device.id];
                return (
                  <td key={i} className="px-4 py-3 text-sm text-foreground">
                    {detail?.device_id || detail?.product_code || 'N/A'}
                  </td>
                );
              })}
            </tr>
            <tr className="hover:bg-secondary/50">
              <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-card">Version/Revision</td>
              {selectedDevices.map((device, i) => {
                const detail = deviceDetails[device.id];
                return (
                  <td key={i} className="px-4 py-3 text-sm text-foreground">
                    {detail?.iodd_version || `${detail?.major_revision}.${detail?.minor_revision}` || 'N/A'}
                  </td>
                );
              })}
            </tr>
            <tr className="hover:bg-secondary/50">
              <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-card">Parameter Count</td>
              {selectedDevices.map((device, i) => {
                const detail = deviceDetails[device.id];
                return (
                  <td key={i} className="px-4 py-3 text-sm text-foreground">
                    {detail?.parameters?.length || 0}
                  </td>
                );
              })}
            </tr>
            <tr className="hover:bg-secondary/50">
              <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-card">Description</td>
              {selectedDevices.map((device, i) => {
                const detail = deviceDetails[device.id];
                return (
                  <td key={i} className="px-4 py-3 text-sm text-foreground">
                    {detail?.description || 'N/A'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Smart device filtering
  const filteredDevices = [...availableDevices, ...availableEds].filter(device => {
    // Filter by search query
    const matchesSearch = !searchQuery ||
      device.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by device type (if any device is selected, only show same type)
    const matchesType = selectedDevices.length === 0 ||
      selectedDevices[0].type === device.type;

    // Exclude already selected devices
    const notAlreadySelected = !selectedDevices.find(d =>
      d.id === device.id && d.type === device.type
    );

    return matchesSearch && matchesType && notAlreadySelected;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <GitCompare className="w-8 h-8 text-orange-500" />
                Device Comparison
              </h1>
              <p className="text-muted-foreground">
                Compare up to 4 devices side-by-side
              </p>
            </div>

            {selectedDevices.length < 4 && (
              <Button
                onClick={() => setShowDeviceSelector(!showDeviceSelector)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            )}
          </div>
        </div>

        {/* Device Selector */}
        {showDeviceSelector && (
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Select Device to Add</CardTitle>
                <button
                  onClick={() => setShowDeviceSelector(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedDevices.length > 0 && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    Showing only <strong>{selectedDevices[0].type}</strong> devices to match your selection
                  </p>
                </div>
              )}

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devices..."
                className="w-full mb-4 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredDevices.map(device => (
                  <div
                    key={`${device.type}-${device.id}`}
                    onClick={() => addDevice(device)}
                    className="p-3 bg-secondary/50 border border-border rounded-lg hover:bg-secondary hover:border-orange-500/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-foreground font-medium mb-1">{device.product_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {device.manufacturer || device.vendor_name}
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            device.type === 'EDS' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                          }`}>
                            {device.type}
                          </span>
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-400" />
                    </div>
                  </div>
                ))}

                {filteredDevices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No devices found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Devices Selected */}
        {selectedDevices.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <GitCompare className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold mb-2">No devices selected</h3>
              <p className="text-muted-foreground mb-4">
                Add at least 2 devices to start comparing
              </p>
              <Button
                onClick={() => setShowDeviceSelector(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Device
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comparison View */}
        {selectedDevices.length > 0 && (
          <>
            {/* Mode Selector */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Compare:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCompareMode('specs')}
                  className={`px-4 py-2 text-sm rounded ${
                    compareMode === 'specs'
                      ? 'bg-orange-600 text-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setCompareMode('parameters')}
                  className={`px-4 py-2 text-sm rounded ${
                    compareMode === 'parameters'
                      ? 'bg-orange-600 text-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Parameters
                </button>
              </div>
            </div>

            {/* Comparison Table */}
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading device details...</p>
                  </div>
                ) : (
                  <>
                    {compareMode === 'specs' && renderSpecsComparison()}
                    {compareMode === 'parameters' && renderParameterComparison()}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            {compareMode === 'parameters' && !loading && (
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500/10 border border-orange-500/30 rounded"></div>
                  <span>Values differ across devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span>Indicates difference</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonView;
