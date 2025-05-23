
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TourStep {
  id: string;
  title: string;
  description: React.ReactNode;
  selector?: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

export const ContentRepurposingTour: React.FC = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem('content-repurposing-tour-seen') === 'true';
  });
  const navigate = useNavigate();

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Content Repurposing',
      description: (
        <div className="space-y-2">
          <p>This tool helps you transform your existing content into various formats for different platforms and audiences.</p>
          <p>Let's walk through how to use this feature effectively!</p>
        </div>
      ),
      position: 'center',
    },
    {
      id: 'select-content',
      title: 'Step 1: Select Content',
      description: (
        <div className="space-y-2">
          <p>Start by selecting a piece of content from your library that you want to repurpose.</p>
          <p>Click on any content item to begin the repurposing process.</p>
        </div>
      ),
      selector: '.content-item',
      position: 'bottom',
    },
    {
      id: 'select-formats',
      title: 'Step 2: Choose Formats',
      description: (
        <div className="space-y-2">
          <p>Select the formats you want to transform your content into.</p>
          <p>You can choose multiple formats at once to generate different versions simultaneously.</p>
        </div>
      ),
      selector: '.formats-selection',
      position: 'right',
    },
    {
      id: 'generate-content',
      title: 'Step 3: Generate Content',
      description: (
        <div className="space-y-2">
          <p>Click the "Generate" button to transform your content into the selected formats.</p>
          <p>The AI will create optimized versions suitable for each platform.</p>
        </div>
      ),
      selector: '.generate-button',
      position: 'bottom',
    },
    {
      id: 'edit-content',
      title: 'Step 4: Edit & Save',
      description: (
        <div className="space-y-2">
          <p>Review, edit, and save your repurposed content.</p>
          <p>You can make changes to ensure it perfectly fits your needs before saving it to your content library.</p>
        </div>
      ),
      selector: '.content-display',
      position: 'left',
    },
    {
      id: 'finish',
      title: 'You're Ready!',
      description: (
        <div className="space-y-2">
          <p>You now know how to repurpose content effectively across multiple formats.</p>
          <p>Let's get started by selecting a piece of content to repurpose!</p>
        </div>
      ),
      position: 'center',
    },
  ];

  useEffect(() => {
    // Only show the tour if the user hasn't seen it yet
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('content-repurposing-tour-seen', 'true');
    setHasSeenTour(true);
  };

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCloseTour();
      navigate('/content-repurposing');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      <Dialog open={isTourOpen} onOpenChange={setIsTourOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentTourStep.title}</DialogTitle>
            <DialogDescription>
              {currentTourStep.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-4">
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={handleCloseTour}
                className="text-muted-foreground"
              >
                Skip tour
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNextStep}>
                {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsTourOpen(true)}
        className="absolute top-4 right-4"
      >
        Start Tour
      </Button>
    </>
  );
};

export default ContentRepurposingTour;
