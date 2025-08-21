import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Target, TrendingUp, Plus, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProposalSelectionTrackerProps {
  totalProposals: number;
  selectedCount: number;
  targetCount: number;
  estimatedTraffic: number;
  targetTraffic: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onLoadMore: () => void;
  loadingMore: boolean;
}

export const ProposalSelectionTracker = ({
  totalProposals,
  selectedCount,
  targetCount,
  estimatedTraffic,
  targetTraffic,
  onSelectAll,
  onClearSelection,
  onLoadMore,
  loadingMore
}: ProposalSelectionTrackerProps) => {
  const selectionProgress = totalProposals > 0 ? (selectedCount / totalProposals) * 100 : 0;
  const goalProgress = targetCount > 0 ? (selectedCount / targetCount) * 100 : 0;
  const trafficProgress = targetTraffic > 0 ? (estimatedTraffic / targetTraffic) * 100 : 0;
  
  const isGoalMet = selectedCount >= targetCount;
  const isTrafficGoalMet = estimatedTraffic >= targetTraffic;
  const needsMoreProposals = totalProposals < targetCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 z-10"
    >
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Proposal Selection
            </CardTitle>
            <div className="flex gap-2">
              {selectedCount > 0 && (
                <Button
                  onClick={onClearSelection}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                >
                  Clear All
                </Button>
              )}
              {totalProposals > selectedCount && (
                <Button
                  onClick={onSelectAll}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                >
                  Select All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Selected</span>
                <span className="text-white font-medium">{selectedCount}/{totalProposals}</span>
              </div>
              <Progress value={selectionProgress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Goal Progress</span>
                <span className={`font-medium ${isGoalMet ? 'text-green-400' : 'text-white'}`}>
                  {selectedCount}/{targetCount}
                </span>
              </div>
              <Progress value={goalProgress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Traffic Goal</span>
                <span className={`font-medium ${isTrafficGoalMet ? 'text-green-400' : 'text-white'}`}>
                  {Math.round(trafficProgress)}%
                </span>
              </div>
              <Progress value={trafficProgress} className="h-2" />
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className={`${isGoalMet ? 'text-green-400 border-green-400' : 'text-white/60 border-white/20'}`}
            >
              <Circle className={`h-3 w-3 mr-1 ${isGoalMet ? 'fill-green-400' : 'fill-white/20'}`} />
              Content Goal: {isGoalMet ? 'Met' : `${targetCount - selectedCount} more needed`}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`${isTrafficGoalMet ? 'text-green-400 border-green-400' : 'text-white/60 border-white/20'}`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Traffic: {estimatedTraffic.toLocaleString()}/{targetTraffic.toLocaleString()}
            </Badge>
          </div>

          {/* Action Buttons */}
          {needsMoreProposals && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <Target className="h-4 w-4" />
                  <span>Need {targetCount - totalProposals} more proposals to reach your goal</span>
                </div>
                <Button
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  size="sm"
                  className="bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-400 mr-1" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Load More
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-green-500/10 rounded-lg border border-green-500/20"
            >
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <ArrowDown className="h-4 w-4" />
                <span>
                  {selectedCount} proposal{selectedCount !== 1 ? 's' : ''} selected. 
                  Go to Dashboard to track progress or Pipeline to start content creation.
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};