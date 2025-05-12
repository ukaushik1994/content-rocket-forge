
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Puzzle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Solution, SolutionIntegrationMetrics } from '@/contexts/content-builder/types';

interface SolutionIntegrationCardProps {
  metrics: SolutionIntegrationMetrics | null;
  solution: Solution | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const SolutionIntegrationCard = ({
  metrics,
  solution,
  isAnalyzing,
  onAnalyze
}: SolutionIntegrationCardProps) => {
  if (!solution) {
    return (
      <Card className="border-purple-500/20 bg-gradient-to-br from-indigo-950/20 to-black/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="bg-neon-purple h-2 w-2 rounded-full"></span>
            Solution Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="text-center space-y-2">
              <Puzzle className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No solution selected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-indigo-950/20 to-black/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="bg-neon-purple h-2 w-2 rounded-full"></span>
          Solution Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Solution Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{solution.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {solution.category}
            </p>
          </div>
          {metrics && (
            <div className={`rounded-full px-2 py-1 text-xs font-medium ${
              metrics.overallScore >= 70 
                ? 'bg-green-500/20 text-green-400' 
                : metrics.overallScore >= 40 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-rose-500/20 text-rose-400'
            }`}>
              {metrics.overallScore >= 70 
                ? 'Well Integrated' 
                : metrics.overallScore >= 40 
                  ? 'Partial Integration' 
                  : 'Poor Integration'}
            </div>
          )}
        </div>

        {/* Content Quality Checklist Reminder */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-md p-3 mb-2">
          <h4 className="text-xs font-medium text-purple-300 mb-1">Content Quality Checklist</h4>
          <ul className="text-xs text-purple-200/80 space-y-1 list-disc pl-4">
            <li>Include at least one call-to-action</li>
            <li>Incorporate solution features naturally</li>
            <li>Maintain primary keyword density (0.5% - 3%)</li>
            <li>Include all selected secondary keywords</li>
          </ul>
        </div>
        
        {!metrics ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-20 bg-white/5 rounded-md animate-pulse"></div>
            </div>
            
            <Button 
              onClick={onAnalyze} 
              disabled={isAnalyzing}
              className="w-full flex items-center gap-2 bg-secondary/20 hover:bg-secondary/40"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Content...
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Analyze Content Structure
                </>
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Feature Integration Score */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Feature Integration</span>
                <span className="font-medium">{metrics.featureIncorporation}%</span>
              </div>
              <Progress value={metrics.featureIncorporation} className="h-2" />
              {metrics.featureIncorporation < 50 && (
                <p className="text-xs text-amber-400 mt-1">
                  Include more solution features in your content
                </p>
              )}
            </div>
            
            {/* Positioning Score */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Strategic Positioning</span>
                <span className="font-medium">{metrics.positioningScore}%</span>
              </div>
              <Progress value={metrics.positioningScore} className="h-2" />
              {metrics.positioningScore < 50 && (
                <p className="text-xs text-amber-400 mt-1">
                  Position your solution more effectively
                </p>
              )}
            </div>

            {/* Feature Mentions */}
            <div>
              <h4 className="text-xs mb-2">Feature Mentions</h4>
              <div className="grid grid-cols-2 gap-1">
                {solution.features.slice(0, 4).map((feature, index) => (
                  <div 
                    key={index}
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                      metrics.mentionedFeatures && metrics.mentionedFeatures.includes(feature)
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {metrics.mentionedFeatures && metrics.mentionedFeatures.includes(feature) ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={onAnalyze} 
              disabled={isAnalyzing}
              className="w-full flex items-center gap-2 bg-secondary/20 hover:bg-secondary/40"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reanalyzing...
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Reanalyze Content
                </>
              )}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
