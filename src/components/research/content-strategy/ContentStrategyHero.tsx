
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ContentStrategyHero = React.memo(({ onCreate }: { onCreate?: () => void }) => {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative"
      >
        <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">
          Content Strategy
        </h1>
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
      >
        AI-powered content strategy with SERP analysis, competitor research, and data-driven recommendations
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <Button size="lg" className="hover-scale" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Strategy
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-glass rounded-full border border-white/10">
          <Target className="h-4 w-4 text-blue-400" />
          <span>SERP Analysis</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-glass rounded-full border border-white/10">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          <span>Competitor Research</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-glass rounded-full border border-white/10">
          <BarChart3 className="h-4 w-4 text-green-400" />
          <span>Performance Tracking</span>
        </div>
      </motion.div>
    </div>
  );
});
