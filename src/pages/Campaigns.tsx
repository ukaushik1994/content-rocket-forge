import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { CampaignsHero } from '@/components/campaigns/CampaignsHero';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

const Campaigns = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/campaigns` : '/campaigns';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Campaigns — AI-Powered Multi-Channel Campaign Builder</title>
        <meta 
          name="description" 
          content="Transform one idea into a complete multi-channel campaign strategy with AI-powered content generation across blogs, social media, landing pages, and more." 
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <Navbar />
      
      {/* Animated Background */}
      <AnimatedBackground intensity="medium" />
      
      <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <CampaignsHero />
          
          {/* Placeholder for future content */}
          <div className="text-center text-muted-foreground py-12">
            Campaign builder coming soon...
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Campaigns;
