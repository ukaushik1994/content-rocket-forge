import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, LineChart, TrendingUp, TrendingDown, Activity, Users, FileText, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichMediaRenderer } from './RichMediaRenderer';

interface AnalyticsData {
  totalContent: number;
  published: number;
  inReview: number;
  avgSeoScore: number;
  weeklyData?: Array<{
    week: string;
    content: number;
    published: number;
    seoScore: number;
  }>;
  contentByType?: Record<string, number>;
  pipelineByStage?: Record<string, number>;
  topPerformers?: Array<{
    title: string;
    score: number;
    views?: number;
  }>;
}

interface PerformanceAnalyticsWidgetProps {
  data?: AnalyticsData;
  onRequestAnalysis?: () => void;
  onGenerateReport?: () => void;
}

export const PerformanceAnalyticsWidget: React.FC<PerformanceAnalyticsWidgetProps> = ({
  data,
  onRequestAnalysis,
  onGenerateReport
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data?.weeklyData) {
      setChartData({
        type: 'chart',
        chartConfig: {
          type: 'line' as const,
          data: data.weeklyData.map(item => ({
            name: item.week,
            content: item.content,
            published: item.published,
            seoScore: item.seoScore
          })),
          categories: ['content', 'published', 'seoScore'],
          colors: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'],
          height: 300
        }
      });
    }
  }, [data]);

  const metrics = data ? [
    {
      id: 'total-content',
      title: 'Total Content',
      value: data.totalContent.toString(),
      icon: 'filetext' as const,
      color: 'blue' as const
    },
    {
      id: 'published',
      title: 'Published',
      value: data.published.toString(),
      icon: 'trendingup' as const,
      color: 'green' as const,
      change: data.published > 0 ? {
        value: Math.round((data.published / data.totalContent) * 100),
        type: 'increase' as const,
        period: 'publication rate'
      } : undefined
    },
    {
      id: 'in-review',
      title: 'In Review',
      value: data.inReview.toString(),
      icon: 'activity' as const,
      color: 'orange' as const
    },
    {
      id: 'seo-score',
      title: 'Avg SEO Score',
      value: `${data.avgSeoScore}%`,
      icon: 'target' as const,
      color: data.avgSeoScore >= 80 ? 'green' as const : data.avgSeoScore >= 60 ? 'orange' as const : 'purple' as const,
      change: {
        value: data.avgSeoScore >= 70 ? 5 : -3,
        type: data.avgSeoScore >= 70 ? 'increase' as const : 'decrease' as const,
        period: 'vs last month'
      }
    }
  ] : [];

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className="border-dashed border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Performance Analytics</CardTitle>
            <p className="text-sm text-muted-foreground">
              Get insights into your content performance and optimization opportunities
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={onRequestAnalysis}
              className="w-full"
            >
              <Activity className="h-4 w-4 mr-2" />
              Request Performance Analysis
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Performance Dashboard</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onGenerateReport}>
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <RichMediaRenderer
                visualData={{
                  type: 'metrics',
                  metrics
                }}
              />
              
              {data.contentByType && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(data.contentByType).map(([type, count]) => {
                        const percentage = (count / data.totalContent) * 100;
                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{type}</span>
                              <span>{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-4 mt-4">
              {chartData && (
                <RichMediaRenderer visualData={chartData} />
              )}
              
              {data.weeklyData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.weeklyData.slice(-3).map((week, index) => (
                    <Card key={week.week}>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {week.content}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Week {week.week}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {week.seoScore}% SEO
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-4">
              {data.topPerformers && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.topPerformers.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            {item.views && (
                              <div className="text-xs text-muted-foreground">
                                {item.views} views
                              </div>
                            )}
                          </div>
                          <Badge variant={item.score >= 80 ? 'default' : 'secondary'}>
                            {item.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Optimization Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {data.avgSeoScore < 70 && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md">
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                        <span>Focus on improving SEO scores across content</span>
                      </div>
                    )}
                    {data.inReview > data.published && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span>Review backlog needs attention</span>
                      </div>
                    )}
                    {data.published / data.totalContent < 0.5 && (
                      <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md">
                        <Target className="h-4 w-4 text-purple-500" />
                        <span>Increase content publication rate</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};