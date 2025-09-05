import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RealAnalyticsDashboardProps {
  metrics: any;
  contentAnalytics: any[];
  goals: any;
  loading: boolean;
}

export const RealAnalyticsDashboard = ({
  metrics,
  contentAnalytics,
  goals,
  loading
}: RealAnalyticsDashboardProps) => {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-panel">
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-white/10 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const monthlyTrafficGoal = goals?.monthlyTraffic || 10000;
  const currentTraffic = metrics?.views || 0;
  const trafficProgress = Math.min((currentTraffic / monthlyTrafficGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Goal Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <Card className="glass-panel bg-gradient-to-br from-blue-950/30 to-blue-900/20 border-blue-500/30 md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-100">Monthly Traffic Goal Progress</CardTitle>
                <CardDescription className="text-blue-200/70">
                  Real analytics data from your connected accounts
                </CardDescription>
              </div>
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                <BarChart3 className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-200/70">Progress</span>
                <span className="text-sm font-medium text-blue-100">
                  {currentTraffic.toLocaleString()} / {monthlyTrafficGoal.toLocaleString()}
                </span>
              </div>
              <Progress value={trafficProgress} className="h-2" />
              <div className="text-2xl font-bold text-blue-100">
                {trafficProgress.toFixed(1)}% Complete
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-green-950/30 to-green-900/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-100 text-base">Real Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-200/70">Traffic</span>
                </div>
                <p className="text-2xl font-bold text-green-100">
                  {metrics?.views?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-200/70">Engagement</span>
                </div>
                <p className="text-lg font-semibold text-green-100">
                  {metrics?.engagement?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real Analytics Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Views</p>
                <p className="text-2xl font-bold">{metrics?.views?.toLocaleString() || '0'}</p>
                {metrics?.change?.views && (
                  <p className={`text-xs ${metrics.change.views > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.change.views > 0 ? '+' : ''}{metrics.change.views.toFixed(1)}% from last month
                  </p>
                )}
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{metrics?.engagement?.toFixed(1) || '0'}%</p>
                {metrics?.change?.engagement && (
                  <p className={`text-xs ${metrics.change.engagement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.change.engagement > 0 ? '+' : ''}{metrics.change.engagement.toFixed(1)}% from last month
                  </p>
                )}
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{metrics?.conversions?.toLocaleString() || '0'}</p>
                {metrics?.change?.conversions && (
                  <p className={`text-xs ${metrics.change.conversions > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.change.conversions > 0 ? '+' : ''}{metrics.change.conversions.toFixed(1)}% from last month
                  </p>
                )}
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${metrics?.revenue?.toLocaleString() || '0'}</p>
                {metrics?.change?.revenue && (
                  <p className={`text-xs ${metrics.change.revenue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.change.revenue > 0 ? '+' : ''}{metrics.change.revenue.toFixed(1)}% from last month
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performing Content */}
      {contentAnalytics && contentAnalytics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Top Performing Content (Real Data)
              </CardTitle>
              <CardDescription>
                Your highest-performing content based on real analytics data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentAnalytics.slice(0, 5).map((content, index) => (
                  <div key={content.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border/30">
                    <div className="flex-1">
                      <p className="font-medium">{content.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{content.views?.toLocaleString()} views</span>
                        <span>{content.engagement} engagement</span>
                        <span>Performance: {content.performance}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">{content.revenue}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};