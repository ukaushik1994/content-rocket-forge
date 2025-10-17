import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Search, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';

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
  const CurrentIcon = GENERATION_STEPS[currentStepIndex]?.icon || Brain;
  const currentStepData = GENERATION_STEPS[currentStepIndex] || GENERATION_STEPS[0];

  return (
    <Dialog open={isGenerating} onOpenChange={() => {}}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
      <DialogContent 
        className="max-w-lg bg-black/90 border-white/10 text-white p-0 gap-0 [&>button]:hidden"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex p-3 bg-white/5 rounded-lg mb-4">
                <CurrentIcon className="h-6 w-6 text-white/80" />
              </div>
              
              <h3 className="text-lg font-medium text-white/90 mb-2">
                {currentStepData.label}
              </h3>
              
              <p className="text-white/60 text-sm">
                {currentStepData.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={progress} 
                className="h-1.5 bg-white/10" 
              />
              <div className="flex justify-between text-xs text-white/50">
                <span>Processing batch {Math.floor(progress / 25) + 1} of 4</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-6">
              {GENERATION_STEPS.slice(0, -1).map((step, index) => {
                const isActive = index === currentStepIndex;
                const isComplete = index < currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-full border transition-all duration-300 ${
                        isComplete 
                          ? 'bg-green-500/10 border-green-500/30 text-green-500/80'
                          : isActive 
                            ? 'bg-white/10 border-white/30 text-white/80'
                            : 'bg-white/5 border-white/10 text-white/30'
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    
                    <span className={`text-[10px] text-center transition-colors duration-300 max-w-[60px] ${
                      isComplete ? 'text-green-500/80' : isActive ? 'text-white/80' : 'text-white/40'
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
                className="bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <Search className="h-3.5 w-3.5" />
                  <span className="font-medium">Smart Processing Active</span>
                </div>
                <p className="text-white/50 text-xs mt-1">
                  Processing keywords in optimized batches to ensure the best results.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}