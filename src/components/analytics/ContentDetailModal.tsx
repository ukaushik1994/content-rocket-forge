
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Eye, 
  Clock, 
  MousePointer, 
  TrendingUp, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    views: number;
    engagement: string;
    performance: number;
    revenue: string;
  } | null;
}

const mockContentAnalytics = {
  overview: {
    totalViews: 15420,
    uniqueVisitors: 12350,
    avgTimeOnPage: 285,
    bounceRate: 0.24,
    conversionRate: 0.087
  },
  timeline: [
    { date: '2024-01-01', views: 890, visitors: 720 },
    { date: '2024-01-02', views: 1250, visitors: 980 },
    { date: '2024-01-03', views: 1450, visitors: 1200 },
    { date: '2024-01-04', views: 1680, visitors: 1350 },
    { date: '2024-01-05', views: 1920, visitors: 1580 },
    { date: '2024-01-06', views: 2100, visitors: 1720 },
    { date: '2024-01-07', views: 1950, visitors: 1650 }
  ],
  demographics: [
    { name: 'Desktop', value: 65, color: '#3b82f6' },
    { name: 'Mobile', value: 30, color: '#10b981' },
    { name: 'Tablet', value: 5, color: '#f59e0b' }
  ],
  topPages: [
    { page: '/introduction', views: 3420, time: 320 },
    { page: '/main-content', views: 2890, time: 450 },
    { page: '/conclusion', views: 1250, time: 180 },
    { page: '/resources', views: 890, time: 240 }
  ],
  referrers: [
    { source: 'Google Search', visitors: 8450, percentage: 68.4 },
    { source: 'Direct', visitors: 2100, percentage: 17.0 },
    { source: 'Social Media', visitors: 980, percentage: 7.9 },
    { source: 'Other', visitors: 820, percentage: 6.7 }
  ]
};

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  isOpen,
  onClose,
  content
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!content) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white mb-4">
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-600/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { 
                  label: 'Total Views', 
                  value: mockContentAnalytics.overview.totalViews.toLocaleString(), 
                  icon: Eye,
                  color: 'text-blue-400'
                },
                { 
                  label: 'Unique Visitors', 
                  value: mockContentAnalytics.overview.uniqueVisitors.toLocaleString(), 
                  icon: Users,
                  color: 'text-green-400'
                },
                { 
                  label: 'Avg. Time', 
                  value: formatTime(mockContentAnalytics.overview.avgTimeOnPage), 
                  icon: Clock,
                  color: 'text-purple-400'
                },
                { 
                  label: 'Bounce Rate', 
                  value: `${(mockContentAnalytics.overview.bounceRate * 100).toFixed(1)}%`, 
                  icon: TrendingUp,
                  color: 'text-orange-400'
                },
                { 
                  label: 'Conversion', 
                  value: `${(mockContentAnalytics.overview.conversionRate * 100).toFixed(1)}%`, 
                  icon: MousePointer,
                  color: 'text-pink-400'
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-600/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                        <span className="text-xs text-slate-400">{metric.label}</span>
                      </div>
                      <p className="text-lg font-bold text-white">{metric.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Views Timeline */}
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white">Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockContentAnalytics.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Views"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Unique Visitors"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white">Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockContentAnalytics.topPages.map((page, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">{page.page}</p>
                          <p className="text-sm text-slate-400">{formatTime(page.time)} avg. time</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{page.views.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockContentAnalytics.demographics}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {mockContentAnalytics.demographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {mockContentAnalytics.demographics.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-300">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white">Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Detailed audience analytics coming soon</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Connect Google Analytics to view demographic data
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockContentAnalytics.referrers.map((source, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="font-medium text-white">{source.source}</p>
                          <p className="text-sm text-slate-400">{source.percentage}% of traffic</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{source.visitors.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">visitors</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-600/30">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
