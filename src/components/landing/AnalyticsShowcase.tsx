import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Eye, DollarSign, ArrowRight, Sparkles, Brain } from 'lucide-react';

const stats = [
  { label: 'Impressions', value: '24.8K', icon: Eye, change: '+18%' },
  { label: 'Click Rate', value: '4.2%', icon: TrendingUp, change: '+0.8%' },
  { label: 'Content Score', value: '92', icon: Brain, change: '+5' },
  { label: 'ROI', value: '3.4x', icon: DollarSign, change: '+0.6x' },
];

const features = [
  {
    title: 'Performance Dashboards',
    desc: 'Real-time metrics across all content and campaigns in one unified view.',
  },
  {
    title: 'Content Insights',
    desc: 'AI identifies what\'s working and what to improve — actionable, not just data.',
  },
  {
    title: 'ROI Tracking',
    desc: 'Measure content investment against business outcomes with attribution modeling.',
  },
];

export const AnalyticsShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-orange/10 border border-neon-orange/20 text-neon-orange text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            Analytics & Insights
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Data-Driven Decisions,{' '}
            <span className="bg-gradient-to-r from-neon-orange to-neon-pink bg-clip-text text-transparent">
              Instantly
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time dashboards, AI-powered insights, and ROI tracking — know exactly what's driving results.
          </p>
        </motion.div>

        {/* Wide Mock Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto mb-12"
        >
          <div className="absolute -inset-4 bg-gradient-to-br from-neon-orange/10 to-neon-pink/10 blur-3xl rounded-3xl" />
          <div className="relative rounded-2xl border border-neon-orange/20 bg-white/[0.04] backdrop-blur-xl p-6 md:p-8">
            {/* Window dots */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">Analytics Dashboard</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-neon-orange/5 border border-neon-orange/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="h-4 w-4 text-neon-orange/60" />
                    <span className="text-xs text-success font-medium">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Mock Chart */}
            <div className="h-32 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-end justify-around px-6 pb-4">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div
                  key={i}
                  className="w-4 md:w-6 rounded-t bg-gradient-to-t from-neon-orange/40 to-neon-orange/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl border border-neon-orange/10 bg-white/[0.03] backdrop-blur-md hover:border-neon-orange/25 transition-all duration-300"
            >
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-gradient-to-r from-neon-orange to-neon-pink hover:from-neon-orange/90 hover:to-neon-pink/90 shadow-lg transition-all duration-300 group"
          >
            See Your Analytics
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </Container>
    </section>
  );
};
