import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { ValidationTooltip } from './ValidationTooltip';

interface StepNavigationItemsProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  steps: Array<{
    id: number;
    title: string;
    icon: React.ComponentType<any>;
    description: string;
  }>;
}

export function StepNavigationItems({ currentStep, onStepClick, steps }: StepNavigationItemsProps) {
  const { state } = useContentBuilder();
  
  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 0: return true; // Always can access solution selection
      case 1: return !!state.selectedSolution; // Need solution selected
      case 2: return !!state.selectedSolution && state.serpSelections.some(item => item.selected); // Need solution and SERP selections
      case 3: return !!state.selectedSolution && state.outline.length > 0; // Need solution and outline
      case 4: return !!state.selectedSolution && !!state.content && state.content.length > 100; // Need everything
      default: return false;
    }
  };

  return (
    <>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = canProceedToStep(index + 1) || (index === steps.length - 1 && state.content);
        const isAccessible = canProceedToStep(index);

        return (
          <ValidationTooltip key={step.id} step={index}>
            <Card 
              className={`cursor-pointer transition-all ${
                isActive 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : isAccessible 
                    ? 'hover:bg-muted/50' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => isAccessible && onStepClick(index)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{step.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{step.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ValidationTooltip>
        );
      })}
    </>
  );
}