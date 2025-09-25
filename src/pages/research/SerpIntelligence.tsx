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
import { SerpABTestingPanel } from '@/components/serp/SerpABTestingPanel';
import { ABTestProvider } from '@/contexts/ABTestContext';

const SerpIntelligence = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/serp-intelligence` 
    : '/research/serp-intelligence';

  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['monitoring', 'performance', 'ab-testing', 'integrations', 'ai-insights'].includes(hash)) {
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

      <AnimatedBackground />
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="p-8">
            <div className="mb-8">
              <motion.h1 
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                SERP Intelligence
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Advanced search engine monitoring, performance analytics, and AI-powered optimization insights
              </motion.p>
            </div>

            <ABTestProvider>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-5 lg:grid-cols-5 mb-8">
                  <TabsTrigger value="monitoring" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span className="hidden sm:inline">Monitoring</span>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="ab-testing" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span className="hidden sm:inline">A/B Testing</span>
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Integrations</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-insights" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">AI Insights</span>
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-6">
                  <TabsContent value="monitoring">
                    <SerpMonitoringDashboard />
                  </TabsContent>

                  <TabsContent value="performance">
                    <SerpMetricsOverview />
                  </TabsContent>

                  <TabsContent value="ab-testing">
                    <SerpABTestingPanel />
                  </TabsContent>

                  <TabsContent value="integrations">
                    <MarketingIntegrationsPanel />
                  </TabsContent>

                  <TabsContent value="ai-insights">
                    <AIWorkflowIntelligence />
                  </TabsContent>
                </div>
              </Tabs>
            </ABTestProvider>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
};

export default SerpIntelligence;