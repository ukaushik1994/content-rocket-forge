import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, AlertTriangle } from 'lucide-react';
import { GlossaryBuilderSidebar } from '@/components/glossary-builder/sidebar/GlossaryBuilderSidebar';
import { Button } from '@/components/ui/button';
import { GlossaryBuilderProvider, useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Helmet } from 'react-helmet-async';

// Step components
import { TermInputStep } from '@/components/glossary-builder/steps/TermInputStep';
import { TermSelectionStep } from '@/components/glossary-builder/steps/TermSelectionStep';
import { DefinitionGenerationStep } from '@/components/glossary-builder/steps/DefinitionGenerationStep';
import { ReviewAndEditStep } from '@/components/glossary-builder/steps/ReviewAndEditStep';
import { SaveAndExportStep } from '@/components/glossary-builder/steps/SaveAndExportStep';

interface GlossaryBuilderContentProps {}

const GlossaryBuilderContent: React.FC<GlossaryBuilderContentProps> = () => {
  const { state } = useGlossaryBuilder();
  const [activeStep, setActiveStep] = useState(0);

  // Define the steps for the glossary builder workflow
  const steps = [
    { id: 0, name: 'Term Input', description: 'Add terms via domain analysis, topics, or manual entry', completed: false },
    { id: 1, name: 'Term Selection', description: 'Select and organize terms for definition generation', completed: false },
    { id: 2, name: 'Generate Definitions', description: 'AI-powered definition and content generation', completed: false },
    { id: 3, name: 'Review & Edit', description: 'Review and refine generated definitions', completed: false },
    { id: 4, name: 'Save & Export', description: 'Save glossary and export in various formats', completed: false }
  ];

  const [stepCompletionStatus, setStepCompletionStatus] = useState(
    steps.map(step => ({ ...step, completed: false }))
  );

  // Calculate progress percentage
  const completedSteps = stepCompletionStatus.filter(step => step.completed);
  const progressPercentage = completedSteps.length / steps.length * 100;

  // Check current step status
  const currentStepComplete = stepCompletionStatus[activeStep]?.completed || false;
  const canGoNext = activeStep < steps.length - 1;
  const canGoPrev = activeStep > 0;

  // Handle step completion
  const markStepCompleted = (stepId: number) => {
    setStepCompletionStatus(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  // Handle navigation
  const navigateToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setActiveStep(step);
    }
  };

  const handleNextStep = () => {
    if (canGoNext) {
      // Mark current step as completed when moving forward
      markStepCompleted(activeStep);
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (canGoPrev) {
      setActiveStep(activeStep - 1);
    }
  };

  // Render the current step component
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return <TermInputStep onStepComplete={() => markStepCompleted(0)} />;
      case 1: return <TermSelectionStep onStepComplete={() => markStepCompleted(1)} />;
      case 2: return <DefinitionGenerationStep onStepComplete={() => markStepCompleted(2)} />;
      case 3: return <ReviewAndEditStep onStepComplete={() => markStepCompleted(3)} />;
      case 4: return <SaveAndExportStep onStepComplete={() => markStepCompleted(4)} />;
      default: return <TermInputStep onStepComplete={() => markStepCompleted(0)} />;
    }
  };

  // Check if we're on the final step
  const isLastStep = activeStep === steps.length - 1;

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.20))]">
      {/* Glossary Builder Sidebar */}
      <GlossaryBuilderSidebar 
        steps={stepCompletionStatus} 
        activeStep={activeStep} 
        navigateToStep={navigateToStep} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Progress indicator */}
        <div className="sticky top-0 z-10 glass-panel border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center animate-pulse-glow">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-holographic">
                  {steps[activeStep].name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {state.lastError && (
                <div className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Error occurred</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground px-3 py-1 glass-card rounded-full border border-white/10">
                Step {activeStep + 1} of {steps.length}
              </div>
            </div>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden"
          />
        </div>
        
        {/* Step content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar futuristic-grid" id="glossary-builder-main-content">
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {renderStepContent()}
          </div>
        </div>
        
        {/* Navigation controls */}
        {!isLastStep && (
          <div className="sticky bottom-0 z-10 glass-panel border-t border-white/10 p-4">
            <div className="flex justify-between max-w-6xl mx-auto">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={!canGoPrev}
                className="gap-2 glass-card border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              
              <Button
                onClick={handleNextStep}
                disabled={!canGoNext}
                className="gap-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 hover:scale-105 shadow-neon"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GlossaryBuilder() {
  return (
    <GlossaryBuilderProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Helmet>
          <title>Glossary Builder | Content Rocket Forge</title>
        </Helmet>
        
        <Navbar />
        
        <div className="flex-1">
          <GlossaryBuilderContent />
        </div>
      </div>
    </GlossaryBuilderProvider>
  );
}