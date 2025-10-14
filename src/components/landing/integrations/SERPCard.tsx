import React from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Check, Globe, TrendingUp } from 'lucide-react';

const benefits = [
  'Real-time SERP data',
  'Competitor analysis',
];

const mockSearchResults = [
  { position: 1, trend: 'up' },
  { position: 2, trend: 'up' },
  { position: 3, trend: 'neutral' },
];

export const SERPCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="group relative h-full"
    >
      {/* Glowing Border Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-violet-500/40 rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-500" />
      
      {/* Card Content */}
      <div className="relative h-full bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-5 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.3),transparent_50%)]" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="p-3 bg-violet-500/20 rounded-xl relative"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Search className="w-6 h-6 text-violet-500 relative z-10" />
              
              {/* Ripple Effect */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-violet-500/30"
                animate={{
                  scale: [1, 1.5, 1.5],
                  opacity: [0.5, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Real-Time Web Search</h3>
              <p className="text-xs text-muted-foreground">SERP API Integration</p>
            </div>
          </div>

          {/* Live Search Simulation */}
          <div className="mb-6 space-y-3">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-3 bg-gradient-to-r from-violet-500/10 to-violet-500/5 rounded-lg border border-violet-500/20 flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-violet-500" />
              <div className="flex-1 text-sm text-muted-foreground">
                Searching live web data...
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4 text-violet-500" />
              </motion.div>
            </motion.div>

            {/* Mock Results */}
            <div className="space-y-2">
              {mockSearchResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="p-3 bg-gradient-to-r from-background/50 to-background/30 rounded-lg border border-border/50 backdrop-blur-sm flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    #{result.position}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gradient-to-r from-violet-500/20 to-transparent rounded-full mb-1" />
                    <div className="h-2 bg-gradient-to-r from-violet-500/10 to-transparent rounded-full w-2/3" />
                  </div>
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <TrendingUp className="w-4 h-4 text-violet-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
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
                <div className="p-1 bg-violet-500/20 rounded-full">
                  <Check className="w-3 h-3 text-violet-500" />
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
