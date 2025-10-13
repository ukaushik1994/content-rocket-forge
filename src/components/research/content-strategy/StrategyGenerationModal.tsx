import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, Brain, Search, Target, Zap, TrendingUp, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GenerationStep = {
  label: string;
  status: 'pending' | 'active' | 'done';
  hint?: string;
};

interface StrategyGenerationModalProps {
  open: boolean;
  steps: GenerationStep[];
  onCancel?: () => void;
  activeProvider?: string;
}

const stepIcons = [Brain, Search, Database, Target, TrendingUp, Zap];

const getStepIcon = (index: number) => {
  return stepIcons[index % stepIcons.length];
};

export function StrategyGenerationModal({ open, steps, onCancel, activeProvider }: StrategyGenerationModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const overallProgress = useMemo(() => {
    const doneCount = steps.filter(s => s.status === 'done').length;
    return Math.round((doneCount / steps.length) * 100);
  }, [steps]);

  const activeStepIndex = steps.findIndex(s => s.status === 'active');
  const activeStep = activeStepIndex >= 0 ? steps[activeStepIndex] : null;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1], // Spring physics
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Animated backdrop with blur */}
          <motion.div 
            className="fixed inset-0 bg-background/90 backdrop-blur-md -z-10"
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(12px)' }}
            onClick={onCancel}
          />

          {/* Floating gradient orbs for depth */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-purple/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-blue/20 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>

          {/* Main modal */}
          <motion.div
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-blue/20 pointer-events-none" />
            
            {/* Header Section */}
            <div className="relative p-8 border-b border-border/50">
              <div className="flex items-start gap-4">
                {/* Large animated icon */}
                <motion.div 
                  className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center ring-2 ring-neon-purple/30"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(155, 135, 245, 0.3)',
                      '0 0 40px rgba(155, 135, 245, 0.6)',
                      '0 0 20px rgba(155, 135, 245, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <Sparkles className="h-8 w-8 text-neon-purple" />
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-neon-purple/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                </motion.div>

                <div className="flex-1">
                  <h2 className="font-space text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Generating AI-Powered Strategy
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 font-inter">
                    {activeStep ? activeStep.hint || activeStep.label : 'Preparing your personalized content strategy...'}
                    {activeProvider && (
                      <span className="text-neon-purple ml-2">
                        • Using {activeProvider}
                      </span>
                    )}
                  </p>
                  
                  {/* Overall progress bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Overall Progress</span>
                      <span className="text-neon-purple font-semibold">{overallProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden ring-1 ring-black/5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="relative p-8">
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
              >
                {steps.map((step, index) => {
                  const StepIcon = getStepIcon(index);
                  const isLast = index === steps.length - 1;
                  
                  return (
                    <motion.div
                      key={index}
                      variants={stepVariants}
                      className="relative"
                    >
                      {/* Step Card */}
                      <div
                        className={cn(
                          'relative rounded-xl p-4 transition-all duration-300',
                          'border backdrop-blur-sm',
                          step.status === 'done' && 'border-success/30 bg-success/5',
                          step.status === 'active' && 'border-neon-purple/50 bg-neon-purple/5 shadow-lg shadow-neon-purple/20',
                          step.status === 'pending' && 'border-border/30 bg-muted/20'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="relative">
                            <motion.div
                              className={cn(
                                'h-12 w-12 rounded-xl flex items-center justify-center',
                                'ring-1 transition-all duration-300',
                                step.status === 'done' && 'bg-success/10 ring-success/30',
                                step.status === 'active' && 'bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 ring-neon-purple/50',
                                step.status === 'pending' && 'bg-muted/50 ring-border/30'
                              )}
                              animate={step.status === 'active' ? {
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                  '0 0 0 0 rgba(155, 135, 245, 0)',
                                  '0 0 0 8px rgba(155, 135, 245, 0.1)',
                                  '0 0 0 0 rgba(155, 135, 245, 0)',
                                ],
                              } : {}}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut'
                              }}
                            >
                              {step.status === 'done' ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                  <CheckCircle2 className="h-6 w-6 text-success" />
                                </motion.div>
                              ) : step.status === 'active' ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                >
                                  <StepIcon className="h-6 w-6 text-neon-purple" />
                                </motion.div>
                              ) : (
                                <StepIcon className="h-6 w-6 text-muted-foreground/50" />
                              )}
                            </motion.div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground/60">
                                STEP {index + 1}
                              </span>
                            </div>
                            <h3 className={cn(
                              'font-space text-base font-semibold mt-1',
                              step.status === 'active' && 'text-foreground',
                              step.status === 'done' && 'text-foreground/80',
                              step.status === 'pending' && 'text-muted-foreground'
                            )}>
                              {step.label}
                            </h3>
                            
                            {step.hint && (
                              <p className="text-sm text-muted-foreground mt-1 font-inter">
                                {step.hint}
                              </p>
                            )}

                            {/* Active step progress */}
                            {step.status === 'active' && (
                              <motion.div
                                className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden ring-1 ring-black/5"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <motion.div
                                  className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan"
                                  animate={{
                                    x: ['-100%', '100%'],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                  }}
                                  style={{ width: '50%' }}
                                />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Connecting line */}
                      {!isLast && (
                        <div className="absolute left-10 top-[76px] w-0.5 h-4 -mb-4">
                          <motion.div
                            className={cn(
                              'w-full h-full',
                              step.status === 'done' ? 'bg-success/30' : 'bg-border/30'
                            )}
                            initial={{ scaleY: 0, originY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Insight Panel */}
              {activeStep && (
                <motion.div
                  className="mt-6 rounded-xl border border-neon-purple/20 bg-neon-purple/5 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-neon-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neon-purple/80 uppercase tracking-wide">
                        Smart Insight
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 font-inter">
                        {activeStep.hint || 'Analyzing your market and discovering opportunities...'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Footer Actions */}
              {onCancel && (
                <div className="mt-6 flex justify-end">
                  <motion.button
                    onClick={onCancel}
                    className="text-sm px-4 py-2 rounded-lg border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
