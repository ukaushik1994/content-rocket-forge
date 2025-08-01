
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategySuggestions } from './tabs/StrategySuggestions';
import { ContentGapsTab } from './tabs/ContentGapsTab';
import { EditorialCalendar } from './calendar/EditorialCalendar';
import { ContentPipeline } from './pipeline/ContentPipeline';
import { StrategyDashboard } from './dashboard/StrategyDashboard';
import { ROICalculator } from './performance/ROICalculator';

interface StrategyTabsProps {
  serpMetrics: any;
  goals: {
    monthlyTraffic: string;
    contentPieces: string;
    timeline: string;
    mainKeyword: string;
  };
}

export const StrategyTabs = ({ serpMetrics, goals }: StrategyTabsProps) => {
  return (
    <Tabs defaultValue="dashboard" className="space-y-8">
      <TabsList className="grid w-full grid-cols-6 h-16 bg-glass border border-white/10 p-1 backdrop-blur-xl">
        <TabsTrigger value="dashboard" className="h-14 text-sm font-medium">
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="strategies" className="h-14 text-sm font-medium">
          Strategies
        </TabsTrigger>
        <TabsTrigger value="gaps" className="h-14 text-sm font-medium">
          Content Gaps
        </TabsTrigger>
        <TabsTrigger value="calendar" className="h-14 text-sm font-medium">
          Calendar
        </TabsTrigger>
        <TabsTrigger value="pipeline" className="h-14 text-sm font-medium">
          Pipeline
        </TabsTrigger>
        <TabsTrigger value="roi" className="h-14 text-sm font-medium">
          ROI
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <StrategyDashboard serpMetrics={serpMetrics} goals={goals} />
      </TabsContent>

      <TabsContent value="strategies">
        <StrategySuggestions serpMetrics={serpMetrics} goals={goals} />
      </TabsContent>

      <TabsContent value="gaps">
        <ContentGapsTab serpMetrics={serpMetrics} goals={goals} />
      </TabsContent>

      <TabsContent value="calendar">
        <EditorialCalendar goals={goals} />
      </TabsContent>

      <TabsContent value="pipeline">
        <ContentPipeline goals={goals} />
      </TabsContent>

      <TabsContent value="roi">
        <ROICalculator goals={goals} serpMetrics={serpMetrics} />
      </TabsContent>
    </Tabs>
  );
};
