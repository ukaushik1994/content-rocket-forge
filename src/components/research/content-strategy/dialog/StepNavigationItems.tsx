import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { ValidationTooltip } from './ValidationTooltip';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface StepNavigationItemsProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  steps: Array<{
    id: number;
    title: string;
    icon: React.ComponentType<any>;
    description: string;
  }>;
}

export function StepNavigationItems({ currentStep, onStepClick, steps }: StepNavigationItemsProps) {
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

  return (
    <>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = canProceedToStep(index + 1) || (index === steps.length - 1 && state.content);
        const isAccessible = canProceedToStep(index);

        return (
          <ValidationTooltip key={step.id} step={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={isAccessible ? { scale: 1.02, y: -2 } : {}}
              whileTap={isAccessible ? { scale: 0.98 } : {}}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 backdrop-blur-xl border-border/50 relative overflow-hidden ${
                  isActive 
                    ? 'ring-2 ring-primary bg-primary/10 shadow-lg shadow-primary/20' 
                    : isAccessible 
                      ? 'hover:bg-background/80 hover:shadow-lg hover:border-primary/30' 
                      : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => isAccessible && onStepClick(index)}
              >
                {/* Animated background for active step */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Completion glow effect */}
                {isCompleted && !isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}

                <CardContent className="p-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`p-2 rounded-lg relative ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg' 
                          : isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                            : 'bg-background/60 backdrop-blur-sm border border-border/50'
                      }`}
                      animate={isActive ? { 
                        boxShadow: ['0 0 20px rgba(var(--primary), 0.3)', '0 0 30px rgba(var(--primary), 0.5)', '0 0 20px rgba(var(--primary), 0.3)']
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      
                      {/* Completion sparkle effect */}
                      {isCompleted && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                          animate={{ 
                            scale: [0, 1.5, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            delay: Math.random() * 2
                          }}
                        />
                      )}
                    </motion.div>
                    
                    <div className="min-w-0 flex-1">
                      <motion.div 
                        className={`font-medium text-sm truncate ${
                          isActive ? 'text-primary' : isCompleted ? 'text-green-600 dark:text-green-400' : ''
                        }`}
                        animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {step.title}
                      </motion.div>
                      <div className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </div>
                    </div>
                    
                    {/* Step number indicator */}
                    <motion.div 
                      className={`text-xs px-2 py-1 rounded-full ${
                        isActive 
                          ? 'bg-primary/20 text-primary border border-primary/30' 
                          : isCompleted
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                            : 'bg-muted text-muted-foreground'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {index + 1}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </ValidationTooltip>
        );
      })}
    </>
  );
}