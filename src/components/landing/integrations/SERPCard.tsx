import React from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const benefits = [
  'Real-time SERP data',
  'Competitor analysis',
  'Keyword opportunities',
  'Live search trends',
];

export const SERPCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <GlassCard className="p-6 h-full hover:shadow-lg transition-all duration-300">
        {/* Icon Container */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neon-pink to-neon-orange p-0.5 mb-4">
          <div className="w-full h-full rounded-lg bg-card flex items-center justify-center">
            <Search className="h-6 w-6 text-neon-pink" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2">Web Search Intelligence</h3>
        <p className="text-sm text-muted-foreground mb-6">SERP API Integration</p>

        {/* Large Icon Display */}
        <div className="flex items-center justify-center mb-8 py-8">
          <div className="relative">
            {/* Pulsing Background */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-pink/20 to-neon-orange/20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Icon */}
            <div className="relative bg-gradient-to-br from-neon-pink/10 to-neon-orange/10 border border-neon-pink/20 rounded-2xl p-8">
              <Search className="w-16 h-16 text-neon-pink" />
            </div>
          </div>
        </div>

        {/* Benefits */}
        <ul className="space-y-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-pink flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
};
