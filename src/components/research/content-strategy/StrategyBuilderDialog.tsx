import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send, Save, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { StepContent } from './dialog/StepContent';
import { ContentBuilderProvider, useContentBuilder } from '@/contexts/ContentBuilderContext';
import { EnhancedSolution } from '@/contexts/content-builder/types';
import { SerpAnalysisStep } from '@/components/content-builder/steps/SerpAnalysisStep';
import { SaveStep } from '@/components/content-builder/steps/save/SaveStep';

interface StrategyBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: any;
}

const STEPS = [
  { id: 0, title: 'Select Solution', icon: Send, description: 'Choose the solution to feature' },
  { id: 1, title: 'SERP Analysis', icon: Sparkles, description: 'Analyze search results' },
  { id: 2, title: 'Generate Outline', icon: Sparkles, description: 'Create content structure' },
  { id: 3, title: 'Generate Content', icon: FileText, description: 'Create the content' },
  { id: 4, title: 'Save Content', icon: Save, description: 'Save to repository' }
];

// Content initialization component to set up context
function StrategyContentInit({ proposal }: { proposal: any }) {
  const { 
    setMainKeyword, 
    setContentTitle, 
    setMetaTitle, 
    setMetaDescription,
    setContentType,
    setContentFormat,
    setContentIntent,
    analyzeKeyword
  } = useContentBuilder();
  
  useEffect(() => {
    if (proposal) {
      // Initialize content builder context with strategy data
      if (proposal.primary_keyword) {
        setMainKeyword(proposal.primary_keyword);
        // Auto-analyze keyword for SERP data
        analyzeKeyword(proposal.primary_keyword);
      }
      if (proposal.title) {
        setContentTitle(proposal.title);
        setMetaTitle(proposal.title);
      }
      
      // Set default content settings
      setContentType('blog');
      setContentFormat('long-form');
      setContentIntent('inform');
      
      // Set meta description based on proposal
      const description = proposal.description || `A comprehensive guide about ${proposal.primary_keyword || 'your topic'}`;
      setMetaDescription(description);
    }
  }, [proposal, setMainKeyword, setContentTitle, setMetaTitle, setMetaDescription, setContentType, setContentFormat, setContentIntent, analyzeKeyword]);
  
  return null;
}

export function StrategyBuilderDialog({ open, onOpenChange, proposal }: StrategyBuilderDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  // Context-aware step validation using ContentBuilder state
  const ContentBuilderStepValidator = ({ children }: { children: React.ReactNode }) => {
    return (
      <ContentBuilderProvider>
        <StrategyContentInit proposal={proposal} />
        <StepValidationLogic>{children}</StepValidationLogic>
      </ContentBuilderProvider>
    );
  };

  const StepValidationLogic = ({ children }: { children: React.ReactNode }) => {
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

    return React.cloneElement(children as React.ReactElement, { canProceedToStep });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Strategy Content Builder
          </DialogTitle>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex-shrink-0 grid grid-cols-5 gap-2 mb-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = false; // Will be updated by context
            const isAccessible = true; // Will be updated by context

            return (
              <Card 
                key={step.id}
                className={`cursor-pointer transition-all ${
                  isActive 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : isAccessible 
                      ? 'hover:bg-muted/50' 
                      : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => setCurrentStep(index)}
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
            );
          })}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          <ContentBuilderStepValidator>
            <StepContent 
              currentStep={currentStep}
              proposal={proposal}
              handleClose={handleClose}
            />
          </ContentBuilderStepValidator>
        </div>

        {/* Navigation Footer */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleClose}>
                Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}