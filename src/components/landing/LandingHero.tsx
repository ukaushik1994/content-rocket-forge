import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DemoModal } from '@/components/landing/DemoModal';
import { DigitalCanvas } from './DigitalCanvas';
import { LeftSidePanel } from './LeftSidePanel';
import { RightSidePanel } from './RightSidePanel';
import { Play, ArrowRight, Star, Users, Zap } from 'lucide-react';

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Dynamic hero messages that rotate every 3 seconds
  const heroMessages = [
    {
      headline: "Create Content That",
      highlightedText: "Converts & Ranks",
      description: "Transform your content strategy with AI that understands",
      highlightedPhrases: [
        { text: "SERP data", color: "text-primary" },
        { text: "engaging copy", color: "text-neon-blue" },
        { text: "measurable results", color: "text-neon-pink" }
      ]
    },
    {
      headline: "Generate Content That",
      highlightedText: "Dominates SERPs",
      description: "Leverage real-time",
      highlightedPhrases: [
        { text: "competitor analysis", color: "text-primary" },
        { text: "keyword intelligence", color: "text-neon-blue" },
        { text: "SEO optimization", color: "text-neon-pink" }
      ]
    },
    {
      headline: "Build Content That",
      highlightedText: "Drives Revenue",
      description: "Monitor",
      highlightedPhrases: [
        { text: "performance analytics", color: "text-primary" },
        { text: "ROI metrics", color: "text-neon-blue" },
        { text: "data-driven insights", color: "text-neon-pink" }
      ]
    },
    {
      headline: "Craft Content That",
      highlightedText: "Outranks Competitors",
      description: "Maintain consistent",
      highlightedPhrases: [
        { text: "brand voice", color: "text-primary" },
        { text: "multi-format content", color: "text-neon-blue" },
        { text: "multiple platforms", color: "text-neon-pink" }
      ]
    },
    {
      headline: "Produce Content That",
      highlightedText: "Scales Your Brand",
      description: "Research trending",
      highlightedPhrases: [
        { text: "keywords", color: "text-primary" },
        { text: "content gaps", color: "text-neon-blue" },
        { text: "competitor opportunities", color: "text-neon-pink" }
      ]
    },
    {
      headline: "Design Content That",
      highlightedText: "Engages & Converts",
      description: "Generate",
      highlightedPhrases: [
        { text: "high-quality content", color: "text-primary" },
        { text: "search optimization", color: "text-neon-blue" },
        { text: "social platforms", color: "text-neon-pink" }
      ]
    }
  ];

  // Rotate messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % heroMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroMessages.length]);

  const currentMessage = heroMessages[currentMessageIndex];

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Digital Canvas Background */}
      <DigitalCanvas />
      
      {/* Side Panels */}
      <LeftSidePanel />
      <RightSidePanel />
      
      <div className="flex items-center justify-center min-h-screen px-4 pt-32 pb-20 relative z-10">
        <div className="flex flex-col items-center justify-center max-w-6xl mx-auto">
          
          {/* Main Content - Centered */}
          <div className="text-center space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Enhanced Badge */}
            <motion.div 
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-background/20 backdrop-blur-xl border border-primary/30 text-primary text-sm font-medium shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-5 w-5" />
              </motion.div>
              AI-Powered Content Creation Platform
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                  className="text-5xl md:text-7xl xl:text-8xl font-bold leading-tight tracking-tight"
                >
                  {currentMessage.headline}
                  <br />
                  <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-300% bg-clip-text text-transparent animate-gradient-shift drop-shadow-lg">
                    {currentMessage.highlightedText}
                  </span>
                </motion.h1>
              </AnimatePresence>
              
              <AnimatePresence mode="wait">
                <motion.p 
                  key={`desc-${currentMessageIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="text-xl md:text-3xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-light"
                >
                  {currentMessage.description}{' '}
                  {currentMessage.highlightedPhrases.map((phrase, index) => (
                    <span key={index}>
                      <span className={`${phrase.color} font-semibold`}>{phrase.text}</span>
                      {index < currentMessage.highlightedPhrases.length - 1 && ', '}
                      {index === currentMessage.highlightedPhrases.length - 2 && ' and '}
                      {index === currentMessage.highlightedPhrases.length - 1 && '.'}
                    </span>
                  ))}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Enhanced CTA Section */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth?mode=signup')}
                    className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-white text-xl font-semibold px-10 py-6 rounded-2xl shadow-2xl hover:shadow-neon-strong transition-all duration-300 group relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10 flex items-center">
                      Start Creating for Free
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsDemoOpen(true)}
                    className="border-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 text-xl font-semibold px-10 py-6 rounded-2xl backdrop-blur-xl transition-all duration-300 group"
                  >
                    <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </Button>
                </motion.div>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-base text-muted-foreground flex-wrap">
                <motion.div 
                  className="flex items-center gap-3 bg-background/20 backdrop-blur-xl rounded-full px-4 py-2 border border-primary/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'hsla(var(--primary) / 0.1)' }}
                >
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-medium">4.9/5 rating</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3 bg-background/20 backdrop-blur-xl rounded-full px-4 py-2 border border-primary/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'hsla(var(--primary) / 0.1)' }}
                >
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">10k+ creators</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3 bg-background/20 backdrop-blur-xl rounded-full px-4 py-2 border border-primary/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'hsla(var(--primary) / 0.1)' }}
                >
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-medium">100M+ words generated</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Demo Modal */}
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      </div>
    </section>
  );
};