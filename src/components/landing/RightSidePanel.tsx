import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, CheckCircle, Clock, Sparkles } from 'lucide-react';

const demoSteps = [
  { icon: Wand2, text: 'Analyzing your topic...', duration: 2000 },
  { icon: Sparkles, text: 'Generating SEO keywords...', duration: 1500 },
  { icon: CheckCircle, text: 'Creating engaging content...', duration: 2500 },
  { icon: CheckCircle, text: 'Optimizing for conversions...', duration: 1800 },
];

const tools = [
  { name: 'Blog Writer', status: 'active', usage: '847 articles' },
  { name: 'Social Media', status: 'active', usage: '2.1k posts' },
  { name: 'Email Campaigns', status: 'processing', usage: '156 campaigns' },
  { name: 'Ad Copy', status: 'active', usage: '934 ads' },
];

export const RightSidePanel = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const cycleSteps = () => {
      setCurrentStep(prev => (prev + 1) % demoSteps.length);
    };

    const interval = setInterval(cycleSteps, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 space-y-6 hidden xl:block">
      {/* Live Demo Simulation */}
      <motion.div
        className="bg-background/10 backdrop-blur-xl rounded-xl p-4 border border-border/20 shadow-lg min-w-[240px]"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-foreground">AI Builder - Live Demo</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {React.createElement(demoSteps[currentStep].icon, { className: "h-4 w-4 text-primary animate-spin" })}
            <span className="text-sm text-foreground">{demoSteps[currentStep].text}</span>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 space-y-2">
          <div className="text-xs text-muted-foreground">Preview:</div>
          <div className="bg-background/20 rounded-md p-2 text-xs text-foreground/80 min-h-[60px] border border-border/10">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              "Transform your content strategy with AI that understands your audience..."
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Tool Palette */}
      <motion.div
        className="bg-background/10 backdrop-blur-xl rounded-xl p-4 border border-border/20 shadow-lg min-w-[240px]"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Content Tools</span>
        </div>

        <div className="space-y-2">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tool.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                <span className="text-xs font-medium text-foreground">{tool.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{tool.usage}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};