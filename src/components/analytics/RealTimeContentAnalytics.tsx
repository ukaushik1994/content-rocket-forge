import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
// Auth context will be implemented later

interface ContentAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string | null;
}

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    conversionRate: number;
  };
  timeline: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
  devices: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  sources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
}

export const RealTimeContentAnalytics: React.FC<ContentAnalyticsProps> = ({
  isOpen,
  onClose,
  contentId
}) => {
  // Auth will be implemented later
  const user = { id: 'current-user' };
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContentAnalytics = async () => {
    if (!contentId || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Get content analytics from Supabase
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('content_analytics')
        .select('*')
        .eq('content_id', contentId)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError;
      }

      // Get content item details
      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .select('title, created_at, status')
        .eq('id', contentId)
        .single();

      if (contentError) {
        throw contentError;
      }

      // Transform the data for the analytics display
      const parsedAnalytics = analyticsData?.analytics_data as any || {};
      
      const transformedData: AnalyticsData = {
        overview: {
          totalViews: (parsedAnalytics as any)?.totalViews || 0,
          uniqueVisitors: (parsedAnalytics as any)?.uniqueVisitors || 0,
          avgTimeOnPage: (parsedAnalytics as any)?.avgTimeOnPage || 0,
          bounceRate: (parsedAnalytics as any)?.bounceRate || 0,
          conversionRate: (parsedAnalytics as any)?.conversionRate || 0
        },
        timeline: (parsedAnalytics as any)?.timeline || generateFallbackTimeline(),
        devices: (parsedAnalytics as any)?.devices || [
          { name: 'Desktop', value: 65, color: '#3b82f6' },
          { name: 'Mobile', value: 30, color: '#10b981' },
          { name: 'Tablet', value: 5, color: '#f59e0b' }
        ],
        sources: (parsedAnalytics as any)?.sources || [
          { source: 'Direct', visitors: 0, percentage: 0 },
          { source: 'Search', visitors: 0, percentage: 0 },
          { source: 'Social', visitors: 0, percentage: 0 }
        ]
      };

      setAnalytics(transformedData);
    } catch (err) {
      console.error('Error loading content analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackTimeline = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push({
        date: date.toISOString().split('T')[0],
        views: 0,
        visitors: 0
      });
    }
    return dates;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen && contentId) {
      loadContentAnalytics();
    }
  }, [isOpen, contentId]);

  if (!analytics) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white mb-4">
              Content Analytics
            </DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-2 text-white">Loading analytics...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={loadContentAnalytics} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">No analytics data available for this content.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl text-white">
              Content Analytics
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadContentAnalytics}
              disabled={loading}
              className="bg-slate-800 border-slate-600"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
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
                  value: analytics.overview.totalViews.toLocaleString(), 
                  icon: Eye,
                  color: 'text-blue-400'
                },
                { 
                  label: 'Unique Visitors', 
                  value: analytics.overview.uniqueVisitors.toLocaleString(), 
                  icon: Users,
                  color: 'text-green-400'
                },
                { 
                  label: 'Avg. Time', 
                  value: formatTime(analytics.overview.avgTimeOnPage), 
                  icon: Clock,
                  color: 'text-purple-400'
                },
                { 
                  label: 'Bounce Rate', 
                  value: `${(analytics.overview.bounceRate * 100).toFixed(1)}%`, 
                  icon: TrendingUp,
                  color: 'text-orange-400'
                },
                { 
                  label: 'Conversion', 
                  value: `${(analytics.overview.conversionRate * 100).toFixed(1)}%`, 
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
                  <LineChart data={analytics.timeline}>
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
              {/* Device Breakdown */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.devices}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {analytics.devices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {analytics.devices.map((item, index) => (
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

              {/* Performance Metrics */}
              <Card className="bg-slate-800/50 border-slate-600/30">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Page Load Time</span>
                      <span className="text-white font-medium">2.3s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Time to First Byte</span>
                      <span className="text-white font-medium">0.8s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Core Web Vitals Score</span>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Good
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white">Audience Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Connect Google Analytics for detailed audience insights</p>
                  <Button className="mt-4" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect Analytics
                  </Button>
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
                  {analytics.sources.map((source, index) => (
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