
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, ArrowRight, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Particle animation for the background
  const particles = Array(12).fill(0);

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
        {particles.map((_, index) => (
          <motion.div
            key={index}
            className="absolute h-2 w-2 rounded-full bg-primary/60 shadow-glow"
            initial={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 - 50 + "%",
              opacity: 0.4 + Math.random() * 0.6,
              scale: 0.4 + Math.random() * 0.6
            }}
            animate={{
              x: [
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%"
              ],
              y: [
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%"
              ],
              opacity: [0.4 + Math.random() * 0.6, 0.1, 0.6],
              scale: [0.4 + Math.random() * 0.6, 0.8, 0.3]
            }}
            transition={{
              duration: 8 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}

        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="flex items-center mb-8">
            {/* Central animated loader */}
            <div className="relative">
              {/* Outer spinning circle */}
              <motion.div 
                className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              />
              
              {/* Middle spinning circle */}
              <motion.div 
                className="absolute inset-1 rounded-full border-t-2 border-l-2 border-blue-400/60"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              />
              
              {/* Inner spinner */}
              <motion.div 
                className="h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md border border-white/10 shadow-xl"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  <Search className="text-primary h-8 w-8" />
                </motion.div>
              </motion.div>
            </div>
            
            {/* Animated sparkles */}
            <motion.div
              className="absolute"
              animate={{ 
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
              }}
            >
              <Sparkles className="absolute top-0 right-0 translate-x-8 -translate-y-4 text-primary h-6 w-6 transform rotate-12" />
              <Sparkles className="absolute bottom-0 left-0 -translate-x-8 translate-y-4 text-blue-400 h-6 w-6 transform -rotate-12" />
            </motion.div>
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl">
            {[
              { 
                icon: <TrendingUp className="h-5 w-5 text-blue-400" />, 
                title: "Analyzing Keywords",
                color: "from-blue-500/20 to-blue-700/10"
              },
              { 
                icon: <FileText className="h-5 w-5 text-purple-400" />, 
                title: "Extracting Content",
                color: "from-purple-500/20 to-purple-700/10"
              },
              { 
                icon: <Search className="h-5 w-5 text-green-400" />, 
                title: "Finding Opportunities",
                color: "from-green-500/20 to-green-700/10"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className={`border border-white/10 rounded-lg p-4 bg-gradient-to-br ${item.color} backdrop-blur-md`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1,
                  y: 0,
                }}
                transition={{ 
                  delay: 0.5 + index * 0.2,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
                    {item.icon}
                  </div>
                  <div className="text-sm font-medium">{item.title}</div>
                </div>
                
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ 
                      duration: 5 + index * 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

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
