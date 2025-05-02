
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  CalendarRange, 
  RefreshCcw, 
  Download, 
  FileText, 
  Link,
  MessageCircle,
  Share2
} from 'lucide-react';

const Analytics = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Analytics</h1>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-glass rounded-md border border-border">
                <Select defaultValue="7days">
                  <SelectTrigger className="border-0 bg-transparent min-w-[150px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="rounded-none border-l border-border">
                  <CalendarRange className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="icon">
                <RefreshCcw className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-secondary/30">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-2">
                <Link className="h-4 w-4" />
                Links
              </TabsTrigger>
              <TabsTrigger value="engagement" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Engagement
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2">
                <Share2 className="h-4 w-4" />
                Social
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <AnalyticsOverview />
            </TabsContent>
            
            <TabsContent value="content">
              <Card className="glass-panel bg-glass">
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                  <CardDescription>Performance metrics for your published content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                      <Input className="pl-9 bg-glass border-border" placeholder="Search content..." />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                    </div>
                    <Button variant="outline">
                      Filter
                    </Button>
                    <Button variant="outline">
                      Sort
                    </Button>
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Content</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Views</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Avg. Time</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ranking</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">CTR</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Conversions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { title: "Top 10 Project Management Tools", views: 1245, time: "4:12", ranking: 3, ctr: "8.2%", conv: 28 },
                            { title: "Email Marketing Best Practices", views: 982, time: "3:45", ranking: 5, ctr: "6.8%", conv: 19 },
                            { title: "CRM Solutions for Small Businesses", views: 876, time: "2:58", ranking: 7, ctr: "5.5%", conv: 15 },
                            { title: "Remote Work Productivity Tips", views: 1532, time: "5:23", ranking: 2, ctr: "9.4%", conv: 42 },
                            { title: "Guide to Email Automation", views: 742, time: "3:12", ranking: 8, ctr: "4.9%", conv: 12 },
                          ].map((item, i) => (
                            <tr key={i} className="border-b border-border">
                              <td className="p-4 align-middle">{item.title}</td>
                              <td className="p-4 align-middle">{item.views}</td>
                              <td className="p-4 align-middle">{item.time}</td>
                              <td className="p-4 align-middle">
                                <div className="flex items-center">
                                  <span>#{item.ranking}</span>
                                </div>
                              </td>
                              <td className="p-4 align-middle">{item.ctr}</td>
                              <td className="p-4 align-middle">{item.conv}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="links">
              <div className="grid grid-cols-1 gap-4">
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle>Link Performance</CardTitle>
                    <CardDescription>How your links are performing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Link Source</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Destination</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Clicks</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">CTR</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Click</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { source: "Top 10 Project Management Tools", dest: "TaskMaster Pro", clicks: 145, ctr: "12.2%", lastClick: "2 mins ago" },
                              { source: "Email Marketing Best Practices", dest: "EmailPro Marketing", clicks: 98, ctr: "9.8%", lastClick: "15 mins ago" },
                              { source: "CRM Solutions Guide", dest: "SalesForce CRM+", clicks: 87, ctr: "10.5%", lastClick: "1 hour ago" },
                              { source: "Data Security Article", dest: "SecurityGuard Pro", clicks: 65, ctr: "8.4%", lastClick: "3 hours ago" },
                              { source: "Business Analytics Guide", dest: "AnalyticsHub", clicks: 51, ctr: "7.9%", lastClick: "5 hours ago" },
                            ].map((item, i) => (
                              <tr key={i} className="border-b border-border">
                                <td className="p-4 align-middle">{item.source}</td>
                                <td className="p-4 align-middle">{item.dest}</td>
                                <td className="p-4 align-middle">{item.clicks}</td>
                                <td className="p-4 align-middle">{item.ctr}</td>
                                <td className="p-4 align-middle">{item.lastClick}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="engagement">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                  <CardDescription>How users interact with your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-background/50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-muted-foreground">Avg. Time on Page</div>
                          <div className="text-2xl font-bold">3:42</div>
                          <div className="text-xs text-green-400">+0:56 vs last period</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-muted-foreground">Bounce Rate</div>
                          <div className="text-2xl font-bold">32.4%</div>
                          <div className="text-xs text-green-400">-5.2% vs last period</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-muted-foreground">Pages Per Visit</div>
                          <div className="text-2xl font-bold">2.8</div>
                          <div className="text-xs text-green-400">+0.4 vs last period</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-muted-foreground">Return Visitors</div>
                          <div className="text-2xl font-bold">42.7%</div>
                          <div className="text-xs text-green-400">+8.3% vs last period</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Top Comment Sections</h3>
                      <div className="space-y-4">
                        {[
                          { title: "Top 10 Project Management Tools", comments: 28, lastComment: "2 hours ago" },
                          { title: "Remote Work Productivity Tips", comments: 36, lastComment: "45 mins ago" },
                          { title: "Guide to Email Automation", comments: 15, lastComment: "1 day ago" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50">
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <div className="text-sm text-muted-foreground">{item.comments} comments</div>
                            </div>
                            <div className="text-sm">Last activity: {item.lastComment}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="social">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Social Media Performance</CardTitle>
                  <CardDescription>How your content is performing on social platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-background/50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-muted-foreground">Total Shares</div>
                          <div className="text-2xl font-bold">328</div>
                          <div className="text-xs text-green-400">+18% vs last period</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-muted-foreground">Social Traffic</div>
                          <div className="text-2xl font-bold">572</div>
                          <div className="text-xs text-green-400">+24% vs last period</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-muted-foreground">Twitter Mentions</div>
                          <div className="text-2xl font-bold">47</div>
                          <div className="text-xs text-green-400">+12 vs last period</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardContent className="pt-6">
                          <div className="text-sm text-muted-foreground">LinkedIn Shares</div>
                          <div className="text-2xl font-bold">86</div>
                          <div className="text-xs text-green-400">+15 vs last period</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Top Performing Posts</h3>
                      <div className="space-y-4">
                        {[
                          { title: "Top 10 Project Management Tools", platform: "LinkedIn", engagement: 243, clicks: 78 },
                          { title: "Remote Work Productivity Tips", platform: "Twitter", engagement: 186, clicks: 53 },
                          { title: "Guide to Email Automation", platform: "Facebook", engagement: 124, clicks: 41 },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50">
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <div className="text-sm text-muted-foreground">Platform: {item.platform}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm">Engagement: {item.engagement}</div>
                              <div className="text-sm">Clicks: {item.clicks}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
