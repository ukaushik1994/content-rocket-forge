
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  gravity?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  duration?: number;
}

/**
 * A custom hook to manage confetti effects
 */
export const useConfetti = () => {
  const [confettiShown, setConfettiShown] = useState(false);
  
  /**
   * Trigger a confetti celebration with custom options
   */
  const triggerConfetti = (options: ConfettiOptions = {}) => {
    const {
      particleCount = 100,
      spread = 70,
      startVelocity = 30,
      gravity = 1.2,
      origin = { y: 0.6 },
      colors = ['#8B5CF6', '#6366F1', '#3B82F6', '#10B981', '#34D399'],
      duration = 3000,
    } = options;
    
    const end = Date.now() + duration;
    
    const launchConfetti = () => {
      confetti({
        particleCount,
        spread,
        startVelocity,
        gravity,
        origin,
        colors,
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(launchConfetti);
      }
    };
    
    launchConfetti();
    setConfettiShown(true);
  };
  
  /**
   * Reset the confetti state
   */
  const resetConfetti = () => {
    setConfettiShown(false);
  };
  
  return {
    confettiShown,
    triggerConfetti,
    resetConfetti
  };
};
