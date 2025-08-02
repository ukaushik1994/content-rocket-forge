import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Target, Calendar, BarChart3, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

interface StrategyProgressTrackerProps {
  strategy: any;
  goals: any;
}

export const StrategyProgressTracker = ({ strategy, goals }: StrategyProgressTrackerProps) => {
  const { pipelineItems, calendarItems } = useContentStrategy();
  const [progressData, setProgressData] = useState({
    overallProgress: 0,
    completedTasks: 0,
    totalTasks: 0,
    onTrackItems: 0,
    delayedItems: 0,
    upcomingDeadlines: 0,
    contentPublished: 0,
    monthlyGoal: 0
  });

  useEffect(() => {
    calculateProgress();
  }, [pipelineItems, calendarItems, strategy]);

  const calculateProgress = () => {
    const strategyPipelineItems = pipelineItems.filter(item => item.strategy_id === strategy?.id);
    const strategyCalendarItems = calendarItems.filter(item => item.strategy_id === strategy?.id);
    
    const completedPipeline = strategyPipelineItems.filter(item => 
      item.stage === 'published' || item.progress_percentage === 100
    ).length;
    
    const completedCalendar = strategyCalendarItems.filter(item => 
      item.status === 'completed' || item.status === 'published'
    ).length;
    
    const totalTasks = strategyPipelineItems.length + strategyCalendarItems.length;
    const completedTasks = completedPipeline + completedCalendar;
    
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate on-track vs delayed items
    const today = new Date();
    const onTrackItems = strategyCalendarItems.filter(item => {
      const scheduledDate = new Date(item.scheduled_date);
      return scheduledDate >= today || item.status === 'completed';
    }).length;
    
    const delayedItems = strategyCalendarItems.filter(item => {
      const scheduledDate = new Date(item.scheduled_date);
      return scheduledDate < today && item.status !== 'completed';
    }).length;
    
    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const upcomingDeadlines = strategyCalendarItems.filter(item => {
      const scheduledDate = new Date(item.scheduled_date);
      return scheduledDate >= today && scheduledDate <= nextWeek && item.status !== 'completed';
    }).length;
    
    setProgressData({
      overallProgress,
      completedTasks,
      totalTasks,
      onTrackItems,
      delayedItems,
      upcomingDeadlines,
      contentPublished: completedPipeline,
      monthlyGoal: strategy?.content_pieces_per_month || 0
    });
  };

  const getProgressStatus = () => {
    if (progressData.overallProgress >= 80) return { status: 'excellent', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    if (progressData.overallProgress >= 60) return { status: 'good', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    if (progressData.overallProgress >= 40) return { status: 'fair', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    return { status: 'needs-attention', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (progressData.delayedItems > 0) {
      recommendations.push({
        type: 'urgent',
        title: 'Address Delayed Items',
        description: `${progressData.delayedItems} items are behind schedule. Consider reallocating resources.`,
        action: 'Review Pipeline',
        icon: AlertTriangle
      });
    }
    
    if (progressData.upcomingDeadlines > 2) {
      recommendations.push({
        type: 'warning',
        title: 'Heavy Upcoming Workload',
        description: `${progressData.upcomingDeadlines} deadlines in the next 7 days. Plan accordingly.`,
        action: 'Plan Schedule',
        icon: Clock
      });
    }
    
    if (progressData.overallProgress < 50) {
      recommendations.push({
        type: 'improvement',
        title: 'Accelerate Progress',
        description: 'Consider breaking down larger tasks or adding more resources to stay on track.',
        action: 'Optimize Workflow',
        icon: Zap
      });
    }
    
    if (progressData.contentPublished === 0 && progressData.totalTasks > 5) {
      recommendations.push({
        type: 'action',
        title: 'Publish First Content',
        description: 'Focus on completing and publishing your first piece to build momentum.',
        action: 'Complete Content',
        icon: Target
      });
    }
    
    return recommendations.slice(0, 3); // Show top 3 recommendations
  };

  const progressStatus = getProgressStatus();
  const recommendations = getRecommendations();

  if (!strategy) {
    return (
      <Card className="glass-panel border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-white/60 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No Active Strategy</h3>
            <p className="text-sm">Select a strategy to track implementation progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className={`glass-panel border-white/10 ${progressStatus.bg} ${progressStatus.border}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Strategy Progress: {strategy.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Overall Implementation</span>
              <span className={`font-bold ${progressStatus.color}`}>
                {Math.round(progressData.overallProgress)}%
              </span>
            </div>
            <Progress value={progressData.overallProgress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progressData.completedTasks} of {progressData.totalTasks} tasks completed</span>
              <span className={progressStatus.color}>
                {progressStatus.status === 'excellent' && '🎉 Excellent progress!'}
                {progressStatus.status === 'good' && '✅ Good progress'}
                {progressStatus.status === 'fair' && '⚡ Keep pushing'}
                {progressStatus.status === 'needs-attention' && '🚨 Needs attention'}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400 mb-1">{progressData.onTrackItems}</div>
              <div className="text-sm text-muted-foreground">On Track</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400 mb-1">{progressData.delayedItems}</div>
              <div className="text-sm text-muted-foreground">Delayed</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Calendar className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400 mb-1">{progressData.upcomingDeadlines}</div>
              <div className="text-sm text-muted-foreground">Due This Week</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400 mb-1">{progressData.contentPublished}</div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-white">🎯 Action Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    rec.type === 'urgent' ? 'bg-red-500/20' :
                    rec.type === 'warning' ? 'bg-yellow-500/20' :
                    rec.type === 'improvement' ? 'bg-blue-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <rec.icon className={`h-5 w-5 ${
                      rec.type === 'urgent' ? 'text-red-400' :
                      rec.type === 'warning' ? 'text-yellow-400' :
                      rec.type === 'improvement' ? 'text-blue-400' :
                      'text-green-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {rec.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Monthly Goal Progress */}
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Content Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Published This Month</span>
              <span className="font-bold text-primary">
                {progressData.contentPublished} / {progressData.monthlyGoal}
              </span>
            </div>
            <Progress 
              value={progressData.monthlyGoal > 0 ? (progressData.contentPublished / progressData.monthlyGoal) * 100 : 0} 
              className="h-3" 
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {progressData.monthlyGoal - progressData.contentPublished > 0 
                  ? `${progressData.monthlyGoal - progressData.contentPublished} more needed`
                  : 'Goal achieved! 🎉'
                }
              </span>
              <span>
                {Math.round(progressData.monthlyGoal > 0 ? (progressData.contentPublished / progressData.monthlyGoal) * 100 : 0)}% complete
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};