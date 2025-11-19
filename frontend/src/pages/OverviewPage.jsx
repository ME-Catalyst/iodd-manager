import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { Package, Database, Clock, ChevronRight, Network, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const OverviewPage = ({ stats, devices, onNavigate }) => (
  <section className="space-y-8" aria-labelledby="overview-heading">
    {/* Hero Welcome Section */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-green/10 via-brand-green/5 to-transparent border border-brand-green/20 p-8 md:p-12">
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-green/20 flex items-center justify-center" aria-hidden="true">
            <Package className="w-6 h-6 text-brand-green" aria-hidden="true" />
          </div>
          <h2 id="overview-heading" className="text-4xl md:text-5xl font-bold text-foreground">
            Welcome to Greenstack
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Industrial IoT development platform
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {/* IO-Link Stats */}
          <div className="bg-card/50 backdrop-blur rounded-xl p-5 border border-border/50 hover:border-brand-green/30 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-green/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IO-Link Devices</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_devices}</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-xl p-5 border border-border/50 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IO-Link Parameters</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_parameters}</p>
              </div>
            </div>
          </div>

          {/* EDS Stats */}
          <div className="bg-card/50 backdrop-blur rounded-xl p-5 border border-border/50 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">EtherNet/IP Devices</p>
                <p className="text-2xl font-bold text-foreground">{stats.unique_eds_devices || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-xl p-5 border border-border/50 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">EDS Parameters</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_eds_parameters || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-0"></div>
    </div>

    {/* Recent Devices */}
    {devices.length > 0 && (
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-brand-green/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-brand-green" />
              </div>
              <CardTitle className="text-foreground">Recent Devices</CardTitle>
            </div>
            <button
              onClick={() => onNavigate('devices')}
              className="text-sm text-brand-green hover:text-brand-green/80 flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {devices.slice(0, 5).map((device, index) => (
              <motion.button
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/50 hover:border-brand-green/30 transition-all cursor-pointer w-full text-left"
                onClick={() => onNavigate('devices', device)}
                type="button"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-green/30 to-brand-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors">
                      {device.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{device.manufacturer}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-green group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Empty State */}
    {devices.length === 0 && (
      <Card className="bg-card border-border border-dashed">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-green/20 to-purple-500/20 flex items-center justify-center">
              <Package className="w-10 h-10 text-brand-green" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No devices yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first IODD file to get started
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white rounded-lg font-medium transition-colors"
            >
              Upload IODD File
            </button>
          </div>
        </CardContent>
      </Card>
    )}
  </section>
);

export default OverviewPage;
