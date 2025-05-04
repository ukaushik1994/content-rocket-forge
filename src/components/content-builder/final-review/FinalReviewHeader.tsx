
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';

interface FinalReviewHeaderProps {
  completionPercentage: number;
  passedChecks: number;
  totalChecks: number;
  seoScore?: number;
}

export const FinalReviewHeader: React.FC<FinalReviewHeaderProps> = ({
  completionPercentage,
  passedChecks,
  totalChecks,
  seoScore
}) => {
  // Get color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-300';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-xl p-6 shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">
            Final Review & Optimization
          </h2>
          <p className="text-muted-foreground">
            Review your content and optimize it for SEO before publishing.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {seoScore !== undefined && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">SEO Score</span>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center mt-1 ${getScoreColor(seoScore)}`}>
                <span className="text-white font-bold">{seoScore}</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mt-1 ${getProgressColor(completionPercentage)}`}>
              <span className="text-white font-bold">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex-1">
          <div className="flex justify-between mb-1 text-sm">
            <span>Content Readiness</span>
            <span>{passedChecks} of {totalChecks} checks passed</span>
          </div>
          <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(completionPercentage)} transition-all duration-500 ease-out`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <Badge 
          className={`${completionPercentage >= 80 ? 'bg-green-500' : 'bg-yellow-500'} text-white px-3 py-1.5 text-xs flex items-center gap-1`}
        >
          {completionPercentage >= 80 ? (
            <>
              <CheckCircle className="h-3.5 w-3.5" />
              Ready to publish
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5" />
              Needs optimization
            </>
          )}
        </Badge>
      </div>
    </div>
  );
};
