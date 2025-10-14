import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Check, X, TrendingUp, Minus } from 'lucide-react';

export const ComparisonTable = () => {
  const comparisons = [
    { feature: 'Content Quality', generic: 'Same for everyone', creaiter: 'Improves specifically for YOU', highlight: true },
    { feature: 'Learning Capability', generic: 'No learning', creaiter: 'Learns from YOUR results', highlight: true },
    { feature: 'Performance Tracking', generic: 'None built-in', creaiter: 'Real-time analytics dashboard' },
    { feature: 'Audience Understanding', generic: 'Generic prompts', creaiter: 'Personalized to YOUR audience' },
    { feature: 'Strategy Guidance', generic: 'You figure it out', creaiter: 'AI Strategy Coach guides you' },
    { feature: 'SERP Research', generic: 'Manual process', creaiter: 'Automated & integrated' },
    { feature: 'Content Repository', generic: 'Not included', creaiter: 'Smart hub with repurposing' },
    { feature: 'Over Time', generic: 'Stays the same', creaiter: 'Gets exponentially better', highlight: true },
    { feature: 'Your 100th Post', generic: 'Same quality as 1st', creaiter: '300% better than 1st', highlight: true }
  ];

  return (
    <section className="py-20 px-4 relative">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            CreAiter vs
            <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-clip-text text-transparent"> Generic AI Tools</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            The difference? We learn. They don't.
          </motion.p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <GlassCard className="p-0 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-background/50 to-background/20 border-b border-border/50">
              <div className="text-sm font-medium text-muted-foreground">Feature</div>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Generic AI Tools</div>
                <div className="text-xs text-muted-foreground">(ChatGPT, Jasper, etc.)</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent mb-1">CreAiter</div>
                <div className="text-xs text-primary">Self-Learning Engine</div>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border/50">
              {comparisons.map((row, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`grid grid-cols-3 gap-4 p-4 ${row.highlight ? 'bg-primary/5' : ''}`}
                >
                  <div className="text-sm font-medium flex items-center">
                    {row.feature}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <X className="h-4 w-4 text-destructive flex-shrink-0" />
                    <span className="text-center">{row.generic}</span>
                  </div>
                  <div className="text-sm flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-center font-medium text-primary">{row.creaiter}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Visual Comparison Graphs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto"
        >
          {/* Generic AI - Flat Line */}
          <GlassCard className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Generic AI Tools</h3>
              <p className="text-sm text-muted-foreground">No improvement over time</p>
            </div>
            <div className="h-32 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-lg border border-destructive/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-1/2 left-4 right-4 h-0.5 bg-destructive/50" />
              <Minus className="h-8 w-8 text-destructive/60" />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Post 1 = Post 100 (Same quality)
            </p>
          </GlassCard>

          {/* CreAiter - Exponential Curve */}
          <GlassCard className="p-6 border-primary/30">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">CreAiter Learning Engine</h3>
              <p className="text-sm text-primary">Exponential improvement</p>
            </div>
            <div className="h-32 bg-gradient-to-br from-primary/10 to-neon-blue/10 rounded-lg border border-primary/20 flex items-center justify-center relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
                <path
                  d="M 10 90 Q 50 80, 70 50 T 190 10"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
              </svg>
              <TrendingUp className="h-8 w-8 text-primary relative z-10" />
            </div>
            <p className="text-xs text-primary text-center mt-3">
              Post 100 = 300% better than Post 1
            </p>
          </GlassCard>
        </motion.div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-xl font-medium text-muted-foreground max-w-3xl mx-auto">
            "Other AI tools are like renting a car. CreAiter is like buying a Tesla that updates itself."
          </p>
        </motion.div>
      </Container>
    </section>
  );
};
