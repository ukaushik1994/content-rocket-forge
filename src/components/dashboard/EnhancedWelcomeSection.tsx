import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, Zap, ArrowRight, Play, Pause } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import { GrandTourTrigger } from '@/components/tour/GrandTourTrigger';
import { modules, ModuleData } from './ModuleCarouselData';

interface EnhancedWelcomeSectionProps {
  setFeedbackOpen: (open: boolean) => void;
  navigate: NavigateFunction;
}

export const EnhancedWelcomeSection: React.FC<EnhancedWelcomeSectionProps> = ({
  setFeedbackOpen,
  navigate
}) => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const currentModule = modules[currentModuleIndex];

  // Auto-advance carousel
  useEffect(() => {
    if (isAutoPlaying && !isHovered) {
      const interval = setInterval(() => {
        setCurrentModuleIndex((prev) => (prev + 1) % modules.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, isHovered]);

  const navigateToModule = (index: number) => {
    setCurrentModuleIndex(index);
    setIsAutoPlaying(false);
  };

  const nextModule = () => {
    setCurrentModuleIndex((prev) => (prev + 1) % modules.length);
    setIsAutoPlaying(false);
  };

  const prevModule = () => {
    setCurrentModuleIndex((prev) => (prev - 1 + modules.length) % modules.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative">
      {/* Main hero container */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/40 via-black/20 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Dynamic background effects */}
        <div className="absolute inset-0">
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-br ${currentModule.theme.gradient} opacity-10`}
            key={currentModule.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 px-6 py-8 md:px-10 md:py-12 lg:px-12 lg:py-14">
          <div className="max-w-5xl mx-auto">
            {/* Status indicator with module category */}
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
              <div className="w-px h-4 bg-white/20" />
              <AnimatePresence mode="wait">
                <motion.span 
                  key={currentModule.id}
                  className="text-sm font-medium text-white/80"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentModule.subtitle}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              {/* Left content */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentModule.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${currentModule.theme.glowColor} border border-white/20`}>
                          <currentModule.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white/70 uppercase tracking-wide">
                          {currentModule.subtitle}
                        </span>
                      </div>
                      
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                        <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                          {currentModule.title}
                        </span>
                      </h1>
                      
                      <div className={`h-1 w-16 bg-gradient-to-r ${currentModule.theme.textGradient} rounded-full`} />
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-base md:text-lg text-white/80 leading-relaxed font-light">
                        {currentModule.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {currentModule.features.map((feature, index) => (
                          <motion.span
                            key={feature}
                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium backdrop-blur-xl"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                          >
                            {feature}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Search interface */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="relative group">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300">
                      <Search className="h-5 w-5 text-white/70" />
                      <AnimatePresence mode="wait">
                        <motion.input
                          key={currentModule.id}
                          type="text" 
                          placeholder={currentModule.searchPlaceholder}
                          className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-base"
                          readOnly
                          onClick={() => navigate(currentModule.route)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </AnimatePresence>
                      <motion.button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${currentModule.theme.textGradient} text-white text-sm font-semibold cursor-pointer hover:shadow-lg transition-all duration-300`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(currentModule.route)}
                      >
                        <Zap className="h-4 w-4" />
                        Generate
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentModule.id}
                    className="flex flex-col sm:flex-row gap-3"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Button 
                      size="lg"
                      className={`bg-gradient-to-r ${currentModule.theme.textGradient} hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 group`}
                      onClick={() => navigate(currentModule.route)}
                    >
                      <span className="flex items-center gap-2">
                        <currentModule.icon className="h-5 w-5" />
                        {currentModule.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                    
                    {currentModule.secondaryCta && (
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/15 text-white px-6 py-3 rounded-lg font-semibold backdrop-blur-xl transition-all duration-300"
                        onClick={() => navigate(currentModule.secondaryRoute!)}
                      >
                        {currentModule.secondaryCta}
                      </Button>
                    )}
                    
                    <GrandTourTrigger variant="hero" size="lg" className="px-6 py-3 rounded-lg font-semibold" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right visual element - dynamic module icon with bounce animation */}
              <div className="relative flex items-center justify-center">
                <div className="relative">
                  {/* Dynamic glow effect */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentModule.id}
                      className={`absolute inset-0 w-60 h-60 rounded-full bg-gradient-to-br ${currentModule.theme.glowColor} blur-3xl opacity-60`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.6, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.8 }}
                    />
                  </AnimatePresence>
                  
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentModule.id}
                      className={`relative w-60 h-60 rounded-full bg-gradient-to-br ${currentModule.theme.glowColor} backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl`}
                      initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 1.2, rotateY: -90 }}
                      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -8, 0],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <currentModule.icon className="h-20 w-20 text-white" />
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Carousel controls */}
            <div className="mt-8 flex items-center justify-between">
              {/* Module indicators */}
              <div className="flex items-center gap-2">
                {modules.map((module, index) => (
                  <motion.button
                    key={module.id}
                    onClick={() => navigateToModule(index)}
                    className={`relative h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentModuleIndex 
                        ? 'w-8 bg-gradient-to-r from-white to-white/80' 
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    title={module.title}
                  >
                    {index === currentModuleIndex && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-white to-white/80"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevModule}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextModule}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
