import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrafficGoalStatusProps {
  monthlyTrafficGoal: number;
  estimatedTraffic: number;
  selectedCount: number;
  isGoalApproached: boolean;
}

export const TrafficGoalStatus: React.FC<TrafficGoalStatusProps> = ({
  monthlyTrafficGoal,
  estimatedTraffic,
  selectedCount,
  isGoalApproached
}) => {
  const trafficProgress = monthlyTrafficGoal > 0 ? Math.min((estimatedTraffic / monthlyTrafficGoal) * 100, 100) : 0;
  const remainingTraffic = Math.max(0, monthlyTrafficGoal - estimatedTraffic);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <Card className={`border transition-all duration-300 ${
        isGoalApproached 
          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' 
          : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Traffic Goal Status
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`${
                isGoalApproached 
                  ? 'text-green-400 border-green-400 bg-green-400/10' 
                  : trafficProgress > 50
                    ? 'text-yellow-400 border-yellow-400 bg-yellow-400/10'
                    : 'text-blue-400 border-blue-400 bg-blue-400/10'
              }`}
            >
              {Math.round(trafficProgress)}% of Goal
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Estimated Monthly Traffic</span>
              <span className="text-white font-medium">
                {estimatedTraffic.toLocaleString()} / {monthlyTrafficGoal.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={trafficProgress} 
              className="h-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <div className="text-white/60 text-sm">Selected Content</div>
              <div className="text-xl font-bold text-white">{selectedCount}</div>
              <div className="text-xs text-white/40">pieces</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <div className="text-white/60 text-sm">Remaining Needed</div>
              <div className="text-xl font-bold text-orange-400">{remainingTraffic.toLocaleString()}</div>
              <div className="text-xs text-white/40">traffic</div>
            </div>
          </div>

          {/* Status Messages */}
          {selectedCount === 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">
                Select AI proposals below to track progress toward your traffic goal
              </span>
            </div>
          )}

          {selectedCount > 0 && !isGoalApproached && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">
                Select more content pieces or use "Load More Proposals" to reach your traffic goal
              </span>
            </div>
          )}

          {isGoalApproached && (
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">
                  Excellent! Your selected content should achieve your traffic goal
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-green-400" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};