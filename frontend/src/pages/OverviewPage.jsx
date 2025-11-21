import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  Code, GitBranch, Users, Calendar, FileCode, Folder, Package,
  TrendingUp, Activity, Layers, Terminal,
  Sparkles, Target, Rocket, GitCommit, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import TechStackMindMap from '@/components/TechStackMindMap';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';

const COLORS = {
  primary: '#10b981',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#10b981'
};

const OverviewPage = ({ onNavigate, API_BASE }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTechStack, setShowTechStack] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/stats/codebase`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-12 h-12 text-brand-green mx-auto mb-4" />
          </motion.div>
          <p className="text-muted-foreground">Loading project statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const languageData = Object.entries(stats.language_stats).map(([name, data]) => ({
    name,
    lines: data.lines - data.blank - data.comments,
    files: data.files,
    fill: COLORS[name.toLowerCase()] || COLORS.accent
  }));

  const structureData = Object.entries(stats.project_structure).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: name === 'backend' ? COLORS.primary :
          name === 'frontend' ? COLORS.secondary :
          name === 'docs' ? COLORS.accent :
          name === 'tests' ? COLORS.success :
          name === 'scripts' ? COLORS.warning :
          COLORS.error
  }));

  const recentCommits = stats.git_stats.recent_commit_details || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="space-y-8 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green/20 via-brand-green/10 to-purple-500/10 border-2 border-brand-green/30 p-12"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl -z-0 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-0 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-green to-brand-green flex items-center justify-center shadow-2xl shadow-brand-green/50"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-brand-green via-brand-green to-purple-500 bg-clip-text text-transparent">
                GreenStack
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Industrial IoT Development Platform
              </p>
            </div>
          </div>

          <p className="text-lg text-foreground/80 max-w-3xl mb-8">
            A comprehensive toolkit for IO-Link and EtherNet/IP device management, featuring advanced parsing,
            quality assurance, MQTT integration, and professional development tools.
          </p>

          <div className="flex flex-wrap gap-3">
            <Badge className="bg-brand-green/20 text-brand-green border-brand-green/50 text-base px-4 py-2">
              <Code className="w-4 h-4 mr-2" />
              {stats.totals.total_code_lines.toLocaleString()} Lines of Code
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-base px-4 py-2">
              <GitCommit className="w-4 h-4 mr-2" />
              {stats.git_stats.total_commits.toLocaleString()} Commits
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-base px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {stats.git_stats.contributors} Contributor{stats.git_stats.contributors !== 1 ? 's' : ''}
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-base px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              {stats.git_stats.days_active} Days Active
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-brand-green/10 to-brand-green/5 border-brand-green/30 hover:border-brand-green/50 transition-all hover:scale-105 cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-green/20 flex items-center justify-center">
                <FileCode className="w-6 h-6 text-brand-green" />
              </div>
              <TrendingUp className="w-5 h-5 text-brand-green/50" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {stats.totals.total_files_counted}
            </p>
            <p className="text-sm text-muted-foreground">Code Files</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Folder className="w-6 h-6 text-purple-400" />
              </div>
              <Activity className="w-5 h-5 text-purple-400/50" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {stats.file_counts.total_directories}
            </p>
            <p className="text-sm text-muted-foreground">Directories</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-500/50 transition-all hover:scale-105 cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-cyan-400" />
              </div>
              <Sparkles className="w-5 h-5 text-cyan-400/50" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {stats.package_stats.python_packages + stats.package_stats.npm_packages}
            </p>
            <p className="text-sm text-muted-foreground">Dependencies</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30 hover:border-orange-500/50 transition-all hover:scale-105 cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-orange-400" />
              </div>
              <Target className="w-5 h-5 text-orange-400/50" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {stats.git_stats.branches}
            </p>
            <p className="text-sm text-muted-foreground">Git Branches</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-green" />
                Language Distribution
              </CardTitle>
              <CardDescription>Lines of code by programming language</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={languageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="lines" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Structure */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Project Structure
              </CardTitle>
              <CardDescription>Distribution of files by project area</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={structureData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {structureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tech Stack Mind Map */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card/80 backdrop-blur border-border overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-brand-green/5 transition-colors"
            onClick={() => setShowTechStack(!showTechStack)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-green" />
                  Technology Stack
                </CardTitle>
                <CardDescription>Interactive mind map of all technologies powering GreenStack</CardDescription>
              </div>
              <motion.div
                animate={{ rotate: showTechStack ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </CardHeader>
          <AnimatePresence>
            {showTechStack && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="pt-0">
                  <TechStackMindMap />
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Architecture Diagram */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card/80 backdrop-blur border-border overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-purple-500/5 transition-colors"
            onClick={() => setShowArchitecture(!showArchitecture)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-400" />
                  System Architecture
                </CardTitle>
                <CardDescription>Layered architecture diagram with data flow visualization</CardDescription>
              </div>
              <motion.div
                animate={{ rotate: showArchitecture ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </CardHeader>
          <AnimatePresence>
            {showArchitecture && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="pt-0">
                  <ArchitectureDiagram />
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Language Details Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              Code Metrics by Language
            </CardTitle>
            <CardDescription>Detailed breakdown of code statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Language</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Files</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Lines</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Code</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Comments</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Blank</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.language_stats).map(([lang, data]) => (
                    <tr key={lang} className="border-b border-border/50 hover:bg-brand-green/5 transition-colors">
                      <td className="py-3 px-4">
                        <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30">
                          {lang}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-foreground">{data.files}</td>
                      <td className="text-right py-3 px-4 font-mono text-foreground">{data.lines.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 font-mono text-brand-green">
                        {(data.lines - data.blank - data.comments).toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-cyan-400">{data.comments.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 font-mono text-muted-foreground">{data.blank.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-brand-green/30 font-bold">
                    <td className="py-3 px-4 text-foreground">Total</td>
                    <td className="text-right py-3 px-4 font-mono text-foreground">{stats.totals.total_files_counted}</td>
                    <td className="text-right py-3 px-4 font-mono text-foreground">
                      {(stats.totals.total_code_lines + stats.totals.total_blank_lines + stats.totals.total_comment_lines).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-brand-green">{stats.totals.total_code_lines.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-mono text-cyan-400">{stats.totals.total_comment_lines.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-mono text-muted-foreground">{stats.totals.total_blank_lines.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Commits */}
      {recentCommits.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-purple-400" />
                Recent Commits
              </CardTitle>
              <CardDescription>Latest development activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCommits.slice(0, 5).map((commit) => (
                  <div
                    key={commit.hash}
                    className="flex items-start gap-4 p-4 rounded-lg bg-surface/50 border border-border/50 hover:border-brand-green/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <GitCommit className="w-5 h-5 text-brand-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{commit.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="font-mono">{commit.hash}</span>
                        <span>•</span>
                        <span>{commit.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(commit.timestamp * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Footer Stats */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-brand-green/5 to-purple-500/5 border-border">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-brand-green to-cyan-400 bg-clip-text text-transparent">
                  {stats.package_stats.python_packages}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Python Packages</p>
              </div>
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.package_stats.npm_packages}
                </p>
                <p className="text-sm text-muted-foreground mt-2">NPM Packages</p>
              </div>
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {stats.git_stats.recent_commits_30d}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Commits (30d)</p>
              </div>
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {Math.round(stats.git_stats.total_commits / Math.max(stats.git_stats.days_active, 1) * 7)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Commits/Week Avg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Statistics generated: {new Date(stats.generated_at).toLocaleString()}
      </div>
    </motion.div>
  );
};

export default OverviewPage;
