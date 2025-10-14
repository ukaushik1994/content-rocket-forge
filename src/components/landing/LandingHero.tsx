import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DemoModal } from '@/components/landing/DemoModal';
import { FloatingKeywords } from '@/components/landing/FloatingKeywords';
import { HeroDashboardPreview } from '@/components/landing/HeroDashboardPreview';
import { Play, ArrowRight, Star, Users, Zap, Brain, RefreshCw } from 'lucide-react';

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Dynamic hero messages that rotate every 3 seconds - Self-Learning Engine Focus
  const heroMessages = [
    {
      headline: "Your Self-Learning",
      highlightedText: "Content Engine",
      description: "Creates, publishes, analyzes, and",
      highlightedPhrases: [
        { text: "learns from results", color: "text-primary" },
        { text: "adapts to your audience", color: "text-neon-blue" },
        { text: "improves automatically", color: "text-neon-pink" }
      ]
    },
    {
      headline: "Content That Gets",
      highlightedText: "Smarter Over Time",
      description: "Every published post feeds analytics back, creating content that's",
      highlightedPhrases: [
        { text: "progressively better", color: "text-primary" },
        { text: "personalized to YOU", color: "text-neon-blue" },
        { text: "continuously learning", color: "text-neon-pink" }
      ]
    },
    {
      headline: "From Research to ROI",
      highlightedText: "All Automated",
      description: "SERP research → AI writing → publishing → analytics →",
      highlightedPhrases: [
        { text: "smarter content", color: "text-primary" },
        { text: "automated workflow", color: "text-neon-blue" },
        { text: "real results", color: "text-neon-pink" }
      ]
    },
    {
      headline: "AI That Understands",
      highlightedText: "YOUR Audience",
      description: "Not generic AI. CreAiter learns what works for",
      highlightedPhrases: [
        { text: "YOUR content", color: "text-primary" },
        { text: "YOUR audience", color: "text-neon-blue" },
        { text: "YOUR strategy", color: "text-neon-pink" }
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

  const stats = [
    { icon: Users, value: '10k+', label: 'Creators' },
    { icon: Star, value: '4.9', label: 'Rating' },
    { icon: Zap, value: '100M+', label: 'Words Generated' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="container max-w-5xl mx-auto relative">
        {/* Floating Keywords Background */}
        <FloatingKeywords />
        <div className="flex flex-col items-center justify-center min-h-screen">
          
          {/* Main Content - Centered */}
          <div className="text-center space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              The Only Self-Learning Content Operating System
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-6xl xl:text-7xl font-bold leading-tight"
                >
                  {currentMessage.headline}
                  <br />
                  <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-300% bg-clip-text text-transparent animate-gradient-shift">
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
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
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

            {/* CTA Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth?mode=signup')}
                  className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-lg px-8 py-4 shadow-xl hover:shadow-neon-strong transition-all duration-300 group"
                >
                  Start Creating for Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsDemoOpen(true)}
                  className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 text-lg px-8 py-4 backdrop-blur-sm transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  See How It Learns
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span>Be among the first creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Join the founding members</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span>AI learns from every post</span>
                </div>
              </div>
            </div>

            {/* Enhanced Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-16 max-w-4xl mx-auto"
            >
              <HeroDashboardPreview />
            </motion.div>
          </div>

          {/* Stats Section */}
          <div className="lg:hidden grid grid-cols-3 gap-4 mt-8 animate-fade-in [animation-delay:400ms]">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 glass-card rounded-xl">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>


        {/* Demo Modal */}
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      </div>
    </section>
  );
};