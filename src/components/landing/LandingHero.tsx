import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';
import { DemoModal } from '@/components/landing/DemoModal';
import { FloatingKeywords } from '@/components/landing/FloatingKeywords';
import { Play, ArrowRight, Star, Users, Zap, Search, TrendingUp, Brain, Target, Sparkles, BarChart3, FileText, CheckCircle, Loader2 } from 'lucide-react';

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const stats = [
    { icon: Users, value: '10k+', label: 'Creators' },
    { icon: Star, value: '4.9', label: 'Rating' },
    { icon: Zap, value: '100M+', label: 'Words Generated' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
      <div className="container max-w-7xl mx-auto relative">
        {/* Floating Keywords Background */}
        <FloatingKeywords />
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Content */}
          <div className="text-left space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              AI-Powered Content Creation
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold leading-tight">
                Create Content That
                <br />
                <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-300% bg-clip-text text-transparent animate-gradient-shift">
                  Converts & Ranks
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Transform your content strategy with AI that understands 
                <span className="text-primary font-semibold"> SERP data</span>, 
                creates <span className="text-neon-blue font-semibold">engaging copy</span>, 
                and delivers <span className="text-neon-pink font-semibold">measurable results</span>.
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
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
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span>4.9/5 rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>10k+ creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>100M+ words generated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative lg:block hidden animate-fade-in [animation-delay:200ms]">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 -z-20">
              {/* Primary Glow */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/30 to-neon-blue/20 rounded-full blur-3xl animate-pulse"></div>
              
              {/* Secondary Orbs */}
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-neon-pink/20 to-neon-orange/10 rounded-full blur-2xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                  x: [0, 20, 0],
                  y: [0, -10, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <motion.div 
                className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-r from-neon-blue/15 to-primary/10 rounded-full blur-2xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.5, 0.2],
                  x: [0, -15, 0],
                  y: [0, 15, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />
              
              {/* Floating Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/60 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 12}%`,
                  }}
                  animate={{
                    y: [-20, 20, -20],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>

            {/* Enhanced Floating Elements Ecosystem */}
            {/* Brain - Top Right (AI Processing) */}
            <motion.div 
              className="absolute -top-12 right-8 w-14 h-14 bg-gradient-to-r from-neon-purple to-primary rounded-2xl p-3 shadow-neon"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="w-full h-full text-white" />
            </motion.div>

            {/* Target - Middle Left (Precision) */}
            <motion.div 
              className="absolute top-1/3 -left-6 w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-xl p-2 shadow-lg"
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Target className="w-full h-full text-white" />
            </motion.div>

            {/* Sparkles - Bottom Left (Magic) */}
            <motion.div 
              className="absolute bottom-8 -left-4 w-12 h-12 bg-gradient-to-r from-neon-pink to-neon-orange rounded-xl p-3 shadow-neon"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-full h-full text-white" />
            </motion.div>

            {/* BarChart3 - Top Left (Analytics) */}
            <motion.div 
              className="absolute top-8 -left-8 w-11 h-11 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg p-2.5 shadow-lg"
              animate={{ 
                y: [0, 10, 0],
                x: [0, 5, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <BarChart3 className="w-full h-full text-white" />
            </motion.div>

            {/* FileText - Bottom Right (Content) */}
            <motion.div 
              className="absolute bottom-0 right-4 w-10 h-10 bg-gradient-to-r from-primary to-neon-purple rounded-lg p-2 shadow-lg"
              animate={{ 
                x: [0, 8, 0],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <FileText className="w-full h-full text-white" />
            </motion.div>

            {/* Zap - Middle Right (Power) */}
            <motion.div 
              className="absolute top-1/2 right-0 w-12 h-12 bg-gradient-to-r from-neon-orange to-neon-pink rounded-xl p-3 shadow-neon"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <Zap className="w-full h-full text-white" />
            </motion.div>

            {/* Main Visual Card */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <GlassCard className="p-8 space-y-6 max-w-md ml-auto relative overflow-hidden">
                {/* Particle Border Effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-0.5 h-0.5 bg-primary/60 rounded-full"
                      style={{
                        left: `${(i / 12) * 100}%`,
                        top: i % 2 === 0 ? '0%' : '100%',
                      }}
                      animate={{
                        x: i % 2 === 0 ? [0, 20, 0] : [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                  <CreAiterLogo showText={false} size="sm" />
                  <motion.div 
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live AI Assistant
                  </motion.div>
                </div>

                {/* Enhanced Content Preview */}
                <div className="space-y-4">
                  <motion.div 
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 1 }}
                    >
                      ▊
                    </motion.span>
                    Content Brief Generated
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                  </motion.div>
                  
                  <div className="space-y-3">
                    {[
                      { label: "Target Keywords", value: "15 identified", color: "text-primary", progress: 100 },
                      { label: "SERP Analysis", value: "Completed", color: "text-neon-blue", progress: 100 },
                      { label: "Content Score", value: "92/100", color: "text-neon-pink", progress: 92 }
                    ].map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="p-3 bg-background/50 rounded-lg border border-border/30 relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        {/* Progress bar background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ delay: 1 + index * 0.2, duration: 1.5, ease: "easeOut" }}
                        />
                        
                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                            {item.progress === 100 ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <Loader2 className="w-3 h-3 text-muted-foreground" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-primary/20 to-neon-blue/20 text-primary border border-primary/30 hover:from-primary/30 hover:to-neon-blue/30 hover:shadow-neon transition-all duration-300 group relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-neon-blue/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        Generate Content
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </GlassCard>

              {/* Enhanced Original Floating Elements */}
              <motion.div 
                className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-primary to-neon-blue rounded-2xl p-4 shadow-neon"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Search className="w-full h-full text-white" />
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -right-6 w-12 h-12 bg-gradient-to-r from-neon-pink to-neon-orange rounded-xl p-3 shadow-lg"
                animate={{ 
                  y: [0, 8, 0],
                  x: [0, 4, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <TrendingUp className="w-full h-full text-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Stats */}
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