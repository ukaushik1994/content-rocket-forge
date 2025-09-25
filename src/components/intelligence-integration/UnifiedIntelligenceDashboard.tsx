import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Network,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { unifiedIntelligenceService, SystemInsight, CrossSystemPattern } from '@/services/intelligence-integration/UnifiedIntelligenceService';
import { advancedAutomationEngine, WorkflowTemplate, WorkflowExecution } from '@/services/intelligence-integration/AdvancedAutomationEngine';
import { integrationEcosystemService } from '@/services/intelligence-integration/IntegrationEcosystemService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function UnifiedIntelligenceDashboard() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<SystemInsight[]>([]);
  const [patterns, setPatterns] = useState<CrossSystemPattern[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (user) {
      loadIntelligenceData();
    }
  }, [user]);

  const loadIntelligenceData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load saved insights
      await unifiedIntelligenceService.loadSavedInsights(user.id);
      setInsights(unifiedIntelligenceService.getSystemInsights());
      setPatterns(unifiedIntelligenceService.getCrossSystemPatterns());
      
      // Load automation data
      setTemplates(advancedAutomationEngine.getWorkflowTemplates());
      setExecutions(advancedAutomationEngine.getActiveExecutions());
      
    } catch (error) {
      console.error('Error loading intelligence data:', error);
      toast.error('Failed to load intelligence data');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeIntelligence = async () => {
    if (!user) return;

    try {
      setIsInitializing(true);
      toast.info('Initializing AI intelligence systems...');
      
      // Initialize all services
      await Promise.all([
        unifiedIntelligenceService.initialize(user.id),
        advancedAutomationEngine.initialize(user.id),
        integrationEcosystemService.initialize(user.id)
      ]);
      
      // Reload data
      await loadIntelligenceData();
      
      toast.success('AI intelligence systems initialized successfully');
    } catch (error) {
      console.error('Error initializing intelligence:', error);
      toast.error('Failed to initialize intelligence systems');
    } finally {
      setIsInitializing(false);
    }
  };

  const executeWorkflow = async (templateId: string) => {
    try {
      const execution = await advancedAutomationEngine.executeWorkflow(templateId);
      setExecutions([...executions, execution]);
      toast.success(`Workflow execution started: ${execution.id}`);
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Unified Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced AI-powered insights and automation across all systems
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={initializeIntelligence} 
            disabled={isInitializing}
            variant="outline"
          >
            {isInitializing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Initialize AI
              </>
            )}
          </Button>
          <Button onClick={loadIntelligenceData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">System Insights</TabsTrigger>
          <TabsTrigger value="patterns">Cross-System Patterns</TabsTrigger>
          <TabsTrigger value="automation">Workflow Automation</TabsTrigger>
          <TabsTrigger value="integration">Integration Status</TabsTrigger>
        </TabsList>

        {/* System Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <Card key={insight.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {insight.system === 'content' && <Brain className="h-4 w-4" />}
                        {insight.system === 'workflow' && <Zap className="h-4 w-4" />}
                        {insight.system === 'serp' && <TrendingUp className="h-4 w-4" />}
                        {insight.system === 'strategy' && <Network className="h-4 w-4" />}
                        <span className="text-sm font-medium capitalize">{insight.system}</span>
                      </div>
                      <Badge variant={getImpactColor(insight.impact)}>{insight.impact}</Badge>
                    </div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <CardDescription>{insight.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                      <Progress value={insight.confidence * 100} className="h-2" />
                      
                      {insight.recommendations.length > 0 && (
                        <div className="pt-2">
                          <p className="text-sm font-medium mb-2">Recommendations:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {insight.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {insight.expires_at && (
                        <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Expires: {insight.expires_at.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Intelligence Insights Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Initialize the AI intelligence system to start generating insights
                  </p>
                  <Button onClick={initializeIntelligence} disabled={isInitializing}>
                    {isInitializing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Initialize Intelligence
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Cross-System Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid gap-6">
            {patterns.length > 0 ? (
              patterns.map((pattern) => (
                <Card key={pattern.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        {pattern.pattern_type.replace('_', ' ').toUpperCase()} Pattern
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {pattern.systems_involved.length} Systems
                        </Badge>
                        <Badge variant={pattern.success_rate > 0.8 ? 'default' : 'secondary'}>
                          {Math.round(pattern.success_rate * 100)}% Success
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{pattern.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Systems Involved</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.systems_involved.map((system) => (
                            <Badge key={system} variant="outline" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Performance</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Frequency:</span>
                            <span>{pattern.frequency}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Impact Score:</span>
                            <span>{pattern.impact_score}/10</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Recommendations</p>
                        <ul className="text-sm space-y-1">
                          {pattern.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Cross-System Patterns Detected</h3>
                  <p className="text-muted-foreground">
                    Pattern analysis will appear here once the system analyzes your workflow data
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Workflow Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid gap-6">
            {/* Workflow Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Workflow Templates
                </CardTitle>
                <CardDescription>
                  Automated workflow templates with intelligent triggers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Success Rate: {Math.round(template.success_rate * 100)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Used {template.usage_count} times
                          </span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => executeWorkflow(template.id)}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Executions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Active Executions
                </CardTitle>
                <CardDescription>
                  Currently running workflow executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {executions.length > 0 ? (
                  <div className="space-y-4">
                    {executions.map((execution) => (
                      <div key={execution.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Execution {execution.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              Template: {execution.template_id}
                            </p>
                          </div>
                          <Badge className={getStatusColor(execution.status)}>
                            {execution.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(execution.progress)}%</span>
                          </div>
                          <Progress value={execution.progress} className="h-2" />
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Step {execution.current_step} of {execution.total_steps}</span>
                            <span>Started: {execution.started_at.toLocaleTimeString()}</span>
                          </div>
                          
                          {execution.errors.length > 0 && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                {execution.errors[execution.errors.length - 1]}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Executions</h3>
                    <p className="text-muted-foreground">
                      Workflow executions will appear here when they're running
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Status Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Integration Ecosystem Status
              </CardTitle>
              <CardDescription>
                Real-time synchronization and webhook status across all systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* System Status Cards */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Content System</h4>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Real-time sync enabled, webhook healthy
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Workflow Engine</h4>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automation pipeline healthy, triggers responsive
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">SERP Analytics</h4>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Data pipeline active, cache optimized
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">AI Strategy</h4>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Intelligence layer active, insights flowing
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">External APIs</h4>
                    <Badge variant="secondary">Standby</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Webhook endpoints configured, rate limits optimal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}