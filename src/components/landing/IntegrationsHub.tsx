import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { AIProvidersCard } from './integrations/AIProvidersCard';
import { AnalyticsCard } from './integrations/AnalyticsCard';
import { SERPCard } from './integrations/SERPCard';
import { FloatingElements } from './FloatingElements';
import { Zap, Link, Database } from 'lucide-react';
export const IntegrationsHub: React.FC = () => {
  const floatingElements = [
    { icon: <Zap className="h-5 w-5" />, position: { top: '20%', left: '8%' }, delay: 0, duration: 7 },
    { icon: <Link className="h-4 w-4" />, position: { top: '60%', right: '10%' }, delay: 1.5, duration: 6 },
    { icon: <Database className="h-5 w-5" />, position: { top: '75%', left: '12%' }, delay: 2, duration: 8 },
  ];

  return <section className="py-8 px-4 relative overflow-hidden">
      <FloatingElements elements={floatingElements} />

      <Container className="relative z-10 backdrop-blur-[2px]">
        {/* Section Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Powerful Integrations
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Connect AI providers, analytics, and search tools in one platform
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <AIProvidersCard />
          <AnalyticsCard />
          <SERPCard />
        </div>

        {/* Bottom Highlight Bar */}
        
      </Container>
    </section>;
};