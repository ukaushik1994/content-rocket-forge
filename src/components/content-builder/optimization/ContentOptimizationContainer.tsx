
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';
import { CircleAlert, RotateCw, PenLine } from 'lucide-react';

export interface ContentOptimizationContainerProps {
  content: string;
  seoScore: number;
  isAnalyzing: boolean;
  seoImprovements: SeoImprovement[];
  analyzeSeo: () => Promise<void>;
  updateContent: (content: string) => void;
  onRewriteOpen: () => void;
}

export const ContentOptimizationContainer: React.FC<ContentOptimizationContainerProps> = ({
  content,
  seoScore,
  isAnalyzing,
  seoImprovements,
  analyzeSeo,
  updateContent,
  onRewriteOpen
}) => {
  // Get the score color based on the SEO score
  const getScoreColor = () => {
    if (seoScore >= 80) return 'text-green-500';
    if (seoScore >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get the progress color based on the SEO score
  const getProgressColor = () => {
    if (seoScore >= 80) return 'bg-green-500';
    if (seoScore >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SEO Score Panel */}
        <div className="md:col-span-1 border rounded-lg p-4 bg-card">
          <h3 className="text-lg font-medium mb-3">SEO Score</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Content Score</span>
              <span className={`text-2xl font-bold ${getScoreColor()}`}>
                {seoScore}
              </span>
            </div>
            
            <Progress value={seoScore} className="h-2" indicatorColor={getProgressColor()} />
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-red-500 rounded"></div>
                <span className="text-muted-foreground">0-59</span>
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-yellow-500 rounded"></div>
                <span className="text-muted-foreground">60-79</span>
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-green-500 rounded"></div>
                <span className="text-muted-foreground">80-100</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={analyzeSeo} 
                disabled={isAnalyzing} 
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <RotateCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Run SEO Analysis'}
              </Button>
              
              <Button
                onClick={onRewriteOpen}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <PenLine className="h-4 w-4" />
                Rewrite Content
              </Button>
            </div>
          </div>
        </div>
        
        {/* SEO Improvements Panel */}
        <div className="md:col-span-2 border rounded-lg bg-card">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">SEO Improvements</h3>
          </div>
          
          <div className="p-4">
            {seoImprovements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CircleAlert className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Run an SEO analysis to get improvement suggestions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {seoImprovements.map((improvement) => (
                  <div 
                    key={improvement.id}
                    className={`p-3 border rounded-md ${improvement.applied ? 'bg-green-500/5 border-green-500/20' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{improvement.title}</h4>
                        <p className="text-sm text-muted-foreground">{improvement.description}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        improvement.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                        improvement.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {improvement.priority}
                      </div>
                    </div>
                    
                    <div className="mt-2 border-t pt-2">
                      <p className="text-sm italic">"{improvement.suggestion}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
