
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Puzzle, CheckCircle2, Target, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SolutionIntegrationDashboardProps {
  solution: any;
  solutionMetrics: any;
  isAnalyzing: boolean;
}

export const SolutionIntegrationDashboard: React.FC<SolutionIntegrationDashboardProps> = ({
  solution,
  solutionMetrics,
  isAnalyzing
}) => {
  if (isAnalyzing) {
    return (
      <Card className="h-full bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <motion.div
              className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-muted-foreground">Analyzing solution integration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!solution) {
    return (
      <Card className="h-full bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Solution Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No solution selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Puzzle className="h-5 w-5" />
          Solution Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-[calc(100%-4rem)] p-6">
          <div className="space-y-6">
            {/* Solution Overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-background/50 rounded-lg border border-white/10"
            >
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                {solution.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">{solution.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{solution.category}</Badge>
                {solution.targetAudience && solution.targetAudience.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {solution.targetAudience.slice(0, 2).join(', ')}
                    {solution.targetAudience.length > 2 && ` +${solution.targetAudience.length - 2}`}
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Integration Metrics */}
            {solutionMetrics && (
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-3 bg-background/50 rounded-lg border border-white/10 text-center"
                >
                  <div className="text-lg font-bold text-orange-500">
                    {solutionMetrics.featureIncorporation}%
                  </div>
                  <div className="text-xs text-muted-foreground">Feature Integration</div>
                  <Progress value={solutionMetrics.featureIncorporation} className="h-1 mt-2" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-3 bg-background/50 rounded-lg border border-white/10 text-center"
                >
                  <div className="text-lg font-bold text-orange-500">
                    {solutionMetrics.positioningScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Positioning</div>
                  <Progress value={solutionMetrics.positioningScore} className="h-1 mt-2" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-3 bg-background/50 rounded-lg border border-white/10 text-center"
                >
                  <div className="text-lg font-bold text-orange-500">
                    {solutionMetrics.nameMentions}
                  </div>
                  <div className="text-xs text-muted-foreground">Name Mentions</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-3 bg-background/50 rounded-lg border border-white/10 text-center"
                >
                  <div className="text-lg font-bold text-orange-500">
                    {solutionMetrics.audienceAlignment}%
                  </div>
                  <div className="text-xs text-muted-foreground">Audience Alignment</div>
                  <Progress value={solutionMetrics.audienceAlignment} className="h-1 mt-2" />
                </motion.div>
              </div>
            )}

            {/* Features Analysis */}
            {solution.features && solution.features.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Features ({solution.features.length})
                </h4>
                <div className="space-y-2">
                  {solution.features.slice(0, 6).map((feature: string, idx: number) => {
                    const isMentioned = solutionMetrics?.mentionedFeatures?.includes(feature);
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className={`flex items-center gap-2 p-2 rounded-md border ${
                          isMentioned 
                            ? 'bg-green-500/10 border-green-500/20' 
                            : 'bg-background/30 border-white/10'
                        }`}
                      >
                        <CheckCircle2 className={`h-4 w-4 ${
                          isMentioned ? 'text-green-500' : 'text-muted-foreground'
                        }`} />
                        <span className={`text-sm ${
                          isMentioned ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {feature}
                        </span>
                      </motion.div>
                    );
                  })}
                  
                  {solution.features.length > 6 && (
                    <div className="text-xs text-muted-foreground">
                      +{solution.features.length - 6} more features
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pain Points */}
            {solution.painPoints && solution.painPoints.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Pain Points Addressed
                </h4>
                <div className="space-y-2">
                  {solution.painPoints.slice(0, 4).map((painPoint: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="p-2 bg-background/30 rounded-md border border-white/10"
                    >
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{painPoint}</span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {solution.painPoints.length > 4 && (
                    <div className="text-xs text-muted-foreground">
                      +{solution.painPoints.length - 4} more pain points
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {solution.targetAudience && solution.targetAudience.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Target Audience
                </h4>
                <div className="flex flex-wrap gap-2">
                  {solution.targetAudience.map((audience: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <Badge variant="outline" className="text-xs">
                        {audience}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
