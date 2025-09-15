import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Star, Target, Zap, BarChart3 } from 'lucide-react';

const features = [
  { icon: TrendingUp, label: 'SEO Optimization', value: '98%', color: 'text-green-400' },
  { icon: Users, label: 'Engagement Rate', value: '5.2x', color: 'text-blue-400' },
  { icon: Target, label: 'Conversion Rate', value: '+340%', color: 'text-purple-400' },
];

const liveStats = [
  { label: 'Content Generated', value: '1,247,892', trend: '+12%' },
  { label: 'Active Users', value: '10,234', trend: '+8%' },
  { label: 'Success Rate', value: '94.7%', trend: '+2%' },
];

export const LeftSidePanel = () => {
  return (
    <div className="absolute left-8 top-1/2 -translate-y-1/2 space-y-6 hidden xl:block">
      {/* Feature Cards */}
      <div className="space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            className="bg-background/10 backdrop-blur-xl rounded-xl p-4 border border-border/20 shadow-lg min-w-[200px]"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            whileHover={{ scale: 1.05, x: 10 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  <p className={`text-lg font-bold ${feature.color}`}>{feature.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Stats Dashboard */}
      <motion.div
        className="bg-background/10 backdrop-blur-xl rounded-xl p-4 border border-border/20 shadow-lg min-w-[200px]"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Live Analytics</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-2">
          {liveStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className="text-right">
                <p className="text-xs font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-green-400">{stat.trend}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};