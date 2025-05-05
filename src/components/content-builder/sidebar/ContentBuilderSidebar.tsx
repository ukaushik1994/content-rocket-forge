
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
  // Animation variants for list items
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <aside className="hidden md:block w-64 bg-black/20 border-r border-white/10 backdrop-blur-lg sticky top-0 h-[calc(100vh-theme(spacing.16))] overflow-y-auto">
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-1 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
          Content Builder
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Create high-quality optimized content
        </p>
        
        <motion.div 
          className="space-y-1"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = step.completed;
            const isClickable = index <= activeStep || isCompleted;
            
            // Add the first active step that's not completed
            const isNextActionStep = !isActive && !isCompleted && 
              index === steps.findIndex((s, i) => i > activeStep && !s.completed);
            
            return (
              <motion.div 
                key={step.id} 
                className="relative"
                variants={itemVariants}
                whileHover={isClickable ? { x: 4 } : {}}
                transition={{ duration: 0.2 }}
              >
                {/* Connecting line between steps - Enhanced to show progress better */}
                {index > 0 && (
                  <motion.div 
                    className={`absolute left-3.5 -top-4 w-0.5 h-4 ${
                      steps[index-1].completed 
                        ? "bg-gradient-to-b from-green-400 to-green-400/50" 
                        : index <= activeStep 
                          ? "bg-gradient-to-b from-neon-purple/50 to-white/10" 
                          : "bg-white/10"
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: '1rem' }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  />
                )}
                
                <button
                  onClick={() => isClickable && navigateToStep(index)}
                  disabled={!isClickable}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-neon-purple/20 to-neon-blue/10 text-white border-l-2 border-neon-purple"
                      : isNextActionStep
                        ? "hover:bg-white/5 text-muted-foreground border-l-2 border-neon-blue/40"
                        : isClickable
                          ? "hover:bg-white/5 text-muted-foreground"
                          : "text-muted-foreground/40 cursor-not-allowed",
                    isCompleted && !isActive && "text-white/70 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-neon-purple to-neon-blue"
                      : isNextActionStep
                        ? "bg-neon-blue/20 animate-pulse"
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
                    <div className={cn(
                      "font-medium",
                      isNextActionStep && "text-neon-blue"
                    )}>{step.name}</div>
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
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </aside>
  );
};
