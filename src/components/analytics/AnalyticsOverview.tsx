
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, BarChart3, TrendingUp, Users, Eye, MousePointerClick, Clock, Search } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for analytics charts
const performanceData = [
  { name: 'Apr 26', impressions: 342, clicks: 45, position: 6.2 },
  { name: 'Apr 27', impressions: 385, clicks: 52, position: 5.8 },
  { name: 'Apr 28', impressions: 420, clicks: 61, position: 5.5 },
  { name: 'Apr 29', impressions: 501, clicks: 73, position: 4.9 },
  { name: 'Apr 30', impressions: 489, clicks: 68, position: 4.7 },
  { name: 'May 1', impressions: 530, clicks: 82, position: 4.2 },
  { name: 'May 2', impressions: 601, clicks: 91, position: 3.8 },
];

const engagementData = [
  { name: 'Introduction', views: 601, avgTime: 35, dropoff: 12 },
  { name: 'Section 1', views: 532, avgTime: 95, dropoff: 15 },
  { name: 'Section 2', views: 452, avgTime: 120, dropoff: 18 },
  { name: 'Section 3', views: 371, avgTime: 85, dropoff: 22 },
  { name: 'Section 4', views: 289, avgTime: 75, dropoff: 25 },
  { name: 'Conclusion', views: 217, avgTime: 40, dropoff: 0 },
];

const keywordData = [
  { keyword: 'project management software', position: 3, change: +2, volume: 9800 },
  { keyword: 'best project management tools', position: 5, change: +1, volume: 5400 },
  { keyword: 'remote team management software', position: 7, change: 0, volume: 3200 },
  { keyword: 'project management for remote teams', position: 4, change: +3, volume: 2900 },
  { keyword: 'free project management tools', position: 9, change: -1, volume: 7400 },
];

export const AnalyticsOverview = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 glass-panel bg-glass hover:shadow-neon transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Performance Overview</span>
            </CardTitle>
            <CardDescription>Last 7 days analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Impressions</div>
                  <div className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.4%
                  </div>
                </div>
                <div className="text-2xl font-bold">3,268</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Clicks</div>
                  <div className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2%
                  </div>
                </div>
                <div className="text-2xl font-bold">472</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Avg Position</div>
                  <div className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.4
                  </div>
                </div>
                <div className="text-2xl font-bold">3.8</div>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 15, 15, 0.9)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="impressions" 
                    name="Impressions"
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    name="Clicks"
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-80 glass-panel bg-glass hover:shadow-neon transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span>Ranking Keywords</span>
            </CardTitle>
            <CardDescription>Top performing keywords</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {keywordData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-background/50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[180px]">{item.keyword}</span>
                  <span className="text-xs text-muted-foreground">{item.volume.toLocaleString()} searches/mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-secondary/80 text-foreground px-2 py-0.5 rounded text-xs font-medium">
                    #{item.position}
                  </span>
                  <span className={`text-xs ${item.change > 0 ? 'text-green-400' : item.change < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {item.change > 0 ? `+${item.change}` : item.change}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full gap-1">
              View all keywords <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="engagement">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="engagement" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            SEO Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="engagement" className="mt-4">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Content Engagement</CardTitle>
              <CardDescription>How users interact with your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <Eye className="h-4 w-4 mr-2 text-primary" />
                    <h3 className="text-sm font-medium">Total Views</h3>
                  </div>
                  <div className="text-2xl font-bold mb-2">601</div>
                  <div className="text-xs text-muted-foreground">+12% from last week</div>
                </div>
                <div className="bg-background/50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <MousePointerClick className="h-4 w-4 mr-2 text-primary" />
                    <h3 className="text-sm font-medium">Link Clicks</h3>
                  </div>
                  <div className="text-2xl font-bold mb-2">87</div>
                  <div className="text-xs text-muted-foreground">14.5% click rate</div>
                </div>
                <div className="bg-background/50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <h3 className="text-sm font-medium">Avg. Time on Page</h3>
                  </div>
                  <div className="text-2xl font-bold mb-2">4:12</div>
                  <div className="text-xs text-muted-foreground">+1:24 vs site average</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Content Section Engagement</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={engagementData}
                      margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 15, 15, 0.9)', 
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Bar 
                        dataKey="views" 
                        name="Views"
                        fill="#8884d8" 
                      />
                      <Bar 
                        dataKey="avgTime" 
                        name="Avg. Time (sec)"
                        fill="#82ca9d" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seo" className="mt-4">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>SEO Performance</CardTitle>
              <CardDescription>How your content is performing in search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Content SEO Score: 87/100</h3>
                <Progress value={87} className="h-2 w-full" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">Content Quality</div>
                    <Progress value={92} className="h-2 w-full bg-secondary [&>div]:bg-green-500 mb-1" />
                    <div className="text-xs flex justify-between">
                      <span>Score: 92/100</span>
                      <span className="text-green-400">Excellent</span>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">Keyword Usage</div>
                    <Progress value={85} className="h-2 w-full bg-secondary [&>div]:bg-green-500 mb-1" />
                    <div className="text-xs flex justify-between">
                      <span>Score: 85/100</span>
                      <span className="text-green-400">Good</span>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">Readability</div>
                    <Progress value={88} className="h-2 w-full bg-secondary [&>div]:bg-green-500 mb-1" />
                    <div className="text-xs flex justify-between">
                      <span>Score: 88/100</span>
                      <span className="text-green-400">Good</span>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">Technical SEO</div>
                    <Progress value={78} className="h-2 w-full bg-secondary [&>div]:bg-yellow-500 mb-1" />
                    <div className="text-xs flex justify-between">
                      <span>Score: 78/100</span>
                      <span className="text-yellow-500">Needs Improvement</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Recommendations</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-500 text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Keyword density is optimal</h3>
                      <p className="text-xs text-muted-foreground">Primary keyword appears at the recommended frequency</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-500 text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Good heading structure</h3>
                      <p className="text-xs text-muted-foreground">Headers are properly organized with keywords</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-500 text-xs font-bold">!</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Add more internal links</h3>
                      <p className="text-xs text-muted-foreground">Add 3-5 more internal links to related content</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-500 text-xs font-bold">×</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Image alt text missing</h3>
                      <p className="text-xs text-muted-foreground">Add descriptive alt text to 4 images</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
