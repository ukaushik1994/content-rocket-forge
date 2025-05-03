
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingParticles } from './LoadingParticle';
import { LoadingSpinner } from './LoadingSpinner';
import { ProgressIndicators } from './ProgressIndicator';

export interface SerpLoadingStateProps {
  isLoading: boolean;
  navigateToStep?: (step: number) => void;
}

export const SerpLoadingState: React.FC<SerpLoadingStateProps> = ({
  isLoading,
  navigateToStep = () => {} // Default empty function to avoid undefined errors
}) => {
  if (!isLoading) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="relative overflow-hidden py-16 px-8 rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 via-purple-900/20 to-blue-900/30 backdrop-blur-xl shadow-2xl"
        variants={itemVariants}
      >
        {/* Animated particles in the background */}
        <LoadingParticles count={12} />

        <div className="flex flex-col items-center justify-center relative z-10">
          <LoadingSpinner />

          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <motion.h2 
              className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Analyzing Search Results
            </motion.h2>
            <p className="text-muted-foreground mb-8">Extracting valuable insights to optimize your content</p>
          </motion.div>

          {/* Animated progress indicators */}
          <ProgressIndicators />

          {/* Skip button */}
          <motion.div
            className="mt-10"
            variants={itemVariants}
          >
            <Button
              variant="outline"
              onClick={() => navigateToStep(5)} // Navigate to the next step
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              Skip Analysis
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
