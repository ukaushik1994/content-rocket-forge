import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/GlassCard';
import { Monitor, BarChart3, Zap, TrendingUp } from 'lucide-react';
import { SerpMonitoringDashboard } from '@/components/serp/SerpMonitoringDashboard';
import { SerpMetricsOverview } from '@/components/serp/SerpMetricsOverview';
import { MarketingIntegrationsPanel } from '@/components/serp/MarketingIntegrationsPanel';
import { AIWorkflowIntelligence } from '@/components/serp/AIWorkflowIntelligence';

const SerpIntelligence = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/serp-intelligence` 
    : '/research/serp-intelligence';

  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['monitoring', 'performance', 'integrations', 'ai-insights'].includes(hash)) {
        return hash;
      }
      return localStorage.getItem('serpIntelligenceActiveTab') || 'monitoring';
    }
    return 'monitoring';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('serpIntelligenceActiveTab', value);
      window.location.hash = value;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>SERP Intelligence — Real-time Search Engine Monitoring & Analytics</title>
        <meta name="description" content="Advanced SERP monitoring, performance analytics, AI-powered insights, and marketing integrations for comprehensive search intelligence." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <Navbar />
      <AnimatedBackground intensity="medium" />
      
      <main className="flex-1 container pt-24 pb-8 z-10 relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-heading font-bold text-foreground"
            >
              SERP Intelligence Platform
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Real-time SERP monitoring, performance analytics, AI insights, and marketing integrations
            </motion.p>
          </div>

          {/* Main Dashboard */}
          <GlassCard className="p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className="flex flex-col gap-6">
                <div className="w-full overflow-x-auto">
                  <TabsList className="inline-flex min-w-max rounded-lg border border-border/50 bg-muted/50 p-1">
                    <TabsTrigger 
                      value="monitoring" 
                      className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                    >
                      <Monitor className="h-4 w-4" />
                      Real-time Monitoring
                    </TabsTrigger>
                    <TabsTrigger 
                      value="performance" 
                      className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Performance Analytics
                    </TabsTrigger>
                    <TabsTrigger 
                      value="ai-insights" 
                      className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                    >
                      <TrendingUp className="h-4 w-4" />
                      AI Insights
                    </TabsTrigger>
                    <TabsTrigger 
                      value="integrations" 
                      className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                    >
                      <Zap className="h-4 w-4" />
                      Marketing Integrations
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1">
                  <TabsContent value="monitoring" className="mt-0 animate-fade-in">
                    <SerpMonitoringDashboard />
                  </TabsContent>

                  <TabsContent value="performance" className="mt-0 animate-fade-in">
                    <SerpMetricsOverview />
                  </TabsContent>

                  <TabsContent value="ai-insights" className="mt-0 animate-fade-in">
                    <AIWorkflowIntelligence />
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-0 animate-fade-in">
                    <MarketingIntegrationsPanel />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
};

export default SerpIntelligence;