import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Calendar,
  ArrowRight,
  Plus,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

interface StrategyProgressTrackerProps {
  strategy: any;
  goals: {
    monthlyTraffic: string;
    contentPieces: string;
    timeline: string;
    mainKeyword: string;
  };
}

export const StrategyProgressTracker = ({ strategy, goals }: StrategyProgressTrackerProps) => {
  const { 
    aiProposals, 
    selectedProposals, 
    calendarItems, 
    pipelineItems 
  } = useContentStrategy();

  if (!strategy) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-2">No Active Strategy</h3>
          <p className="text-white/60 text-sm">
            Create a content strategy to start tracking your progress
          </p>
        </CardContent>
      </Card>
    );
  }

  const targetContentPieces = parseInt(goals.contentPieces) || 0;
  const targetTraffic = parseInt(goals.monthlyTraffic) || 0;
  
  // Calculate progress metrics
  const proposalsGenerated = aiProposals.length;
  const selectedCount = Object.values(selectedProposals).filter(Boolean).length;
  const inPipeline = pipelineItems.length;
  const published = calendarItems.filter(item => item.status === 'published').length;
  
  // Calculate estimated traffic from selected proposals
  const estimatedTraffic = aiProposals
    .filter((_, index) => selectedProposals[index])
    .reduce((sum, proposal) => {
      const primaryKw = proposal.primary_keyword;
      const metrics = proposal.serp_data?.[primaryKw] || {};
      const est = proposal.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
      return sum + est;
    }, 0);

  // Progress calculations
  const proposalProgress = targetContentPieces > 0 ? Math.min((proposalsGenerated / targetContentPieces) * 100, 100) : 0;
  const selectionProgress = proposalsGenerated > 0 ? (selectedCount / proposalsGenerated) * 100 : 0;
  const contentProgress = targetContentPieces > 0 ? (published / targetContentPieces) * 100 : 0;
  const trafficProgress = targetTraffic > 0 ? Math.min((estimatedTraffic / targetTraffic) * 100, 100) : 0;

  // Timeline progress (assuming 3 months default)
  const startDate = new Date(strategy.created_at);
  const timelineMonths = goals.timeline === '1 month' ? 1 : goals.timeline === '6 months' ? 6 : goals.timeline === '12 months' ? 12 : 3;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + timelineMonths);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeProgress = Math.min((daysPassed / totalDays) * 100, 100);

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
      name: 'In Pipeline',
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
      progress: contentProgress,
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
      {/* Overall Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Overall Progress</span>
                <span className="text-white">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            {/* Timeline Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Timeline Progress</span>
                <span className="text-white">{Math.round(timeProgress)}% ({daysPassed}/{totalDays} days)</span>
              </div>
              <Progress value={timeProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stage Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Progress Stages</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {estimatedTraffic.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">Est. Monthly Traffic</div>
                  <div className="text-xs text-white/40">
                    Target: {targetTraffic.toLocaleString()}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
              <div className="mt-2">
                <Progress value={trafficProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{published}</div>
                  <div className="text-sm text-white/60">Content Published</div>
                  <div className="text-xs text-white/40">
                    Target: {targetContentPieces}
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
              <div className="mt-2">
                <Progress value={contentProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{selectedCount}</div>
                  <div className="text-sm text-white/60">Proposals Selected</div>
                  <div className="text-xs text-white/40">
                    Available: {proposalsGenerated}
                  </div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Next Actions */}
      {currentStage && !currentStage.completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};