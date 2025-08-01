
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { useGrandTour } from '@/contexts/GrandTourContext';
import { TourStepCard } from './TourStepCard';
import { TourProgress } from './TourProgress';
import { Particles } from './TourParticles';

// Achievement notification component
const AchievementNotification: React.FC<{ achievement: any; onClose: () => void }> = ({ achievement, onClose }) => (
  <motion.div
    className="fixed top-8 right-8 z-70 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-xl p-6 max-w-sm shadow-2xl"
    initial={{ opacity: 0, x: 100, scale: 0.8 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 100, scale: 0.8 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <Trophy className="h-8 w-8 text-yellow-400" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-yellow-300 text-lg">Achievement Unlocked!</div>
        <div className="text-white/90 text-sm mt-1">{achievement.name}</div>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-white/60 hover:text-white">
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
      setTimeout(() => setShowAchievement(null), 5000);
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
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Particles type={currentTourStep.particles || 'sparkles'} />
        
        <motion.div
          className="relative w-full max-w-6xl bg-background/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
          style={{ height: '85vh' }}
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Dynamic gradient header */}
          <div className={`h-3 bg-gradient-to-r ${getPhaseColor(currentTourStep.phase || 'welcome')}`} />
          
          {/* Header */}
          <div className="relative p-8 pb-6 border-b border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 h-10 w-10 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              onClick={skipTour}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-neon-blue" />
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Grand App Tour
                    </h1>
                    <div className="text-sm text-muted-foreground mt-1">
                      Discover the full potential of your application
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievement counter */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-semibold text-white">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length} Achievements
                </span>
              </div>
            </div>

            {/* Progress */}
            <TourProgress 
              currentStep={currentStep}
              totalSteps={steps.length}
              steps={steps}
              onStepClick={goToStep}
            />
          </div>

          {/* Content - No scrollbars, uses full available space */}
          <div className="flex-1 p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <TourStepCard
                key={currentTourStep.id}
                title={currentTourStep.title}
                description={currentTourStep.description}
                phase={currentTourStep.phase || 'welcome'}
                icon={currentTourStep.icon}
                highlights={currentTourStep.highlights || []}
              />
            </AnimatePresence>
          </div>

          {/* Enhanced footer */}
          <div className="flex items-center justify-between p-8 pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={skipTour}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Tour
            </Button>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-white/20 hover:border-white/40 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                className={`bg-gradient-to-r ${getPhaseColor(currentTourStep.phase || 'welcome')} hover:opacity-90 text-white font-semibold px-8 shadow-lg`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Complete Grand Tour
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
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
