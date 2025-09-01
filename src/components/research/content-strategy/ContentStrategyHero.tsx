
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ContentStrategyHero = React.memo(({ onCreate }: { onCreate?: () => void }) => {
  return (
    <div className="text-center space-y-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2"
        >
          <Sparkles className="h-10 w-10 text-primary/60" />
        </motion.div>
        <h1 className="text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 tracking-tight">
          Content Strategy
        </h1>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light"
      >
        AI-powered content strategy with SERP analysis, competitor research, and data-driven recommendations
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="flex items-center justify-center pt-4"
      >
        <Button 
          size="lg" 
          className="hover-scale bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground border-0 shadow-xl px-10 py-4 text-lg font-medium rounded-xl" 
          onClick={onCreate}
        >
          <Plus className="h-5 w-5 mr-3" />
          Create New Strategy
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex items-center justify-center gap-6 pt-8"
      >
        <motion.div 
          className="flex items-center gap-3 px-6 py-3 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 hover:bg-card/80 transition-all duration-300 shadow-sm"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Target className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-foreground">SERP Analysis</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-3 px-6 py-3 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 hover:bg-card/80 transition-all duration-300 shadow-sm"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <TrendingUp className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-medium text-foreground">Competitor Research</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-3 px-6 py-3 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 hover:bg-card/80 transition-all duration-300 shadow-sm"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <BarChart3 className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-foreground">Performance Tracking</span>
        </motion.div>
      </motion.div>
    </div>
  );
});
