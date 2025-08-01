import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { EnhancedWelcomeSection } from '@/components/dashboard/EnhancedWelcomeSection';
import { EnhancedQuickActions } from '@/components/dashboard/EnhancedQuickActions';
import { EnhancedPerformanceSection } from '@/components/dashboard/EnhancedPerformanceSection';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';
import { GrandTourProvider } from '@/contexts/GrandTourContext';
import { GrandAppTour } from '@/components/tour/GrandAppTour';
import { GrandTourTrigger } from '@/components/tour/GrandTourTrigger';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';

const Index = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 100,
        damping: 20,
        duration: 0.8
      }
    }
  };
  
  return (
    <GrandTourProvider>
      <div className="min-h-screen flex flex-col bg-background overflow-hidden">
        {/* Enhanced background with multiple animated layers */}
        <div className="absolute inset-0 -z-10">
          {/* Primary gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
          
          {/* Animated gradient orbs */}
          <motion.div 
            className="absolute top-[10%] left-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-r from-neon-purple/15 via-neon-blue/10 to-transparent blur-[120px]"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute top-[40%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-l from-neon-pink/12 via-neon-purple/8 to-transparent blur-[100px]"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 0.9, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 5
            }}
          />
          
          <motion.div 
            className="absolute bottom-[20%] left-[25%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-neon-blue/10 via-cyan-400/8 to-transparent blur-[80px]"
            animate={{
              x: [0, 30, 0],
              y: [0, -25, 0],
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 10
            }}
          />
          
          {/* Futuristic grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(155,135,245,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(155,135,245,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>
          
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
        
        <Navbar />
        
        <main className="flex-1 py-8 relative z-0">
          <Container>
            <motion.div 
              className="space-y-16" 
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              variants={containerVariants}
            >
              {/* Enhanced Welcome/Hero Section */}
              <motion.section variants={sectionVariants}>
                <EnhancedWelcomeSection 
                  setFeedbackOpen={setFeedbackOpen} 
                  navigate={navigate} 
                />
              </motion.section>
              
              {/* Enhanced Quick Actions */}
              <motion.section variants={sectionVariants}>
                <div className="space-y-6">
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-neon-purple/30 to-neon-blue/30 flex items-center justify-center backdrop-blur-xl border border-white/10">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue" />
                      </div>
                      <h2 className="text-2xl font-semibold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                        Quick Actions
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm text-white/60">
                        Choose your next step
                      </div>
                      <GrandTourTrigger variant="inline" size="sm" />
                    </div>
                  </motion.div>
                  
                  <EnhancedQuickActions navigate={navigate} />
                </div>
              </motion.section>
              
              {/* Enhanced Performance Section */}
              <motion.section variants={sectionVariants}>
                <EnhancedPerformanceSection />
              </motion.section>
            </motion.div>
          </Container>
        </main>
        
        {/* Grand Tour Components */}
        <GrandAppTour />
        
        <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      </div>
    </GrandTourProvider>
  );
};

export default Index;
