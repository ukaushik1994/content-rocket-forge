import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Check } from 'lucide-react';

const benefits = [
  'Real-time performance tracking',
  'SEO insights & rankings',
];

export const AnalyticsCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="group relative h-full"
    >
      {/* Glowing Border Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/40 rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-500" />
      
      {/* Card Content */}
      <div className="relative h-full bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-5 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.3),transparent_50%)]" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="p-3 bg-primary/20 rounded-xl"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <BarChart3 className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Analytics Integration</h3>
              <p className="text-xs text-muted-foreground">GA4 & Search Console</p>
            </div>
          </div>

          {/* Analytics Logos */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-blue-500/5 rounded-xl border border-blue-500/20 backdrop-blur-sm"
            >
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-2">
                  GA4
                </div>
                <div className="text-xs text-muted-foreground">Google Analytics</div>
              </div>
              
              {/* Mini Chart Animation */}
              <div className="mt-4 flex items-end justify-center gap-1 h-12">
                {[40, 60, 45, 75, 55, 80].map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-2 bg-blue-500/60 rounded-t"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-purple-500/5 rounded-xl border border-purple-500/20 backdrop-blur-sm"
            >
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent mb-2">
                  GSC
                </div>
                <div className="text-xs text-muted-foreground">Search Console</div>
              </div>
              
              {/* Trend Line Animation */}
              <div className="mt-4 flex items-center justify-center h-12">
                <motion.div
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5 }}
                >
                  <TrendingUp className="w-16 h-16 text-purple-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Benefits List */}
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <div className="p-1 bg-primary/20 rounded-full">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-muted-foreground">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
