
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { useGrandTour } from '@/contexts/GrandTourContext';

// Particle component for visual effects
const Particles: React.FC<{ type: 'cosmic' | 'content' | 'data' | 'ai' }> = ({ type }) => {
  const getParticleConfig = () => {
    switch (type) {
      case 'cosmic':
        return { count: 20, colors: ['#9b87f5', '#33c3f0', '#d946ef'], size: [1, 3] };
      case 'content':
        return { count: 15, colors: ['#10b981', '#f59e0b', '#ef4444'], size: [2, 4] };
      case 'data':
        return { count: 12, colors: ['#06b6d4', '#8b5cf6', '#ec4899'], size: [1, 2] };
      case 'ai':
        return { count: 25, colors: ['#f472b6', '#a855f7', '#6366f1'], size: [2, 5] };
      default:
        return { count: 10, colors: ['#9b87f5'], size: [1, 2] };
    }
  };

  const config = getParticleConfig();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(config.count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-70"
          style={{
            backgroundColor: config.colors[i % config.colors.length],
            width: Math.random() * (config.size[1] - config.size[0]) + config.size[0],
            height: Math.random() * (config.size[1] - config.size[0]) + config.size[0],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

// Achievement notification component
const AchievementNotification: React.FC<{ achievement: any; onClose: () => void }> = ({ achievement, onClose }) => (
  <motion.div
    className="fixed top-4 right-4 z-70 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-xl p-4 max-w-sm"
    initial={{ opacity: 0, x: 100, scale: 0.8 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 100, scale: 0.8 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-3">
      <div className="text-2xl">{achievement.icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-yellow-300">Achievement Unlocked!</div>
        <div className="text-sm text-white/80">{achievement.name}</div>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
        <X className="h-4 w-4" />
      </Button>
    </div>
  </motion.div>
);

export const GrandAppTour: React.FC = () => {
  const {
    isActive,
    currentStep,
    steps,
    achievements,
    nextStep,
    prevStep,
    skipTour,
    goToStep,
  } = useGrandTour();

  const overlayRef = useRef<HTMLDivElement>(null);
  const [showAchievement, setShowAchievement] = React.useState<any>(null);
  
  const currentTourStep = steps[currentStep];
  
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isActive]);

  // Show achievement notifications
  useEffect(() => {
    const unlockedAchievement = achievements.find(a => a.unlocked && !localStorage.getItem(`shown-${a.id}`));
    if (unlockedAchievement) {
      setShowAchievement(unlockedAchievement);
      localStorage.setItem(`shown-${unlockedAchievement.id}`, 'true');
      setTimeout(() => setShowAchievement(null), 4000);
    }
  }, [achievements]);

  if (!isActive) return null;

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
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Particles type={currentTourStep.particles} />
        
        <motion.div
          className="fixed inset-4 max-w-2xl mx-auto my-8 bg-background/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
          style={{
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '85vh',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Dynamic gradient header */}
          <div className={`h-2 bg-gradient-to-r ${getPhaseColor(currentTourStep.phase)}`} />
          
          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="absolute -top-1 -right-1 w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-white/10"
              onClick={skipTour}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-neon-blue" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-white/10 capitalize">
                {currentTourStep.phase.replace('-', ' ')} Phase
              </div>
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {currentTourStep.title}
            </h2>
          </div>

          {/* Content with scroll */}
          <div className="px-6 pb-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-white/10">
            <div className="text-sm text-muted-foreground leading-relaxed">
              {currentTourStep.description}
            </div>
          </div>

          {/* Enhanced progress indicators */}
          <div className="px-6 pb-4">
            <div className="flex gap-1.5">
              {steps.map((step, index) => (
                <motion.button
                  key={step.id}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? `bg-gradient-to-r ${getPhaseColor(step.phase)} w-12`
                      : index < currentStep
                      ? 'bg-white/50 w-3'
                      : 'bg-white/20 w-2'
                  }`}
                  onClick={() => goToStep(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  title={step.title}
                />
              ))}
            </div>
            
            {/* Phase indicator */}
            <div className="mt-2 text-xs text-center text-white/60">
              Phase: {currentTourStep.phase.replace('-', ' ').toUpperCase()}
            </div>
          </div>

          {/* Enhanced footer */}
          <div className="flex items-center justify-between p-6 pt-0 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip Tour
              </Button>
              
              {/* Achievement counter */}
              <div className="text-xs text-white/60">
                🏆 {achievements.filter(a => a.unlocked).length}/{achievements.length} Achievements
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-white/20 hover:border-white/40"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                size="sm"
                onClick={nextStep}
                className={`bg-gradient-to-r ${getPhaseColor(currentTourStep.phase)} hover:opacity-90 text-white font-semibold px-6`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Complete Grand Tour
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Achievement notification */}
      <AnimatePresence>
        {showAchievement && (
          <AchievementNotification
            achievement={showAchievement}
            onClose={() => setShowAchievement(null)}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
