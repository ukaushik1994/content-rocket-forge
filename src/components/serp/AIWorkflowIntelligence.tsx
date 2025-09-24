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
  Users,
  Key,
  User
} from 'lucide-react';
import { aiWorkflowIntelligence } from '@/services/aiWorkflowIntelligence';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useSerpServiceStatus } from '@/hooks/useSerpServiceStatus';
import { EmptyDataState } from '@/components/content-builder/serp/EmptyDataState';

type ErrorType = 'no-auth' | 'no-api-keys' | 'api-error' | 'database-error' | 'no-data';

export const AIWorkflowIntelligence = () => {
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const serpStatus = useSerpServiceStatus();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorType(null);

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Authentication required to view AI workflow intelligence');
        setErrorType('no-auth');
        return;
      }

      // Check API keys
      if (!serpStatus.hasProviders) {
        setError('No SERP API keys configured');
        setErrorType('no-api-keys');
        return;
      }

      const [insightsData, recommendationsData] = await Promise.all([
        aiWorkflowIntelligence.analyzeWorkflowPatterns(),
        aiWorkflowIntelligence.generateWorkflowSuggestions()
      ]);
      
      if (!insightsData && (!recommendationsData || recommendationsData.length === 0)) {
        setError('No AI workflow data available');
        setErrorType('no-data');
        return;
      }

      setInsights(insightsData);
      setRecommendations(recommendationsData || []);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      setError('Failed to load AI workflow intelligence');
      setErrorType('api-error');
    } finally {
      setLoading(false);
    }
  };


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

  // Handle error states
  if (error) {
    const getErrorAction = () => {
      switch (errorType) {
        case 'no-auth':
          return {
            label: 'Sign In',
            onClick: () => window.location.href = '/auth'
          };
        case 'no-api-keys':
          return {
            label: 'Configure API Keys',
            onClick: () => window.location.href = '/settings/api-keys'
          };
        case 'api-error':
        case 'database-error':
          return {
            label: 'Retry',
            onClick: loadInsights
          };
        default:
          return {
            label: 'Refresh',
            onClick: loadInsights
          };
      }
    };

    const action = getErrorAction();

    return (
      <EmptyDataState
        variant={errorType === 'no-auth' ? 'api-error' : errorType === 'no-api-keys' ? 'api-error' : 'api-error'}
        title="AI Workflow Intelligence Unavailable"
        description={error}
        actionLabel={action.label}
        onAction={action.onClick}
      />
    );
  }

  if (!insights && recommendations.length === 0) {
    return (
      <EmptyDataState
        variant="no-data"
        title="No AI Insights Available"
        description="No workflow intelligence data available to display"
        actionLabel="Refresh"
        onAction={loadInsights}
      />
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
            <div className="text-2xl font-bold">{insights?.insightsGenerated || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {insights?.insightsTrend || 'No trend data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflow Efficiency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.workflowEfficiency || 0}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {insights?.efficiencyTrend || 'No trend data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.automationRate || 0}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
              {insights?.automationTrend || 'No automation data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunity Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.opportunityScore || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {insights?.opportunityScore >= 90 ? 'Excellent' : insights?.opportunityScore >= 70 ? 'Good' : 'Limited'} potential
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
            {recommendations.length > 0 ? recommendations.map((rec, index) => {
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
            }) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No AI recommendations available</p>
                <p className="text-sm text-muted-foreground">Start using SERP intelligence to generate AI-powered insights</p>
              </div>
            )}
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
                {insights?.opportunityData && insights.opportunityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={insights.opportunityData}>
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
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No opportunity data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Opportunities</CardTitle>
                <CardDescription>High-potential opportunities ready for action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights?.currentOpportunities && insights.currentOpportunities.length > 0 ? (
                  insights.currentOpportunities.map((opp, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No opportunities identified yet</p>
                  </div>
                )}
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
                  {insights?.automationRules && insights.automationRules.length > 0 ? (
                    insights.automationRules.map((rule, index) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No automation rules configured</p>
                    </div>
                  )}
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
              {insights?.workflowMetrics && insights.workflowMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={insights.workflowMetrics}>
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
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No workflow analytics data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};