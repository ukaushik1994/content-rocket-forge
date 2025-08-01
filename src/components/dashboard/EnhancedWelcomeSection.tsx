import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RocketIcon, MessageCircle, Sparkles, BarChart3, Search, Zap, ArrowRight } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black/40 via-black/20 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl">
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

        <div className="relative z-10 px-6 py-16 md:px-16 md:py-24 lg:px-20 lg:py-28 xl:px-24 xl:py-32">
          <div className="max-w-7xl mx-auto">
            {/* Status indicator */}
            <motion.div 
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-10 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50"
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
              <span className="text-base font-semibold text-white/95 tracking-wide">AI System Online</span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-sm text-white/70">Ready to Create</span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              {/* Left content */}
              <div className="space-y-10 lg:space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="space-y-6"
                >
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
                    <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent block">
                      Content Rocket
                    </span>
                    <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink bg-clip-text text-transparent block -mt-1">
                      Forge
                    </span>
                  </h1>
                  
                  <div className="space-y-4">
                    <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light max-w-2xl">
                      Generate high-ranking, conversion-driven content by integrating 
                      real-time SERP data, keyword clusters, and business solutions.
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      {['AI-Powered', 'SERP Integrated', 'SEO Optimized'].map((tag, index) => (
                        <motion.span
                          key={tag}
                          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium backdrop-blur-xl"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced search-like interface */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple/50 via-neon-blue/50 to-neon-pink/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                    <div className="relative flex items-center gap-4 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-500 hover:bg-white/15">
                      <div className="flex-shrink-0">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 border border-white/20">
                          <Search className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <input 
                        type="text" 
                        placeholder="What content would you like to create today?"
                        className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-xl font-light"
                        readOnly
                        onClick={() => navigate('/content-builder')}
                      />
                      <motion.div
                        className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white text-base font-semibold cursor-pointer shadow-lg hover:shadow-xl hover:shadow-neon-purple/25 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/content-builder')}
                      >
                        <Zap className="h-5 w-5" />
                        Generate Now
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced action buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-neon-purple/30 group relative overflow-hidden min-h-[60px]"
                    onClick={() => navigate('/content-builder')}
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-3">
                      <RocketIcon className="h-6 w-6" />
                      Start Creating Content
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/15 text-white px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-xl transition-all duration-300 group min-h-[60px] hover:shadow-lg"
                    onClick={() => navigate('/analytics')}
                  >
                    <span className="flex items-center gap-3">
                      <BarChart3 className="h-6 w-6" />
                      View Performance
                    </span>
                  </Button>
                </motion.div>
              </div>

              {/* Right visual element - enhanced */}
              <motion.div 
                className="relative flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <div className="relative">
                  {/* Animated rings */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-white/10"
                      style={{
                        width: 200 + i * 40,
                        height: 200 + i * 40,
                        left: -(i * 20),
                        top: -(i * 20)
                      }}
                      animate={{
                        rotate: [0, 360],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 20 + i * 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  ))}
                  
                  {/* Center orb */}
                  <motion.div 
                    className="relative w-48 h-48 rounded-full bg-gradient-to-br from-neon-purple/30 via-neon-blue/20 to-neon-pink/30 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl"
                    animate={{
                      y: [0, -10, 0],
                      boxShadow: [
                        "0 0 40px rgba(155, 135, 245, 0.3)",
                        "0 0 60px rgba(155, 135, 245, 0.5)",
                        "0 0 40px rgba(155, 135, 245, 0.3)"
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
                      <Sparkles className="h-16 w-16 text-white" />
                    </motion.div>
                    
                    {/* Floating particles around orb */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/60 rounded-full"
                        style={{
                          left: `${50 + 40 * Math.cos((i * 60) * Math.PI / 180)}%`,
                          top: `${50 + 40 * Math.sin((i * 60) * Math.PI / 180)}%`
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
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
