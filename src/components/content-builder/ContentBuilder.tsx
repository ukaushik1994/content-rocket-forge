import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';

// Import step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { OutlineStep } from './steps/OutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizationStep } from './steps/OptimizationStep';
import { PublishStep } from './steps/PublishStep';
export const ContentBuilder = () => {
  const {
    state,
    navigateToStep
  } = useContentBuilder();
  const {
    activeStep,
    steps
  } = state;

  // Calculate progress percentage
  const progressPercentage = steps.filter(step => step.completed).length / steps.length * 100;

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
  return <div className="w-full space-y-8">
      {/* Progress Bar and Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">Content Builder</h2>
          </div>
          <div className="text-sm text-muted-foreground px-3 py-1 bg-white/5 rounded-full border border-white/10">
            Step {activeStep + 1} of {steps.length}
          </div>
        </div>
        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-300 ease-out" style={{
          width: `${progressPercentage}%`
        }}></div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="w-full overflow-x-auto scrollbar-none">
        <Tabs value={activeStep.toString()} onValueChange={value => navigateToStep(parseInt(value))} className="w-full">
          <TabsList className="w-full justify-start bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-1">
            {steps.map(step => <TabsTrigger key={step.id} value={step.id.toString()} disabled={!step.completed && step.id !== activeStep} className="gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md transition-all duration-200">
                {step.completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : null}
                {step.name}
              </TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-white/10 p-8 shadow-lg backdrop-blur-xl bg-gray-950">
        <div className="space-y-2 mb-8">
          <h3 className="text-2xl font-bold text-gradient">{steps[activeStep].name}</h3>
          <p className="text-muted-foreground">{steps[activeStep].description}</p>
        </div>
        
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => navigateToStep(activeStep - 1)} disabled={activeStep === 0} className="gap-1 bg-glass border border-white/10 hover:border-white/20 transition-all">
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        
        <Button onClick={() => navigateToStep(activeStep + 1)} disabled={!canGoNext} className={`gap-1 shadow-lg ${canGoNext ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300' : 'opacity-50'}`}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>;
};