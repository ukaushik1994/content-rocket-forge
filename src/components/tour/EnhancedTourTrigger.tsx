
import React from 'react';
import { Button } from '@/components/ui/button';
import { Compass, Play, Rocket, Star, Award } from 'lucide-react';
import { useEnhancedTour } from '@/contexts/EnhancedTourContext';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedTourTriggerProps {
  variant?: 'default' | 'floating' | 'inline' | 'hero';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showAchievements?: boolean;
}

export const EnhancedTourTrigger: React.FC<EnhancedTourTriggerProps> = ({ 
  variant = 'default', 
  size = 'default',
  className = '',
  showAchievements = false
}) => {
  const { startTour, hasCompletedTour, achievements } = useEnhancedTour();

  const handleStartTour = () => {
    startTour();
  };

  if (variant === 'floating') {
    return (
      <motion.div
        className={`fixed bottom-6 right-6 z-40 ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="relative">
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-neon-blue/50"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <Button
            onClick={handleStartTour}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white shadow-2xl shadow-neon-blue/40 hover:shadow-xl hover:shadow-neon-blue/60 transition-all duration-300 relative overflow-hidden"
            title={hasCompletedTour ? "Retake Grand Tour" : "Take Grand Tour"}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Rocket className="h-6 w-6" />
            </motion.div>
            
            {/* Achievement badge */}
            {showAchievements && achievements.length > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 3 }}
              >
                {achievements.length}
              </motion.div>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={className}
      >
        <Button
          onClick={handleStartTour}
          size={size}
          className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-pink hover:via-neon-blue hover:to-neon-purple text-white font-bold transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-neon-blue/50 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          
          <div className="flex items-center gap-2 relative z-10">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Star className="h-5 w-5" />
            </motion.div>
            <span>{hasCompletedTour ? 'Retake Grand Tour' : 'Start Grand Tour'}</span>
            <motion.div
              className="ml-1"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Compass className="h-5 w-5" />
            </motion.div>
          </div>
        </Button>
        
        {/* Achievement indicator */}
        <AnimatePresence>
          {showAchievements && achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-1 mt-2 text-sm text-yellow-400"
            >
              <Award className="h-4 w-4" />
              <span>{achievements.length} achievement{achievements.length !== 1 ? 's' : ''} earned</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleStartTour}
        className={`border-neon-blue/30 hover:border-neon-blue/60 text-neon-blue hover:text-white hover:bg-neon-blue/10 transition-all duration-300 group ${className}`}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Play className="h-4 w-4 mr-2 group-hover:text-white transition-colors" />
        </motion.div>
        {hasCompletedTour ? 'Retake Grand Tour' : 'Take Grand Tour'}
        
        {showAchievements && achievements.length > 0 && (
          <motion.div
            className="ml-2 px-2 py-0.5 bg-yellow-400/20 rounded-full text-xs"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {achievements.length}
          </motion.div>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleStartTour}
      size={size}
      className={`bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white transition-all duration-300 relative overflow-hidden group ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      <div className="flex items-center gap-2 relative z-10">
        <Compass className="h-4 w-4" />
        <span>{hasCompletedTour ? 'Retake Grand Tour' : 'Take Grand Tour'}</span>
        
        {showAchievements && achievements.length > 0 && (
          <motion.div
            className="ml-1 w-5 h-5 bg-yellow-400/30 rounded-full flex items-center justify-center text-xs"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {achievements.length}
          </motion.div>
        )}
      </div>
    </Button>
  );
};
