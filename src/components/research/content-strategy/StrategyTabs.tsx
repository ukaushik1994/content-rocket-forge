
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategySuggestions } from './tabs/StrategySuggestions';
import { ContentGapsTab } from './tabs/ContentGapsTab';
import { TopicClustersTab } from './tabs/TopicClustersTab';

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
    <Tabs defaultValue="strategies" className="space-y-8">
      <TabsList className="grid w-full grid-cols-3 h-16 bg-glass border border-white/10 p-1 backdrop-blur-xl">
        <TabsTrigger value="strategies" className="h-14 text-base font-medium">
          Strategy Suggestions
        </TabsTrigger>
        <TabsTrigger value="gaps" className="h-14 text-base font-medium">
          Content Gaps
        </TabsTrigger>
        <TabsTrigger value="clusters" className="h-14 text-base font-medium">
          Topic Clusters
        </TabsTrigger>
      </TabsList>

      <TabsContent value="strategies">
        <StrategySuggestions serpMetrics={serpMetrics} goals={goals} />
      </TabsContent>

      <TabsContent value="gaps">
        <ContentGapsTab serpMetrics={serpMetrics} goals={goals} />
      </TabsContent>

      <TabsContent value="clusters">
        <TopicClustersTab serpMetrics={serpMetrics} goals={goals} />
      </TabsContent>
    </Tabs>
  );
};
