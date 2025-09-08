import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
export const RocketLogo = () => {
  return <motion.div className="flex items-center justify-center mb-8" initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.8,
    ease: "easeOut"
  }}>
      <div className="relative">
        {/* Rocket icon with glow effect */}
        
        
        {/* Brand text */}
        <motion.div className="mt-4 text-center" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.8,
        delay: 0.3
      }}>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-300% bg-clip-text text-transparent animate-gradient-shift">
            CreAiter
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Where Creativity Meets AI
          </p>
        </motion.div>
      </div>
    </motion.div>;
};