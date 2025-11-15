import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Megaphone, Target, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CampaignsHeroProps {
  onCreateClick?: () => void;
}

export const CampaignsHero = React.memo(({ onCreateClick }: CampaignsHeroProps) => {
  return (
    <motion.div 
      className="relative min-h-[60vh] flex items-center justify-center w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative z-10 w-full px-6 pt-8 pb-12">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10 rounded-3xl blur-3xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 hover:scale-105 transition-transform duration-300">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Campaign Builder</span>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative space-y-2"
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
                Campaign Planner
              </span>
            </h1>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Transform one idea into a complete multi-channel campaign strategy with AI-powered content generation
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center justify-center"
          >
            <Button 
              size="lg" 
              className="relative overflow-hidden group bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-primary-foreground border-0 shadow-2xl px-8 py-4 text-lg h-auto"
              onClick={onCreateClick}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <Megaphone className="mr-2 h-5 w-5" />
              Create New Campaign
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto"
          >
            {[
              { icon: Target, label: 'Active Campaigns', value: '-', color: 'from-purple-500 to-pink-500' },
              { icon: Zap, label: 'Content Generated', value: '-', color: 'from-blue-500 to-cyan-500' },
              { icon: TrendingUp, label: 'Formats Used', value: '-', color: 'from-green-500 to-emerald-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1), duration: 0.4 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl"
                    style={{ background: `linear-gradient(to right, ${stat.color})` }}
                  />
                  <div className="relative bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color} mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

CampaignsHero.displayName = 'CampaignsHero';
