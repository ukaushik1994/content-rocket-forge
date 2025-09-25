import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Settings,
  BarChart3,
  Target,
  Lightbulb,
  ArrowRight,
  Timer,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  WorkflowPattern,
  AutomationSuggestion,
  TaskPrioritization,
  WorkflowOptimization,
  workflowAutomationService
} from '@/services/ai-intelligence/WorkflowAutomationService';

interface WorkflowAutomationDashboardProps {
  className?: string;
}

export const WorkflowAutomationDashboard: React.FC<WorkflowAutomationDashboardProps> = ({
  className = ""
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [patterns, setPatterns] = useState<WorkflowPattern[]>([]);
  const [suggestions, setSuggestions] = useState<AutomationSuggestion[]>([]);
  const [prioritizedTasks, setPrioritizedTasks] = useState<TaskPrioritization[]>([]);
  const [optimization, setOptimization] = useState<WorkflowOptimization | null>(null);
  const [activeAutomations, setActiveAutomations] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadWorkflowData();
    }
  }, [user]);

  const loadWorkflowData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Simulate recent user actions for pattern detection
      const recentActions = [
        { action: 'content_creation', timestamp: Date.now() - 3600000, duration: 45 },
        { action: 'seo_optimization', timestamp: Date.now() - 7200000, duration: 15 },
        { action: 'content_review', timestamp: Date.now() - 10800000, duration: 20 },
        { action: 'publishing', timestamp: Date.now() - 14400000, duration: 5 }
      ];

      // Analyze patterns
      const detectedPatterns = await workflowAutomationService.analyzeUserPatterns(user.id, recentActions);
      setPatterns(detectedPatterns);

      // Generate automation suggestions
      const automationSuggestions = await workflowAutomationService.generateAutomationSuggestions(user.id, detectedPatterns);
      setSuggestions(automationSuggestions);

      // Sample tasks for prioritization
      const sampleTasks = [
        {
          id: 'task1',
          title: 'Optimize SEO for 5 blog posts',
          description: 'Review and improve SEO for recent blog content',
          estimatedEffort: 2,
          deadline: new Date(Date.now() + 7 * 24 * 3600000).toISOString()
        },
        {
          id: 'task2', 
          title: 'Create social media content',
          description: 'Generate social posts for next week',
          estimatedEffort: 1,
          dependencies: ['task1']
        },
        {
          id: 'task3',
          title: 'A/B test landing pages',
          description: 'Set up and monitor A/B tests',
          estimatedEffort: 3
        }
      ];

      const taskPriorities = await workflowAutomationService.prioritizeTasks(user.id, sampleTasks);
      setPrioritizedTasks(taskPriorities);

      // Generate workflow optimization
      const workflowSteps = detectedPatterns[0]?.steps || [];
      const currentMetrics = { totalTime: 90, errorRate: 5, userSatisfaction: 80 };
      const workflowOpt = await workflowAutomationService.optimizeWorkflow(workflowSteps, currentMetrics);
      setOptimization(workflowOpt);

    } catch (error) {
      console.error('Failed to load workflow data:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load workflow automation data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeAutomation = async (automationId: string, context: any = {}) => {
    try {
      setActiveAutomations(prev => [...prev, automationId]);
      
      const result = await workflowAutomationService.executeAutomation(automationId, context);
      
      if (result.success) {
        toast({
          title: "Automation Executed",
          description: `Automation completed in ${result.executionTime}ms`,
        });
      } else {
        throw new Error('Automation failed');
      }
    } catch (error) {
      console.error('Automation execution failed:', error);
      toast({
        title: "Automation Failed",
        description: "Failed to execute automation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActiveAutomations(prev => prev.filter(id => id !== automationId));
    }
  };

  const getAutomationTypeIcon = (type: string) => {
    switch (type) {
      case 'full_automation': return <Bot className="h-4 w-4 text-green-500" />;
      case 'partial_automation': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'optimization': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getComplexityBadgeVariant = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'text-red-600';
    if (priority >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card className={`border-border bg-card ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Bot className="h-6 w-6 animate-pulse text-primary" />
            <div>
              <h3 className="font-semibold">Loading Workflow Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing patterns and generating automation suggestions...
              </p>
            </div>
          </div>
          <Progress value={45} className="mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Task Priority
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Detected Workflow Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patterns.length > 0 ? (
                  <div className="space-y-4">
                    {patterns.map((pattern) => (
                      <Card key={pattern.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{pattern.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {pattern.description}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {pattern.automationPotential}% automatable
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{pattern.averageTimeSpent}min avg</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{pattern.frequency}x per week</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                              <span>{pattern.steps.length} steps</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className={getPriorityColor(pattern.automationPotential)}>
                                {pattern.automationPotential > 70 ? 'High' : 
                                 pattern.automationPotential > 40 ? 'Medium' : 'Low'} Priority
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <h5 className="font-medium mb-2">Workflow Steps:</h5>
                            <div className="flex flex-wrap gap-2">
                              {pattern.steps.map((step) => (
                                <Badge 
                                  key={step.id} 
                                  variant={step.isAutomatable ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {step.action} ({step.duration}min)
                                  {step.isAutomatable && <Bot className="h-3 w-3 ml-1" />}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No workflow patterns detected yet. Use the platform more to see patterns emerge.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Automation Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              {getAutomationTypeIcon(suggestion.type)}
                              <div>
                                <h4 className="font-semibold">{suggestion.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {suggestion.description}
                                </p>
                              </div>
                            </div>
                            <Badge variant={getComplexityBadgeVariant(suggestion.implementationComplexity)}>
                              {suggestion.implementationComplexity} complexity
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-green-500" />
                              <span>Saves {suggestion.timeSavings}min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <span>ROI: {suggestion.expectedROI}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                              <span>{suggestion.steps.length} steps</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <h5 className="font-medium text-green-600 mb-1">Benefits:</h5>
                              <ul className="text-sm space-y-1">
                                {suggestion.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {suggestion.risks.length > 0 && (
                              <div>
                                <h5 className="font-medium text-yellow-600 mb-1">Risks:</h5>
                                <ul className="text-sm space-y-1">
                                  {suggestion.risks.map((risk, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                      <span>{risk}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t">
                            <div className="text-xs text-muted-foreground">
                              Pattern: {suggestion.patternId}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => executeAutomation(suggestion.id)}
                              disabled={activeAutomations.includes(suggestion.id)}
                            >
                              {activeAutomations.includes(suggestion.id) ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Execute
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No automation suggestions available. Complete more workflows to generate suggestions.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                AI-Prioritized Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prioritizedTasks.length > 0 ? (
                <div className="space-y-3">
                  {prioritizedTasks.map((task, index) => (
                    <Card key={task.taskId} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl font-bold text-muted-foreground">
                              #{index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {task.aiReasoning}
                              </p>
                            </div>
                          </div>
                          <Badge className={getPriorityColor(task.priority)}>
                            Priority: {task.priority}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Urgency</div>
                            <div className="flex items-center gap-2">
                              <Progress value={task.urgency} className="h-2 flex-1" />
                              <span className="text-sm font-medium">{task.urgency}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Impact</div>
                            <div className="flex items-center gap-2">
                              <Progress value={task.impact} className="h-2 flex-1" />
                              <span className="text-sm font-medium">{task.impact}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Effort</div>
                            <div className="flex items-center gap-2">
                              <Progress value={task.effort} className="h-2 flex-1" />
                              <span className="text-sm font-medium">{task.effort}</span>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Deadline</div>
                            <div className="text-sm">
                              {task.deadline ? 
                                new Date(task.deadline).toLocaleDateString() : 
                                'No deadline'
                              }
                            </div>
                          </div>
                        </div>

                        {task.dependencies.length > 0 && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Dependencies:</div>
                            <div className="flex flex-wrap gap-2">
                              {task.dependencies.map((dep, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No tasks to prioritize. Add tasks to see AI-powered prioritization.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="mt-4">
          {optimization && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Workflow Optimization Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">Efficiency Comparison</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Current Efficiency</span>
                              <span>{optimization.currentEfficiency}%</span>
                            </div>
                            <Progress value={optimization.currentEfficiency} className="h-3" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Optimized Efficiency</span>
                              <span className="text-green-600">{optimization.optimizedEfficiency}%</span>
                            </div>
                            <Progress value={optimization.optimizedEfficiency} className="h-3" />
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              Potential Improvement: +{optimization.optimizedEfficiency - optimization.currentEfficiency}%
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Estimated time savings: {optimization.estimatedTimeSavings} minutes per day
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {optimization.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Identified Bottlenecks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimization.bottlenecks.map((bottleneck, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{bottleneck.step}</h5>
                          <Badge variant="destructive">
                            {bottleneck.impact}% impact
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          <strong>Solution:</strong> {bottleneck.solution}
                        </div>
                        <Progress value={bottleneck.impact} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};