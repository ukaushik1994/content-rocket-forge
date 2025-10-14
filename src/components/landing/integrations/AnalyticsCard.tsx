import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import logosImage from '@/assets/logos/integrations-logos.png';

const benefits = [
  'Real-time performance tracking',
  'SEO insights & rankings',
  'User behavior analytics',
  'Data-driven optimization',
];

export const AnalyticsCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <GlassCard className="p-6 h-full hover:shadow-lg transition-all duration-300">
        {/* Icon Container */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-neon-blue to-neon-pink p-0.5 mb-4">
          <div className="w-full h-full rounded-lg bg-card flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-neon-blue" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2">Analytics Tracking</h3>
        <p className="text-sm text-muted-foreground mb-6">Performance Insights</p>

        {/* Logo Grid - GA4 & GSC */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* GA4 Logo */}
          <div className="aspect-square bg-card/50 border border-border/50 rounded-lg overflow-hidden hover:border-neon-blue/30 transition-colors">
            <img
              src={logosImage}
              alt="Google Analytics 4"
              className="w-full h-full object-cover"
              style={{
                objectPosition: '33.33% 50%',
                objectFit: 'none',
                transform: 'scale(3)',
                transformOrigin: '33.33% 50%',
              }}
            />
          </div>
          
          {/* GSC Logo */}
          <div className="aspect-square bg-card/50 border border-border/50 rounded-lg overflow-hidden hover:border-neon-pink/30 transition-colors">
            <img
              src={logosImage}
              alt="Google Search Console"
              className="w-full h-full object-cover"
              style={{
                objectPosition: '66.66% 50%',
                objectFit: 'none',
                transform: 'scale(3)',
                transformOrigin: '66.66% 50%',
              }}
            />
          </div>
        </div>

        {/* Benefits */}
        <ul className="space-y-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-neon-blue flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
};
