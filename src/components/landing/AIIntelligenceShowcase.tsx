import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { TabSwitcher } from './ai-showcase/TabSwitcher';
import { AIChatDemo } from './ai-showcase/AIChatDemo';
import { AIProposalDemo } from './ai-showcase/AIProposalDemo';
import { FeatureComparisonGrid } from './ai-showcase/FeatureComparisonGrid';
import { motion } from 'framer-motion';

export const AIIntelligenceShowcase = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'proposals'>('chat');

  return (
    <section className="relative py-16 md:py-24 backdrop-blur-[2px]">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-clip-text text-transparent">
            Your AI-Powered Intelligence Layer
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Two AI systems that think, analyze, and create—so you can focus on what matters
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Demo Content */}
        <div className="mt-8 md:mt-12">
          {activeTab === 'chat' ? <AIChatDemo /> : <AIProposalDemo />}
        </div>

        {/* Feature Comparison Grid */}
        <FeatureComparisonGrid />
      </Container>
    </section>
  );
};
