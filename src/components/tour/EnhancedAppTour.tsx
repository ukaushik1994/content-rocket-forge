
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  MapPin,
  Star,
  Award,
  Rocket,
  Brain,
  Target,
  BarChart3
} from 'lucide-react';
import { useEnhancedTour } from '@/contexts/EnhancedTourContext';
import { useNavigate } from 'react-router-dom';

const ParticleSystem = ({ type }: { type?: 'cosmic' | 'keywords' | 'content' | 'analytics' }) => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  const getParticleColor = () => {
    switch (type) {
      case 'cosmic': return ['#9B87F5', '#33C3F0', '#D946EF'];
      case 'keywords': return ['#33C3F0', '#06B6D4', '#8B5CF6'];
      case 'content': return ['#D946EF', '#F97316', '#EF4444'];
      case 'analytics': return ['#10B981', '#3B82F6', '#8B5CF6'];
      default: return ['#9B87F5', '#33C3F0', '#D946EF'];
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => {
        const colors = getParticleColor();
        const color = colors[particle % colors.length];
        
        return (
          <motion.div
            key={particle}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(particle) * 50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

const PhaseIndicator = ({ phase }: { phase: string }) => {
  const phaseConfig = {
    welcome: { icon: Rocket, color: 'from-neon-purple to-neon-blue', label: 'Welcome' },
    core: { icon: Brain, color: 'from-neon-blue to-neon-pink', label: 'Core Engine' },
    management: { icon: Target, color: 'from-neon-pink to-purple-500', label: 'Management' },
    strategy: { icon: BarChart3, color: 'from-purple-500 to-neon-purple', label: 'Strategy' },
    intelligence: { icon: Sparkles, color: 'from-neon-blue to-cyan-400', label: 'Intelligence' },
    'ai-mode': { icon: Star, color: 'from-neon-purple via-neon-blue to-neon-pink', label: 'AI Mode' }
  };

  const config = phaseConfig[phase as keyof typeof phaseConfig] || phaseConfig.welcome;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${config.color} bg-opacity-20 border border-white/20`}>
      <Icon className="h-4 w-4 text-white" />
      <span className="text-sm font-semibold text-white">{config.label}</span>
    </div>
  );
};

const AchievementNotification = ({ achievement }: { achievement: any }) => {
  return (
    <motion.div
      className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-lg px-4 py-2 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
    >
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-yellow-400" />
        <span className="text-sm font-semibold text-white">Achievement Unlocked!</span>
      </div>
      <div className="text-xs text-white/80">{achievement.name}: {achievement.description}</div>
    </motion.div>
  );
};

export const EnhancedAppTour: React.FC = () => {
  const {
    isActive,
    currentStep,
    currentPhase,
    steps,
    achievements,
    nextStep,
    prevStep,
    skipTour,
    goToStep,
    tourProgress,
  } = useEnhancedTour();

  const navigate = useNavigate();
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

  useEffect(() => {
    // Handle route navigation
    if (currentTourStep?.route && isActive) {
      navigate(currentTourStep.route);
    }
  }, [currentTourStep, navigate, isActive]);

  useEffect(() => {
    // Show achievement notification
    if (currentTourStep?.achievement) {
      setShowAchievement(currentTourStep.achievement);
      const timer = setTimeout(() => setShowAchievement(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentTourStep]);

  const getElementPosition = (selector: string) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
  };

  const getDialogPosition = () => {
    if (!currentTourStep.selector || currentTourStep.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
      };
    }

    const elementPos = getElementPosition(currentTourStep.selector);
    if (!elementPos) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
      };
    }

    const dialogWidth = 500;
    const dialogHeight = 400;
    const offset = 20;

    let style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 60,
    };

    switch (currentTourStep.position) {
      case 'top':
        style.top = elementPos.top - dialogHeight - offset;
        style.left = elementPos.left + elementPos.width / 2 - dialogWidth / 2;
        break;
      case 'bottom':
        style.top = elementPos.top + elementPos.height + offset;
        style.left = elementPos.left + elementPos.width / 2 - dialogWidth / 2;
        break;
      case 'left':
        style.top = elementPos.top + elementPos.height / 2 - dialogHeight / 2;
        style.left = elementPos.left - dialogWidth - offset;
        break;
      case 'right':
        style.top = elementPos.top + elementPos.height / 2 - dialogHeight / 2;
        style.left = elementPos.left + elementPos.width + offset;
        break;
      default:
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
    }

    return style;
  };

  const renderSpotlight = () => {
    if (!currentTourStep.selector || !currentTourStep.visualEffects?.spotlight) return null;
    
    const elementPos = getElementPosition(currentTourStep.selector);
    if (!elementPos) return null;

    return (
      <motion.div
        className="absolute rounded-xl border-4 border-neon-blue shadow-2xl shadow-neon-blue/60 pointer-events-none"
        style={{
          top: elementPos.top - 12,
          left: elementPos.left - 12,
          width: elementPos.width + 24,
          height: elementPos.height + 24,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: [
            "0 0 0 0 rgba(51, 195, 240, 0.6)",
            "0 0 0 40px rgba(51, 195, 240, 0.1)",
            "0 0 0 0 rgba(51, 195, 240, 0.6)"
          ]
        }}
        transition={{ 
          duration: 0.6,
          boxShadow: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
    );
  };

  if (!isActive) return null;

  const phaseSteps = steps.filter(step => step.phase === currentPhase);
  const currentPhaseIndex = phaseSteps.findIndex(step => step.id === currentTourStep.id);

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Particle System */}
        <ParticleSystem type={currentTourStep.visualEffects?.particles} />
        
        {renderSpotlight()}
        
        {/* Achievement Notification */}
        <AnimatePresence>
          {showAchievement && (
            <AchievementNotification achievement={showAchievement} />
          )}
        </AnimatePresence>
        
        <motion.div
          className="w-[500px] max-w-[90vw] bg-background/95 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden"
          style={getDialogPosition()}
          initial={{ opacity: 0, scale: 0.8, y: 40, rotateX: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40, rotateX: -15 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 25 }}
        >
          {/* Cosmic Header */}
          <div className="relative p-6 pb-4 bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-slate-900/50">
            {/* Floating achievement badge */}
            {achievements.length > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <Award className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {achievements.length}
                </span>
              </motion.div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-white/10"
              onClick={skipTour}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Phase and Step Indicator */}
            <div className="flex items-center justify-between mb-4">
              <PhaseIndicator phase={currentPhase} />
              <div className="flex items-center gap-2 text-xs text-white/60">
                <MapPin className="h-3 w-3" />
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>

            <motion.h2 
              className="text-2xl font-bold mt-3 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentStep}
            >
              {currentTourStep.title}
            </motion.h2>
            
            {currentTourStep.subtitle && (
              <motion.p 
                className="text-sm text-white/70 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentTourStep.subtitle}
              </motion.p>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pb-4 max-h-80 overflow-y-auto">
            <motion.div 
              className="text-sm text-white/85 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              key={currentStep}
            >
              {currentTourStep.description}
            </motion.div>
          </div>

          {/* Enhanced Progress indicators */}
          <div className="px-6 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/60">
                <span>Tour Progress</span>
                <span>{tourProgress.current} / {tourProgress.total}</span>
              </div>
              <div className="flex gap-1">
                {steps.map((step, index) => (
                  <motion.button
                    key={step.id}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'bg-gradient-to-r from-neon-purple to-neon-blue w-8'
                        : index < currentStep
                        ? 'bg-neon-blue/70 w-2'
                        : 'bg-white/20 w-2'
                    }`}
                    onClick={() => goToStep(index)}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="flex items-center justify-between p-6 pt-4 border-t border-white/10 bg-gradient-to-r from-slate-900/30 to-slate-800/30">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-white/60 hover:text-white hover:bg-white/5"
              >
                Skip Tour
              </Button>
              
              {achievements.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-400">
                  <Star className="h-3 w-3" />
                  <span>{achievements.length} achievement{achievements.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                size="sm"
                onClick={nextStep}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white px-6 font-semibold"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Launch!
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
    </AnimatePresence>
  );
};
