import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategySuggestions } from './tabs/StrategySuggestions';
import { ContentGapsTab } from './tabs/ContentGapsTab';
import { EditorialCalendar } from './calendar/EditorialCalendar';
import { ContentPipeline } from './pipeline/ContentPipeline';
import { StrategyDashboard } from './dashboard/StrategyDashboard';
import { ROICalculator } from './performance/ROICalculator';
import { StrategyProgressTracker } from './StrategyProgressTracker';
import { OpportunityHunter } from './opportunity/OpportunityHunter';

import { useContentStrategy } from '@/contexts/ContentStrategyContext';

export const StrategyTabs = React.memo(() => {
  const { currentStrategy, insights } = useContentStrategy();
  
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="strategies" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted/30 p-1 h-auto">
          <TabsTrigger 
            value="strategies" 
            className="px-2 py-3 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Strategies
          </TabsTrigger>
          <TabsTrigger 
            value="dashboard" 
            className="px-2 py-3 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="px-2 py-3 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger 
            value="pipeline" 
            className="px-2 py-3 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Pipeline
          </TabsTrigger>
          <TabsTrigger 
            value="opportunities" 
            className="px-2 py-3 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Opportunities
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="px-2 py-3 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies">
          <StrategySuggestions serpMetrics={serpMetrics} goals={goals} />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <StrategyDashboard goals={goals} />
        </TabsContent>

        <TabsContent value="calendar">
          <EditorialCalendar goals={goals} />
        </TabsContent>

        <TabsContent value="pipeline">
          <ContentPipeline goals={goals} />
        </TabsContent>

        <TabsContent value="opportunities">
          <OpportunityHunter />
        </TabsContent>

        <TabsContent value="performance">
          <ROICalculator goals={goals} serpMetrics={serpMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
});