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
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="p-6 rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl"
        >
          <feature.icon className={`h-8 w-8 ${feature.color} mb-4`} />
          <h4 className="font-bold mb-3">{feature.title}</h4>
          <ul className="space-y-2">
            {feature.metrics.map((metric, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                {metric}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
};