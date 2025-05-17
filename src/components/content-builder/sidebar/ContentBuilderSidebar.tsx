
import React from 'react';
import { CheckCircle, ChevronRight, CheckSquare, Settings, Search, FileText, Edit, Sparkles, BarChart4, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentBuilderSidebarProps {
  steps: {
    id: number;
    name: string;
    description?: string; // Make description optional to match ContentBuilderStep
    completed: boolean;
  }[];
  activeStep: number;
  navigateToStep: (step: number) => void;
}

export const ContentBuilderSidebar = ({ steps, activeStep, navigateToStep }: ContentBuilderSidebarProps) => {
  // Filter out the SERP Analysis step (step with id 2)
  const visibleSteps = steps.filter(step => step.id !== 2);
  
  // Return the appropriate icon for each step
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 0: return <Sparkles className="h-4 w-4" />;
      case 1: return <CheckSquare className="h-4 w-4" />;
      case 2: return <Search className="h-4 w-4" />;
      case 3: return <FileText className="h-4 w-4" />;
      case 4: return <Edit className="h-4 w-4" />;
      case 5: return <BarChart4 className="h-4 w-4" />;
      case 6: return <Upload className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  // Get the visible step index for a step from the original steps array
  const getVisibleStepIndex = (step: any) => {
    return visibleSteps.findIndex(s => s.id === step.id);
  };
  
  return (
    <div className="w-72 border-r border-white/10 bg-black/20 backdrop-blur-lg shrink-0 hidden md:block">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-lg">Content Builder</h3>
        </div>
        
        <div className="space-y-1.5">
          {visibleSteps.map((step, index) => {
            // Find the actual step index from the original steps array
            const originalStepIndex = steps.findIndex(s => s.id === step.id);
            const isActive = activeStep === originalStepIndex;
            const isCompleted = step.completed;
            
            return (
              <button
                key={step.id}
                onClick={() => navigateToStep(originalStepIndex)}
                disabled={!isCompleted && !isActive && index !== 0}
                className={cn(
                  "w-full flex items-center text-left rounded-md px-3 py-2.5 text-sm transition-colors relative overflow-hidden group",
                  isActive 
                    ? "bg-gradient-to-r from-neon-purple/20 to-neon-blue/10 text-white"
                    : isCompleted
                      ? "text-white/90 hover:bg-white/5"
                      : "text-white/40 cursor-not-allowed"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/10 opacity-[0.15] animate-pulse"></div>
                )}
                
                <div className={cn(
                  "flex items-center justify-center rounded-full h-6 w-6 mr-3 shrink-0",
                  isActive 
                    ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white"
                    : isCompleted
                      ? "bg-green-500/20 text-green-400"
                      : "bg-white/10 text-white/40"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    getStepIcon(step.id)
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  {step.description && (
                    <div className={cn(
                      "text-xs line-clamp-1",
                      isActive ? "text-white/70" : "text-white/50"
                    )}>
                      {step.description}
                    </div>
                  )}
                </div>
                
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-2 text-white/70 animate-bounce" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="px-3 pb-4 pt-6 mt-auto border-t border-white/10">
        <div className="bg-white/5 rounded-md p-3 text-xs text-white/70">
          <p className="font-medium mb-1">Tips</p>
          <ul className="space-y-1 list-disc pl-4 text-white/60">
            <li>Complete each step before moving to the next</li>
            <li>You can go back to previous steps anytime</li>
            <li>Progress is automatically saved</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
