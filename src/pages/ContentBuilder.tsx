
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { ContentBuilder } from '@/components/content-builder/ContentBuilder';
import { ContentBuilderProvider } from '@/contexts/content-builder/ContentBuilderContext';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target } from 'lucide-react';

const ContentBuilderPage = () => {
  // Animation variants for the page transition
  const pageVariants = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  
  const itemVariants = {
    initial: {
      y: 20,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background" 
      variants={pageVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit"
    >
      <Helmet>
        <title>Content Builder | ContentRocketForge</title>
        <meta name="description" content="AI-powered content creation with SERP analysis and optimization" />
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-neon-purple/20 via-background to-neon-blue/10 border-b border-white/10"
      >
        {/* Enhanced background elements */}
        <div className="absolute inset-0 futuristic-grid opacity-10 z-0" />
        
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 z-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            background: [
              "linear-gradient(to bottom right, rgba(155, 135, 245, 0.1), rgba(51, 195, 240, 0.05))",
              "linear-gradient(to bottom right, rgba(155, 135, 245, 0.15), rgba(51, 195, 240, 0.07))",
              "linear-gradient(to bottom right, rgba(155, 135, 245, 0.1), rgba(51, 195, 240, 0.05))"
            ]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        />
        
        {/* Animated particles */}
        <motion.div 
          className="absolute inset-0 z-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-neon-blue/20 blur-md"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 50 - 25],
                y: [0, Math.random() * 50 - 25],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
        
        <div className="relative z-10 container py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <motion.div variants={itemVariants} className="inline-block">
                <div className="flex items-center space-x-2 bg-neon-purple/20 rounded-full px-3 py-1 text-sm font-medium text-neon-purple">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Content Creation</span>
                </div>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gradient">
                Build SEO-Optimized Content with AI
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-muted-foreground text-lg">
                Create high-ranking content with our AI-powered builder. Analyze SERPs, generate outlines, and write optimized content that dominates search results.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
                  <span>SERP Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                  <span>AI Content Generation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-neon-orange rounded-full animate-pulse"></div>
                  <span>SEO Optimization</span>
                </div>
              </motion.div>
            </div>
            
            <div className="flex gap-4">
              <motion.div 
                variants={itemVariants} 
                className="glass-panel text-center p-4 rounded-xl border border-white/10 min-w-[120px] backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-neon-purple" />
                  <h3 className="text-2xl font-bold text-gradient">6</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Build Steps
                </p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants} 
                className="glass-panel text-center p-4 rounded-xl border border-white/10 min-w-[120px] backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-neon-blue" />
                  <h3 className="text-2xl font-bold text-gradient">AI</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Powered
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <main className="flex-1">
        <ContentBuilderProvider>
          <ContentBuilder />
        </ContentBuilderProvider>
      </main>
    </motion.div>
  );
};

export default ContentBuilderPage;
