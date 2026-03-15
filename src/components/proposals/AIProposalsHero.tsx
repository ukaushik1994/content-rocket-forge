import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, CalendarPlus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AIProposalsHeroProps {
  stats?: { total: number; available: number; scheduled: number; completed: number };
}

export const AIProposalsHero = React.memo(({ stats }: AIProposalsHeroProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-16 relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-violet-500/10 rounded-3xl blur-3xl"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative">
        <motion.div
          className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
          <span className="text-sm font-medium">AI-Powered Strategy</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-violet-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          AI
          <br />
          <span className="text-primary">Proposals</span>
        </motion.h1>

        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Browse, schedule, and execute AI-generated content proposals — 
          your strategic roadmap to organic growth
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Button
            onClick={() => navigate('/research/content-strategy')}
            className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-white font-semibold px-8 py-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate New Proposals
          </Button>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            className="flex justify-center gap-8 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              { icon: Target, value: stats.total, label: 'Total Proposals', color: 'text-blue-400' },
              { icon: Sparkles, value: stats.available, label: 'Available', color: 'text-emerald-400' },
              { icon: CalendarPlus, value: stats.scheduled, label: 'Scheduled', color: 'text-amber-400' },
              { icon: TrendingUp, value: stats.completed, label: 'Completed', color: 'text-green-400' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Feature Tags */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {[
            { icon: Target, label: 'Keyword Targeting', color: 'from-blue-500/20 to-purple-500/20' },
            { icon: TrendingUp, label: 'Traffic Estimation', color: 'from-green-500/20 to-emerald-500/20' },
            { icon: CalendarPlus, label: 'Calendar Scheduling', color: 'from-orange-500/20 to-red-500/20' },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${feature.color} backdrop-blur-xl rounded-full border border-white/10 shadow-lg`}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, delay: index * 0.1 }}
            >
              <feature.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
});

AIProposalsHero.displayName = 'AIProposalsHero';
