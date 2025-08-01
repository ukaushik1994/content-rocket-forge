
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface TourProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: any[];
  onStepClick: (index: number) => void;
}

export const TourProgress: React.FC<TourProgressProps> = ({ 
  currentStep, 
  totalSteps, 
  steps, 
  onStepClick 
}) => {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'welcome': return 'from-neon-purple via-neon-blue to-neon-pink';
      case 'dashboard': return 'from-blue-500 via-purple-500 to-pink-500';
      case 'creation': return 'from-emerald-400 via-teal-500 to-cyan-600';
      case 'optimization': return 'from-purple-400 via-pink-500 to-red-500';
      case 'research': return 'from-cyan-400 via-blue-500 to-indigo-600';
      case 'analytics': return 'from-emerald-400 via-green-500 to-teal-600';
      case 'ai-mode': return 'from-pink-400 via-purple-500 to-indigo-600';
      default: return 'from-neon-purple to-neon-blue';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getPhaseColor(steps[currentStep]?.phase || 'welcome')}`}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="text-sm font-medium text-white/80">
            {currentStep + 1}/{totalSteps}
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <motion.button
            key={step.id}
            onClick={() => onStepClick(index)}
            className={`relative w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              index === currentStep
                ? 'border-neon-blue bg-neon-blue/20 text-white'
                : index < currentStep
                ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                : 'border-white/20 bg-white/5 text-white/40'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={step.title}
          >
            {index < currentStep ? (
              <Check size={16} className="mx-auto" />
            ) : (
              <span className="text-sm font-semibold">{index + 1}</span>
            )}
            
            {index === currentStep && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-neon-blue"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Phase indicator */}
      <div className="text-center">
        <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getPhaseColor(steps[currentStep]?.phase || 'welcome')} text-white text-sm font-semibold capitalize`}>
          {steps[currentStep]?.phase?.replace('-', ' ') || 'Welcome'} Phase
        </div>
      </div>
    </div>
  );
};
