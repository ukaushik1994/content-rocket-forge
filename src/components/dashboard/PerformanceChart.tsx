
import React from 'react';
import { LineChart, BarChart } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock performance data for the past week
const performanceData = [
  { date: 'Apr 28', visitors: 420, conversions: 12, avgTime: 2.4, keywords: 38 },
  { date: 'Apr 29', visitors: 480, conversions: 15, avgTime: 2.8, keywords: 41 },
  { date: 'Apr 30', visitors: 520, conversions: 17, avgTime: 3.2, keywords: 41 },
  { date: 'May 1', visitors: 580, conversions: 22, avgTime: 3.6, keywords: 43 },
  { date: 'May 2', visitors: 610, conversions: 21, avgTime: 3.4, keywords: 45 },
  { date: 'May 3', visitors: 640, conversions: 24, avgTime: 3.8, keywords: 47 },
  { date: 'May 4', visitors: 680, conversions: 28, avgTime: 3.5, keywords: 49 },
];

// Content performance data
const contentPerformance = [
  { content: 'Homepage', views: 245, engagement: 68, conversion: 8.4 },
  { content: 'Products', views: 187, engagement: 54, conversion: 6.2 },
  { content: 'Blog', views: 134, engagement: 72, conversion: 5.1 },
  { content: 'About Us', views: 96, engagement: 42, conversion: 3.8 },
  { content: 'Contact', views: 78, engagement: 38, conversion: 5.7 },
];

interface PerformanceChartProps {
  className?: string;
}

export function PerformanceChart({ className }: PerformanceChartProps) {
  // Format number as compact representation (e.g. 1.5k)
  const formatCompact = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  // Format time values with proper units
  const formatTime = (value: number) => {
    return `${value.toFixed(1)} min`;
  };

  return (
    <Card className={`overflow-hidden shadow-lg bg-card/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2 border-b border-border/20">
        <CardTitle className="text-base font-medium">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="visitors" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="bg-background/30 grid w-full grid-cols-3 h-9 mb-2">
              <TabsTrigger 
                value="visitors" 
                className="text-xs font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-foreground transition-all"
              >
                Traffic
              </TabsTrigger>
              <TabsTrigger 
                value="engagement" 
                className="text-xs font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-foreground transition-all"
              >
                Engagement
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="text-xs font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-foreground transition-all"
              >
                Content
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="visitors" className="mt-0 px-2 pb-4">
            <div className="h-[300px] w-full px-2"> 
              <LineChart 
                data={performanceData}
                categories={['visitors', 'keywords']}
                index="date"
                colors={['#9b87f5', '#33C3F0']}
                valueFormatter={(value) => formatCompact(value)}
                className="pt-4"
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 px-4">
              <div className="bg-background/50 p-3 px-4 rounded-lg shadow-sm border border-border/20">
                <div className="font-medium text-xs text-muted-foreground">Avg. Daily Traffic</div>
                <div className="mt-1.5 text-lg font-bold">561</div>
                <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  +18.4% vs last week
                </div>
              </div>
              <div className="bg-background/50 p-3 px-4 rounded-lg shadow-sm border border-border/20">
                <div className="font-medium text-xs text-muted-foreground">Keywords Ranked</div>
                <div className="mt-1.5 text-lg font-bold">49</div>
                <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  6 vs last month
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement" className="mt-0 px-2 pb-4">
            <div className="h-[300px] w-full px-2"> 
              <LineChart 
                data={performanceData}
                categories={['conversions', 'avgTime']}
                index="date"
                colors={['#D946EF', '#33C3F0']}
                valueFormatter={(value, name) => name === 'avgTime' ? formatTime(value) : value.toString()}
                className="pt-4"
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 px-4">
              <div className="bg-background/50 p-3 px-4 rounded-lg shadow-sm border border-border/20">
                <div className="font-medium text-xs text-muted-foreground">Avg. Conversion Rate</div>
                <div className="mt-1.5 text-lg font-bold">4.2%</div>
                <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  +0.8% vs last week
                </div>
              </div>
              <div className="bg-background/50 p-3 px-4 rounded-lg shadow-sm border border-border/20">
                <div className="font-medium text-xs text-muted-foreground">Avg. Time on Page</div>
                <div className="mt-1.5 text-lg font-bold">3:12</div>
                <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  42s vs last month
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="mt-0 px-2 pb-4">
            <div className="h-[300px] w-full px-2">
              <BarChart 
                data={contentPerformance}
                categories={['views', 'engagement']}
                index="content"
                colors={['#9b87f5', '#33C3F0']}
                valueFormatter={(value) => formatCompact(value)}
                className="pt-4"
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 px-4">
              <div className="bg-background/50 p-3 px-4 rounded-lg shadow-sm border border-border/20">
                <div className="font-medium text-xs text-muted-foreground">Top Performing</div>
                <div className="mt-1.5 text-lg font-bold">Homepage</div>
                <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                  245 views, 8.4% conv.
                </div>
              </div>
              <div className="bg-background/50 p-3 px-4 rounded-lg shadow-sm border border-border/20">
                <div className="font-medium text-xs text-muted-foreground">Highest Engagement</div>
                <div className="mt-1.5 text-lg font-bold">Blog</div>
                <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                  72% engagement rate
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
