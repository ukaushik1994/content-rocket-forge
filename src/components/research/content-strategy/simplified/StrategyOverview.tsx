import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  FileText, 
  Calendar, 
  BarChart3,
  ArrowRight,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

interface StrategyOverviewProps {
  onEditGoals: () => void;
  onNavigateToStrategies: () => void;
  onNavigateToPipeline: () => void;
  onNavigateToCalendar: () => void;
}

export const StrategyOverview: React.FC<StrategyOverviewProps> = ({
  onEditGoals,
  onNavigateToStrategies,
  onNavigateToPipeline,
  onNavigateToCalendar
}) => {
  const { 
    currentStrategy, 
    calendarItems, 
    pipelineItems, 
    aiProposals,
    selectedProposals
  } = useContentStrategy();

  if (!currentStrategy) {
    return (
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Target className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-white">No Strategy Set</h3>
              <p className="text-white/70 mb-4">
                Create your content strategy to get started with AI-powered proposals
              </p>
              <Button onClick={onEditGoals} className="bg-primary/20 hover:bg-primary/30">
                <Target className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthlyTrafficGoal = currentStrategy.monthly_traffic_goal || 0;
  const contentPiecesGoal = currentStrategy.content_pieces_per_month || 0;
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  // Calculate metrics
  const proposalsGenerated = aiProposals.length;
  const selectedCount = Object.values(selectedProposals).filter(Boolean).length;
  const publishedContent = calendarItems.filter(item => item.status === 'published').length;
  const pipelineProgress = pipelineItems.length > 0 
    ? Math.round(pipelineItems.reduce((acc, item) => acc + (item.progress_percentage || 0), 0) / pipelineItems.length)
    : 0;

  // Estimate traffic from selected proposals
  const estimatedTraffic = aiProposals
    .filter((_, index) => Object.values(selectedProposals)[index])
    .reduce((sum, proposal) => {
      const primaryKw = proposal.primary_keyword;
      const metrics = proposal.serp_data?.[primaryKw] || {};
      const est = proposal.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
      return sum + est;
    }, 0);
  
  const trafficProgress = monthlyTrafficGoal > 0 ? Math.min((estimatedTraffic / monthlyTrafficGoal) * 100, 100) : 0;

  const quickActions = [
    {
      title: 'Generate Content Ideas',
      description: 'Create AI proposals based on your strategy',
      icon: FileText,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-400/30',
      textColor: 'text-blue-400',
      action: onNavigateToStrategies,
      count: proposalsGenerated
    },
    {
      title: 'Manage Pipeline',
      description: 'Track content through production stages',
      icon: BarChart3,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-400/30',
      textColor: 'text-green-400',
      action: onNavigateToPipeline,
      count: pipelineItems.length
    },
    {
      title: 'Schedule Content',
      description: 'Plan and organize your content calendar',
      icon: Calendar,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-400/30',
      textColor: 'text-purple-400',
      action: onNavigateToCalendar,
      count: calendarItems.length
    }
  ];

  return (
    <div className="space-y-6">
      {/* Strategy Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Active Strategy
              <Badge variant="outline" className="text-green-400 border-green-400">
                {currentStrategy.timeline}
              </Badge>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEditGoals}
              className="border-white/20 text-white/80 hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Goals
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-white/60">Monthly Traffic Goal</div>
              <div className="text-2xl font-bold text-white">
                {monthlyTrafficGoal.toLocaleString()}
              </div>
              {estimatedTraffic > 0 && (
                <div className="space-y-1">
                  <Progress value={trafficProgress} className="h-2" />
                  <div className="text-xs text-green-400">
                    {estimatedTraffic.toLocaleString()} estimated from proposals
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-white/60">Content Goal</div>
              <div className="text-2xl font-bold text-white">
                {publishedContent}/{contentPiecesGoal || 'Auto'}
              </div>
              <div className="text-xs text-blue-400">
                {proposalsGenerated} AI proposals generated
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-white/60">Main Keyword</div>
              <div className="text-lg font-semibold text-white">
                {currentStrategy.main_keyword || 'Not set'}
              </div>
              <div className="text-xs text-purple-400">
                {selectedCount} proposals selected
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`bg-gradient-to-r ${action.color} border ${action.borderColor} cursor-pointer hover:scale-105 transition-all duration-200 group`}
              onClick={action.action}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${action.color} rounded-xl border ${action.borderColor}`}>
                    <action.icon className={`h-6 w-6 ${action.textColor}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${action.textColor}`}>
                      {action.count}
                    </div>
                    <div className="text-xs text-white/60">items</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-white/70">
                    {action.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className={`h-4 w-4 ${action.textColor}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      {(proposalsGenerated > 0 || pipelineItems.length > 0 || calendarItems.length > 0) && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{proposalsGenerated}</div>
                <div className="text-sm text-white/60">AI Proposals</div>
                {proposalsGenerated > 0 && (
                  <div className="mt-1">
                    <div className="text-xs text-green-400">
                      {selectedCount} selected
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{pipelineItems.length}</div>
                <div className="text-sm text-white/60">In Pipeline</div>
                {pipelineItems.length > 0 && (
                  <div className="mt-1">
                    <Progress value={pipelineProgress} className="h-1" />
                    <div className="text-xs text-white/40">{pipelineProgress}% avg</div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{calendarItems.length}</div>
                <div className="text-sm text-white/60">Scheduled</div>
                {publishedContent > 0 && (
                  <div className="mt-1">
                    <div className="text-xs text-green-400">
                      {publishedContent} published
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">
                  {Math.round(trafficProgress)}%
                </div>
                <div className="text-sm text-white/60">Traffic Goal</div>
                {estimatedTraffic > 0 && (
                  <div className="mt-1">
                    <div className="text-xs text-white/40">
                      {estimatedTraffic.toLocaleString()} est.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};