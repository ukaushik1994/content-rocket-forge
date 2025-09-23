import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock, Zap } from 'lucide-react';
import { WorkflowChain } from '@/services/workflowChainService';

interface WorkflowProgressProps {
  workflow: WorkflowChain;
  onStepClick?: (stepIndex: number) => void;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ 
  workflow, 
  onStepClick 
}) => {
  const progress = (workflow.currentStepIndex / workflow.steps.length) * 100;
  const completedSteps = workflow.steps.filter(step => step.completed).length;

  const getStepIcon = (step: any, index: number) => {
    if (step.completed) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (index === workflow.currentStepIndex) {
      return <Zap className="h-5 w-5 text-blue-500" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const getStepStatus = (step: any, index: number) => {
    if (step.completed) return 'completed';
    if (index === workflow.currentStepIndex) return 'active';
    if (index < workflow.currentStepIndex) return 'completed';
    return 'pending';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {workflow.title}
          </CardTitle>
          <Badge variant={workflow.status === 'completed' ? 'default' : 'secondary'}>
            {workflow.status}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completedSteps} of {workflow.steps.length} steps completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {workflow.steps.map((step, index) => {
            const status = getStepStatus(step, index);
            
            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  status === 'active' 
                    ? 'border-blue-200 bg-blue-50' 
                    : status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-muted'
                } ${onStepClick ? 'cursor-pointer hover:bg-accent' : ''}`}
                onClick={() => onStepClick?.(index)}
              >
                {getStepIcon(step, index)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      status === 'active' 
                        ? 'text-blue-700' 
                        : status === 'completed'
                        ? 'text-green-700'
                        : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </h4>
                    {step.estimatedTime && (
                      <Badge variant="outline" className="text-xs">
                        {step.estimatedTime}min
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  
                  {step.data && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Data:</strong> {JSON.stringify(step.data).substring(0, 100)}...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {workflow.status === 'completed' && workflow.completedAt && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ Workflow completed on {workflow.completedAt.toLocaleDateString()} at {workflow.completedAt.toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};