import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/GlassCard';
import { useContentStrategyOptional } from '@/contexts/ContentStrategyContext';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Calendar as CalendarIcon,
  BarChart3
} from 'lucide-react';
import { StrategyOverview } from './StrategyOverview';
import { StrategySuggestions } from '../tabs/StrategySuggestions';
import { EditorialCalendar } from '../calendar/EditorialCalendar';
import { StrategyDashboard } from '../dashboard/StrategyDashboard';
import { useAnalyticsConnection } from '@/hooks/useAnalyticsConnection';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';

interface ContentStrategyTabsProps {
  onEditGoals: () => void;
}

export const ContentStrategyTabs: React.FC<ContentStrategyTabsProps> = ({ onEditGoals }) => {
  const ctx = useContentStrategyOptional();
  const analyticsConnection = useAnalyticsConnection();
  const { metrics, contentAnalytics, loading: analyticsLoading } = useRealAnalytics('30days');
  
  if (!ctx) {
    return null;
  }

  const { currentStrategy, insights } = ctx;
  
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

  const getInitialTab = () => {
    const allowed = new Set([
      'overview', 'strategies', 'calendar', 'dashboard'
    ]);
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && allowed.has(hash)) return hash;
      const stored = localStorage.getItem('cs.activeTab');
      if (stored && allowed.has(stored)) return stored;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = React.useState<string>(getInitialTab);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== activeTab) {
        setActiveTab(hash);
      }
    }
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${value}`);
      localStorage.setItem('cs.activeTab', value);
    }
  };

  const navigateToTab = (tab: string) => {
    handleTabChange(tab);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex flex-col gap-6">
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex min-w-max rounded-lg border border-border/50 bg-muted/50 p-1">
                <TabsTrigger
                  value="overview"
                  className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="strategies"
                  className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>AI Proposals</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>Calendar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dashboard"
                  className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="animate-fade-in">
              <StrategyOverview
                onEditGoals={onEditGoals}
                onNavigateToStrategies={() => navigateToTab('strategies')}
                onNavigateToCalendar={() => navigateToTab('calendar')}
              />
            </TabsContent>

            <TabsContent value="strategies" className="animate-fade-in">
              <div className="space-y-6">
                <StrategySuggestions serpMetrics={serpMetrics} goals={goals} />
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="animate-fade-in">
              <div className="space-y-6">
                <EditorialCalendar goals={goals} />
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
};