import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { AIProvidersCard } from './integrations/AIProvidersCard';
import { AnalyticsCard } from './integrations/AnalyticsCard';
import { SERPCard } from './integrations/SERPCard';
export const IntegrationsHub: React.FC = () => {
  return <section className="relative py-20 overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => <motion.div key={i} className="absolute w-1 h-1 bg-primary/30 rounded-full" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.6, 0.3]
      }} transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2
      }} />)}
      </div>

      <Container className="relative z-10">
        {/* Section Header with Badge */}
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
      }} className="text-center mb-16">
          {/* Glowing Badge */}
          

          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Connect Your Entire Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seamlessly integrate with industry-leading platforms to supercharge your content creation workflow
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AIProvidersCard />
          <AnalyticsCard />
          <SERPCard />
        </div>

        {/* Bottom Highlight Bar */}
        
      </Container>
    </section>;
};