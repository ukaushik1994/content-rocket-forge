
import React from 'react';
import { CheckCircle, ChevronRight, CheckSquare, Settings, Search, FileText, Edit, Sparkles, BarChart4, Upload, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  // Filter out the SERP Analysis step (step with id 2)
  const visibleSteps = steps.filter(step => step.id !== 2);
  
  // Return the appropriate icon for each step
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 0: return <Sparkles className="h-4 w-4" />;
      case 1: return <Layers className="h-4 w-4" />; // Combined step icon
      case 2: return <Search className="h-4 w-4" />;
      case 3: return <Edit className="h-4 w-4" />;
      case 4: return <BarChart4 className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  // Get the visible step index for a step from the original steps array
  const getVisibleStepIndex = (step: any) => {
    return visibleSteps.findIndex(s => s.id === step.id);
  };
  
  return (
    <div className="fixed top-0 left-0 h-screen w-80 border-r border-border/40 bg-background/60 backdrop-blur-sm z-10 overflow-y-auto">
      <div className="p-6">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Content Builder</span>
          </div>
          <h2 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
            Build Your Content
          </h2>
          <p className="text-sm text-muted-foreground">
            Create SEO-optimized, AI-powered content
          </p>
        </motion.div>
        
        <div className="space-y-4">
          {visibleSteps.map((step, index) => {
            // Find the actual step index from the original steps array
            const originalStepIndex = steps.findIndex(s => s.id === step.id);
            const isActive = activeStep === originalStepIndex;
            const isCompleted = step.completed;
            const canNavigate = !isCompleted && !isActive && index !== 0 ? false : true;
            
            return (
              <motion.div
                key={step.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  canNavigate ? 'hover:scale-102' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canNavigate && navigateToStep(originalStepIndex)}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={canNavigate ? { scale: 1.02 } : {}}
              >
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-r from-primary/20 to-blue-500/20 border-primary/40 shadow-lg shadow-primary/20" 
                    : isCompleted
                    ? "bg-green-500/10 border-green-500/20 hover:bg-green-500/15"
                    : "bg-background/60 border-border/40 hover:bg-background/80"
                )}>
                  
                  {/* Step indicator */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      getStepIcon(step.id)
                    )}
                  </div>
                  
                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isActive ? "text-foreground" : "text-foreground/80"
                    )}>
                      {step.name}
                    </h3>
                    <p className={cn(
                      "text-xs mt-1 transition-colors duration-300",
                      isActive ? "text-muted-foreground" : "text-muted-foreground/70"
                    )}>
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>

                {/* Connecting line */}
                {index < visibleSteps.length - 1 && (
                  <div className="ml-7 mt-2 h-6 w-px bg-border/30" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tips section */}
        <motion.div 
          className="mt-8 p-4 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl border border-primary/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h4 className="text-sm font-medium mb-2 text-foreground">💡 Pro Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Complete each step before moving to the next</li>
            <li>• You can go back to previous steps anytime</li>
            <li>• Progress is automatically saved</li>
            <li>• Use AI assistance for better optimization</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};
