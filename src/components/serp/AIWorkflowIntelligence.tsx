import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  BarChart3,
  Clock,
  Users
} from 'lucide-react';
import { aiWorkflowIntelligence } from '@/services/aiWorkflowIntelligence';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const AIWorkflowIntelligence = () => {
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const [insightsData, recommendationsData] = await Promise.all([
        aiWorkflowIntelligence.analyzeWorkflowPatterns(),
        aiWorkflowIntelligence.generateWorkflowSuggestions()
      ]);
      
      setInsights(insightsData);
      setRecommendations(recommendationsData || []);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const opportunityData = [
    { name: 'Week 1', opportunities: 12, converted: 8, score: 85 },
    { name: 'Week 2', opportunities: 18, converted: 14, score: 92 },
    { name: 'Week 3', opportunities: 25, converted: 19, score: 88 },
    { name: 'Week 4', opportunities: 32, converted: 28, score: 94 }
  ];

  const workflowMetrics = [
    { name: 'Mon', efficiency: 78, automation: 65, insights: 23 },
    { name: 'Tue', efficiency: 82, automation: 71, insights: 31 },
    { name: 'Wed', efficiency: 85, automation: 75, insights: 28 },
    { name: 'Thu', efficiency: 88, automation: 78, insights: 35 },
    { name: 'Fri', efficiency: 92, automation: 82, insights: 42 },
    { name: 'Sat', efficiency: 89, automation: 80, insights: 38 },
    { name: 'Sun', efficiency: 91, automation: 84, insights: 45 }
  ];

  const mockRecommendations = [
    {
      id: '1',
      type: 'content_optimization',
      title: 'Optimize Content for Featured Snippets',
      description: 'Your content has 73% potential to rank for featured snippets with structural improvements',
      impact: 'high',
      effort: 'medium',
      timeframe: '2-3 weeks',
      metrics: { potential_traffic: '+1,247 visitors/month', confidence: 87 }
    },
    {
      id: '2',
      type: 'keyword_expansion',
      title: 'Target Long-tail Keywords',
      description: 'AI identified 18 low-competition keywords with high conversion potential',
      impact: 'high',
      effort: 'low',
      timeframe: '1-2 weeks',
      metrics: { potential_traffic: '+892 visitors/month', confidence: 94 }
    },
    {
      id: '3',
      type: 'content_gaps',
      title: 'Fill Content Gaps in Competitor Analysis',
      description: 'Competitors are ranking for 12 topics you haven\'t covered yet',
      impact: 'medium',
      effort: 'high',
      timeframe: '4-6 weeks',
      metrics: { potential_traffic: '+2,156 visitors/month', confidence: 78 }
    },
    {
      id: '4',
      type: 'workflow_automation',
      title: 'Automate SERP Monitoring Alerts',
      description: 'Set up intelligent alerts for ranking changes and new opportunities',
      impact: 'medium',
      effort: 'low',
      timeframe: '1 week',
      metrics: { time_saved: '4 hours/week', confidence: 96 }
    }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'content_optimization': return Target;
      case 'keyword_expansion': return TrendingUp;
      case 'content_gaps': return Lightbulb;
      case 'workflow_automation': return Zap;
      default: return Brain;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <Brain className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">AI Workflow Intelligence</h2>
          <p className="text-muted-foreground">AI-powered insights and automation recommendations</p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          <Brain className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* AI Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights Generated</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              23% increase this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflow Efficiency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              14% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
              Tasks automated
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunity Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Excellent potential
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Dashboard */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunity Tracking</TabsTrigger>
          <TabsTrigger value="automation">Workflow Automation</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {mockRecommendations.map((rec, index) => {
              const TypeIcon = getTypeIcon(rec.type);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-lg">{rec.title}</CardTitle>
                              <Badge className={getImpactColor(rec.impact)}>
                                {rec.impact} impact
                              </Badge>
                            </div>
                            <CardDescription>{rec.description}</CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Effort Required</Label>
                          <div className="flex items-center space-x-2">
                            <Progress value={rec.effort === 'low' ? 30 : rec.effort === 'medium' ? 60 : 90} className="h-2" />
                            <span className="text-sm">{rec.effort}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Timeframe</Label>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{rec.timeframe}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Potential Impact</Label>
                          <div className="text-sm font-medium">
                            {rec.metrics.potential_traffic || rec.metrics.time_saved}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">
                              {rec.metrics.confidence}% confidence
                            </span>
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">Learn More</Button>
                            <Button size="sm">Implement</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Conversion Trends</CardTitle>
                <CardDescription>AI-identified opportunities and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={opportunityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="opportunities" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="converted" 
                      stackId="2"
                      stroke="hsl(var(--secondary))" 
                      fill="hsl(var(--secondary))" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Opportunities</CardTitle>
                <CardDescription>High-potential opportunities ready for action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Featured Snippet Opportunity', score: 94, type: 'Content' },
                  { title: 'Long-tail Keyword Gap', score: 87, type: 'Keywords' },
                  { title: 'Competitor Weakness', score: 82, type: 'Competitive' },
                  { title: 'Trending Topic Match', score: 78, type: 'Trending' }
                ].map((opp, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{opp.title}</p>
                      <Badge variant="outline" className="text-xs">{opp.type}</Badge>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <Progress value={opp.score} className="w-16 h-2" />
                        <span className="text-sm font-medium">{opp.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Automation Status</CardTitle>
                <CardDescription>Current automation rules and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'SERP Position Alerts', status: 'active', triggers: 247, success: 98.2 },
                    { name: 'Keyword Opportunity Detection', status: 'active', triggers: 156, success: 94.7 },
                    { name: 'Content Gap Analysis', status: 'active', triggers: 89, success: 91.3 },
                    { name: 'Competitor Monitoring', status: 'paused', triggers: 0, success: 0 }
                  ].map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${rule.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {rule.triggers} triggers • {rule.success}% success rate
                          </p>
                        </div>
                      </div>
                      <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                        {rule.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Analytics</CardTitle>
              <CardDescription>Workflow efficiency and automation metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={workflowMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Efficiency %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="automation" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Automation %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="insights" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Insights Generated"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};