import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { isAfter, parseISO, differenceInDays } from 'date-fns';

interface ContentAnalyticsDashboardProps {
  pipelineItems: any[];
  calendarItems: any[];
  className?: string;
}

export const ContentAnalyticsDashboard: React.FC<ContentAnalyticsDashboardProps> = ({
  pipelineItems,
  calendarItems,
  className = ""
}) => {
  const analytics = React.useMemo(() => {
    const now = new Date();
    
    // Basic counts
    const totalItems = pipelineItems.length;
    const completedItems = pipelineItems.filter(item => item.stage === 'published').length;
    const inProgressItems = pipelineItems.filter(item => 
      ['in_progress', 'review'].includes(item.stage)
    ).length;
    
    // Priority analysis
    const highPriorityItems = pipelineItems.filter(item => item.priority === 'high').length;
    const urgentItems = pipelineItems.filter(item => {
      if (!item.due_date) return false;
      const daysUntilDue = differenceInDays(parseISO(item.due_date), now);
      return daysUntilDue <= 3 && daysUntilDue >= 0;
    }).length;
    
    // Overdue analysis
    const overdueItems = pipelineItems.filter(item => 
      item.due_date && isAfter(now, parseISO(item.due_date))
    ).length;
    
    // Progress analysis
    const avgProgress = totalItems > 0 
      ? Math.round(pipelineItems.reduce((acc, item) => acc + (item.progress_percentage || 0), 0) / totalItems)
      : 0;
    
    // Stage distribution
    const stageDistribution = pipelineItems.reduce((acc, item) => {
      acc[item.stage] = (acc[item.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Content type analysis
    const contentTypeDistribution = pipelineItems.reduce((acc, item) => {
      acc[item.content_type] = (acc[item.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calendar integration stats
    const scheduledCalendarItems = calendarItems.filter(item => 
      ['scheduled', 'planning'].includes(item.status)
    ).length;
    
    // AI proposals integration
    const aiGeneratedItems = pipelineItems.filter(item => item.source_proposal_id).length;
    
    // Completion rate
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    // Blocked items
    const blockedItems = pipelineItems.filter(item => 
      item.blockers && item.blockers.length > 0
    ).length;
    
    return {
      totalItems,
      completedItems,
      inProgressItems,
      highPriorityItems,
      urgentItems,
      overdueItems,
      avgProgress,
      stageDistribution,
      contentTypeDistribution,
      scheduledCalendarItems,
      aiGeneratedItems,
      completionRate,
      blockedItems
    };
  }, [pipelineItems, calendarItems]);

  const statsCards = [
    {
      title: 'Total Items',
      value: analytics.totalItems,
      icon: Target,
      color: 'from-blue-500/20 to-cyan-500/20',
      textColor: 'text-blue-400',
      change: `${analytics.inProgressItems} in progress`
    },
    {
      title: 'Completion Rate',
      value: `${analytics.completionRate}%`,
      icon: CheckCircle2,
      color: 'from-green-500/20 to-emerald-500/20',
      textColor: 'text-green-400',
      change: `${analytics.completedItems}/${analytics.totalItems} completed`
    },
    {
      title: 'Average Progress',
      value: `${analytics.avgProgress}%`,
      icon: TrendingUp,
      color: 'from-purple-500/20 to-pink-500/20',
      textColor: 'text-purple-400',
      change: 'Across all stages'
    },
    {
      title: 'High Priority',
      value: analytics.highPriorityItems,
      icon: AlertTriangle,
      color: 'from-red-500/20 to-orange-500/20',
      textColor: 'text-red-400',
      change: `${analytics.urgentItems} urgent (≤3 days)`
    },
    {
      title: 'Scheduled Items',
      value: analytics.scheduledCalendarItems,
      icon: Calendar,
      color: 'from-indigo-500/20 to-blue-500/20',
      textColor: 'text-indigo-400',
      change: 'In calendar'
    },
    {
      title: 'AI Generated',
      value: analytics.aiGeneratedItems,
      icon: Zap,
      color: 'from-yellow-500/20 to-orange-500/20',
      textColor: 'text-yellow-400',
      change: `${Math.round((Number(analytics.aiGeneratedItems) / Math.max(Number(analytics.totalItems), 1)) * 100)}% of total`
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-xl border-border/50 hover:border-border/80 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-xl border border-white/10`}>
                    <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform`}>
                      {String(stat.value)}
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.title}</div>
                    <div className="text-xs text-muted-foreground/80 mt-1">{stat.change}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Stage Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(analytics.stageDistribution).map(([stage, count]) => {
                const percentage = analytics.totalItems > 0 ? (Number(count) / Number(analytics.totalItems)) * 100 : 0;
                const stageLabels: Record<string, string> = {
                  to_be_written: 'To Be Written',
                  in_progress: 'In Progress',
                  review: 'Review',
                  scheduled: 'Scheduled',
                  published: 'Published'
                };
                
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-foreground">{stageLabels[stage] || stage}</span>
                      <span className="text-muted-foreground">{String(count)} items</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2 bg-muted/30" 
                    />
                    <div className="text-xs text-muted-foreground text-right">{Math.round(percentage)}%</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Type & Issues */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Content Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Types */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Content Types</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analytics.contentTypeDistribution).map(([type, count]) => {
                    const typeIcons: Record<string, string> = {
                      blog: '📝',
                      social: '📱',
                      video: '🎬',
                      email: '✉️'
                    };
                    
                    return (
                      <Badge 
                        key={type}
                        variant="outline" 
                        className="bg-primary/10 text-primary border-primary/30"
                      >
                        {typeIcons[type] || '📄'} {type}: {String(count)}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Issue Highlights */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Issues & Alerts</h4>
                <div className="space-y-2">
                  {analytics.overdueItems > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-red-400">{analytics.overdueItems} overdue items</span>
                    </div>
                  )}
                  {analytics.blockedItems > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <Clock className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-orange-400">{analytics.blockedItems} blocked items</span>
                    </div>
                  )}
                  {analytics.urgentItems > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">{analytics.urgentItems} items due soon</span>
                    </div>
                  )}
                  {analytics.overdueItems === 0 && analytics.blockedItems === 0 && analytics.urgentItems === 0 && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">No critical issues detected</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};