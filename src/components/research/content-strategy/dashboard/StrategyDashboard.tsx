
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  FileText, 
  Users, 
  BarChart3, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { StrategyWorkflowActions } from '../StrategyWorkflowActions';
import { StrategyOptimization } from '../StrategyOptimization';

interface StrategyDashboardProps {
  serpMetrics?: any;
  strategy?: any;
  goals: {
    monthlyTraffic: string;
    contentPieces: string;
    timeline: string;
    mainKeyword: string;
  };
}

export const StrategyDashboard: React.FC<StrategyDashboardProps> = ({ serpMetrics, goals, strategy }) => {
  const { 
    currentStrategy, 
    calendarItems, 
    pipelineItems, 
    contentItems,
    insights,
    aiProposals,
    selectedProposals
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

  // AI Proposals metrics
  const proposalsGenerated = aiProposals.length;
  const selectedCount = Object.values(selectedProposals).filter(Boolean).length;
  const proposalProgress = contentPiecesGoal > 0 ? Math.min((proposalsGenerated / contentPiecesGoal) * 100, 100) : 0;
  const selectionProgress = proposalsGenerated > 0 ? (selectedCount / proposalsGenerated) * 100 : 0;

  // Estimate traffic based on selected AI proposals
  const estimatedTraffic = aiProposals
    .filter((_, index) => Object.values(selectedProposals)[index])
    .reduce((sum, proposal) => {
      const primaryKw = proposal.primary_keyword;
      const metrics = proposal.serp_data?.[primaryKw] || {};
      const est = proposal.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
      return sum + est;
    }, 0);
  const trafficProgress = monthlyTrafficGoal > 0 ? Math.min((estimatedTraffic / monthlyTrafficGoal) * 100, 100) : 0;

  // Get recent insights
  const recentInsights = insights.slice(0, 3);

  // Progress tracking calculations (from StrategyProgressTracker)
  const targetContentPieces = parseInt(goals.contentPieces) || 0;
  const targetTraffic = parseInt(goals.monthlyTraffic) || 0;
  const inPipeline = pipelineItems.length;
  const published = calendarItems.filter(item => item.status === 'published').length;

  // Timeline progress (assuming 3 months default)
  const startDate = strategy ? new Date(strategy.created_at) : new Date();
  const timelineMonths = goals.timeline === '1 month' ? 1 : goals.timeline === '6 months' ? 6 : goals.timeline === '12 months' ? 12 : 3;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + timelineMonths);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeProgress = Math.min((daysPassed / totalDays) * 100, 100);

  // Progress stages
  const stages = [
    {
      name: 'Strategy Created',
      completed: true,
      progress: 100,
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      name: 'AI Proposals',
      completed: proposalsGenerated >= targetContentPieces,
      progress: proposalProgress,
      icon: FileText,
      color: proposalsGenerated >= targetContentPieces ? 'text-green-400' : 'text-blue-400',
      bgColor: proposalsGenerated >= targetContentPieces ? 'bg-green-400/10' : 'bg-blue-400/10',
      description: `${proposalsGenerated}/${targetContentPieces} generated`
    },
    {
      name: 'Selection',
      completed: selectedCount > 0,
      progress: selectionProgress,
      icon: CheckCircle2,
      color: selectedCount > 0 ? 'text-green-400' : 'text-orange-400',
      bgColor: selectedCount > 0 ? 'bg-green-400/10' : 'bg-orange-400/10',
      description: `${selectedCount} selected`
    },
    {
      name: 'Pipeline',
      completed: inPipeline > 0,
      progress: selectedCount > 0 ? (inPipeline / selectedCount) * 100 : 0,
      icon: Clock,
      color: inPipeline > 0 ? 'text-green-400' : 'text-purple-400',
      bgColor: inPipeline > 0 ? 'bg-green-400/10' : 'bg-purple-400/10',
      description: `${inPipeline} pieces`
    },
    {
      name: 'Published',
      completed: published > 0,
      progress: (published / targetContentPieces) * 100,
      icon: Calendar,
      color: published > 0 ? 'text-green-400' : 'text-gray-400',
      bgColor: published > 0 ? 'bg-green-400/10' : 'bg-gray-400/10',
      description: `${published}/${targetContentPieces} live`
    }
  ];

  const currentStage = stages.find(stage => !stage.completed) || stages[stages.length - 1];
  const overallProgress = stages.reduce((sum, stage) => sum + (stage.completed ? 20 : stage.progress * 0.2), 0);

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              {estimatedTraffic > 0 && (
                <div className="mt-2">
                  <Progress value={trafficProgress} className="h-1" />
                  <p className="text-xs text-green-400 mt-1">
                    {estimatedTraffic.toLocaleString()} est. from AI proposals
                  </p>
                </div>
              )}
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
              {contentPiecesGoal > 0 && (
                <div className="mt-2">
                  <Progress value={(completedCalendarItems / contentPiecesGoal) * 100} className="h-1" />
                  <p className="text-xs text-blue-400 mt-1">
                    {proposalsGenerated} AI proposals generated
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                AI Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {selectedCount}/{proposalsGenerated}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Selected proposals
              </p>
              {proposalsGenerated > 0 && (
                <div className="mt-2">
                  <Progress value={selectionProgress} className="h-1" />
                  <p className="text-xs text-orange-400 mt-1">
                    {Math.round(selectionProgress)}% selection rate
                  </p>
                </div>
              )}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              AI Proposals Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposalsGenerated === 0 ? (
              <div className="text-center py-4">
                <FileText className="h-8 w-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No AI proposals yet</p>
                <p className="text-white/30 text-xs">Generate proposals to see progress</p>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">Proposal Generation</span>
                    <span className="text-white">{Math.round(proposalProgress)}%</span>
                  </div>
                  <Progress value={proposalProgress} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-white/60">Generated</div>
                    <div className="text-xl font-semibold text-white">{proposalsGenerated}</div>
                  </div>
                  <div>
                    <div className="text-white/60">Selected</div>
                    <div className="text-xl font-semibold text-green-400">{selectedCount}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

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

      {/* Strategy Progress Stages */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Strategy Progress
            </span>
            <Badge variant="outline" className="text-white/80 border-white/20">
              {Math.round(overallProgress)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Overall Progress</span>
              <span className="text-white">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Timeline Progress */}
          {strategy && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Timeline Progress</span>
                <span className="text-white">{Math.round(timeProgress)}% ({daysPassed}/{totalDays} days)</span>
              </div>
              <Progress value={timeProgress} className="h-2" />
            </div>
          )}

          {/* Progress Stages */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stages.map((stage, index) => (
              <div key={stage.name} className="text-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300
                  ${stage.completed 
                    ? 'bg-green-400/20 text-green-400' 
                    : stage === currentStage 
                      ? `${stage.bgColor} ${stage.color} animate-pulse`
                      : 'bg-white/10 text-white/40'
                  }
                `}>
                  <stage.icon className="h-6 w-6" />
                </div>
                <div className={`text-sm font-medium mb-1 ${
                  stage.completed ? 'text-green-400' : 
                  stage === currentStage ? stage.color : 'text-white/60'
                }`}>
                  {stage.name}
                </div>
                {stage.description && (
                  <div className="text-xs text-white/50">{stage.description}</div>
                )}
                {stage.progress > 0 && stage.progress < 100 && (
                  <div className="mt-2">
                    <Progress value={stage.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Next Actions */}
          {currentStage && !currentStage.completed && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <currentStage.icon className={`h-5 w-5 ${currentStage.color}`} />
                  <div>
                    <div className="font-medium text-white">Next: {currentStage.name}</div>
                    <div className="text-sm text-white/60">{currentStage.description}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
