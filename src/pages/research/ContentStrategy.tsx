
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, TrendingUp, Users, Clock, Star, ArrowRight, Plus, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const ContentStrategy = () => {
  const [goals, setGoals] = useState({
    monthlyTraffic: '',
    contentPieces: '',
    timeline: '3 months'
  });

  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const strategySuggestions = [
    {
      id: 1,
      title: "SEO-Focused Blog Content",
      description: "Target high-volume, low-competition keywords with comprehensive guides",
      difficulty: "Medium",
      traffic: "15,000",
      contentPieces: 12,
      score: 85,
      topics: ["How-to guides", "Best practices", "Industry trends"],
      timeframe: "3 months"
    },
    {
      id: 2,
      title: "Video Content Series",
      description: "Create engaging video content for YouTube and social media",
      difficulty: "High",
      traffic: "25,000",
      contentPieces: 8,
      score: 92,
      topics: ["Tutorials", "Behind the scenes", "Product demos"],
      timeframe: "4 months"
    },
    {
      id: 3,
      title: "Community-Driven Content",
      description: "User-generated content and community engagement strategies",
      difficulty: "Low",
      traffic: "8,000",
      contentPieces: 15,
      score: 78,
      topics: ["User stories", "Q&A sessions", "Community highlights"],
      timeframe: "2 months"
    }
  ];

  const contentGaps = [
    {
      topic: "Advanced tutorials",
      opportunity: "High",
      competition: "Low",
      volume: "12,000"
    },
    {
      topic: "Case studies",
      opportunity: "Medium",
      competition: "Medium",
      volume: "8,500"
    },
    {
      topic: "Industry comparisons",
      opportunity: "High",
      competition: "High",
      volume: "15,000"
    }
  ];

  const handleGenerateStrategy = () => {
    if (!goals.monthlyTraffic || !goals.contentPieces) {
      toast.error("Please fill in your traffic and content goals");
      return;
    }
    toast.success("AI strategy generated based on your goals!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Helmet>
        <title>Content Strategy | Research Platform</title>
      </Helmet>
      
      <Navbar />
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-40 left-1/2 w-64 h-64 bg-neon-purple/10 rounded-full filter blur-3xl opacity-30"></div>
        <div className="futuristic-grid absolute inset-0 opacity-10"></div>
      </div>
      
      <main className="flex-1 container py-8 z-10 relative">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gradient">Content Strategy</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered content strategy planning with goal setting, gap analysis, and topic clusters
            </p>
          </div>

          {/* Goal Setting Section */}
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-neon-blue" />
                Set Your Content Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="traffic">Monthly Traffic Goal</Label>
                  <Input
                    id="traffic"
                    placeholder="e.g., 50,000"
                    value={goals.monthlyTraffic}
                    onChange={(e) => setGoals({...goals, monthlyTraffic: e.target.value})}
                    className="bg-glass border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content Pieces per Month</Label>
                  <Input
                    id="content"
                    placeholder="e.g., 8"
                    value={goals.contentPieces}
                    onChange={(e) => setGoals({...goals, contentPieces: e.target.value})}
                    className="bg-glass border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <select 
                    className="w-full px-3 py-2 bg-glass border border-white/10 rounded-md text-white"
                    value={goals.timeline}
                    onChange={(e) => setGoals({...goals, timeline: e.target.value})}
                  >
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="12 months">12 months</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleGenerateStrategy} className="w-full md:w-auto">
                <Target className="h-4 w-4 mr-2" />
                Generate AI Strategy
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="strategies" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="strategies">Strategy Suggestions</TabsTrigger>
              <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
              <TabsTrigger value="clusters">Topic Clusters</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies" className="space-y-6">
              <div className="grid gap-6">
                {strategySuggestions.map((strategy) => (
                  <Card 
                    key={strategy.id}
                    className={`glass-panel border-white/10 cursor-pointer transition-all hover:border-neon-blue/30 ${
                      selectedStrategy === strategy.id ? 'border-neon-blue' : ''
                    }`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{strategy.title}</h3>
                            <Badge variant="outline" className="text-neon-blue border-neon-blue">
                              Score: {strategy.score}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{strategy.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-neon-blue">{strategy.traffic}</div>
                          <div className="text-sm text-muted-foreground">Monthly Traffic</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-neon-purple">{strategy.contentPieces}</div>
                          <div className="text-sm text-muted-foreground">Content Pieces</div>
                        </div>
                        <div className="text-center">
                          <Badge variant={strategy.difficulty === 'Low' ? 'default' : strategy.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                            {strategy.difficulty}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">Difficulty</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-white">{strategy.timeframe}</div>
                          <div className="text-sm text-muted-foreground">Timeline</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {strategy.topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      <Progress value={strategy.score} className="mb-3" />
                      
                      <Button className="w-full" variant={selectedStrategy === strategy.id ? "default" : "outline"}>
                        {selectedStrategy === strategy.id ? "Selected Strategy" : "Select This Strategy"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-6">
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-neon-green" />
                    Content Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentGaps.map((gap, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-glass rounded-lg border border-white/10">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{gap.topic}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Volume: {gap.volume}/month</span>
                            <Badge variant={gap.opportunity === 'High' ? 'default' : 'secondary'}>
                              {gap.opportunity} Opportunity
                            </Badge>
                            <Badge variant={gap.competition === 'Low' ? 'default' : gap.competition === 'Medium' ? 'secondary' : 'destructive'}>
                              {gap.competition} Competition
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Content
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clusters" className="space-y-6">
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-neon-purple" />
                    Topic Cluster Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Topic Clusters Coming Soon</h3>
                    <p className="text-muted-foreground mb-6">
                      Visual topic cluster analysis and content planning tools are in development.
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Request Early Access
                    </Button>
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

export default ContentStrategy;
