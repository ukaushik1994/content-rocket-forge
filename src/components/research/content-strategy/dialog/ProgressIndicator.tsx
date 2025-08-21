import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const { state } = useContentBuilder();
  
  const getStepStatus = (step: number) => {
    switch (step) {
      case 0: // Solution Selection
        return {
          completed: !!state.selectedSolution,
          error: false,
          message: state.selectedSolution ? `Selected: ${state.selectedSolution.name}` : 'Select a solution'
        };
      
      case 1: // SERP Analysis
        const serpCompleted = state.serpSelections.some(item => item.selected);
        return {
          completed: serpCompleted,
          error: !state.serpData && !state.isAnalyzing,
          message: serpCompleted 
            ? `${state.serpSelections.filter(item => item.selected).length} items selected`
            : state.isAnalyzing 
              ? 'Analyzing...' 
              : 'Analyze search results'
        };
      
      case 2: // Outline Generation
        return {
          completed: state.outline.length > 0,
          error: false,
          message: state.outline.length > 0 
            ? `${state.outline.length} sections created`
            : 'Generate outline'
        };
      
      case 3: // Content Generation
        const hasContent = state.content && state.content.length > 100;
        return {
          completed: hasContent,
          error: false,
          message: hasContent 
            ? `${state.content.split(/\s+/).length} words generated`
            : state.isGenerating
              ? 'Generating...'
              : 'Generate content'
        };
      
      case 4: // Save
        return {
          completed: false, // This is handled by the save step
          error: false,
          message: state.isSaving ? 'Saving...' : 'Ready to save'
        };
      
      default:
        return { completed: false, error: false, message: '' };
    }
  };

  const steps = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {steps.map((step) => {
        const status = getStepStatus(step);
        const isActive = step === currentStep;
        const isPast = step < currentStep;
        
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : status.completed 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : status.error
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-muted text-muted-foreground'
            }`}>
              {status.completed ? (
                <CheckCircle className="h-3 w-3" />
              ) : status.error ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              <span>{status.message}</span>
            </div>
            {step < steps.length - 1 && (
              <div className={`w-2 h-px ${isPast || isActive ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}