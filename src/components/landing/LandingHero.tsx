import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';
import { DemoModal } from '@/components/landing/DemoModal';

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

            {/* Enhanced Floating Elements Ecosystem - Scattered Layout */}
            {/* Row 1 - Top scattered icons */}
            <motion.div 
              className="absolute -top-16 left-1/4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-3 shadow-neon"
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -8, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="w-full h-full text-white" />
            </motion.div>

            <motion.div 
              className="absolute -top-8 right-1/3 w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl p-2 shadow-lg"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Target className="w-full h-full text-white" />
            </motion.div>

            <motion.div 
              className="absolute -top-12 right-8 w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-3 shadow-neon"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-full h-full text-white" />
            </motion.div>

            {/* Row 2 - Middle scattered icons */}
            <motion.div 
              className="absolute top-1/4 -left-12 w-11 h-11 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2.5 shadow-lg"
              animate={{ 
                y: [0, 12, 0],
                x: [0, 6, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <BarChart3 className="w-full h-full text-white" />
            </motion.div>

            <motion.div 
              className="absolute top-1/3 right-1/4 w-13 h-13 bg-gradient-to-r from-rose-400 to-red-500 rounded-xl p-3 shadow-neon"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <Zap className="w-full h-full text-white" />
            </motion.div>

            <motion.div 
              className="absolute top-2/5 -left-6 w-9 h-9 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg p-2 shadow-lg"
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, 8, -8, 0],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            >
              <FileText className="w-full h-full text-white" />
            </motion.div>

            {/* Row 3 - Bottom scattered icons */}
            <motion.div 
              className="absolute bottom-1/4 -left-8 w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-3 shadow-neon"
              animate={{ 
                x: [0, 10, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
            >
              <Search className="w-full h-full text-white" />
            </motion.div>

            <motion.div 
              className="absolute bottom-8 right-1/3 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg p-2 shadow-lg"
              animate={{ 
                y: [0, 8, 0],
                x: [0, 4, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            >
              <TrendingUp className="w-full h-full text-white" />
            </motion.div>

            <motion.div 
              className="absolute bottom-12 left-1/4 w-11 h-11 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-2.5 shadow-lg"
              animate={{ 
                scale: [1, 1.2, 1],
                y: [0, -6, 0],
              }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            >
              <Star className="w-full h-full text-white" />
            </motion.div>

            {/* Additional scattered elements for more excitement */}
            <motion.div 
              className="absolute top-1/2 right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full p-2 shadow-lg"
              animate={{ 
                rotate: [0, 180, 360],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <Users className="w-full h-full text-white" />
            </motion.div>

            <motion.div 
              className="absolute top-3/4 -left-4 w-9 h-9 bg-gradient-to-r from-indigo-400 to-blue-600 rounded-lg p-2 shadow-lg"
              animate={{ 
                y: [0, -10, 0],
                x: [0, 8, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <BarChart3 className="w-full h-full text-white" />
            </motion.div>

            {/* Enhanced Interactive Icon Playground */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Magnetic Hover Icons with Advanced Effects */}
              
              {/* Central Hub Icons - More prominent */}
              <motion.div 
                className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-neon-pink to-purple-600 rounded-3xl p-4 shadow-neon-strong pointer-events-auto cursor-pointer"
                style={{ transform: 'translate(-50%, -50%)' }}
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                whileHover={{ 
                  scale: 1.3,
                  rotate: 180,
                  boxShadow: "0 0 40px rgba(236, 72, 153, 0.6), 0 0 80px rgba(236, 72, 153, 0.3)",
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-full h-full text-white drop-shadow-lg" />
              </motion.div>

              {/* Orbiting Content Icons */}
              <motion.div 
                className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-neon-blue to-indigo-600 rounded-2xl p-3 shadow-neon pointer-events-auto cursor-pointer"
                animate={{ 
                  y: [0, -15, 0],
                  scale: [1, 1.15, 1],
                }}
                whileHover={{
                  scale: 1.4,
                  y: -10,
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)",
                  transition: { duration: 0.2 }
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <FileText className="w-full h-full text-white" />
              </motion.div>

              <motion.div 
                className="absolute top-2/3 left-1/3 w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl p-3 shadow-neon pointer-events-auto cursor-pointer"
                animate={{ 
                  x: [0, 12, 0],
                  rotate: [0, 8, -8, 0],
                }}
                whileHover={{
                  scale: 1.35,
                  rotate: 15,
                  boxShadow: "0 0 35px rgba(34, 197, 94, 0.7), 0 0 70px rgba(34, 197, 94, 0.3)",
                  transition: { duration: 0.2 }
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <BarChart3 className="w-full h-full text-white" />
              </motion.div>

              {/* Scattered Interaction Icons */}
              <motion.div 
                className="absolute top-1/4 right-1/6 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl p-2 shadow-lg pointer-events-auto cursor-pointer"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                whileHover={{
                  scale: 1.5,
                  rotate: 360,
                  boxShadow: "0 0 25px rgba(245, 158, 11, 0.8), 0 0 50px rgba(245, 158, 11, 0.4)",
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Sparkles className="w-full h-full text-white" />
              </motion.div>

              <motion.div 
                className="absolute bottom-1/3 right-1/5 w-11 h-11 bg-gradient-to-br from-rose-400 to-red-600 rounded-xl p-2.5 shadow-neon pointer-events-auto cursor-pointer"
                animate={{ 
                  y: [0, 10, 0],
                  x: [0, -8, 0],
                }}
                whileHover={{
                  scale: 1.4,
                  y: -15,
                  boxShadow: "0 0 30px rgba(244, 63, 94, 0.8), 0 0 60px rgba(244, 63, 94, 0.4)",
                  transition: { duration: 0.2 }
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <Zap className="w-full h-full text-white" />
              </motion.div>

              <motion.div 
                className="absolute top-3/5 right-1/12 w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg p-2 shadow-lg pointer-events-auto cursor-pointer"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                whileHover={{
                  scale: 1.6,
                  rotate: 45,
                  boxShadow: "0 0 25px rgba(139, 92, 246, 0.8), 0 0 50px rgba(139, 92, 246, 0.4)",
                  transition: { duration: 0.2 }
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <Target className="w-full h-full text-white" />
              </motion.div>

              {/* Chain Reaction Icons */}
              <motion.div 
                className="absolute bottom-1/4 left-3/4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-full p-2 shadow-lg pointer-events-auto cursor-pointer"
                animate={{ 
                  scale: [0.9, 1.1, 0.9],
                  y: [0, -6, 0],
                }}
                whileHover={{
                  scale: 1.7,
                  boxShadow: "0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(34, 211, 238, 0.4)",
                  transition: { duration: 0.2 }
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              >
                <Search className="w-full h-full text-white" />
              </motion.div>

              <motion.div 
                className="absolute top-1/6 left-2/3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl p-2 shadow-lg pointer-events-auto cursor-pointer"
                animate={{ 
                  x: [0, 8, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                whileHover={{
                  scale: 1.45,
                  x: 12,
                  boxShadow: "0 0 25px rgba(252, 211, 77, 0.8), 0 0 50px rgba(252, 211, 77, 0.4)",
                  transition: { duration: 0.2 }
                }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              >
                <TrendingUp className="w-full h-full text-white" />
              </motion.div>

              {/* Additional Floating Elements for Visual Richness */}
              <motion.div 
                className="absolute bottom-1/6 right-2/5 w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg p-1.5 shadow-lg pointer-events-auto cursor-pointer"
                animate={{ 
                  rotate: [0, 180, 360],
                  scale: [0.8, 1, 0.8],
                }}
                whileHover={{
                  scale: 1.8,
                  rotate: 720,
                  boxShadow: "0 0 20px rgba(236, 72, 153, 0.8), 0 0 40px rgba(236, 72, 153, 0.4)",
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
              >
                <Star className="w-full h-full text-white" />
              </motion.div>

              <motion.div 
                className="absolute top-4/5 left-1/2 w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-lg p-2 shadow-lg pointer-events-auto cursor-pointer"
                animate={{ 
                  y: [0, -12, 0],
                  x: [0, 6, 0],
                }}
                whileHover={{
                  scale: 1.5,
                  y: -20,
                  boxShadow: "0 0 25px rgba(99, 102, 241, 0.8), 0 0 50px rgba(99, 102, 241, 0.4)",
                  transition: { duration: 0.2 }
                }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
              >
                <Users className="w-full h-full text-white" />
              </motion.div>
            </div>
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