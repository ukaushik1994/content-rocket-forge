import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Settings,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Network,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { IntelligentWorkflowOrchestrator, IntelligentWorkflow } from '@/services/intelligent-workflow/IntelligentWorkflowOrchestrator';
import { Solution } from '@/contexts/content-builder/types/solution-types';

interface IntelligentWorkflowInterfaceProps {
  solutions: Solution[];
  onWorkflowComplete?: (workflow: IntelligentWorkflow) => void;
  className?: string;
}

export const IntelligentWorkflowInterface: React.FC<IntelligentWorkflowInterfaceProps> = ({
  solutions,
  onWorkflowComplete,
  className = ""
}) => {
  const { user } = useAuth();
  const [activeWorkflows, setActiveWorkflows] = useState<IntelligentWorkflow[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [request, setRequest] = useState('');
  const [intelligenceLevel, setIntelligenceLevel] = useState<'basic' | 'advanced' | 'expert'>('advanced');

  useEffect(() => {
    loadActiveWorkflows();
  }, [user]);

  const loadActiveWorkflows = async () => {
    // In a real implementation, load from database
    // For now, using empty array
    setActiveWorkflows([]);
  };

  const handleCreateWorkflow = async () => {
    if (!user || !request.trim()) return;

    setIsCreating(true);
    try {
      const context = {
        userId: user.id,
        availableSolutions: solutions,
        userContext: { preferences: {} },
        businessContext: {},
        previousWorkflows: []
      };

      const workflow = await IntelligentWorkflowOrchestrator.createIntelligentWorkflow(
        request,
        context,
        { intelligenceLevel, autoExecute: true }
      );

      setActiveWorkflows(prev => [workflow, ...prev]);
      setRequest('');
      
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleWorkflowAction = async (workflowId: string, action: 'pause' | 'resume' | 'cancel') => {
    switch (action) {
      case 'pause':
        IntelligentWorkflowOrchestrator.pauseWorkflow(workflowId);
        break;
      case 'resume':
        IntelligentWorkflowOrchestrator.resumeWorkflow(workflowId);
        break;
      // Add cancel logic if needed
    }

    // Refresh workflows
    loadActiveWorkflows();
  };

  const getWorkflowProgress = (workflow: IntelligentWorkflow): number => {
    if (workflow.steps.length === 0) return 0;
    const completedSteps = workflow.steps.filter(step => step.completed).length;
    return (completedSteps / workflow.steps.length) * 100;
  };

  const getStatusColor = (status: IntelligentWorkflow['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIntelligenceBadgeColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'advanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Intelligent Workflow Orchestration</h2>
              <p className="text-sm text-muted-foreground font-normal">
                AI-powered workflows with solution integration and smart task decomposition
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Workflow Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Create Intelligent Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe what you want to accomplish:</label>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="e.g., Create a comprehensive content strategy for our new product launch using GLConnect data and People Analytics insights"
              className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <label className="text-sm font-medium">Intelligence Level:</label>
              <div className="flex gap-2">
                {(['basic', 'advanced', 'expert'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={intelligenceLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIntelligenceLevel(level)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">
                {solutions.length} solutions available
              </div>
              <Button 
                onClick={handleCreateWorkflow}
                disabled={!request.trim() || isCreating}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Create Workflow
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <AnimatePresence>
            {activeWorkflows.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Active Workflows
                  </h3>
                  <p className="text-sm text-muted-foreground/70">
                    Create your first intelligent workflow to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeWorkflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{workflow.title}</h4>
                            <Badge className={getIntelligenceBadgeColor(workflow.intelligenceLevel)}>
                              {workflow.intelligenceLevel}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.status)}`} />
                              <span className="text-xs text-muted-foreground capitalize">
                                {workflow.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              <span>{workflow.steps.length} steps</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Network className="h-3 w-3" />
                              <span>{workflow.solutionIntegration.primarySolutions.length} solutions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Started {new Date(workflow.startedAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {workflow.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {workflow.status === 'paused' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWorkflowAction(workflow.id, 'resume')}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(getWorkflowProgress(workflow))}%</span>
                        </div>
                        <Progress value={getWorkflowProgress(workflow)} className="h-2" />
                      </div>

                      {/* Current Step */}
                      {workflow.currentStepIndex < workflow.steps.length && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-medium">Current Step</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {workflow.steps[workflow.currentStepIndex]?.title}
                          </p>
                        </div>
                      )}

                      {/* Solution Integration */}
                      {workflow.solutionIntegration.primarySolutions.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium flex items-center gap-1">
                            <Network className="h-4 w-4" />
                            Integrated Solutions
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {workflow.solutionIntegration.primarySolutions.map(solutionId => {
                              const solution = solutions.find(s => s.id === solutionId);
                              return solution ? (
                                <Badge key={solutionId} variant="secondary" className="text-xs">
                                  {solution.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Cross-Solution Opportunities */}
                      {workflow.solutionIntegration.crossSolutionActions.length > 0 && (
                        <div className="bg-primary/5 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Cross-Solution Opportunities</span>
                          </div>
                          <div className="space-y-1">
                            {workflow.solutionIntegration.crossSolutionActions.slice(0, 2).map((action, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ArrowRight className="h-3 w-3" />
                                <span>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="text-center py-12">
              <Zap className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Workflow Templates
              </h3>
              <p className="text-sm text-muted-foreground/70">
                Pre-built intelligent workflow templates coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Execution History
              </h3>
              <p className="text-sm text-muted-foreground/70">
                Workflow execution history will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};