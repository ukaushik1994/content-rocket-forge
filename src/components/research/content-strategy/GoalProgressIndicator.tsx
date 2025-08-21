import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, FileText, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

interface GoalProgressIndicatorProps {
  goals: {
    monthlyTraffic: string;
    contentPieces: string;
    timeline: string;
    mainKeyword: string;
  };
}

export const GoalProgressIndicator = ({ goals }: GoalProgressIndicatorProps) => {
  const { aiProposals, selectedProposals, calendarItems, pipelineItems, currentStrategy } = useContentStrategy();
  
  if (!currentStrategy || !goals.contentPieces) return null;
  
  const targetContentPieces = parseInt(goals.contentPieces) || 0;
  const proposalsGenerated = aiProposals.length;
  const selectedCount = Object.values(selectedProposals).filter(Boolean).length;
  const inPipeline = pipelineItems.length;
  const published = calendarItems.filter(item => item.status === 'published').length;
  
  const steps = [
    {
      label: 'Goals Set',
      completed: true,
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'AI Proposals',
      completed: proposalsGenerated >= targetContentPieces,
      current: proposalsGenerated > 0 && proposalsGenerated < targetContentPieces,
      progress: targetContentPieces > 0 ? (proposalsGenerated / targetContentPieces) * 100 : 0,
      icon: FileText,
      color: proposalsGenerated >= targetContentPieces ? 'text-green-400' : 'text-blue-400',
      bgColor: proposalsGenerated >= targetContentPieces ? 'bg-green-400/10' : 'bg-blue-400/10',
      description: `${proposalsGenerated}/${targetContentPieces} proposals generated`
    },
    {
      label: 'Selection',
      completed: selectedCount > 0,
      current: proposalsGenerated > 0 && selectedCount === 0,
      progress: proposalsGenerated > 0 ? (selectedCount / proposalsGenerated) * 100 : 0,
      icon: CheckCircle2,
      color: selectedCount > 0 ? 'text-green-400' : 'text-orange-400',
      bgColor: selectedCount > 0 ? 'bg-green-400/10' : 'bg-orange-400/10',
      description: `${selectedCount} proposals selected`
    },
    {
      label: 'Production',
      completed: inPipeline > 0,
      current: selectedCount > 0 && inPipeline === 0,
      progress: selectedCount > 0 ? (inPipeline / selectedCount) * 100 : 0,
      icon: Calendar,
      color: inPipeline > 0 ? 'text-green-400' : 'text-purple-400',
      bgColor: inPipeline > 0 ? 'bg-green-400/10' : 'bg-purple-400/10',
      description: `${inPipeline} pieces in pipeline`
    },
    {
      label: 'Published',
      completed: published > 0,
      current: inPipeline > 0 && published === 0,
      progress: targetContentPieces > 0 ? (published / targetContentPieces) * 100 : 0,
      icon: TrendingUp,
      color: published > 0 ? 'text-green-400' : 'text-gray-400',
      bgColor: published > 0 ? 'bg-green-400/10' : 'bg-gray-400/10',
      description: `${published}/${targetContentPieces} pieces published`
    }
  ];

  const overallProgress = steps.reduce((sum, step) => sum + (step.completed ? 20 : 0), 0);
  
  const nextStep = steps.find(step => !step.completed && !step.current);
  const currentStep = steps.find(step => step.current);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Strategy Progress
            </CardTitle>
            <Badge variant="outline" className="text-white/80 border-white/20">
              {Math.round(overallProgress)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Overall Progress</span>
              <span className="text-white">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Step Progress */}
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, index) => (
              <div key={step.label} className="text-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300
                  ${step.completed 
                    ? 'bg-green-400/20 text-green-400' 
                    : step.current 
                      ? `${step.bgColor} ${step.color} animate-pulse`
                      : 'bg-white/10 text-white/40'
                  }
                `}>
                  <step.icon className="h-4 w-4" />
                </div>
                <div className={`text-xs font-medium ${
                  step.completed ? 'text-green-400' : 
                  step.current ? step.color : 'text-white/60'
                }`}>
                  {step.label}
                </div>
                {step.progress !== undefined && step.progress > 0 && step.progress < 100 && (
                  <div className="mt-1">
                    <Progress value={step.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Next Action */}
          {(currentStep || nextStep) && (
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 text-sm">
                {currentStep && (
                  <>
                    <currentStep.icon className={`h-4 w-4 ${currentStep.color}`} />
                    <span className="text-white/80">In Progress:</span>
                    <span className="text-white">{currentStep.description}</span>
                  </>
                )}
                {!currentStep && nextStep && (
                  <>
                    <nextStep.icon className={`h-4 w-4 ${nextStep.color}`} />
                    <span className="text-white/80">Next:</span>
                    <span className="text-white">{nextStep.label}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};