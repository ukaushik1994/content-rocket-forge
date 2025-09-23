import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RotateCcw,
  Download,
  Eye
} from 'lucide-react';
import { 
  serpWorkflowOrchestrator, 
  WorkflowState, 
  WorkflowAction 
} from '@/services/serpWorkflowOrchestrator';

interface WorkflowManagerProps {
  workflows: WorkflowState[];
  onWorkflowAction?: (action: string, workflowId: string, data?: any) => void;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  workflows: initialWorkflows,
  onWorkflowAction
}) => {
  const [workflows, setWorkflows] = useState<WorkflowState[]>(initialWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  useEffect(() => {
    // Poll for workflow updates
    const interval = setInterval(() => {
      workflows.forEach(workflow => {
        if (workflow.status === 'running') {
          const updated = serpWorkflowOrchestrator.getWorkflowStatus(workflow.id);
          if (updated) {
            setWorkflows(prev => 
              prev.map(w => w.id === workflow.id ? updated : w)
            );
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [workflows]);

  const handleWorkflowAction = (action: string, workflowId: string, data?: any) => {
    switch (action) {
      case 'pause':
        serpWorkflowOrchestrator.pauseWorkflow(workflowId);
        break;
      case 'resume':
        serpWorkflowOrchestrator.resumeWorkflow(workflowId);
        break;
      case 'view_details':
        setSelectedWorkflow(workflowId);
        break;
    }
    
    onWorkflowAction?.(action, workflowId, data);
  };

  const getStatusIcon = (status: WorkflowState['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: WorkflowState['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'default';
      case 'paused':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const selectedWorkflowData = workflows.find(w => w.id === selectedWorkflow);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map(workflow => (
              <Card key={workflow.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <h4 className="font-semibold">{workflow.type.replace('_', ' ').toUpperCase()}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workflow.context.keywords.length} keywords • {workflow.currentStep}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {workflow.progress}%
                      </span>
                    </div>
                  </div>

                  <Progress value={workflow.progress} className="mb-3" />

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>
                      Started: {new Date(workflow.metadata.startedAt).toLocaleTimeString()}
                    </span>
                    <span>
                      Est. {formatDuration(workflow.metadata.estimatedDuration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {workflow.status === 'running' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWorkflowAction('pause', workflow.id)}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    
                    {workflow.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWorkflowAction('resume', workflow.id)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWorkflowAction('view_details', workflow.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>

                    {workflow.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWorkflowAction('download_report', workflow.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                    )}
                  </div>

                  {workflow.context.recommendations.length > 0 && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Key Recommendations:</h5>
                      <ul className="text-sm space-y-1">
                        {workflow.context.recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i} className="text-muted-foreground">• {rec}</li>
                        ))}
                        {workflow.context.recommendations.length > 2 && (
                          <li className="text-xs text-muted-foreground">
                            +{workflow.context.recommendations.length - 2} more recommendations
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {workflows.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active workflows</p>
                <p className="text-sm">Create a workflow from the Advanced Analytics panel</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedWorkflowData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Workflow Details</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedWorkflow(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Keywords Being Analyzed</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkflowData.context.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Progress Details</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Step:</span>
                    <span className="font-medium">{selectedWorkflowData.currentStep}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={getStatusColor(selectedWorkflowData.status)}>
                      {selectedWorkflowData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Priority:</span>
                    <span className="font-medium">{selectedWorkflowData.metadata.priority}</span>
                  </div>
                </div>
              </div>

              {selectedWorkflowData.nextActions.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Next Actions</h5>
                  <div className="space-y-2">
                    {selectedWorkflowData.nextActions.map((action, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{action.title}</span>
                          <Badge variant={action.automated ? 'default' : 'secondary'}>
                            {action.automated ? 'Auto' : 'Manual'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedWorkflowData.context.analysis && (
                <div>
                  <h5 className="font-medium mb-2">Analysis Results</h5>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm">
                      {selectedWorkflowData.context.analysis.predictions && (
                        <div className="mb-2">
                          <span className="font-medium">Trend Predictions:</span> {selectedWorkflowData.context.analysis.predictions.length} keywords analyzed
                        </div>
                      )}
                      {selectedWorkflowData.context.analysis.opportunities && (
                        <div>
                          <span className="font-medium">Opportunities:</span> {selectedWorkflowData.context.analysis.opportunities.length} opportunities identified
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};