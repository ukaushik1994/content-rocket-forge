import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategySuggestions } from './tabs/StrategySuggestions';
import { StrategyDashboard } from './dashboard/StrategyDashboard';
import { ROICalculator } from './performance/ROICalculator';
import { StrategyProgressTracker } from './StrategyProgressTracker';
import { GlassCard } from '@/components/ui/GlassCard';

import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { Lightbulb, LayoutDashboard, BarChart2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StrategyTabs = React.memo(() => {
  const { currentStrategy, insights, calendarItems, pipelineItems } = useContentStrategy();
  
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
      'strategies','dashboard','performance','progress'
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
      const legacyTabs = new Set(['calendar', 'pipeline', 'content-gaps']);
      const redirectMap: Record<string, string> = {
        'calendar': '/research/calendar',
        'pipeline': '/research/pipeline',
        'content-gaps': '/research/content-gaps',
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
    <div className="space-y-6">
    <GlassCard className="relative overflow-hidden p-4 sm:p-6 shadow-neon">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/10),transparent_60%)]" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-foreground/80 bg-clip-text text-transparent">
                  Strategy Workspace
                </h3>
                <p className="text-xs text-muted-foreground">Plan, track, and optimize your content strategy</p>
              </div>
            </div>
          </div>
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex min-w-max rounded-full border border-border/60 bg-muted/60 p-1 shadow-inner">
                <TabsTrigger
                  value="strategies"
                  className="rounded-full px-4 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 transition-all hover-scale data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-neon data-[state=active]:ring-1 data-[state=active]:ring-primary/40"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>Strategies</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dashboard"
                  className="rounded-full px-4 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 transition-all hover-scale data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-neon data-[state=active]:ring-1 data-[state=active]:ring-primary/40"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="rounded-full px-4 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 transition-all hover-scale data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-neon data-[state=active]:ring-1 data-[state=active]:ring-primary/40"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>Performance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="progress"
                  className="rounded-full px-4 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 transition-all hover-scale data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-neon data-[state=active]:ring-1 data-[state=active]:ring-primary/40"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Progress</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="strategies" className="animate-enter">
              <div className="space-y-6">
                <StrategySuggestions serpMetrics={serpMetrics} goals={goals} />
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="animate-enter">
              <div className="space-y-6">
                <StrategyDashboard goals={goals} />
              </div>
            </TabsContent>

            <TabsContent value="performance" className="animate-enter">
              <div className="space-y-6">
                <ROICalculator goals={goals} serpMetrics={serpMetrics} />
              </div>
            </TabsContent>

            <TabsContent value="progress" className="animate-enter">
              <div className="space-y-6">
                <StrategyProgressTracker strategy={currentStrategy} goals={goals} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </GlassCard>
    </div>
  );
});