import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui';
import {
  BarChart3, TrendingUp, Package, Database, Activity, Download,
  Cpu, Zap, Calendar, Users, PieChart, LineChart as LineChartIcon
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsDashboard = ({ devices, edsFiles, stats }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('devices');

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Manufacturer distribution
    const manufacturerCounts = {};
    devices.forEach((device) => {
      const mfg = device.manufacturer || 'Unknown';
      manufacturerCounts[mfg] = (manufacturerCounts[mfg] || 0) + 1;
    });

    // EDS vendor distribution
    const vendorCounts = {};
    edsFiles.forEach((eds) => {
      const vendor = eds.vendor_name || 'Unknown';
      vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;
    });

    // Device I/O types distribution
    const ioTypeCounts = { digital: 0, analog: 0, mixed: 0, unknown: 0 };
    devices.forEach((device) => {
      const params = device.parameters || [];
      const hasDigital = params.some(p => p.datatype?.toLowerCase().includes('bool'));
      const hasAnalog = params.some(p => !p.datatype?.toLowerCase().includes('bool'));

      if (hasDigital && hasAnalog) ioTypeCounts.mixed++;
      else if (hasDigital) ioTypeCounts.digital++;
      else if (hasAnalog) ioTypeCounts.analog++;
      else ioTypeCounts.unknown++;
    });

    // Parameter data types
    const datatypeCounts = {};
    devices.forEach((device) => {
      const params = device.parameters || [];
      params.forEach((param) => {
        const dt = param.datatype || 'Unknown';
        datatypeCounts[dt] = (datatypeCounts[dt] || 0) + 1;
      });
    });

    // Parameters per device distribution
    const paramDistribution = { '0-10': 0, '11-50': 0, '51-100': 0, '100+': 0 };
    devices.forEach((device) => {
      const count = device.parameters?.length || 0;
      if (count <= 10) paramDistribution['0-10']++;
      else if (count <= 50) paramDistribution['11-50']++;
      else if (count <= 100) paramDistribution['51-100']++;
      else paramDistribution['100+']++;
    });

    return {
      manufacturerCounts,
      vendorCounts,
      ioTypeCounts,
      datatypeCounts,
      paramDistribution,
    };
  }, [devices, edsFiles]);

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
  };

  // Manufacturer chart data
  const manufacturerChartData = {
    labels: Object.keys(analyticsData.manufacturerCounts).slice(0, 10),
    datasets: [
      {
        label: 'Devices',
        data: Object.values(analyticsData.manufacturerCounts).slice(0, 10),
        backgroundColor: 'rgba(61, 182, 15, 0.7)',
        borderColor: 'rgba(61, 182, 15, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Vendor chart data
  const vendorChartData = {
    labels: Object.keys(analyticsData.vendorCounts).slice(0, 10),
    datasets: [
      {
        label: 'EDS Files',
        data: Object.values(analyticsData.vendorCounts).slice(0, 10),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  // I/O Type distribution
  const ioTypeChartData = {
    labels: Object.keys(analyticsData.ioTypeCounts).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [
      {
        data: Object.values(analyticsData.ioTypeCounts),
        backgroundColor: [
          'rgba(61, 182, 15, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(251, 146, 60, 0.7)',
        ],
        borderColor: [
          'rgba(61, 182, 15, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Parameter distribution
  const paramDistChartData = {
    labels: Object.keys(analyticsData.paramDistribution),
    datasets: [
      {
        label: 'Number of Devices',
        data: Object.values(analyticsData.paramDistribution),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Data type distribution (top 10)
  const topDatatypes = Object.entries(analyticsData.datatypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const datatypeChartData = {
    labels: topDatatypes.map(([dt]) => dt),
    datasets: [
      {
        data: topDatatypes.map(([, count]) => count),
        backgroundColor: [
          'rgba(61, 182, 15, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(251, 146, 60, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(20, 184, 166, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Summary metrics
  const metrics = [
    {
      title: 'Total Devices',
      value: devices.length,
      icon: <Package className="w-5 h-5" />,
      color: 'cyan',
      trend: '+12%',
    },
    {
      title: 'Total Parameters',
      value: stats.total_parameters || 0,
      icon: <Database className="w-5 h-5" />,
      color: 'green',
      trend: '+8%',
    },
    {
      title: 'EDS Files',
      value: edsFiles.length,
      icon: <Cpu className="w-5 h-5" />,
      color: 'purple',
      trend: '+15%',
    },
    {
      title: 'Manufacturers',
      value: Object.keys(analyticsData.manufacturerCounts).length,
      icon: <Users className="w-5 h-5" />,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-slate-400 mt-1">Insights and trends from your device library</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-300">{metric.title}</p>
                <div className="text-slate-400">{metric.icon}</div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
              {metric.trend && <p className="text-sm text-green-400">{metric.trend} from last period</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-900 border-b border-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="eds">EDS Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  I/O Type Distribution
                </CardTitle>
                <CardDescription>Device categorization by I/O capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Doughnut data={ioTypeChartData} options={pieChartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Parameters per Device
                </CardTitle>
                <CardDescription>Distribution of parameter counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={paramDistChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top Manufacturers
              </CardTitle>
              <CardDescription>Devices by manufacturer (top 10)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={manufacturerChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Data Type Distribution
              </CardTitle>
              <CardDescription>Top 10 parameter data types across all devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Pie data={datatypeChartData} options={pieChartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eds" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                EDS Vendors
              </CardTitle>
              <CardDescription>EDS files by vendor (top 10)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={vendorChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
