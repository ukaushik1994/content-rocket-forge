
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RocketIcon, MessageCircle, Sparkles } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface WelcomeSectionProps {
  setFeedbackOpen: (open: boolean) => void;
  navigate: NavigateFunction;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ setFeedbackOpen, navigate }) => {
  return (
    <div className="relative overflow-hidden rounded-xl p-6 md:p-8 glass-panel shadow-neon">
      <div className="absolute inset-0 futuristic-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 z-0" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="space-y-4 max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold">
            <motion.span 
              className="text-gradient inline-block"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              AI-Powered SEO
            </motion.span>{" "}
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Content Builder
            </motion.span>
          </h1>
          
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Generate high-ranking, conversion-driven content by integrating real-time SERP data, 
            keyword clusters, and business solutions.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Button 
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 hover:shadow-neon-strong" 
              onClick={() => navigate('/content')}
            >
              New Project
              <RocketIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="neon-border hover:bg-neon-purple/10 transition-all duration-300" 
              onClick={() => setFeedbackOpen(true)}
            >
              Share Feedback
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          className="w-full max-w-xs flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <div className="relative">
            <motion.div 
              className="w-48 h-48 rounded-full bg-gradient-to-br from-neon-purple via-neon-blue to-neon-pink opacity-20 blur-xl absolute"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div 
              className="w-40 h-40 rounded-full bg-glass flex items-center justify-center relative z-10 border border-white/10 backdrop-blur-xl"
              animate={{ 
                y: [0, -10, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Sparkles className="h-16 w-16 text-primary animate-pulse-glow" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
