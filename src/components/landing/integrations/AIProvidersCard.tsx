import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, Wind, Route } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import logosImage from '@/assets/logos/integrations-logos.png';

const providers = [
  { name: 'OpenAI', position: '0% 0%', size: '33.33%' },
  { name: 'Anthropic', position: '33.33% 0%', size: '33.33%' },
  { name: 'Gemini', position: '66.66% 0%', size: '33.33%' },
  { name: 'LM Studio', position: '0% 50%', size: '33.33%' },
];

const benefits = [
  'Use your own API keys',
  'No vendor lock-in',
  'Cost-effective scaling',
  'Model flexibility',
];

export const AIProvidersCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <GlassCard className="p-6 h-full hover:shadow-lg transition-all duration-300">
        {/* Icon Container */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-neon-blue p-0.5 mb-4">
          <div className="w-full h-full rounded-lg bg-card flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2">AI Model Freedom</h3>
        <p className="text-sm text-muted-foreground mb-6">Bring Your Own Keys</p>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="aspect-square bg-card/50 border border-border/50 rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              <img
                src={logosImage}
                alt={provider.name}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: provider.position,
                  objectFit: 'none',
                  transform: `scale(${100 / parseFloat(provider.size)})`,
                  transformOrigin: provider.position,
                }}
              />
            </div>
          ))}
          {/* Mistral - Lucide Icon */}
          <div className="aspect-square bg-card/50 border border-border/50 rounded-lg flex items-center justify-center hover:border-primary/30 transition-colors">
            <Wind className="w-8 h-8 text-primary/60" />
          </div>
          {/* OpenRouter - Lucide Icon */}
          <div className="aspect-square bg-card/50 border border-border/50 rounded-lg flex items-center justify-center hover:border-primary/30 transition-colors">
            <Route className="w-8 h-8 text-primary/60" />
          </div>
        </div>

        {/* Benefits */}
        <ul className="space-y-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
};
