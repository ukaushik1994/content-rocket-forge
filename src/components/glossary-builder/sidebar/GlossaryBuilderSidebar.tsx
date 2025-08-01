import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, BookOpen, Brain, Edit, Save, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

interface GlossaryBuilderSidebarProps {
  steps: Step[];
  activeStep: number;
  navigateToStep: (step: number) => void;
}

export function GlossaryBuilderSidebar({ steps, activeStep, navigateToStep }: GlossaryBuilderSidebarProps) {
  const getStepIcon = (stepId: number, completed: boolean, isActive: boolean) => {
    if (completed) {
      return <CheckCircle className="h-5 w-5 text-primary" />;
    }

    const iconClass = cn(
      "h-5 w-5",
      isActive ? "text-primary" : "text-muted-foreground"
    );

    switch (stepId) {
      case 0: return <Target className={iconClass} />;
      case 1: return <Circle className={iconClass} />;
      case 2: return <Brain className={iconClass} />;
      case 3: return <Edit className={iconClass} />;
      case 4: return <Save className={iconClass} />;
      default: return <Circle className={iconClass} />;
    }
  };

  return (
    <div className="w-80 h-full glass-panel border-r border-white/10 p-4 overflow-y-auto custom-scrollbar">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-holographic">Glossary Builder</h2>
            <p className="text-xs text-muted-foreground">Step-by-step workflow</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = step.completed;
            const canNavigate = isCompleted || index <= activeStep;

            return (
              <Card
                key={step.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 border",
                  isActive 
                    ? "holographic-border shadow-neon scale-105" 
                    : canNavigate 
                      ? "glass-card border-white/20 hover:border-white/40 hover:scale-102" 
                      : "glass-card border-white/10 opacity-60 cursor-not-allowed",
                  isCompleted && !isActive && "border-primary/30"
                )}
                onClick={() => canNavigate && navigateToStep(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step.id, isCompleted, isActive)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          "font-semibold text-sm",
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {step.name}
                        </h3>
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                            Done
                          </Badge>
                        )}
                        {isActive && (
                          <Badge variant="default" className="text-xs animate-pulse">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-holographic mb-1">
                {steps.filter(s => s.completed).length}/{steps.length}
              </div>
              <p className="text-xs text-muted-foreground">Steps Completed</p>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="glass-card border-primary/20">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-primary mb-2">💡 Pro Tip</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use bulk selection to process multiple terms at once for faster glossary creation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}