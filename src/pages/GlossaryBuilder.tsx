import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlossaryBuilderProvider } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { GlossaryBuilderSidebar } from '@/components/glossary-builder/sidebar/GlossaryBuilderSidebar';
import { TermInputStep } from '@/components/glossary-builder/steps/TermInputStep';
import { TermSelectionStep } from '@/components/glossary-builder/steps/TermSelectionStep';
import { DefinitionGenerationStep } from '@/components/glossary-builder/steps/DefinitionGenerationStep';
import { ReviewAndEditStep } from '@/components/glossary-builder/steps/ReviewAndEditStep';
import { SaveAndExportStep } from '@/components/glossary-builder/steps/SaveAndExportStep';
import { Helmet } from 'react-helmet-async';

const steps = [
  { id: 0, name: 'Term Discovery', description: 'Input terms via domain, topic, or manual entry', completed: false },
  { id: 1, name: 'Multi-Selection', description: 'Select multiple terms for processing', completed: false },
  { id: 2, name: 'AI Generation', description: 'Generate definitions with AI assistance', completed: false },
  { id: 3, name: 'Review & Edit', description: 'Review and refine generated definitions', completed: false },
  { id: 4, name: 'Save & Export', description: 'Save glossary and export in multiple formats', completed: false }
];

function GlossaryBuilderContent() {
  const { state, dispatch } = useGlossaryBuilder();
  const { currentStep, selectedTerms, suggestedTerms, isGenerating, isAnalyzing } = state;

  const navigateToStep = (stepIndex: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepIndex });
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      navigateToStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      navigateToStep(currentStep - 1);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  // Check if next step is available
  const canGoNext = () => {
    switch (currentStep) {
      case 0: return suggestedTerms.length > 0; // Has discovered terms
      case 1: return selectedTerms.length > 0; // Has selected terms
      case 2: return !isGenerating; // Generation complete
      case 3: return true; // Can always proceed from review
      default: return false;
    }
  };

  // Render the current step component
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <TermInputStep />;
      case 1: return <TermSelectionStep />;
      case 2: return <DefinitionGenerationStep />;
      case 3: return <ReviewAndEditStep />;
      case 4: return <SaveAndExportStep />;
      default: return <TermInputStep />;
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.20))]">
      {/* Glossary Builder Sidebar */}
      <GlossaryBuilderSidebar 
        steps={steps} 
        activeStep={currentStep} 
        navigateToStep={navigateToStep} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Progress indicator */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40 px-6 py-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
                {steps[currentStep].name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground px-3 py-1 bg-white/5 rounded-full border border-white/10">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-1.5 bg-white/5" />
        </div>
        
        {/* Step content */}
        <div className="flex-1 p-6 overflow-y-auto" id="glossary-builder-main-content">
          {renderStepContent()}
        </div>
        
        {/* Navigation controls */}
        {!isLastStep && (
          <div className="sticky bottom-0 z-10 bg-background/80 backdrop-blur-sm border-t border-border/40 p-4">
            <div className="flex justify-between px-6">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="gap-1 bg-glass border border-white/10 hover:border-white/20 transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              
              <Button
                onClick={handleNextStep}
                disabled={!canGoNext()}
                className={`gap-1 shadow-lg ${canGoNext() ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300' : 'opacity-50'}`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GlossaryBuilder() {
  return (
    <GlossaryBuilderProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Helmet>
          <title>Glossary Builder | Cr3ate</title>
        </Helmet>
        
        <Navbar />
        
        <div className="flex-1">
          <GlossaryBuilderContent />
        </div>
      </div>
    </GlossaryBuilderProvider>
  );
}