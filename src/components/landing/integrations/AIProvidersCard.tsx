import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Check } from 'lucide-react';
import { ProviderLogo } from '@/components/ui/provider-logo';

const providers = [
  { name: 'OpenAI', id: 'openai' as const },
  { name: 'Anthropic', id: 'anthropic' as const },
  { name: 'Gemini', id: 'gemini' as const },
  { name: 'LM Studio', id: 'lmstudio' as const },
  { name: 'Mistral', id: 'mistral' as const },
  { name: 'OpenRouter', id: 'openrouter' as const },
];

const benefits = [
  'Use your own API keys',
  'Model flexibility',
];

export const AIProvidersCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
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
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Brain className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-foreground">AI Provider Freedom</h3>
              <p className="text-xs text-muted-foreground">Bring Your Own Keys</p>
            </div>
          </div>

          {/* Provider Logos Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="relative p-3 bg-card/50 border border-border/50 rounded-xl cursor-pointer backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-2">
                  <ProviderLogo 
                    provider={provider.id} 
                    size="lg" 
                    className="transition-transform duration-300"
                  />
                  <div className="text-[10px] font-semibold text-muted-foreground leading-tight text-center">
                    {provider.name}
                  </div>
                </div>
              </motion.div>
            ))}
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
