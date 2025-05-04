
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SeoScoreCardProps {
  seoScore: number;
  scores: {
    keywordUsage: number;
    contentLength: number;
    readability: number;
  };
  getScoreColor: (score: number) => string;
}

export const SeoScoreCard = ({ seoScore, scores, getScoreColor }: SeoScoreCardProps) => {
  // Calculate circular progress values
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (seoScore / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">SEO Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="relative h-32 w-32">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                className="stroke-gray-200" 
                r={radius} 
                cx="50" 
                cy="50" 
                strokeWidth="10" 
                fill="none" 
              />
              
              {/* Progress arc */}
              <circle 
                className={`${getScoreColor(seoScore)} transition-all duration-1000 ease-in-out`}
                r={radius}
                cx="50" 
                cy="50" 
                strokeWidth="10" 
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-3xl font-bold">
              {seoScore}
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {seoScore >= 90 
              ? 'Excellent! Your content is well-optimized.'
              : seoScore >= 70
              ? 'Good! Minor tweaks can improve your score.'
              : seoScore >= 50
              ? 'Average. Follow recommendations to improve.'
              : 'Needs improvement. Review recommendations carefully.'}
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-xs mb-1 font-medium">Keyword Usage</div>
            <Progress value={scores.keywordUsage} className="h-1.5" />
          </div>
          <div>
            <div className="text-xs mb-1 font-medium">Content Length</div>
            <Progress value={scores.contentLength} className="h-1.5" />
          </div>
          <div>
            <div className="text-xs mb-1 font-medium">Readability</div>
            <Progress value={scores.readability} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
