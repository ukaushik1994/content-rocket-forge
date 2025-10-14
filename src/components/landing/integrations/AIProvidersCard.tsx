import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Check } from 'lucide-react';

const providers = [
  { name: 'OpenAI', color: 'from-green-400 to-green-600' },
  { name: 'Anthropic', color: 'from-orange-400 to-orange-600' },
  { name: 'Gemini', color: 'from-blue-400 to-blue-600' },
  { name: 'LM Studio', color: 'from-purple-400 to-purple-600' },
  { name: 'Mistral', color: 'from-pink-400 to-pink-600' },
  { name: 'OpenRouter', color: 'from-yellow-400 to-yellow-600' },
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
      className="group relative h-full"
    >
      {/* Glowing Border Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-neon-blue to-primary rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-500" />
      
      {/* Card Content */}
      <div className="relative h-full bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.3),transparent_50%)]" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="p-3 bg-gradient-to-br from-primary/20 to-neon-blue/20 rounded-xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Brain className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground">AI Provider Freedom</h3>
              <p className="text-sm text-muted-foreground">Bring Your Own Keys</p>
            </div>
          </div>

          {/* Provider Logos Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className={`relative p-4 bg-gradient-to-br ${provider.color} rounded-xl cursor-pointer shadow-lg`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {provider.name.charAt(0)}
                  </div>
                  <div className="text-[10px] font-semibold text-white/90 leading-tight">
                    {provider.name}
                  </div>
                </div>
                
                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rounded-xl"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
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
