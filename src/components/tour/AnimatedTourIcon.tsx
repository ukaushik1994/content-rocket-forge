
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedTourIconProps {
  Icon: LucideIcon;
  phase: string;
  size?: number;
}

export const AnimatedTourIcon: React.FC<AnimatedTourIconProps> = ({ Icon, phase, size = 32 }) => {
  const getAnimationVariants = () => {
    switch (phase) {
      case 'welcome':
        return {
          animate: {
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          },
          transition: {
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        };
      case 'dashboard':
        return {
          animate: {
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
          },
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'creation':
        return {
          animate: {
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360],
          },
          transition: {
            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 6, repeat: Infinity, ease: "linear" }
          }
        };
      case 'optimization':
        return {
          animate: {
            x: [0, 4, -4, 0],
            rotate: [0, 10, -10, 0],
          },
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'research':
        return {
          animate: {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'analytics':
        return {
          animate: {
            y: [0, -6, 0],
            scale: [1, 1.05, 1],
          },
          transition: {
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'ai-mode':
        return {
          animate: {
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
          },
          transition: {
            rotate: { duration: 5, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
        };
      default:
        return {
          animate: {
            scale: [1, 1.1, 1],
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      className="flex items-center justify-center"
      {...variants}
    >
      <Icon size={size} className="text-current" />
    </motion.div>
  );
};
