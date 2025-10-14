import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  title: string;
  icon: any;
  description: string;
}

interface StrategyWorkflowProgressProps {
  currentStep: number;
  steps: Step[];
  completedSteps?: number[];
}

export function StrategyWorkflowProgress({ 
  currentStep, 
  steps,
  completedSteps = []
}: StrategyWorkflowProgressProps) {
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Card className="bg-background/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Workflow Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step List */}
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index) || index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isCurrent ? 'bg-primary/10' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Status Icon */}
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 animate-pulse" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isCurrent ? 'text-primary' : isPending ? 'text-muted-foreground' : ''
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>

                {/* Step Number Badge */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCurrent ? 'bg-primary text-primary-foreground' :
                  isCompleted ? 'bg-green-500/20 text-green-700' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
