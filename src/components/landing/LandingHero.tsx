import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EnhancedFloatingKeywords } from './EnhancedFloatingKeywords';
import { FuturisticGrid } from './FuturisticGrid';
import { SideDecorations } from './SideDecorations';
import { ParticleSystem } from './ParticleSystem';
import { AuroraBackdrop } from '@/components/ui/AuroraBackdrop';
import { DemoModal } from './DemoModal';

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Enhanced dynamic hero messages with simplified structure
  const heroMessages = [
    {
      headline: "Create Content That",
      highlight: "Converts & Ranks",
      description: "Transform your content strategy with AI-powered SERP data analysis, competitor intelligence, and performance optimization for measurable results.",
      highlightPhrases: ["SERP", "competitor", "performance", "optimization"]
    },
    {
      headline: "Generate Content That", 
      highlight: "Dominates SERPs",
      description: "Leverage real-time competitor analysis, advanced keyword intelligence, and cutting-edge SEO optimization to outrank your competition.",
      highlightPhrases: ["real-time", "keyword", "SEO", "outrank"]
    },
    {
      headline: "Build Content That",
      highlight: "Drives Revenue", 
      description: "Monitor comprehensive performance analytics, track ROI metrics, and gain actionable data-driven insights to maximize your content impact.",
      highlightPhrases: ["analytics", "ROI", "data-driven", "maximize"]
    },
    {
      headline: "Craft Content That",
      highlight: "Outranks Competitors",
      description: "Maintain consistent brand voice across multi-format content delivery and optimize for multiple platforms simultaneously.",
      highlightPhrases: ["brand", "multi-format", "platforms", "simultaneously"]
    },
    {
      headline: "Produce Content That",
      highlight: "Scales Your Brand",
      description: "Research trending keywords, identify profitable content gaps, and discover untapped competitor opportunities for exponential growth.",
      highlightPhrases: ["trending", "gaps", "opportunities", "exponential"]
    }
  ];

  // Rotate messages every 4 seconds for better readability
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % heroMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroMessages.length]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Multi-layered Background System */}
      <AuroraBackdrop className="absolute inset-0" intensity={0.7} />
      <FuturisticGrid />
      <ParticleSystem density="medium" />
      <EnhancedFloatingKeywords />
      
      {/* Side Decorative Elements */}
      <SideDecorations />

      {/* Main Content - Enhanced Layout */}
      <div className="relative z-30 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Enhanced Badge with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <motion.span 
            className="inline-flex items-center px-6 py-3 rounded-full text-base font-semibold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20 backdrop-blur-md shadow-[0_8px_32px_rgba(59,130,246,0.3)]"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 12px 40px rgba(59,130,246,0.4)",
              transition: { duration: 0.2 }
            }}
            animate={{
              boxShadow: [
                "0 8px 32px rgba(59,130,246,0.3)",
                "0 8px 32px rgba(147,51,234,0.3)",
                "0 8px 32px rgba(59,130,246,0.3)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Zap className="h-5 w-5 mr-3 text-yellow-400 animate-pulse" />
            AI-Powered Content Creation Platform
          </motion.span>
        </motion.div>

        {/* Enhanced Main Headline with Rotating Messages */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.h1 
              className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
              initial={{ letterSpacing: "0.05em" }}
              animate={{ letterSpacing: "0.02em" }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <motion.span 
                className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                {heroMessages[currentMessageIndex].headline}
              </motion.span>
              <br />
              <motion.span 
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                style={{ backgroundSize: "200% 200%" }}
              >
                {heroMessages[currentMessageIndex].highlight}
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-2xl text-gray-200/90 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {heroMessages[currentMessageIndex].description.split(' ').map((word, index) => 
                heroMessages[currentMessageIndex].highlightPhrases.includes(word) ? (
                  <motion.span 
                    key={index} 
                    className="text-blue-300 font-semibold bg-blue-400/10 px-1 py-0.5 rounded"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(59,130,246,0.2)" }}
                  >
                    {word}{' '}
                  </motion.span>
                ) : (
                  <span key={index}>{word} </span>
                )
              )}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mb-20 flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth/signup')}
              className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-10 py-5 text-xl font-bold shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:shadow-[0_25px_60px_rgba(59,130,246,0.6)] transition-all duration-500 transform overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center">
                Start Creating for Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </span>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsDemoOpen(true)}
              className="border-2 border-white/30 text-white bg-white/5 backdrop-blur-md hover:bg-white/15 hover:border-white/50 px-10 py-5 text-xl font-bold transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)]"
            >
              <Play className="mr-3 h-6 w-6" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="flex flex-wrap justify-center items-center gap-12 text-base"
        >
          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(234,179,8,0.2)",
                "0 0 30px rgba(234,179,8,0.4)",
                "0 0 20px rgba(234,179,8,0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.3 }}
                >
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </motion.div>
              ))}
            </div>
            <span className="text-white font-semibold">4.9/5 rating</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-white font-semibold">50,000+ creators</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <Zap className="h-5 w-5 text-purple-400" />
            <span className="text-white font-semibold">2M+ words generated</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
};