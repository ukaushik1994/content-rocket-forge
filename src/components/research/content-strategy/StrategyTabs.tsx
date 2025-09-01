import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategySuggestions } from './tabs/StrategySuggestions';
import { StrategyDashboard } from './dashboard/StrategyDashboard';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';

import { useContentStrategyOptional } from '@/contexts/ContentStrategyContext';
import { Lightbulb, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileOptimizedTabs } from './MobileOptimizedTabs';
import { AccessibilityEnhancements } from './AccessibilityEnhancements';
import { PerformanceOptimizedLayout } from './PerformanceOptimizedLayout';

export const StrategyTabs = React.memo(() => {
  const ctx = useContentStrategyOptional();
  if (!ctx) {
    return null;
  }
  const { currentStrategy, insights, calendarItems, pipelineItems } = ctx;
  
  // Memoize expensive calculations
  const serpMetrics = React.useMemo(() => 
    insights.find(insight => 
      insight.keyword === currentStrategy?.main_keyword
    )?.serp_data || null,
    [insights, currentStrategy?.main_keyword]
  );

  const goals = React.useMemo(() => ({
    monthlyTraffic: currentStrategy?.monthly_traffic_goal?.toString() || '',
    contentPieces: currentStrategy?.content_pieces_per_month?.toString() || '',
    timeline: currentStrategy?.timeline || '3 months',
    mainKeyword: currentStrategy?.main_keyword || ''
  }), [currentStrategy]);

  // Removed counts for calendar/pipeline as they moved to standalone pages

  const getInitialTab = () => {
    const allowed = new Set([
      'strategies','dashboard'
    ]);
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && allowed.has(hash)) return hash;
      const stored = localStorage.getItem('cs.activeTab');
      if (stored && allowed.has(stored)) return stored;
    }
    return 'strategies';
  };

  const [activeTab, setActiveTab] = React.useState<string>(getInitialTab);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const stored = localStorage.getItem('cs.activeTab') || '';
      const legacyTabs = new Set(['calendar', 'pipeline', 'content-gaps', 'performance', 'progress']);
      const redirectMap: Record<string, string> = {
        'calendar': '/research/calendar',
        'pipeline': '/research/pipeline',
        'content-gaps': '/research/content-gaps',
        'performance': '#dashboard',
        'progress': '#dashboard'
      };
      const legacy = legacyTabs.has(hash) ? hash : (legacyTabs.has(stored) ? stored : '');
      if (legacy) {
        localStorage.removeItem('cs.activeTab');
        navigate(redirectMap[legacy], { replace: true });
        return;
      }
      if (hash && hash !== activeTab) {
        setActiveTab(hash);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${value}`);
      localStorage.setItem('cs.activeTab', value);
    }
  };

  return (
    <AccessibilityEnhancements enableKeyboardNav enableHighContrast>
      <PerformanceOptimizedLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-4 sm:p-6 lg:p-8 glass-card">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex flex-col gap-6 lg:gap-8">
                  {/* Mobile-Optimized Tab Navigation */}
                  <MobileOptimizedTabs 
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    className="w-full"
                  />

                  {/* Enhanced Tab Content with Stagger Animations */}
                  <TabsContent value="strategies" className="m-0" role="tabpanel" aria-labelledby="strategies-tab">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <StrategySuggestions serpMetrics={serpMetrics} goals={goals} />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="dashboard" className="m-0" role="tabpanel" aria-labelledby="dashboard-tab">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <StrategyDashboard goals={goals} strategy={currentStrategy} />
                    </motion.div>
                  </TabsContent>
                </div>
              </Tabs>
            </GlassCard>
          </motion.div>
        </div>
      </PerformanceOptimizedLayout>
    </AccessibilityEnhancements>
  );
});