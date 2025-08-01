
import React from 'react';
import { Button } from '@/components/ui/button';
import { Compass, Play, Sparkles, Trophy, Rocket } from 'lucide-react';
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
        className={`fixed bottom-8 right-8 z-40 ${className}`}
        initial={{ scale: 0, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          delay: 2, 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          duration: 0.8
        }}
        whileHover={{ scale: 1.08, y: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-purple/30 via-neon-blue/30 to-neon-pink/30 animate-pulse blur-xl" />
        </div>
        
        {/* Middle glow ring */}
        <div className="absolute inset-2 rounded-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple/50 via-neon-blue/50 to-neon-pink/50 animate-pulse blur-lg" 
               style={{ animationDelay: '0.5s' }} />
        </div>

        <Button
          onClick={handleStartTour}
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-neon-purple via-neon-blue to-neon-pink hover:from-neon-blue hover:via-neon-pink hover:to-neon-purple text-white shadow-2xl shadow-neon-blue/60 hover:shadow-neon-pink/80 transition-all duration-700 border-2 border-white/20 hover:border-white/40 group overflow-hidden"
          title={hasCompletedTour ? "Experience Grand Tour Again" : "Take the Grand Tour"}
        >
          {/* Background shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Main icon with enhanced animation */}
          <motion.div
            className="relative z-10"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Rocket className="h-8 w-8" />
          </motion.div>
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 10 - 5, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Achievement badge with enhanced styling */}
          {unlockedCount > 0 && (
            <motion.div 
              className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="h-4 w-4" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-xs">
                {unlockedCount}
              </span>
            </motion.div>
          )}
        </Button>
        
        {/* Tooltip */}
        <motion.div
          className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-xl text-white text-sm px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20"
          initial={{ y: 10, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
        >
          {hasCompletedTour ? 'Experience Again' : 'Start Grand Tour'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90" />
        </motion.div>
      </motion.div>
    );
  }

  if (variant === 'hero') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/30 via-neon-blue/30 to-neon-pink/30 rounded-3xl blur-xl animate-pulse" />
        
        <Button
          onClick={handleStartTour}
          size="lg"
          className={`relative bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white px-10 py-6 rounded-3xl font-bold text-xl transition-all duration-700 shadow-2xl shadow-neon-blue/40 hover:shadow-neon-pink/60 border-2 border-white/20 hover:border-white/40 group overflow-hidden ${className}`}
        >
          {/* Background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.15, 1]
            }}
            transition={{ 
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mr-4 relative z-10"
          >
            <Rocket className="h-7 w-7" />
          </motion.div>
          <span className="relative z-10">
            {hasCompletedTour ? 'Experience Grand Tour Again' : 'Take the Grand Tour'}
          </span>
          <motion.div
            className="ml-3 relative z-10"
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            →
          </motion.div>
        </Button>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size={size}
          onClick={handleStartTour}
          className={`border-2 border-neon-blue/40 hover:border-neon-blue/80 text-neon-blue hover:text-white hover:bg-gradient-to-r hover:from-neon-purple/20 hover:to-neon-blue/20 transition-all duration-500 group relative overflow-hidden backdrop-blur-sm ${className}`}
        >
          {/* Background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <motion.div
            animate={{ rotate: hasCompletedTour ? 0 : 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="mr-2 relative z-10"
          >
            <Play className="h-4 w-4" />
          </motion.div>
          <span className="relative z-10">
            {hasCompletedTour ? 'Retake Grand Tour' : 'Take Grand Tour'}
          </span>
          
          {unlockedCount > 0 && (
            <div className="ml-3 flex items-center gap-1 relative z-10">
              <Trophy className="h-3 w-3 text-yellow-400" />
              <span className="text-xs font-semibold">{unlockedCount}</span>
            </div>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={handleStartTour}
        size={size}
        className={`bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white transition-all duration-500 shadow-xl shadow-neon-blue/30 hover:shadow-2xl hover:shadow-neon-blue/50 border border-white/20 hover:border-white/40 relative overflow-hidden group ${className}`}
      >
        {/* Background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <Compass className="h-4 w-4 mr-2 relative z-10" />
        <span className="relative z-10">
          {hasCompletedTour ? 'Retake Grand Tour' : 'Take Grand Tour'}
        </span>
        
        {unlockedCount > 0 && (
          <div className="ml-3 flex items-center gap-1 relative z-10">
            <Trophy className="h-3 w-3 text-yellow-200" />
            <span className="text-xs font-semibold">{unlockedCount}</span>
          </div>
        )}
      </Button>
    </motion.div>
  );
};
