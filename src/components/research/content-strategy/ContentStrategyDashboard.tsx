import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Progress } from '@/components/ui/progress';
import { useContentStrategyOptional } from '@/contexts/ContentStrategyContext';
import { Target, FileText, CheckCircle, TrendingUp } from 'lucide-react';

export const ContentStrategyDashboard = React.memo(() => {
  const ctx = useContentStrategyOptional();
  if (!ctx) {
    return null;
  }

  const { currentStrategy, pipelineItems, calendarItems } = ctx;
  
  const monthlyTrafficGoal = currentStrategy?.monthly_traffic_goal || 0;
  const selectedPieces = pipelineItems.length;
  const createdPieces = calendarItems.length;
  
  // Calculate progress percentage (assuming each piece contributes equally to the goal)
  const progressPercentage = monthlyTrafficGoal > 0 ? Math.min((createdPieces / (monthlyTrafficGoal / 1000)) * 100, 100) : 0;

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Strategy Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Monthly Traffic Goal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Monthly Traffic Goal</span>
            </div>
            <div className="text-2xl font-bold">
              {monthlyTrafficGoal.toLocaleString()}
            </div>
          </div>

          {/* Selected Pieces */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Selected Pieces</span>
            </div>
            <div className="text-2xl font-bold">
              {selectedPieces}
            </div>
          </div>

          {/* Created Pieces */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Created Pieces</span>
            </div>
            <div className="text-2xl font-bold">
              {createdPieces}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress Toward Goal</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
    </GlassCard>
  );
});

ContentStrategyDashboard.displayName = 'ContentStrategyDashboard';