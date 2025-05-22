
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabSelectorProps {
  selectedTab: string;
  onTabChange: (value: string) => void;
  contentCount: number;
  draftsCount: number;
  publishedCount: number;
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  selectedTab,
  onTabChange,
  contentCount,
  draftsCount,
  publishedCount
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <Tabs 
        value={selectedTab} 
        onValueChange={onTabChange} 
        className="w-full sm:max-w-md bg-card/30 p-1 rounded-lg backdrop-blur-sm border border-white/10"
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All ({contentCount})
          </TabsTrigger>
          <TabsTrigger 
            value="drafts"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Drafts ({draftsCount})
          </TabsTrigger>
          <TabsTrigger 
            value="published"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Published ({publishedCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
