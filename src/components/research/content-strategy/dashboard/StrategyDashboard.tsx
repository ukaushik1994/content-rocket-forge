
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Calendar, FileText, Users, BarChart3, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { StrategyWorkflowActions } from '../StrategyWorkflowActions';
import { StrategyOptimization } from '../StrategyOptimization';

interface StrategyDashboardProps {
  serpMetrics?: any;
  goals: {
    monthlyTraffic: string;
    contentPieces: string;
    timeline: string;
    mainKeyword: string;
  };
}

export const StrategyDashboard: React.FC<StrategyDashboardProps> = ({ serpMetrics, goals }) => {
  const { 
    currentStrategy, 
    calendarItems, 
    pipelineItems, 
    contentItems,
    insights 
  } = useContentStrategy();

  // Calculate dashboard metrics
  const totalCalendarItems = calendarItems.length;
  const completedCalendarItems = calendarItems.filter(item => item.status === 'published').length;
  const calendarProgress = totalCalendarItems > 0 ? (completedCalendarItems / totalCalendarItems) * 100 : 0;

  const totalPipelineItems = pipelineItems.length;
  const completedPipelineItems = pipelineItems.filter(item => item.stage === 'published').length;
  const pipelineProgress = totalPipelineItems > 0 ? (completedPipelineItems / totalPipelineItems) * 100 : 0;

  const avgPipelineProgress = totalPipelineItems > 0 
    ? Math.round(pipelineItems.reduce((acc, item) => acc + (item.progress_percentage || 0), 0) / totalPipelineItems)
    : 0;

  const totalContentItems = contentItems.length;
  const highPriorityItems = pipelineItems.filter(item => item.priority === 'high').length;
  const urgentItems = calendarItems.filter(item => {
    const scheduledDate = new Date(item.scheduled_date);
    const today = new Date();
    const diffTime = scheduledDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  const monthlyTrafficGoal = parseInt(goals.monthlyTraffic) || 0;
  const contentPiecesGoal = parseInt(goals.contentPieces) || 0;
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  // Get recent insights
  const recentInsights = insights.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Monthly Traffic Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {monthlyTrafficGoal.toLocaleString()}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Target for {currentMonth}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {completedCalendarItems}/{contentPiecesGoal}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Pieces this month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {goals.timeline}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Strategy duration
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80">Overall Completion</span>
                <span className="text-white">{Math.round(calendarProgress)}%</span>
              </div>
              <Progress value={calendarProgress} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white/60">Total Items</div>
                <div className="text-xl font-semibold text-white">{totalCalendarItems}</div>
              </div>
              <div>
                <div className="text-white/60">Completed</div>
                <div className="text-xl font-semibold text-green-400">{completedCalendarItems}</div>
              </div>
            </div>
            {urgentItems > 0 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">{urgentItems} items due this week</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pipeline Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80">Average Progress</span>
                <span className="text-white">{avgPipelineProgress}%</span>
              </div>
              <Progress value={avgPipelineProgress} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white/60">Total Items</div>
                <div className="text-xl font-semibold text-white">{totalPipelineItems}</div>
              </div>
              <div>
                <div className="text-white/60">High Priority</div>
                <div className="text-xl font-semibold text-red-400">{highPriorityItems}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Insights */}
      {recentInsights.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInsights.map((insight, index) => (
                <div key={insight.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">{insight.keyword}</div>
                    <div className="text-sm text-white/60">
                      {insight.search_volume && `${insight.search_volume.toLocaleString()} searches/month`}
                      {insight.opportunity_score && ` • ${insight.opportunity_score}% opportunity`}
                    </div>
                  </div>
                  {insight.opportunity_score && (
                    <Badge 
                      variant="outline" 
                      className={
                        insight.opportunity_score > 70 
                          ? 'text-green-400 border-green-400'
                          : insight.opportunity_score > 50 
                          ? 'text-yellow-400 border-yellow-400'
                          : 'text-red-400 border-red-400'
                      }
                    >
                      {insight.opportunity_score}% opportunity
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <StrategyWorkflowActions 
        selectedKeywords={currentStrategy?.main_keyword ? [currentStrategy.main_keyword] : []}
        contentGaps={recentInsights.flatMap(insight => insight.content_gaps || []).slice(0, 3)}
      />

      {/* Strategy Details */}
      {currentStrategy && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Strategy Details
              </span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2">Target Audience</h4>
                <p className="text-sm text-white/70">
                  {currentStrategy.target_audience || 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Brand Voice</h4>
                <p className="text-sm text-white/70">
                  {currentStrategy.brand_voice || 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Main Keyword</h4>
                <p className="text-sm text-white/70">
                  {currentStrategy.main_keyword || 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Content Pillars</h4>
                <div className="flex flex-wrap gap-1">
                  {currentStrategy.content_pillars && currentStrategy.content_pillars.length > 0 ? (
                    currentStrategy.content_pillars.map((pillar, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {pillar}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-white/70">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Strategy Optimization */}
      <StrategyOptimization 
        strategy={currentStrategy}
        serpMetrics={serpMetrics}
        goals={goals}
      />
    </div>
  );
};
