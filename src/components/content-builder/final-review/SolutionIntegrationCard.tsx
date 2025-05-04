
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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            Solution Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No solution selected.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart4 className="h-4 w-4" />
          Solution Integration: {solution.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics ? (
          <>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle 
                    className="stroke-gray-200" 
                    r={45} 
                    cx="50" 
                    cy="50" 
                    strokeWidth="10" 
                    fill="none" 
                  />
                  
                  {/* Progress arc */}
                  <circle 
                    className={`${getScoreColor(metrics.overallScore)} transition-all duration-1000 ease-in-out`}
                    r={45}
                    cx="50" 
                    cy="50" 
                    strokeWidth="10" 
                    fill="none"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - metrics.overallScore / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-2xl font-bold">
                  {metrics.overallScore}
                </div>
              </div>
              
              <div className="mt-2 text-center text-sm text-muted-foreground">
                {getScoreMessage(metrics.overallScore)}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium">Name Mentions</span>
                  <span>{metrics.nameMentions} times</span>
                </div>
                <Progress value={Math.min(metrics.nameMentions * 20, 100)} className="h-1.5" />
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
                  <span>{metrics.audienceAlignment}%</span>
                </div>
                <Progress value={metrics.audienceAlignment} className="h-1.5" />
              </div>
              
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium">Positioning Score</span>
                  <span>{metrics.positioningScore}%</span>
                </div>
                <Progress value={metrics.positioningScore} className="h-1.5" />
              </div>
            </div>
            
            {metrics.painPointsAddressed.length > 0 && (
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
              <Badge variant={metrics.ctaMentions > 0 ? "default" : "outline"}>
                {metrics.ctaMentions}
              </Badge>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Click analyze to check solution integration metrics.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
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
