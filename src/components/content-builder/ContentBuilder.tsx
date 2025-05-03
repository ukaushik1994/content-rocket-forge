
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// Import step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { OutlineStep } from './steps/OutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizationStep } from './steps/OptimizationStep';
import { PublishStep } from './steps/PublishStep';

export const ContentBuilder = () => {
  const { state, navigateToStep } = useContentBuilder();
  const { activeStep, steps } = state;

  // Calculate progress percentage
  const progressPercentage = 
    (steps.filter(step => step.completed).length / steps.length) * 100;

  // Determine if user can proceed to next step
  const canGoNext = activeStep < steps.length - 1 && steps[activeStep].completed;
  
  // Render the current step component
  const renderStepContent = () => {
    const stepIndex = steps[activeStep].id;
    
    switch (stepIndex) {
      case 0:
        return <KeywordSelectionStep />;
      case 1:
        return <ContentTypeStep />;
      case 2:
        return <OutlineStep />;
      case 3:
        return <ContentWritingStep />;
      case 4:
        return <OptimizationStep />;
      case 5:
        return <PublishStep />;
      default:
        return <KeywordSelectionStep />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Content Builder</h2>
          <div className="text-sm text-muted-foreground">
            Step {activeStep + 1} of {steps.length}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="w-full overflow-x-auto">
        <Tabs 
          value={activeStep.toString()} 
          onValueChange={(value) => navigateToStep(parseInt(value))}
          className="w-full"
        >
          <TabsList className="w-full justify-start">
            {steps.map((step) => (
              <TabsTrigger 
                key={step.id} 
                value={step.id.toString()} 
                disabled={!step.completed && step.id !== activeStep}
                className="gap-1.5"
              >
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : null}
                {step.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Step Content */}
      <div className="bg-glass rounded-lg border border-white/10 p-6">
        <div className="space-y-2 mb-6">
          <h3 className="text-xl font-bold">{steps[activeStep].name}</h3>
          <p className="text-muted-foreground">{steps[activeStep].description}</p>
        </div>
        
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigateToStep(activeStep - 1)}
          disabled={activeStep === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        
        <Button
          onClick={() => navigateToStep(activeStep + 1)}
          disabled={!canGoNext}
          className={`gap-1 ${canGoNext ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple' : ''}`}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
