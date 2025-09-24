import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, 
  Play, 
  Plus, 
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflowData, useWorkflowExecution } from '@/hooks/useWorkflowData';

interface WorkflowIntegrationPanelProps {
  onWorkflowResult?: (result: any) => void;
}

export function WorkflowIntegrationPanel({ onWorkflowResult }: WorkflowIntegrationPanelProps) {
  const [selectedTab, setSelectedTab] = useState('templates');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [executionName, setExecutionName] = useState('');
  const [inputContext, setInputContext] = useState('{}');
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  const {
    workflows,
    executions,
    templates,
    isLoading,
    executeWorkflow,
    isExecuting,
    createWorkflow,
    getExecutionsByWorkflowId
  } = useWorkflowData();

  const { 
    execution: executionDetails, 
    isLoading: executionLoading 
  } = useWorkflowExecution(selectedExecution);

  const handleExecuteTemplate = async () => {
    if (!selectedTemplate) return;

    let parsedContext = {};
    try {
      parsedContext = JSON.parse(inputContext || '{}');
    } catch (error) {
      // Invalid JSON, use empty object
    }

    executeWorkflow({
      templateId: selectedTemplate.id,
      inputContext: parsedContext,
      executionName: executionName || `${selectedTemplate.name} - ${new Date().toLocaleString()}`
    });

    setShowExecuteDialog(false);
    setSelectedTemplate(null);
    setExecutionName('');
    setInputContext('{}');
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    executeWorkflow({
      workflowId,
      inputContext: {},
      executionName: `Execution - ${new Date().toLocaleString()}`
    });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Intelligent Workflows</h3>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>

      <div className="flex-1 p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 overflow-hidden">
            <TabsContent value="templates" className="h-full overflow-auto space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-sm">{template.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {template.difficulty_level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {template.estimated_duration}
                            </span>
                            <span>{template.use_count} uses</span>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowExecuteDialog(true);
                            }}
                            size="sm"
                            className="gap-2"
                          >
                            <Play className="h-3 w-3" />
                            Execute
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="workflows" className="h-full overflow-auto space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {workflows.map((workflow) => (
                    <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-sm">{workflow.title}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {workflow.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {workflow.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {getExecutionsByWorkflowId(workflow.id).length} executions
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleExecuteWorkflow(workflow.id)}
                              size="sm"
                              className="gap-2"
                              disabled={isExecuting}
                            >
                              <Play className="h-3 w-3" />
                              Execute
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="executions" className="h-full overflow-auto space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <Card key={execution.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-sm">
                              {execution.execution_name || 'Unnamed Execution'}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {new Date(execution.created_at).toLocaleString()}
                            </CardDescription>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${getStatusColor(execution.status)}`}>
                            {getStatusIcon(execution.status)}
                            {execution.status}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Progress: {typeof execution.progress === 'object' && execution.progress ? 
                              `${(execution.progress as any).current_step || 0}/${(execution.progress as any).total_steps || 0}` : 
                              'N/A'}
                          </div>
                          <Button
                            onClick={() => setSelectedExecution(execution.id)}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Create Intelligent Workflow</DialogTitle>
            <DialogDescription>
              Design a new workflow with AI-powered task orchestration
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div className="p-4 text-center text-muted-foreground">
              <p>Workflow builder interface will be available soon.</p>
              <p className="text-sm mt-2">For now, use templates to create workflows.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Execute Template Dialog */}
      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Workflow Template</DialogTitle>
            <DialogDescription>
              Configure and execute: {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="execution-name">Execution Name</Label>
              <Input
                id="execution-name"
                value={executionName}
                onChange={(e) => setExecutionName(e.target.value)}
                placeholder="Optional custom name"
              />
            </div>
            <div>
              <Label htmlFor="input-context">Input Context (JSON)</Label>
              <textarea
                id="input-context"
                value={inputContext}
                onChange={(e) => setInputContext(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full h-24 px-3 py-2 text-sm border border-border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecuteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecuteTemplate} disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution Details Dialog */}
      <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workflow Execution Details</DialogTitle>
          </DialogHeader>
          {executionLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : executionDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong>
                  <div className={`flex items-center gap-1 mt-1 ${getStatusColor(executionDetails.status)}`}>
                    {getStatusIcon(executionDetails.status)}
                    {executionDetails.status}
                  </div>
                </div>
                <div>
                  <strong>Progress:</strong>
                  <div className="mt-1">
                    {executionDetails.progress.current_step}/{executionDetails.progress.total_steps} steps
                  </div>
                </div>
              </div>
              
              {executionDetails.output_results && (
                <div>
                  <strong>Results:</strong>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(executionDetails.output_results, null, 2)}
                  </pre>
                </div>
              )}

              {executionDetails.error_details && (
                <div>
                  <strong>Error Details:</strong>
                  <pre className="mt-2 p-3 bg-destructive/10 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(executionDetails.error_details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}