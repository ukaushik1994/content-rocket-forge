import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, CheckCircle2, Brain, Zap } from 'lucide-react';
const features = [{
  icon: Zap,
  title: 'Speed',
  metrics: ['Insights in seconds', 'Real-time analysis'],
  color: 'text-primary'
}, {
  icon: CheckCircle2,
  title: 'Accuracy',
  metrics: ['95%+ data confidence', 'SERP-backed metrics'],
  color: 'text-success'
}, {
  icon: Brain,
  title: 'Intelligence',
  metrics: ['Multi-chart perspectives', 'Contextual actions'],
  color: 'text-neon-blue'
}, {
  icon: Gauge,
  title: 'Automation',
  metrics: ['Zero manual research', 'Auto-scheduling'],
  color: 'text-neon-pink'
}];
export const FeatureComparisonGrid = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">
          Built for Performance
        </h3>
        <p className="text-sm text-muted-foreground">
          Engineered for speed, accuracy, and intelligence
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 hover:border-primary/30 transition-all"
          >
            <feature.icon className={`h-8 w-8 ${feature.color} mb-3`} />
            <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
            <ul className="space-y-1">
              {feature.metrics.map((metric, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                  <span className="text-primary mt-1">•</span>
                  {metric}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};