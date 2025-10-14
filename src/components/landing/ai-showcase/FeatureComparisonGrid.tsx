import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, CheckCircle2, Brain, Zap } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Speed',
    metrics: ['Insights in seconds', 'Real-time analysis'],
    color: 'text-primary'
  },
  {
    icon: CheckCircle2,
    title: 'Accuracy',
    metrics: ['95%+ data confidence', 'SERP-backed metrics'],
    color: 'text-success'
  },
  {
    icon: Brain,
    title: 'Intelligence',
    metrics: ['Multi-chart perspectives', 'Contextual actions'],
    color: 'text-neon-blue'
  },
  {
    icon: Gauge,
    title: 'Automation',
    metrics: ['Zero manual research', 'Auto-scheduling'],
    color: 'text-neon-pink'
  }
];

export const FeatureComparisonGrid = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="mt-16 md:mt-24"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold mb-3">
          Built for Performance
        </h3>
        <p className="text-muted-foreground">
          Four pillars of AI-powered content intelligence
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <div className={`mb-4 ${feature.color}`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <ul className="space-y-2">
                {feature.metrics.map((metric, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
