import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StepCompletionCheckerProps {
  currentStep: number;
}

export function StepCompletionChecker({ currentStep }: StepCompletionCheckerProps) {
  const { state } = useContentBuilder();

  const getStepRequirements = (step: number) => {
    switch (step) {
      case 0:
        return [
          {
            label: 'Solution selected',
            completed: !!state.selectedSolution,
            required: true
          }
        ];
      
      case 1:
        return [
          {
            label: 'Solution selected',
            completed: !!state.selectedSolution,
            required: true
          },
          {
            label: 'SERP analysis completed',
            completed: state.serpSelections.length > 0,
            required: false
          },
          {
            label: 'Research items selected',
            completed: state.serpSelections.some(item => item.selected),
            required: true
          }
        ];
      
      case 2:
        return [
          {
            label: 'Solution selected',
            completed: !!state.selectedSolution,
            required: true
          },
          {
            label: 'Research selections made',
            completed: state.serpSelections.some(item => item.selected),
            required: true
          },
          {
            label: 'Content outline generated',
            completed: state.outline.length > 0,
            required: true
          }
        ];
      
      case 3:
        return [
          {
            label: 'Solution selected',
            completed: !!state.selectedSolution,
            required: true
          },
          {
            label: 'Outline created',
            completed: state.outline.length > 0,
            required: true
          },
          {
            label: 'Content generated',
            completed: !!state.content && state.content.length > 100,
            required: true
          },
          {
            label: 'Content title set',
            completed: !!state.contentTitle,
            required: false
          }
        ];
      
      case 4:
        return [
          {
            label: 'Content generated',
            completed: !!state.content && state.content.length > 100,
            required: true
          },
          {
            label: 'Meta information complete',
            completed: !!state.metaTitle && !!state.metaDescription,
            required: false
          }
        ];
      
      default:
        return [];
    }
  };

  const requirements = getStepRequirements(currentStep);
  const requiredCount = requirements.filter(req => req.required).length;
  const completedRequired = requirements.filter(req => req.required && req.completed).length;
  const isStepComplete = completedRequired === requiredCount;

  if (requirements.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-primary/20">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {isStepComplete ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertCircle className="h-4 w-4 text-warning" />
            )}
            <span className="text-sm font-medium">
              Step Requirements ({completedRequired}/{requiredCount} required completed)
            </span>
          </div>
          
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {req.completed ? (
                  <CheckCircle className="h-3 w-3 text-success" />
                ) : (
                  <XCircle className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={`${req.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {req.label}
                  {req.required && <span className="text-destructive ml-1">*</span>}
                </span>
              </div>
            ))}
          </div>
          
          {!isStepComplete && (
            <p className="text-xs text-muted-foreground">
              * Required items must be completed to proceed to the next step
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}