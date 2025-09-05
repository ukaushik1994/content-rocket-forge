import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Search, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
  if (!isGenerating) return null;

  const currentStepIndex = GENERATION_STEPS.findIndex(step => step.key === currentStep);
  const CurrentIcon = GENERATION_STEPS[currentStepIndex]?.icon || Brain;
  const currentStepData = GENERATION_STEPS[currentStepIndex] || GENERATION_STEPS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-panel border-primary/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
                className="inline-flex p-3 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full mb-4"
              >
                <CurrentIcon className="h-8 w-8 text-primary" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {currentStepData.label}
              </h3>
              
              <p className="text-white/70 text-sm">
                {currentStepData.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={progress} 
                className="h-2 bg-white/10" 
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>Processing batch {Math.floor(progress / 25) + 1} of 4</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-8">
              {GENERATION_STEPS.slice(0, -1).map((step, index) => {
                const isActive = index === currentStepIndex;
                const isComplete = index < currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center space-y-2">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                      className={`p-2 rounded-full border-2 transition-all duration-300 ${
                        isComplete 
                          ? 'bg-green-500/20 border-green-400 text-green-400'
                          : isActive 
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-white/5 border-white/20 text-white/40'
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </motion.div>
                    
                    <span className={`text-xs text-center transition-colors duration-300 ${
                      isComplete ? 'text-green-400' : isActive ? 'text-primary' : 'text-white/40'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Rate Limiting Info */}
            {currentStep === 'analysis' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <Search className="h-4 w-4" />
                  <span className="font-medium">Smart Processing Active</span>
                </div>
                <p className="text-blue-300/80 text-xs mt-1">
                  Processing keywords in optimized batches to ensure the best results while respecting API limits.
                </p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}