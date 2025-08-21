import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ValidationTooltipProps {
  step: number;
  children: React.ReactNode;
}

export function ValidationTooltip({ step, children }: ValidationTooltipProps) {
  const { state } = useContentBuilder();
  
  const getValidationStatus = (step: number) => {
    switch (step) {
      case 0:
        return {
          isValid: !!state.selectedSolution,
          message: state.selectedSolution 
            ? `✓ Solution selected: ${state.selectedSolution.name}`
            : '⚠ Please select a solution to proceed',
          type: state.selectedSolution ? 'success' : 'warning'
        };
      
      case 1:
        const hasSelections = state.serpSelections.some(item => item.selected);
        return {
          isValid: hasSelections,
          message: hasSelections
            ? `✓ ${state.serpSelections.filter(item => item.selected).length} SERP items selected`
            : state.isAnalyzing
              ? '⏳ Analyzing search results...'
              : '⚠ Please select SERP research items',
          type: hasSelections ? 'success' : state.isAnalyzing ? 'pending' : 'warning'
        };
      
      case 2:
        return {
          isValid: state.outline.length > 0,
          message: state.outline.length > 0
            ? `✓ Outline created with ${state.outline.length} sections`
            : '⚠ Please generate an outline',
          type: state.outline.length > 0 ? 'success' : 'warning'
        };
      
      case 3:
        const hasContent = state.content && state.content.length > 100;
        return {
          isValid: hasContent,
          message: hasContent
            ? `✓ Content generated (${state.content.split(/\s+/).length} words)`
            : state.isGenerating
              ? '⏳ Generating content...'
              : '⚠ Please generate content',
          type: hasContent ? 'success' : state.isGenerating ? 'pending' : 'warning'
        };
      
      case 4:
        return {
          isValid: true, // Save step is always accessible
          message: state.isSaving 
            ? '⏳ Saving content...'
            : '✓ Ready to save',
          type: state.isSaving ? 'pending' : 'success'
        };
      
      default:
        return { isValid: true, message: '', type: 'success' };
    }
  };

  const validation = getValidationStatus(step);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {children}
            {/* Validation indicator */}
            <div className="absolute -top-1 -right-1">
              {validation.type === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500 bg-background rounded-full" />
              )}
              {validation.type === 'warning' && (
                <AlertCircle className="h-4 w-4 text-yellow-500 bg-background rounded-full" />
              )}
              {validation.type === 'pending' && (
                <Clock className="h-4 w-4 text-blue-500 bg-background rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-48">{validation.message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}