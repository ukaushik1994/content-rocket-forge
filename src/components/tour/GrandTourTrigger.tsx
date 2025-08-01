
import React from 'react';
import { Button } from '@/components/ui/button';
import { Compass, Play, Sparkles, Trophy } from 'lucide-react';
import { useGrandTour } from '@/contexts/GrandTourContext';
import { motion } from 'framer-motion';

interface GrandTourTriggerProps {
  variant?: 'default' | 'floating' | 'inline' | 'hero';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const GrandTourTrigger: React.FC<GrandTourTriggerProps> = ({ 
  variant = 'default', 
  size = 'default',
  className = '' 
}) => {
  const { startTour, hasCompletedTour, achievements } = useGrandTour();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

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
        whileHover={{ scale: 1.05 }}
      >
        <Button
          onClick={handleStartTour}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-blue hover:to-neon-purple text-white shadow-2xl shadow-neon-blue/40 hover:shadow-3xl hover:shadow-neon-blue/60 transition-all duration-500 relative group"
          title={hasCompletedTour ? "Experience Grand Tour Again" : "Take the Grand Tour"}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
          
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-purple/30 to-neon-blue/30 animate-pulse -z-10 scale-150" />
          
          {/* Achievement badge */}
          {unlockedCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {unlockedCount}
            </div>
          )}
        </Button>
      </motion.div>
    );
  }

  if (variant === 'hero') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleStartTour}
          size="lg"
          className={`bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl shadow-neon-blue/30 hover:shadow-neon-pink/40 group ${className}`}
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mr-3"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
          {hasCompletedTour ? 'Experience Grand Tour Again' : 'Take the Grand Tour'}
          <motion.div
            className="ml-2"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            →
          </motion.div>
        </Button>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleStartTour}
        className={`border-neon-blue/30 hover:border-neon-blue/60 text-neon-blue hover:text-white hover:bg-gradient-to-r hover:from-neon-purple/10 hover:to-neon-blue/10 transition-all duration-300 group ${className}`}
      >
        <motion.div
          animate={{ rotate: hasCompletedTour ? 0 : 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Play className="h-4 w-4 mr-2" />
        </motion.div>
        {hasCompletedTour ? 'Retake Grand Tour' : 'Take Grand Tour'}
        
        {unlockedCount > 0 && (
          <div className="ml-2 flex items-center gap-1">
            <Trophy className="h-3 w-3 text-yellow-400" />
            <span className="text-xs">{unlockedCount}</span>
          </div>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleStartTour}
      size={size}
      className={`bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white transition-all duration-300 shadow-lg shadow-neon-blue/25 hover:shadow-xl hover:shadow-neon-blue/40 ${className}`}
    >
      <Compass className="h-4 w-4 mr-2" />
      {hasCompletedTour ? 'Retake Grand Tour' : 'Take Grand Tour'}
      
      {unlockedCount > 0 && (
        <div className="ml-2 flex items-center gap-1">
          <Trophy className="h-3 w-3 text-yellow-200" />
          <span className="text-xs">{unlockedCount}</span>
        </div>
      )}
    </Button>
  );
};
