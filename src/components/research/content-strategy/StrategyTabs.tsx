import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategySuggestions } from './tabs/StrategySuggestions';
import { StrategyDashboard } from './dashboard/StrategyDashboard';
import { GlassCard } from '@/components/ui/GlassCard';
import { useContentStrategyOptional } from '@/contexts/ContentStrategyContext';
import { Lightbulb, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsConnection } from '@/hooks/useAnalyticsConnection';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

export const StrategyTabs = React.memo(() => {
  const ctx = useContentStrategyOptional();
  const navigate = useNavigate();
  const analyticsConnection = useAnalyticsConnection();
  const { loading: analyticsLoading } = useAnalyticsData();
  const metrics = null;
  const contentAnalytics: any[] = [];
  
  if (!ctx) {
    return null;
  }
  const { currentStrategy, insights, calendarItems, pipelineItems } = ctx;
  
  const [workflowMode, setWorkflowMode] = React.useState<'estimated' | 'real'>('estimated');
  const canUseRealData = analyticsConnection.hasAnyAnalytics && analyticsConnection.hasPublishedContent;
  
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
    <div className="space-y-6">
      <GlassCard className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex flex-col gap-6">
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex min-w-max rounded-lg border border-border/50 bg-muted/50 p-1">
                <TabsTrigger
                  value="strategies"
                  className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>Strategies</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dashboard"
                  className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="strategies" className="animate-fade-in">
              <div className="space-y-6">
                <StrategySuggestions serpMetrics={serpMetrics} goals={goals} />
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="animate-fade-in">
              <div className="space-y-6">
                <StrategyDashboard 
                  goals={goals} 
                  strategy={currentStrategy}
                  workflowMode={workflowMode}
                  realAnalytics={workflowMode === 'real' && canUseRealData ? {
                    metrics,
                    contentAnalytics,
                    loading: analyticsLoading
                  } : undefined}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </GlassCard>
    </div>
  );
});