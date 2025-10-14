import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AIProvidersCard } from './integrations/AIProvidersCard';
import { AnalyticsCard } from './integrations/AnalyticsCard';
import { SERPCard } from './integrations/SERPCard';

export const IntegrationsHub: React.FC = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <Container className="relative z-10 backdrop-blur-[2px]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Integrations
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Integrations{' '}
            <span className="bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent">
              for Enterprise Teams
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect your existing tools and workflows for seamless content creation
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <AIProvidersCard />
          <AnalyticsCard />
          <SERPCard />
        </div>
      </Container>
    </section>
  );
};
