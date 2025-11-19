import React, { useState } from 'react';
import { Button, Badge } from '@/components/ui';
import {
  Cpu, Settings, ChevronLeft, Home, Radio, FileText, Wifi, Database,
  Workflow, LineChart, Server, Zap, Search, GitBranch, BarChart3, Book
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

const Sidebar = ({ activeView, setActiveView, devices, edsFiles, onDeviceSelect, onEdsSelect, recentDevices, recentEdsFiles }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-background border-r border-border transition-all duration-300 z-50 ${collapsed ? 'w-16' : 'w-64'}`}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <header className="px-4 py-5 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Cpu className="w-6 h-6 text-brand-green" aria-hidden="true" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-brand-green to-brand-green bg-clip-text text-transparent">
                GreenStack
              </h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} aria-hidden="true" />
          </Button>
        </header>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto" aria-label="Primary navigation">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Overview"
            active={activeView === 'overview'}
            onClick={() => setActiveView('overview')}
            collapsed={collapsed}
          />

          {/* Devices Section */}
          {!collapsed && (
            <div className="px-3 pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Devices</p>
            </div>
          )}
          <NavItem
            icon={<Radio className="w-5 h-5" />}
            label={`IO Link Devices`}
            badge={devices.length}
            active={activeView === 'devices'}
            onClick={() => setActiveView('devices')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<FileText className="w-5 h-5" />}
            label={`EDS Files`}
            badge={edsFiles.length}
            active={activeView === 'eds-files'}
            onClick={() => setActiveView('eds-files')}
            collapsed={collapsed}
          />

          {/* Applications Section */}
          {!collapsed && (
            <div className="px-3 pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applications</p>
            </div>
          )}
          <NavItem
            icon={<Wifi className="w-5 h-5" />}
            label="MQTT Broker"
            active={activeView === 'mqtt'}
            onClick={() => setActiveView('mqtt')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Database className="w-5 h-5" />}
            label="InfluxDB"
            active={activeView === 'influxdb'}
            onClick={() => setActiveView('influxdb')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Workflow className="w-5 h-5" />}
            label="Node-RED"
            active={activeView === 'nodered'}
            onClick={() => setActiveView('nodered')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<LineChart className="w-5 h-5" />}
            label="Grafana"
            active={activeView === 'grafana'}
            onClick={() => setActiveView('grafana')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Server className="w-5 h-5" />}
            label="Services"
            active={activeView === 'services'}
            onClick={() => setActiveView('services')}
            collapsed={collapsed}
          />

          {/* Tools Section */}
          {!collapsed && (
            <div className="px-3 pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</p>
            </div>
          )}
          <NavItem
            icon={<Zap className="w-5 h-5" />}
            label="Generators"
            active={activeView === 'generators'}
            onClick={() => setActiveView('generators')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Search className="w-5 h-5" />}
            label="Search"
            active={activeView === 'search'}
            onClick={() => setActiveView('search')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<GitBranch className="w-5 h-5" />}
            label="Compare"
            active={activeView === 'compare'}
            onClick={() => setActiveView('compare')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Analytics"
            active={activeView === 'analytics'}
            onClick={() => setActiveView('analytics')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Book className="w-5 h-5" />}
            label="Documentation"
            active={activeView === 'documentation'}
            onClick={() => setActiveView('documentation')}
            collapsed={collapsed}
          />
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setActiveView('settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <ThemeToggle variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, badge, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all ${
      active
        ? 'bg-gradient-to-r from-brand-green to-brand-green text-foreground shadow-lg shadow-brand-green/20'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
    aria-label={`${label}${badge !== undefined ? `, ${badge} items` : ''}`}
    aria-current={active ? 'page' : undefined}
    role="menuitem"
  >
    <span aria-hidden="true">{icon}</span>
    {!collapsed && (
      <>
        <span className="flex-1 text-sm font-medium text-left">{label}</span>
        {badge !== undefined && (
          <Badge className="bg-muted text-foreground text-xs" aria-label={`${badge} items`}>
            {badge}
          </Badge>
        )}
      </>
    )}
  </button>
);

export default Sidebar;
