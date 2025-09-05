import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Target, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsWorkflowSwitchProps {
  hasAnalytics: boolean;
  hasPublishedContent: boolean;
  onSwitchToEstimated: () => void;
  onSwitchToReal: () => void;
  currentMode: 'estimated' | 'real';
}

export const AnalyticsWorkflowSwitch = ({
  hasAnalytics,
  hasPublishedContent,
  onSwitchToEstimated,
  onSwitchToReal,
  currentMode
}: AnalyticsWorkflowSwitchProps) => {
  const canUseRealData = hasAnalytics && hasPublishedContent;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <Card className="bg-background/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${currentMode === 'estimated' ? 'bg-purple-500/20' : 'bg-muted/50'}`}>
                  <Sparkles className={`h-4 w-4 ${currentMode === 'estimated' ? 'text-purple-400' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium">AI Estimation Mode</p>
                  <p className="text-xs text-muted-foreground">Goal-based traffic planning</p>
                </div>
                {currentMode === 'estimated' && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                    Active
                  </Badge>
                )}
              </div>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${currentMode === 'real' && canUseRealData ? 'bg-blue-500/20' : 'bg-muted/50'}`}>
                  <BarChart3 className={`h-4 w-4 ${currentMode === 'real' && canUseRealData ? 'text-blue-400' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className={`font-medium ${!canUseRealData ? 'text-muted-foreground' : ''}`}>
                    Real Analytics Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {canUseRealData ? 'Live traffic data' : 'Requires analytics setup'}
                  </p>
                </div>
                {currentMode === 'real' && canUseRealData && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                    Active
                  </Badge>
                )}
                {!canUseRealData && (
                  <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                    Unavailable
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={currentMode === 'estimated' ? 'default' : 'outline'}
                size="sm"
                onClick={onSwitchToEstimated}
                className={currentMode === 'estimated' ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-100 border-purple-500/30' : ''}
              >
                <Target className="h-4 w-4 mr-1" />
                Goal Mode
              </Button>
              <Button
                variant={currentMode === 'real' && canUseRealData ? 'default' : 'outline'}
                size="sm"
                onClick={onSwitchToReal}
                disabled={!canUseRealData}
                className={currentMode === 'real' && canUseRealData ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 border-blue-500/30' : ''}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Analytics Mode
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};