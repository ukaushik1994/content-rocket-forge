import React from 'react';
import { GlossaryStep } from '@/contexts/glossary-builder/types';
import { CheckCircle, Circle, Search, MousePointer, Building, Sparkles, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlossaryBuilderSidebarProps {
  steps: GlossaryStep[];
  activeStep: number;
  navigateToStep: (step: number) => void;
}

export const GlossaryBuilderSidebar: React.FC<GlossaryBuilderSidebarProps> = ({
  steps,
  activeStep,
  navigateToStep
}) => {
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 0: return Search;
      case 1: return MousePointer;
      case 2: return Building;
      case 3: return Sparkles;
      case 4: return Save;
      default: return Circle;
    }
  };

  return (
    <div className="w-80 border-r border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="p-6">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Glossary Builder</span>
          </div>
          <h2 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
            Build Your Glossary
          </h2>
          <p className="text-sm text-muted-foreground">
            Create comprehensive, AI-powered glossaries
          </p>
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = getStepIcon(step.id);
            const isActive = activeStep === index;
            const isCompleted = step.completed;
            const canNavigate = index <= activeStep || isCompleted;

            return (
              <motion.div
                key={step.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  canNavigate ? 'hover:scale-102' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canNavigate && navigateToStep(index)}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={canNavigate ? { scale: 1.02 } : {}}
              >
                <div className={`
                  flex items-center gap-3 p-4 rounded-xl border transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary/20 to-blue-500/20 border-primary/40 shadow-lg shadow-primary/20' 
                    : isCompleted
                    ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15'
                    : 'bg-background/60 border-border/40 hover:bg-background/80'
                  }
                `}>
                  {/* Step indicator */}
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      text-sm font-medium transition-colors duration-300
                      ${isActive ? 'text-foreground' : 'text-foreground/80'}
                    `}>
                      {step.name}
                    </h3>
                    <p className={`
                      text-xs mt-1 transition-colors duration-300
                      ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/70'}
                    `}>
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
                {index < steps.length - 1 && (
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
            <li>• Use domain analysis for comprehensive term discovery</li>
            <li>• Select multiple terms for batch processing</li>
            <li>• Choose a solution to contextualize definitions</li>
            <li>• AI generates SEO-optimized content</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};