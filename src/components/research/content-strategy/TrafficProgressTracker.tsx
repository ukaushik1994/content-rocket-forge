import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrafficProgressTrackerProps {
  monthlyTrafficGoal: number;
  estimatedTraffic: number;
  selectedCount: number;
  totalProposals: number;
  aiProposals: any[];
  selectedProposals: Record<string, boolean>;
}

export const TrafficProgressTracker: React.FC<TrafficProgressTrackerProps> = ({
  monthlyTrafficGoal,
  estimatedTraffic,
  selectedCount,
  totalProposals,
  aiProposals,
  selectedProposals
}) => {
  const trafficProgress = monthlyTrafficGoal > 0 ? Math.min((estimatedTraffic / monthlyTrafficGoal) * 100, 100) : 0;
  const isTrafficGoalApproached = trafficProgress >= 80; // Show dashboard when 80% of traffic goal is approached
  
  // Calculate remaining traffic needed
  const remainingTraffic = Math.max(0, monthlyTrafficGoal - estimatedTraffic);
  
  // Estimate how many more pieces might be needed
  const avgTrafficPerPiece = selectedCount > 0 ? estimatedTraffic / selectedCount : 0;
  const estimatedMorePiecesNeeded = avgTrafficPerPiece > 0 ? Math.ceil(remainingTraffic / avgTrafficPerPiece) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Traffic Progress Card */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Traffic Goal Progress
            </span>
            <Badge 
              variant="outline" 
              className={`${
                isTrafficGoalApproached 
                  ? 'text-green-400 border-green-400 bg-green-400/10' 
                  : 'text-yellow-400 border-yellow-400 bg-yellow-400/10'
              }`}
            >
              {Math.round(trafficProgress)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Estimated Traffic from Selected Content</span>
              <span className="text-white font-medium">
                {estimatedTraffic.toLocaleString()} / {monthlyTrafficGoal.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={trafficProgress} 
              className="h-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-white/60">Selected Content</div>
              <div className="text-xl font-bold text-white">{selectedCount}</div>
              <div className="text-xs text-white/40">pieces selected</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-white/60">Estimated Traffic</div>
              <div className="text-xl font-bold text-green-400">{estimatedTraffic.toLocaleString()}</div>
              <div className="text-xs text-white/40">monthly impressions</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-white/60">Remaining</div>
              <div className="text-xl font-bold text-orange-400">{remainingTraffic.toLocaleString()}</div>
              <div className="text-xs text-white/40">traffic needed</div>
            </div>
          </div>

          {/* Progress Status Messages */}
          {selectedCount === 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">
                Select AI proposals below to see estimated traffic progress
              </span>
            </div>
          )}

          {selectedCount > 0 && !isTrafficGoalApproached && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">
                You may need approximately {estimatedMorePiecesNeeded} more content pieces to reach your traffic goal
              </span>
            </div>
          )}

          {isTrafficGoalApproached && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">
                Great! Your selected content is estimated to achieve {Math.round(trafficProgress)}% of your traffic goal
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {totalProposals > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-sm text-white/80">
                  {selectedCount} of {totalProposals} AI proposals selected
                </span>
              </div>
              <div className="text-xs text-white/50">
                {selectedCount > 0 && `Avg. ${Math.round(estimatedTraffic / selectedCount)} traffic per piece`}
              </div>
            </div>
            
            {selectedCount < totalProposals && (
              <div className="mt-2">
                <Progress 
                  value={(selectedCount / totalProposals) * 100} 
                  className="h-1"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};