import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Zap,
  Target,
  Lightbulb
} from 'lucide-react';

interface OptimizationStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description: string;
  estimatedTime?: number;
  icon: React.ReactNode;
}

interface OptimizationProgressProps {
  currentStep: number;
  totalSteps: number;
  steps?: OptimizationStep[];
  isOptimizing: boolean;
  progress: number;
}

export const OptimizationProgress: React.FC<OptimizationProgressProps> = ({
  currentStep,
  totalSteps,
  steps,
  isOptimizing,
  progress
}) => {
  const getStatusIcon = (status: OptimizationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: OptimizationStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'pending':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const defaultSteps: OptimizationStep[] = [
    {
      id: 'analysis',
      name: 'Content Analysis',
      status: currentStep > 0 ? 'completed' : 'in-progress',
      description: 'Analyzing content for optimization opportunities',
      estimatedTime: 3,
      icon: <Target className="h-4 w-4" />
    },
    {
      id: 'suggestions',
      name: 'Generate Suggestions',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'in-progress' : 'pending',
      description: 'Creating personalized optimization recommendations',
      estimatedTime: 5,
      icon: <Lightbulb className="h-4 w-4" />
    },
    {
      id: 'optimization',
      name: 'Apply Optimizations',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in-progress' : 'pending',
      description: 'Implementing selected improvements',
      estimatedTime: 8,
      icon: <Zap className="h-4 w-4" />
    },
    {
      id: 'validation',
      name: 'Validate Changes',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'in-progress' : 'pending',
      description: 'Ensuring quality and coherence',
      estimatedTime: 2,
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  const displaySteps = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Optimization Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Progress */}
        <div className="space-y-3">
          {displaySteps.map((step, index) => (
            <div 
              key={step.id} 
              className={`p-3 rounded-lg border transition-all duration-200 ${getStatusColor(step.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(step.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{step.name}</h4>
                    <div className="flex items-center gap-2">
                      {step.estimatedTime && step.status === 'in-progress' && (
                        <Badge variant="outline" className="text-xs">
                          ~{step.estimatedTime}s
                        </Badge>
                      )}
                      {step.status === 'completed' && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  
                  {/* Individual step progress for current step */}
                  {step.status === 'in-progress' && (
                    <div className="mt-2">
                      <Progress 
                        value={progress % 25 * 4} 
                        className="h-1" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {step.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Message */}
        {isOptimizing && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              <span className="text-sm font-medium">
                Optimizing your content... This may take a few moments.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};