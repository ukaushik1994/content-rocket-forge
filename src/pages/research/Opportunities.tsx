import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, BarChart3, Zap, Search } from 'lucide-react';
import { OpportunityHunter } from '@/components/research/content-strategy/opportunity/OpportunityHunter';
import { AuroraBackdrop } from '@/components/ui/AuroraBackdrop';

const OpportunitiesPage: React.FC = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/opportunities` 
    : '/research/opportunities';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Content Opportunities — Discover and Plan</title>
        <meta name="description" content="Discover high-impact content opportunities from SERP intelligence. Filter, brief, schedule, and track in one place." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />

      {/* Interactive Aurora Backdrop */}
      <AuroraBackdrop className="absolute inset-0 z-0" />

      <main className="flex-1 container py-10 z-10 relative max-w-7xl mx-auto">
        {/* Hero inspired by Content Builder Step 1 */}
        <motion.section 
          className="text-center mb-10 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative">
            <motion.div 
              className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-6"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered Opportunity Hunter</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
            >
              Content Opportunities
            </motion.h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Scan, prioritize, brief, and schedule opportunities sourced from SERP insights and your strategy.
            </p>

            {/* Quick stats */}
            <div className="flex justify-center gap-6">
              {[{Icon: TrendingUp, label: 'High Priority', value: 'auto'}, {Icon: BarChart3, label: 'Signals', value: 'multi'}, {Icon: Zap, label: 'Real-time', value: 'live'}].map(({Icon, label}, idx) => (
                <motion.div key={label} className="text-center" whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Full module */}
        <section aria-labelledby="opportunities-heading">
          <h2 id="opportunities-heading" className="sr-only">Opportunities Module</h2>
          <OpportunityHunter />
        </section>
      </main>
    </div>
  );
};

export default OpportunitiesPage;
