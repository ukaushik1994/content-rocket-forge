
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp, BarChart3, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

export const ContentStrategyHero = React.memo(({ onCreate }: { onCreate?: () => void }) => {
  const { strategies, aiProposals, pipelineItems, loading } = useContentStrategy();
  
  const activeStrategiesCount = strategies.filter(s => s.is_active).length;
  const proposalsCount = aiProposals.length;
  const pipelineCount = pipelineItems.length;

  return (
    <motion.div 
      className="relative min-h-[60vh] flex items-center justify-center w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative z-10 w-full px-6 pt-8 pb-12">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          {/* Animated background blur */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 hover:scale-105 transition-transform duration-300">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Strategy Planning</span>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative space-y-2"
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
                Content Strategy
              </span>
              <br />
              <span className="text-primary">Workspace</span>
            </h1>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </motion.div>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Complete content strategy workspace with AI proposals, production pipeline, editorial calendar, and performance analytics
          </motion.p>

          {/* Main Action Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center justify-center"
          >
            <Button 
              size="lg" 
              className="relative overflow-hidden group bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-primary-foreground border-0 shadow-2xl px-8 py-4 text-lg h-auto"
              onClick={onCreate}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <Target className="h-5 w-5 mr-2 relative z-10" />
              <span className="relative z-10">Create Strategy</span>
              <Sparkles className="h-5 w-5 ml-2 relative z-10" />
            </Button>
          </motion.div>
          
          {/* Quick Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
          >
            <motion.div 
              className="flex items-center gap-4 p-6 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 hover:bg-background/80 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-3 rounded-lg bg-primary/10 backdrop-blur-xl">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                {loading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{activeStrategiesCount}</div>
                )}
                <div className="text-sm text-muted-foreground">Active Strategies</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-4 p-6 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 hover:bg-background/80 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-3 rounded-lg bg-blue-500/10 backdrop-blur-xl">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-left">
                {loading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{proposalsCount}</div>
                )}
                <div className="text-sm text-muted-foreground">Content Proposals</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-4 p-6 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 hover:bg-background/80 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-3 rounded-lg bg-purple-500/10 backdrop-blur-xl">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-left">
                {loading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{pipelineCount}</div>
                )}
                <div className="text-sm text-muted-foreground">Pipeline Items</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            className="flex items-center justify-center gap-4 text-sm pt-8"
          >
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 hover:bg-background/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-muted-foreground">AI Proposals</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 hover:bg-background/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-muted-foreground">Production Pipeline</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 hover:bg-background/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <BarChart3 className="h-4 w-4 text-green-400" />
              <span className="text-muted-foreground">Editorial Calendar</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
