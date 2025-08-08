import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategySuggestions } from './tabs/StrategySuggestions';
import { ContentGapsTab } from './tabs/ContentGapsTab';
import { EditorialCalendar } from './calendar/EditorialCalendar';
import { ContentPipeline } from './pipeline/ContentPipeline';
import { StrategyDashboard } from './dashboard/StrategyDashboard';
import { ROICalculator } from './performance/ROICalculator';
import { StrategyProgressTracker } from './StrategyProgressTracker';


import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { Lightbulb, LayoutDashboard, CalendarDays, GitBranch, BarChart2, FileSearch, TrendingUp } from 'lucide-react';

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

  const counts = React.useMemo(() => ({
    calendar: calendarItems?.length || 0,
    pipeline: pipelineItems?.length || 0,
  }), [calendarItems, pipelineItems]);

  const getInitialTab = () => {
    const allowed = new Set([
      'strategies','dashboard','calendar','pipeline','performance','content-gaps','progress'
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
      if (hash && hash !== activeTab) {
        setActiveTab(hash);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${value}`);
      localStorage.setItem('cs.activeTab', value);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full overflow-x-auto sticky top-16 z-10 backdrop-blur bg-muted/40 p-1 h-auto">
          <TabsTrigger 
            value="strategies" 
            className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale flex-shrink-0 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Strategies</span>
          </TabsTrigger>
          <TabsTrigger 
            value="dashboard" 
            className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale flex-shrink-0 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale flex-shrink-0 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Calendar</span>
            {counts.calendar > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground">{counts.calendar}</span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="pipeline" 
            className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale flex-shrink-0 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <GitBranch className="h-4 w-4" />
            <span>Pipeline</span>
            {counts.pipeline > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground">{counts.pipeline}</span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="opportunities" 
            className="hidden"
          >
            {/* removed */}
            <span>Opportunities</span>
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale flex-shrink-0 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart2 className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger 
            value="content-gaps" 
            className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale flex-shrink-0 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileSearch className="h-4 w-4" />
            <span>Content Gaps</span>
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 hover-scale flex-shrink-0 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Progress</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" forceMount className="animate-fade-in">
          <StrategySuggestions serpMetrics={serpMetrics} goals={goals} />
        </TabsContent>
        
        <TabsContent value="dashboard" forceMount className="animate-fade-in">
          <StrategyDashboard goals={goals} />
        </TabsContent>

        <TabsContent value="calendar" forceMount className="animate-fade-in">
          <EditorialCalendar goals={goals} />
        </TabsContent>

        <TabsContent value="pipeline" forceMount className="animate-fade-in">
          <ContentPipeline goals={goals} />
        </TabsContent>


        <TabsContent value="performance" forceMount className="animate-fade-in">
          <ROICalculator goals={goals} serpMetrics={serpMetrics} />
        </TabsContent>

        <TabsContent value="content-gaps" forceMount className="animate-fade-in">
          <ContentGapsTab serpMetrics={serpMetrics} goals={goals} />
        </TabsContent>

        <TabsContent value="progress" forceMount className="animate-fade-in">
          <StrategyProgressTracker strategy={currentStrategy} goals={goals} />
        </TabsContent>
      </Tabs>
    </div>
  );
});