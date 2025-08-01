import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RocketIcon, MessageCircle, Sparkles, BarChart3, Search, Zap, ArrowRight } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { TourTrigger } from '@/components/tour/TourTrigger';

interface EnhancedWelcomeSectionProps {
  setFeedbackOpen: (open: boolean) => void;
  navigate: NavigateFunction;
}

export const EnhancedWelcomeSection: React.FC<EnhancedWelcomeSectionProps> = ({
  setFeedbackOpen,
  navigate
}) => {
  return (
    <div className="relative">
      {/* Main hero container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/40 via-black/20 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl">
        {/* Animated background effects */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-neon-blue/15 to-neon-pink/10"
            animate={{ 
              background: [
                "linear-gradient(to bottom right, rgba(155, 135, 245, 0.2), rgba(51, 195, 240, 0.15), rgba(217, 70, 239, 0.1))",
                "linear-gradient(to bottom right, rgba(51, 195, 240, 0.2), rgba(217, 70, 239, 0.15), rgba(155, 135, 245, 0.1))",
                "linear-gradient(to bottom right, rgba(217, 70, 239, 0.2), rgba(155, 135, 245, 0.15), rgba(51, 195, 240, 0.1))"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          {/* Floating orbs */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-white/10 to-transparent blur-sm"
              style={{
                width: Math.random() * 120 + 40,
                height: Math.random() * 120 + 40,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                x: [0, Math.random() * 60 - 30],
                y: [0, Math.random() * 60 - 30],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        <div className="relative z-10 px-6 py-8 md:px-10 md:py-12 lg:px-12 lg:py-14">
          <div className="max-w-5xl mx-auto">
            {/* Status indicator */}
            <motion.div 
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50"
                animate={{ 
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <span className="text-sm font-semibold text-white/95">AI System Online</span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              {/* Left content */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-neon-purple/30 to-neon-blue/30 border border-white/20">
                        <RocketIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white/70 uppercase tracking-wide">Content Creation</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                      <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                        Content Rocket Forge
                      </span>
                    </h1>
                    
                    <div className="h-1 w-16 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink rounded-full" />
                  </div>
                  
                  <p className="text-base md:text-lg text-white/80 leading-relaxed font-light">
                    Generate high-ranking, conversion-driven content by integrating 
                    real-time SERP data and keyword optimization.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {['AI-Powered', 'SERP Integrated', 'SEO Optimized'].map((tag, index) => (
                      <motion.span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium backdrop-blur-xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Compact search interface */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <div className="relative group">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-500">
                      <Search className="h-5 w-5 text-white/70" />
                      <input 
                        type="text" 
                        placeholder="What content would you like to create?"
                        className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-base"
                        readOnly
                        onClick={() => navigate('/content-builder')}
                      />
                      <motion.button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-semibold cursor-pointer hover:shadow-lg transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/content-builder')}
                      >
                        <Zap className="h-4 w-4" />
                        Generate
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Compact action buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 group"
                    onClick={() => navigate('/content-builder')}
                  >
                    <span className="flex items-center gap-2">
                      <RocketIcon className="h-5 w-5" />
                      Start Creating
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/15 text-white px-6 py-3 rounded-lg font-semibold backdrop-blur-xl transition-all duration-300"
                    onClick={() => navigate('/analytics')}
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analytics
                    </span>
                  </Button>
                  
                  <TourTrigger variant="inline" size="lg" className="px-6 py-3 rounded-lg font-semibold" />
                </motion.div>
              </div>

              {/* Right visual element */}
              <motion.div 
                className="relative flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <div className="relative">
                  {/* Larger animated rings */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-white/10"
                      style={{
                        width: 240 + i * 80,
                        height: 240 + i * 80,
                        left: -(i * 40),
                        top: -(i * 40)
                      }}
                      animate={{
                        rotate: [0, 360],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{
                        duration: 20 + i * 10,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  ))}
                  
                  <motion.div 
                    className="relative w-60 h-60 rounded-full bg-gradient-to-br from-neon-purple/30 via-neon-blue/20 to-neon-pink/30 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl"
                    animate={{
                      y: [0, -15, 0],
                      boxShadow: [
                        "0 0 60px rgba(155, 135, 245, 0.4)",
                        "0 0 80px rgba(155, 135, 245, 0.6)",
                        "0 0 60px rgba(155, 135, 245, 0.4)"
                      ]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-20 w-20 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
