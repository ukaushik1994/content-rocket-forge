
import React from 'react';
import { CheckCircle, ChevronRight, CheckSquare, Settings, Search, FileText, Edit, Sparkles, BarChart4, Upload, Layers, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentBuilderSidebarProps {
  steps: {
    id: number;
    name: string;
    description: string;
    completed: boolean;
  }[];
  activeStep: number;
  navigateToStep: (step: number) => void;
}

export const ContentBuilderSidebar = ({ steps, activeStep, navigateToStep }: ContentBuilderSidebarProps) => {
  // Separate strategy step from content creation steps
  const strategyStep = steps.find(step => step.id === 0);
  const contentSteps = steps.filter(step => step.id !== 0 && step.id !== 2); // Filter out strategy and SERP Analysis
  
  // Return the appropriate icon for each step
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 0: return <Lightbulb className="h-4 w-4" />;
      case 1: return <Layers className="h-4 w-4" />; // Combined step icon
      case 2: return <Search className="h-4 w-4" />;
      case 3: return <Edit className="h-4 w-4" />;
      case 4: return <BarChart4 className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
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
        
        {/* Strategy Foundation Section */}
        {strategyStep && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-0.5 w-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
              <span className="text-xs font-medium text-amber-300 uppercase tracking-wide">Strategy Foundation</span>
            </div>
            
            {(() => {
              const isActive = activeStep === 0;
              const isCompleted = strategyStep.completed;
              
              return (
                <button
                  onClick={() => navigateToStep(0)}
                  className={cn(
                    "w-full flex items-center text-left rounded-lg px-4 py-3 text-sm transition-all relative overflow-hidden group border",
                    isActive 
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-white border-amber-400/30"
                      : isCompleted
                        ? "text-white/90 hover:bg-amber-500/5 border-amber-500/20"
                        : "text-white/70 border-amber-400/20"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/5 opacity-50 animate-pulse"></div>
                  )}
                  
                  <div className={cn(
                    "flex items-center justify-center rounded-full h-7 w-7 mr-3 shrink-0",
                    isActive 
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                      : isCompleted
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-amber-400/10 text-amber-400/70"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Lightbulb className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{strategyStep.name}</div>
                    <div className={cn(
                      "text-xs line-clamp-1",
                      isActive ? "text-white/70" : "text-white/50"
                    )}>
                      {strategyStep.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-2 text-white/70 animate-bounce" />
                  )}
                </button>
              );
            })()}
          </div>
        )}

        {/* Strategy to Content Transition */}
        {strategyStep?.completed && (
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-2 text-green-400/70">
              <div className="h-px w-8 bg-green-400/30"></div>
              <ArrowRight className="h-3 w-3" />
              <div className="h-px w-8 bg-green-400/30"></div>
            </div>
          </div>
        )}
        
        {/* Content Creation Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-0.5 w-4 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"></div>
            <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">Content Creation</span>
          </div>
          
          <div className="space-y-1.5">
            {contentSteps.map((step, index) => {
              // Find the actual step index from the original steps array
              const originalStepIndex = steps.findIndex(s => s.id === step.id);
              const isActive = activeStep === originalStepIndex;
              const isCompleted = step.completed;
              const canAccess = strategyStep?.completed || index === 0;
              
              return (
                <button
                  key={step.id}
                  onClick={() => navigateToStep(originalStepIndex)}
                  disabled={!canAccess && !isActive}
                  className={cn(
                    "w-full flex items-center text-left rounded-md px-3 py-2.5 text-sm transition-colors relative overflow-hidden group",
                    isActive 
                      ? "bg-gradient-to-r from-neon-purple/20 to-neon-blue/10 text-white"
                      : isCompleted
                        ? "text-white/90 hover:bg-white/5"
                        : canAccess 
                          ? "text-white/70 hover:bg-white/5"
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
                        : canAccess
                          ? "bg-white/10 text-white/70"
                          : "bg-white/5 text-white/30"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      getStepIcon(step.id)
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className={cn(
                      "text-xs line-clamp-1",
                      isActive ? "text-white/70" : "text-white/50"
                    )}>
                      {step.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-2 text-white/70 animate-bounce" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="px-3 pb-4 pt-6 mt-auto border-t border-white/10">
        <div className="bg-white/5 rounded-md p-3 text-xs text-white/70">
          <p className="font-medium mb-1">Workflow Tips</p>
          <ul className="space-y-1 list-disc pl-4 text-white/60">
            <li>Start with Strategy Studio to build your foundation</li>
            <li>Content creation unlocks after strategy completion</li>
            <li>Progress is automatically saved</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
