
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface FinalChecklistProps {
  checks: {
    title: string;
    passed: boolean;
  }[];
}

export const FinalChecklistCard = ({ checks }: FinalChecklistProps) => {
  const passedChecks = checks.filter(check => check.passed).length;
  const progress = Math.round((passedChecks / checks.length) * 100);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
          Final Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{passedChecks} of {checks.length} checks passed</span>
          <span className="text-sm font-medium text-primary">{progress}%</span>
        </div>
        
        <div className="w-full bg-secondary/30 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="space-y-2 mt-2 max-h-[280px] overflow-y-auto pr-1">
          {checks.map((check, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-2 p-2 rounded-md transition-colors ${check.passed ? 'bg-primary/10' : 'bg-secondary/20'}`}
            >
              {check.passed ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${check.passed ? 'font-medium' : 'text-muted-foreground'}`}>
                {check.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
