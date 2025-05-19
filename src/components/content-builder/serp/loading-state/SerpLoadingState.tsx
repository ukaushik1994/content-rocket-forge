import React from 'react';
import { LoadingParticle } from './LoadingParticle';
import { ProgressIndicators } from './ProgressIndicator';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface SerpLoadingStateProps {
  keyword?: string;
  onCancel?: () => void;
}

export const SerpLoadingState: React.FC<SerpLoadingStateProps> = ({ keyword, onCancel }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <ProgressIndicators />
      <p className="text-lg font-semibold mt-4">Analyzing SERP for: {keyword}</p>
      <p className="text-sm text-muted-foreground">This may take a few moments...</p>
      <Button variant="outline" className="mt-6" onClick={onCancel}>
        <X className="mr-2 h-4 w-4" />
        Cancel Analysis
      </Button>
    </div>
  );
};
