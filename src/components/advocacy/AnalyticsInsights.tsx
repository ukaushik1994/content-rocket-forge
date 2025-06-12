
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  MessageCircle,
  Share2,
  DollarSign,
  Target,
  Calendar,
  Award,
  Zap,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
}

interface ContentPerformance {
  id: string;
  title: string;
  platform: string;
  publishedAt: string;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
  roi: number;
}

export const AnalyticsInsights = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('reach');

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Total Reach',
      value: '124.3K',
      change: 15.2,
      icon: Eye,
      color: 'text-blue-500'
    },
    {
      label: 'Engagement Rate',
      value: '8.7%',
      change: 2.4,
      icon: MessageCircle,
      color: 'text-green-500'
    },
    {
      label: 'New Followers',
      value: 856,
      change: -3.1,
      icon: Users,
      color: 'text-purple-500'
    },
    {
      label: 'Generated Leads',
      value: 47,
      change: 12.8,
      icon: Target,
      color: 'text-orange-500'
    },
    {
      label: 'Estimated ROI',
      value: '$2,340',
      change: 8.9,
      icon: DollarSign,
      color: 'text-emerald-500'
    },
    {
      label: 'Brand Mentions',
      value: 23,
      change: 18.5,
      icon: Share2,
      color: 'text-pink-500'
    }
  ];

  const timelineData = [
    { date: '2024-01-01', reach: 12500, engagement: 890, conversions: 12 },
    { date: '2024-01-02', reach: 13200, engagement: 945, conversions: 15 },
    { date: '2024-01-03', reach: 11800, engagement: 823, conversions: 9 },
    { date: '2024-01-04', reach: 14500, engagement: 1120, conversions: 18 },
    { date: '2024-01-05', reach: 16200, engagement: 1340, conversions: 22 },
    { date: '2024-01-06', reach: 15800, engagement: 1280, conversions: 20 },
    { date: '2024-01-07', reach: 17900, engagement: 1456, conversions: 25 }
  ];

  const platformData = [
    { name: 'LinkedIn', value: 45, color: '#0077B5' },
    { name: 'Twitter', value: 30, color: '#1DA1F2' },
    { name: 'Facebook', value: 20, color: '#4267B2' },
    { name: 'Instagram', value: 5, color: '#E4405F' }
  ];

  const topContent: ContentPerformance[] = [
    {
      id: '1',
      title: 'AI Revolution in Manufacturing',
      platform: 'LinkedIn',
      publishedAt: '2 days ago',
      reach: 18500,
      engagement: 12.4,
      clicks: 890,
      conversions: 15,
      roi: 340
    },
    {
      id: '2',
      title: 'Remote Work Best Practices',
      platform: 'Twitter',
      publishedAt: '4 days ago',
      reach: 12300,
      engagement: 8.9,
      clicks: 567,
      conversions: 12,
      roi: 280
    },
    {
      id: '3',
      title: 'Company Culture Spotlight',
      platform: 'LinkedIn',
      publishedAt: '1 week ago',
      reach: 15600,
      engagement: 9.7,
      clicks: 723,
      conversions: 18,
      roi: 420
    }
  ];

  const audienceInsights = {
    demographics: [
      { segment: 'Tech Professionals', percentage: 35 },
      { segment: 'Marketing Managers', percentage: 25 },
      { segment: 'C-Level Executives', percentage: 20 },
      { segment: 'Sales Leaders', percentage: 15 },
      { segment: 'Other', percentage: 5 }
    ],
    geography: [
      { location: 'North America', percentage: 45 },
      { location: 'Europe', percentage: 30 },
      { location: 'Asia Pacific', percentage: 20 },
      { location: 'Other', percentage: 5 }
    ],
    growth: {
      thisMonth: 12.5,
      lastMonth: 8.3,
      trend: 'up'
    }
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUp : ArrowDown;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="h-6 w-6 text-neon-purple" />
              <CardTitle className="text-white">Analytics & Insights</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-white/20">
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/10 grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="roi">ROI & Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric, index) => {
              const Icon = metric.icon;
              const ChangeIcon = getChangeIcon(metric.change);
              
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-5 w-5 ${metric.color}`} />
                        <div className={`flex items-center gap-1 text-sm ${getChangeColor(metric.change)}`}>
                          <ChangeIcon className="h-3 w-3" />
                          {Math.abs(metric.change)}%
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                      <div className="text-sm text-white/70">{metric.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Timeline Chart */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Performance Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                    />
                    <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stroke="#8B5CF6"
                      fill="rgba(139, 92, 246, 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topContent.slice(0, 3).map((content, index) => (
                    <div key={content.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{content.platform}</Badge>
                        <span className="text-xs text-white/60">{content.publishedAt}</span>
                      </div>
                      <h4 className="font-medium text-white text-sm mb-2">{content.title}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-white/70">
                          Reach: <span className="text-blue-400">{content.reach.toLocaleString()}</span>
                        </div>
                        <div className="text-white/70">
                          Engagement: <span className="text-green-400">{content.engagement}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Content Performance Table */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Content Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topContent.map((content) => (
                  <div key={content.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{content.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{content.platform}</Badge>
                          <span className="text-xs text-white/60">{content.publishedAt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">${content.roi}</div>
                        <div className="text-xs text-white/60">ROI</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-blue-400 font-medium">{content.reach.toLocaleString()}</div>
                        <div className="text-white/60">Reach</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-medium">{content.engagement}%</div>
                        <div className="text-white/60">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-medium">{content.clicks}</div>
                        <div className="text-white/60">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-400 font-medium">{content.conversions}</div>
                        <div className="text-white/60">Conversions</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audience Demographics */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audienceInsights.demographics.map((segment, index) => (
                    <div key={segment.segment} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">{segment.segment}</span>
                        <span className="text-white">{segment.percentage}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-neon-purple to-neon-blue h-2 rounded-full"
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audienceInsights.geography.map((location, index) => (
                    <div key={location.location} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">{location.location}</span>
                        <span className="text-white">{location.percentage}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audience Growth */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Audience Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">+{audienceInsights.growth.thisMonth}%</div>
                  <div className="text-sm text-white/70">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">+{audienceInsights.growth.lastMonth}%</div>
                  <div className="text-sm text-white/70">Last Month</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-green-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-sm text-white/70">Trending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          {/* ROI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">$12,450</div>
                <div className="text-sm text-white/70">Total ROI Generated</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">89</div>
                <div className="text-sm text-white/70">Leads Generated</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">340%</div>
                <div className="text-sm text-white/70">ROI Growth</div>
              </CardContent>
            </Card>
          </div>

          {/* Impact Breakdown */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Impact Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Brand Awareness Impact</span>
                    <span className="text-green-400 font-semibold">High</span>
                  </div>
                  <div className="text-sm text-white/60">
                    Your content reached 124K+ professionals, increasing brand visibility by 15%
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Lead Generation</span>
                    <span className="text-blue-400 font-semibold">89 Leads</span>
                  </div>
                  <div className="text-sm text-white/60">
                    Direct attribution to advocacy efforts with 12% conversion rate
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Employee Branding</span>
                    <span className="text-purple-400 font-semibold">Excellent</span>
                  </div>
                  <div className="text-sm text-white/60">
                    Enhanced personal brand with 856 new followers and industry recognition
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
