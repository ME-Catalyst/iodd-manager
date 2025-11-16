import React, { useState, useEffect } from 'react';
import { Box, AlertCircle, Loader2, Cpu, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Badge } from './ui';
import axios from 'axios';

/**
 * Modules Section Component
 * Displays module definitions for modular EDS devices (e.g., bus couplers, distributed I/O)
 */
const ModulesSection = ({ edsId }) => {
  const [modulesData, setModulesData] = useState({ modules: [], total_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!edsId) return;

    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/eds/${edsId}/modules`);
        setModulesData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch modules:', err);
        setError('Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [edsId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-muted-foreground">Loading modules...</span>
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

  if (modulesData.total_count === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No module definitions found in this EDS file.</p>
        <p className="text-sm mt-2">
          Modules are used in modular devices like bus couplers and distributed I/O systems.
        </p>
      </div>
    );
  }

  const formatRevision = (major, minor) => {
    if (major === null && minor === null) return 'N/A';
    if (minor === null) return `v${major}`;
    return `v${major}.${minor}`;
  };

  const formatIOSize = (inputSize, outputSize) => {
    const parts = [];
    if (inputSize !== null && inputSize !== undefined) {
      parts.push(`${inputSize} bytes in`);
    }
    if (outputSize !== null && outputSize !== undefined) {
      parts.push(`${outputSize} bytes out`);
    }
    return parts.length > 0 ? parts.join(' / ') : 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-purple-400">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Hardware Modules
        </h3>
        <Badge className="bg-purple-900/50 text-purple-300 border-purple-700">
          {modulesData.total_count}
        </Badge>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-4">
        {modulesData.modules.map((module) => (
          <Card
            key={module.id}
            className="bg-card border-border hover:border-purple-700/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <span className="font-mono text-purple-300">
                      Module {module.module_number}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span>{module.module_name}</span>
                  </CardTitle>
                  {module.module_description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.module_description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground border-border"
                >
                  #{module.module_number}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {module.catalog_number && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Catalog Number</div>
                    <div className="font-mono text-cyan-300">
                      {module.catalog_number}
                    </div>
                  </div>
                )}
                {module.device_type && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Device Type</div>
                    <div className="text-foreground">
                      {module.device_type}
                    </div>
                  </div>
                )}
                {(module.major_revision !== null || module.minor_revision !== null) && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Revision</div>
                    <div className="font-mono text-green-300">
                      {formatRevision(module.major_revision, module.minor_revision)}
                    </div>
                  </div>
                )}
                {module.module_class && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Module Class</div>
                    <div className="text-foreground">
                      {module.module_class}
                    </div>
                  </div>
                )}
              </div>

              {/* I/O Information */}
              {(module.input_size !== null || module.output_size !== null) && (
                <div className="bg-secondary/50 rounded p-3">
                  <div className="text-xs text-muted-foreground mb-1">I/O Sizes</div>
                  <div className="font-mono text-sm text-blue-300">
                    {formatIOSize(module.input_size, module.output_size)}
                  </div>
                </div>
              )}

              {/* Configuration Info */}
              {module.config_size !== null && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Config Size</div>
                    <div className="font-mono text-yellow-300">
                      {module.config_size} bytes
                    </div>
                  </div>
                  {module.slot_number !== null && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Slot Number</div>
                      <div className="font-mono text-foreground">
                        {module.slot_number}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vendor/Product Codes */}
              {(module.vendor_code !== null || module.product_code !== null) && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {module.vendor_code !== null && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Vendor Code</div>
                      <div className="font-mono text-orange-300">
                        0x{module.vendor_code.toString(16).toUpperCase().padStart(4, '0')}
                      </div>
                    </div>
                  )}
                  {module.product_code !== null && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Product Code</div>
                      <div className="font-mono text-orange-300">
                        0x{module.product_code.toString(16).toUpperCase().padStart(4, '0')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Config Data (if present) */}
              {module.config_data && (
                <div className="bg-secondary/50 rounded p-2">
                  <div className="text-xs text-muted-foreground mb-1">Configuration Data</div>
                  <div className="font-mono text-xs text-cyan-300 break-all">
                    {module.config_data}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Footer */}
      <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
        <div className="text-sm text-foreground">
          <strong className="text-purple-300">Modules</strong> represent physical I/O modules
          in modular devices like bus couplers and distributed I/O systems. Each module
          can have its own configuration, input/output sizes, and hardware characteristics.
        </div>
      </div>
    </div>
  );
};

export default ModulesSection;
