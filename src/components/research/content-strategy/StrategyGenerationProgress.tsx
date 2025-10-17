import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Target, Search, Brain, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface StrategyGenerationProgressProps {
  isGenerating: boolean;
  currentStep?: string;
  progress?: number;
}

const GENERATION_STEPS = [
  { key: 'keywords', label: 'Generating Keywords', icon: Brain, description: 'AI is discovering untapped keyword opportunities...' },
  { key: 'analysis', label: 'Analyzing SERP Data', icon: Search, description: 'Processing search metrics and competition data...' },
  { key: 'strategy', label: 'Creating Strategy', icon: Target, description: 'Building comprehensive content strategy...' },
  { key: 'complete', label: 'Strategy Ready!', icon: Sparkles, description: 'Your personalized content strategy is complete.' }
];

export function StrategyGenerationProgress({ 
  isGenerating, 
  currentStep = 'keywords',
  progress = 0 
}: StrategyGenerationProgressProps) {
  const currentStepIndex = GENERATION_STEPS.findIndex(step => step.key === currentStep);
  const currentStepData = GENERATION_STEPS[currentStepIndex] || GENERATION_STEPS[0];
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on completion
  useEffect(() => {
    if (currentStep === 'complete' && progress >= 95 && !showConfetti) {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981']
      });
    }
  }, [currentStep, progress, showConfetti]);

  if (!isGenerating) return null;

  return createPortal(
    <motion.div 
      className="fixed inset-0 z-[9999] flex items-center justify-center transform-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated gradient backdrop with particles */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/90 via-primary/20 to-black/90 backdrop-blur-md">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {/* Glassmorphic modal content */}
      <motion.div 
        className="relative z-[10000] w-full max-w-md mx-4"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl shadow-2xl p-8">
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50 blur-xl" />
          
          <div className="relative space-y-6">
            {/* Header with animated icon */}
            <div className="text-center space-y-4">
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
                animate={{ 
                  rotate: currentStep === 'complete' ? 360 : 0,
                  scale: currentStep === 'complete' ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.6 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep === 'complete' ? (
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    ) : (
                      <currentStepData.icon className="h-8 w-8 text-primary" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    {currentStepData.label}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentStepData.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Enhanced Progress Bar with shimmer */}
            <div className="space-y-3">
              <div className="relative">
                <Progress 
                  value={progress} 
                  className="h-2 bg-muted/50 overflow-hidden" 
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <motion.span 
                  className="text-muted-foreground"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Processing...
                </motion.span>
                <motion.span 
                  className="font-medium text-primary"
                  key={progress}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
            </div>

            {/* Step Indicators with animations */}
            <div className="flex justify-center gap-6 pt-2">
              {GENERATION_STEPS.slice(0, -1).map((step, index) => {
                const isActive = index === currentStepIndex;
                const isComplete = index < currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <motion.div 
                    key={step.key} 
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      className={`p-2 rounded-xl border-2 transition-all ${
                        isComplete 
                          ? 'bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/20'
                          : isActive 
                            ? 'bg-accent/20 border-accent/50 text-accent shadow-lg shadow-accent/20'
                            : 'bg-background/50 border-border/50 text-muted-foreground'
                      }`}
                      animate={{
                        scale: isActive ? [1, 1.1, 1] : 1,
                        rotate: isActive ? [0, 5, -5, 0] : 0
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: isActive ? Infinity : 0,
                        repeatDelay: 1
                      }}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </motion.div>
                    
                    <span className={`text-[11px] font-medium text-center max-w-[60px] transition-colors ${
                      isComplete ? 'text-primary' : isActive ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}