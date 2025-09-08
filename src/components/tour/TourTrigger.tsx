import React from 'react';
import { Button } from '@/components/ui/button';
import { Compass, Play } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';
import { motion } from 'framer-motion';
interface TourTriggerProps {
  variant?: 'default' | 'floating' | 'inline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}
export const TourTrigger: React.FC<TourTriggerProps> = ({
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const {
    startTour,
    hasCompletedTour
  } = useTour();
  const handleStartTour = () => {
    startTour();
  };
  if (variant === 'floating') {
    return <motion.div className={`fixed bottom-6 right-6 z-40 ${className}`} initial={{
      scale: 0,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} transition={{
      delay: 2,
      type: "spring",
      stiffness: 300,
      damping: 30
    }}>
        <Button onClick={handleStartTour} className="h-12 w-12 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white shadow-lg shadow-neon-blue/25 hover:shadow-xl hover:shadow-neon-blue/40 transition-all duration-300" title={hasCompletedTour ? "Retake Tour" : "Take Tour"}>
          <Compass className="h-5 w-5" />
        </Button>
      </motion.div>;
  }
  if (variant === 'inline') {
    return;
  }
  return <Button onClick={handleStartTour} size={size} className={`bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white transition-all duration-300 ${className}`}>
      <Compass className="h-4 w-4 mr-2" />
      {hasCompletedTour ? 'Retake Tour' : 'Take Tour'}
    </Button>;
};