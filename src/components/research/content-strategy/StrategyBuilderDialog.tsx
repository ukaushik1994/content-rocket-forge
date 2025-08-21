import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send, Save, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { DialogSolutionSelector } from './dialog/DialogSolutionSelector';
import { DialogOutlineGenerator } from './dialog/DialogOutlineGenerator';
import { DialogContentGenerator } from './dialog/DialogContentGenerator';
import { DialogContentSaver } from './dialog/DialogContentSaver';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';
import { EnhancedSolution } from '@/contexts/content-builder/types';

interface StrategyBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: any;
}

const STEPS = [
  { id: 0, title: 'Select Solution', icon: Send, description: 'Choose the solution to feature' },
  { id: 1, title: 'Generate Outline', icon: Sparkles, description: 'Create content structure' },
  { id: 2, title: 'Generate Content', icon: FileText, description: 'Create the content' },
  { id: 3, title: 'Save Content', icon: Save, description: 'Save to repository' }
];

export function StrategyBuilderDialog({ open, onOpenChange, proposal }: StrategyBuilderDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSolution, setSelectedSolution] = useState<EnhancedSolution | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [contentTitle, setContentTitle] = useState(proposal?.title || '');

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setSelectedSolution(null);
      setGeneratedOutline([]);
      setGeneratedContent('');
      setContentTitle(proposal?.title || '');
    }
  }, [open, proposal]);

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 0: return true; // Always can access solution selection
      case 1: return !!selectedSolution; // Need solution selected
      case 2: return !!selectedSolution && generatedOutline.length > 0; // Need solution and outline
      case 3: return !!selectedSolution && generatedOutline.length > 0 && !!generatedContent; // Need everything
      default: return false;
    }
  };

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < STEPS.length && canProceedToStep(nextStep)) {
      setCurrentStep(nextStep);
    } else {
      toast({
        title: "Cannot proceed",
        description: "Please complete the current step before continuing",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (canProceedToStep(stepIndex)) {
      setCurrentStep(stepIndex);
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
        <div className="flex-shrink-0 grid grid-cols-4 gap-2 mb-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = canProceedToStep(index + 1) || (index === STEPS.length - 1 && generatedContent);
            const isAccessible = canProceedToStep(index);

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
                onClick={() => handleStepClick(index)}
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
          <ContentBuilderProvider>
            {currentStep === 0 && (
              <DialogSolutionSelector
                selectedSolution={selectedSolution}
                onSolutionSelect={setSelectedSolution}
                proposal={proposal}
              />
            )}
            
            {currentStep === 1 && (
              <DialogOutlineGenerator
                proposal={proposal}
                selectedSolution={selectedSolution}
                onOutlineGenerated={setGeneratedOutline}
                generatedOutline={generatedOutline}
              />
            )}

            {currentStep === 2 && (
              <DialogContentGenerator
                proposal={proposal}
                selectedSolution={selectedSolution}
                outline={generatedOutline}
                onContentGenerated={setGeneratedContent}
                generatedContent={generatedContent}
                contentTitle={contentTitle}
                onTitleChange={setContentTitle}
              />
            )}

            {currentStep === 3 && (
              <DialogContentSaver
                proposal={proposal}
                selectedSolution={selectedSolution}
                outline={generatedOutline}
                content={generatedContent}
                title={contentTitle}
                onSaveComplete={handleClose}
              />
            )}
          </ContentBuilderProvider>
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
              <Button 
                onClick={handleNext}
                disabled={!canProceedToStep(currentStep + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleClose}
                disabled={!generatedContent}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}