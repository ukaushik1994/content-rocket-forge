import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Eye, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';

interface AnalyticsData {
  roi: {
    current: number;
    previous: number;
    trend: 'up' | 'down';
    breakdown: { source: string; value: number; color: string }[];
  };
  performance: {
    totalViews: number;
    engagement: number;
    conversion: number;
    revenue: number;
    trends: { date: string; views: number; engagement: number; conversion: number }[];
  };
  content: {
    topPerforming: { title: string; views: number; engagement: number; roi: number }[];
    categories: { name: string; count: number; performance: number }[];
  };
  predictive: {
    projectedROI: number;
    recommendations: string[];
    opportunities: { title: string; impact: number; effort: number }[];
  };
}

const MOCK_ANALYTICS: AnalyticsData = {
  roi: {
    current: 285.4,
    previous: 198.2,
    trend: 'up',
    breakdown: [
      { source: 'Organic Traffic', value: 45, color: '#0ea5e9' },
      { source: 'Paid Ads', value: 30, color: '#10b981' },
      { source: 'Social Media', value: 15, color: '#f59e0b' },
      { source: 'Email', value: 10, color: '#ef4444' }
    ]
  },
  performance: {
    totalViews: 125000,
    engagement: 8.2,
    conversion: 3.4,
    revenue: 45600,
    trends: [
      { date: '2024-01', views: 15000, engagement: 6.5, conversion: 2.1 },
      { date: '2024-02', views: 18000, engagement: 7.2, conversion: 2.8 },
      { date: '2024-03', views: 22000, engagement: 8.1, conversion: 3.2 },
      { date: '2024-04', views: 28000, engagement: 8.8, conversion: 3.6 },
      { date: '2024-05', views: 32000, engagement: 9.2, conversion: 4.1 },
      { date: '2024-06', views: 35000, engagement: 8.9, conversion: 3.8 }
    ]
  },
  content: {
    topPerforming: [
      { title: 'Ultimate SEO Guide 2024', views: 15600, engagement: 12.4, roi: 340 },
      { title: 'AI Marketing Strategies', views: 12800, engagement: 10.2, roi: 285 },
      { title: 'Content Creation Workflow', views: 9200, engagement: 8.7, roi: 210 },
      { title: 'Social Media Automation', views: 7800, engagement: 7.3, roi: 165 },
      { title: 'Email Marketing Tips', views: 6400, engagement: 6.8, roi: 142 }
    ],
    categories: [
      { name: 'SEO & Marketing', count: 24, performance: 94 },
      { name: 'Content Creation', count: 18, performance: 87 },
      { name: 'Social Media', count: 15, performance: 82 },
      { name: 'Email Marketing', count: 12, performance: 78 },
      { name: 'Analytics', count: 9, performance: 85 }
    ]
  },
  predictive: {
    projectedROI: 425.8,
    recommendations: [
      'Increase content frequency in SEO category (+15% ROI)',
      'Optimize email campaigns for better conversion (+8% ROI)',
      'Expand social media presence (+12% ROI)',
      'Implement A/B testing for landing pages (+6% ROI)'
    ],
    opportunities: [
      { title: 'Video Content Strategy', impact: 85, effort: 60 },
      { title: 'Advanced SEO Optimization', impact: 75, effort: 40 },
      { title: 'Influencer Partnerships', impact: 65, effort: 70 },
      { title: 'Marketing Automation', impact: 90, effort: 80 }
    ]
  }
};

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(MOCK_ANALYTICS);
  const [timeRange, setTimeRange] = useState('6m');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const exportData = () => {
    const data = JSON.stringify(analytics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const roiChange = ((analytics.roi.current - analytics.roi.previous) / analytics.roi.previous * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            ROI tracking, predictive insights, and performance optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.roi.current.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.roi.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {roiChange > 0 ? '+' : ''}{roiChange.toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.totalViews.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.engagement}%</div>
            <div className="text-xs text-muted-foreground">
              +0.8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.performance.revenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              +18.2% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={analytics.performance.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={2} />
                    <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.content.categories.map(category => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span>{category.count} items • {category.performance}% avg performance</span>
                      </div>
                      <Progress value={category.performance} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ROI Breakdown</CardTitle>
                <CardDescription>Revenue sources and their contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics.roi.breakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ source, value }) => `${source}: ${value}%`}
                    >
                      {analytics.roi.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={analytics.performance.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversion" fill="#0ea5e9" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Highest ROI content pieces this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.content.topPerforming.map((item, index) => (
                  <div key={item.title} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{item.views.toLocaleString()} views</span>
                          <span>{item.engagement}% engagement</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{item.roi}% ROI</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Projected ROI: <span className="font-bold text-green-600">{analytics.predictive.projectedROI}%</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.predictive.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Badge variant="outline">{index + 1}</Badge>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
                <CardDescription>Impact vs Effort analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.predictive.opportunities.map(opp => (
                    <div key={opp.title} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{opp.title}</span>
                        <Badge variant={opp.impact > 80 ? 'default' : 'secondary'}>
                          {opp.impact > 80 ? 'High Impact' : 'Medium Impact'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Impact: </span>
                          <Progress value={opp.impact} className="h-2 mt-1" />
                        </div>
                        <div>
                          <span className="text-muted-foreground">Effort: </span>
                          <Progress value={opp.effort} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};