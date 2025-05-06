
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart4, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SolutionIntegrationMetrics, Solution } from '@/contexts/content-builder/types';

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
      <Card className="h-full">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
            Solution Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm text-center">No solution selected.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
          Solution Integration: {solution.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 overflow-hidden">
        {metrics ? (
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative h-24 w-24">
                {/* SVG circular progress */}
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle 
                    className="stroke-secondary/50" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    strokeWidth="10" 
                    fill="none" 
                  />
                  
                  {/* Progress arc - using strokeDasharray and strokeDashoffset for animation */}
                  <circle 
                    className={`${getScoreColor(metrics.overallScore || 0)} transition-all duration-1000 ease-in-out`}
                    cx="50" 
                    cy="50" 
                    r="45" 
                    strokeWidth="10" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - (metrics.overallScore || 0) / 100)}`}
                    transform="rotate(-90, 50, 50)"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  {metrics.overallScore || 0}
                </div>
              </div>
              
              <div className="mt-2 text-center text-sm text-muted-foreground">
                {getScoreMessage(metrics.overallScore || 0)}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium">Name Mentions</span>
                  <span>{typeof metrics.nameMentions === 'number' ? metrics.nameMentions : 0} times</span>
                </div>
                <Progress 
                  value={Math.min(
                    typeof metrics.nameMentions === 'number' ? metrics.nameMentions * 20 : 0, 
                    100
                  )} 
                  className="h-1.5" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium">Feature Coverage</span>
                  <span>{metrics.featureIncorporation}%</span>
                </div>
                <Progress value={metrics.featureIncorporation} className="h-1.5" />
              </div>
              
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium">Audience Alignment</span>
                  <span>{metrics.audienceAlignment || 0}%</span>
                </div>
                <Progress value={metrics.audienceAlignment || 0} className="h-1.5" />
              </div>
              
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium">Positioning Score</span>
                  <span>{metrics.positioningScore}%</span>
                </div>
                <Progress value={metrics.positioningScore} className="h-1.5" />
              </div>
            </div>
            
            {metrics.painPointsAddressed && metrics.painPointsAddressed.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium">Pain Points Addressed</h4>
                <div className="flex flex-wrap gap-1">
                  {metrics.painPointsAddressed.map((point, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {point}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Call-to-Action Mentions</span>
              <Badge variant={(metrics.ctaMentions || 0) > 0 ? "default" : "outline"}>
                {metrics.ctaMentions || 0}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[250px] text-center space-y-4">
            <div className="text-muted-foreground text-sm">
              Click analyze to check solution integration metrics.
            </div>
            <div className="p-4 rounded-full bg-secondary/20">
              <BarChart4 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 bg-secondary/20 hover:bg-secondary/40"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" /> Analyze Solution Integration
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper functions
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  if (score >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
};

const getScoreMessage = (score: number): string => {
  if (score >= 80) return 'Excellent solution integration';
  if (score >= 60) return 'Good solution integration';
  if (score >= 40) return 'Average solution integration';
  return 'Poor solution integration';
};
