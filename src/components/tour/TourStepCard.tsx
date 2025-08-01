
import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedTourIcon } from './AnimatedTourIcon';

interface TourStepCardProps {
  title: string;
  description: string;
  phase: string;
  icon: any;
  highlights?: string[];
}

export const TourStepCard: React.FC<TourStepCardProps> = ({ 
  title, 
  description, 
  phase, 
  icon, 
  highlights = [] 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Main content card */}
      <div className="relative bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
        
        {/* Header with icon and title */}
        <div className="relative z-10 flex items-center gap-6 mb-6">
          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple/20 via-neon-blue/20 to-neon-pink/20 border border-white/10 flex items-center justify-center">
            <AnimatedTourIcon Icon={icon} phase={phase} size={32} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {title}
            </h3>
            <div className="text-sm font-medium text-neon-blue/80 uppercase tracking-wider">
              {phase.replace('-', ' ')} Phase
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="relative z-10 text-base text-muted-foreground leading-relaxed mb-6">
          {description}
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
              >
                <div className="w-2 h-2 rounded-full bg-neon-blue/80" />
                <span className="text-sm text-foreground/90">{highlight}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple/10 via-neon-blue/10 to-neon-pink/10 blur-xl" />
        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink/10 via-neon-blue/10 to-neon-purple/10 blur-lg" />
      </div>
    </motion.div>
  );
};
