
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Final Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{passedChecks} of {checks.length} checks passed</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div 
            className="bg-green-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="space-y-2 mt-2">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center gap-2">
              {check.passed ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              )}
              <span className={`text-sm ${check.passed ? '' : 'text-muted-foreground'}`}>
                {check.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
