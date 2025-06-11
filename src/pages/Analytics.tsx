
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  CalendarRange, 
  RefreshCcw, 
  Download, 
  FileText, 
  Link,
  MessageCircle,
  Activity,
  TrendingUp,
  Eye,
  Clock,
  Users,
  MousePointer
} from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <motion.div 
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header Section */}
          <motion.div 
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            variants={itemVariants}
          >
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Track your content performance and user engagement
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center bg-glass rounded-lg border border-border/50 shadow-sm">
                <Select defaultValue="7days">
                  <SelectTrigger className="border-0 bg-transparent min-w-[150px] text-sm">
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
                <Button variant="ghost" size="icon" className="rounded-none border-l border-border/50">
                  <CalendarRange className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="glass-panel hover:scale-105 transition-all duration-200">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="icon" className="glass-panel hover:scale-105 transition-all duration-200">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Tabs Section */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-glass/50 backdrop-blur-sm border border-border/50 p-1 h-auto grid grid-cols-4 gap-1">
                <TabsTrigger 
                  value="overview" 
                  className="gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <FileText className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="links" 
                  className="gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <Link className="h-4 w-4" />
                  Links
                </TabsTrigger>
                <TabsTrigger 
                  value="engagement" 
                  className="gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  Engagement
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <AnalyticsOverview />
              </TabsContent>
              
              <TabsContent value="content" className="space-y-6">
                <Card className="glass-panel bg-gradient-to-br from-background/80 to-muted/20 border-border/50 shadow-lg">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Content Performance
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Detailed performance metrics for your published content
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Live Data
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                      <div className="relative flex-1 max-w-sm">
                        <Input 
                          className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors" 
                          placeholder="Search content..." 
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-border/50">
                          Filter
                        </Button>
                        <Button variant="outline" size="sm" className="border-border/50">
                          Sort
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/30">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b border-border/50 bg-muted/30">
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Content</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Views</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Avg. Time</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Ranking</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">CTR</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Conversions</th>
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
                              <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                <td className="p-4 align-middle">
                                  <div className="font-medium text-foreground">{item.title}</div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{item.views.toLocaleString()}</span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-green-500" />
                                    <span>{item.time}</span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <Badge 
                                    variant={item.ranking <= 3 ? "default" : item.ranking <= 5 ? "secondary" : "outline"}
                                    className="font-medium"
                                  >
                                    #{item.ranking}
                                  </Badge>
                                </td>
                                <td className="p-4 align-middle">
                                  <span className="font-medium text-orange-500">{item.ctr}</span>
                                </td>
                                <td className="p-4 align-middle">
                                  <span className="font-medium text-purple-500">{item.conv}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="links" className="space-y-6">
                <Card className="glass-panel bg-gradient-to-br from-background/80 to-muted/20 border-border/50 shadow-lg">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Link className="h-5 w-5 text-primary" />
                          Link Performance
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Track how your affiliate and reference links are performing
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Active Tracking
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="rounded-lg border border-border/50 overflow-hidden bg-background/30">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b border-border/50 bg-muted/30">
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Link Source</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Destination</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Clicks</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">CTR</th>
                              <th className="h-12 px-4 text-left align-middle font-semibold text-foreground">Last Click</th>
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
                              <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                <td className="p-4 align-middle">
                                  <div className="font-medium text-foreground max-w-xs truncate">{item.source}</div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="font-medium text-blue-500">{item.dest}</span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <MousePointer className="h-4 w-4 text-orange-500" />
                                    <span className="font-medium">{item.clicks}</span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <Badge variant="outline" className="font-medium">
                                    {item.ctr}
                                  </Badge>
                                </td>
                                <td className="p-4 align-middle">
                                  <span className="text-muted-foreground text-xs">{item.lastClick}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="engagement" className="space-y-6">
                <Card className="glass-panel bg-gradient-to-br from-background/80 to-muted/20 border-border/50 shadow-lg">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          User Engagement
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Understand how users interact with your content
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        Real-time
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                          { 
                            label: "Avg. Time on Page", 
                            value: "3:42", 
                            change: "+0:56 vs last period", 
                            icon: Clock, 
                            color: "text-blue-500",
                            bgColor: "bg-blue-500/10",
                            borderColor: "border-blue-500/20"
                          },
                          { 
                            label: "Bounce Rate", 
                            value: "32.4%", 
                            change: "-5.2% vs last period", 
                            icon: TrendingUp, 
                            color: "text-green-500",
                            bgColor: "bg-green-500/10",
                            borderColor: "border-green-500/20"
                          },
                          { 
                            label: "Pages Per Visit", 
                            value: "2.8", 
                            change: "+0.4 vs last period", 
                            icon: Eye, 
                            color: "text-orange-500",
                            bgColor: "bg-orange-500/10",
                            borderColor: "border-orange-500/20"
                          },
                          { 
                            label: "Return Visitors", 
                            value: "42.7%", 
                            change: "+8.3% vs last period", 
                            icon: Users, 
                            color: "text-purple-500",
                            bgColor: "bg-purple-500/10",
                            borderColor: "border-purple-500/20"
                          }
                        ].map((metric, index) => (
                          <Card key={index} className={`${metric.bgColor} ${metric.borderColor} border`}>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>
                                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                              </div>
                              <div className="text-2xl font-bold mb-1">{metric.value}</div>
                              <div className="text-xs text-green-400 font-medium">{metric.change}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-primary" />
                          Top Comment Sections
                        </h3>
                        <div className="space-y-3">
                          {[
                            { title: "Top 10 Project Management Tools", comments: 28, lastComment: "2 hours ago" },
                            { title: "Remote Work Productivity Tips", comments: 36, lastComment: "45 mins ago" },
                            { title: "Guide to Email Automation", comments: 15, lastComment: "1 day ago" },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                              <div className="space-y-1">
                                <h4 className="font-medium text-foreground">{item.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MessageCircle className="h-3 w-3" />
                                  {item.comments} comments
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">Last activity</div>
                                <div className="text-sm font-medium">{item.lastComment}</div>
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
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;
