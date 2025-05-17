
import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkipWarningProps {
  onSkip: () => void;
  onCancel: () => void;
}

export const SkipWarning: React.FC<SkipWarningProps> = ({ onSkip, onCancel }) => {
  return (
    <Card className="border-yellow-200 bg-yellow-50 shadow-md">
      <CardHeader className="pb-2 border-b border-yellow-200/50">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Skip SEO Optimization?
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <p className="text-sm text-yellow-700 mb-4">
          SEO optimization helps improve your content's search ranking. Are you sure you want to skip this step?
        </p>
        
        <div className="flex items-center justify-end gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCancel}
          >
            Continue Optimizing
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={onSkip}
            className="bg-yellow-500 hover:bg-yellow-600 text-white gap-1"
          >
            Skip <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
