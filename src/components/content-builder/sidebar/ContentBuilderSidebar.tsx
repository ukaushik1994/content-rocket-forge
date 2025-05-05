
import React from 'react';
import { ContentBuilderStep } from '@/contexts/content-builder/types';
import { 
  Search, PenTool, Sparkles, FileText, Edit, LineChart, CheckSquare, Save,
  CheckCircle, ArrowRight, LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ContentBuilderSidebarProps {
  steps: ContentBuilderStep[];
  activeStep: number;
  navigateToStep: (stepIndex: number) => void;
}

interface StepIconProps {
  stepId: number;
  isActive: boolean;
  isCompleted: boolean;
}

const StepIcon: React.FC<StepIconProps> = ({ stepId, isActive, isCompleted }) => {
  // Map step IDs to their corresponding icons
  const getStepIcon = (id: number): LucideIcon => {
    switch (id) {
      case 0: return Search;
      case 1: return PenTool;
      case 2: return Sparkles;
      case 3: return FileText;
      case 4: return Edit;
      case 5: return LineChart;
      case 6: return CheckSquare;
      case 7: return Save;
      default: return Search;
    }
  };
  
  const IconComponent = getStepIcon(stepId);
  
  // Render icon based on step state
  if (isCompleted) {
    return <CheckCircle className="h-5 w-5 text-green-400" />;
  }
  
  return (
    <IconComponent 
      className={cn(
        "h-5 w-5",
        isActive ? "text-white" : "text-muted-foreground"
      )} 
    />
  );
};

export const ContentBuilderSidebar: React.FC<ContentBuilderSidebarProps> = ({
  steps,
  activeStep,
  navigateToStep
}) => {
  return (
    <aside className="hidden md:block w-64 bg-black/20 border-r border-white/10 backdrop-blur-lg sticky top-0 h-[calc(100vh-theme(spacing.16))] overflow-y-auto">
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-1 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
          Content Builder
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Create high-quality optimized content
        </p>
        
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = step.completed;
            const isClickable = index <= activeStep || isCompleted;
            
            return (
              <div key={step.id} className="relative">
                {/* Connecting line between steps */}
                {index > 0 && (
                  <div 
                    className={`absolute left-3.5 -top-4 w-0.5 h-4 ${
                      steps[index-1].completed ? "bg-green-400" : "bg-white/10"
                    }`}
                  />
                )}
                
                <button
                  onClick={() => isClickable && navigateToStep(index)}
                  disabled={!isClickable}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-neon-purple/20 to-neon-blue/10 text-white"
                      : isClickable
                        ? "hover:bg-white/5 text-muted-foreground"
                        : "text-muted-foreground/40 cursor-not-allowed",
                    isCompleted && !isActive && "text-white/70 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full",
                    isActive
                      ? "bg-gradient-to-r from-neon-purple to-neon-blue"
                      : isCompleted 
                        ? "bg-green-400/20" 
                        : "bg-white/5"
                  )}>
                    <StepIcon 
                      stepId={step.id}
                      isActive={isActive}
                      isCompleted={isCompleted}
                    />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium">{step.name}</div>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        repeatType: "reverse"
                      }}
                    >
                      <ArrowRight className="h-4 w-4 text-neon-blue" />
                    </motion.div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
