import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContextualAction } from '@/services/aiService';
import { 
  FileText, 
  Search, 
  Target, 
  BarChart3, 
  Lightbulb,
  ArrowRight,
  Zap,
  TrendingUp
} from 'lucide-react';

interface ActionButtonProps {
  action: ContextualAction;
  onExecute: (actionId: string, data?: any) => void;
  disabled?: boolean;
}

const getActionIcon = (actionType: string) => {
  if (actionType.includes('blog') || actionType.includes('content')) return FileText;
  if (actionType.includes('keyword') || actionType.includes('research')) return Search;
  if (actionType.includes('strategy')) return Target;
  if (actionType.includes('analysis') || actionType.includes('performance')) return BarChart3;
  if (actionType.includes('optimization')) return TrendingUp;
  return Lightbulb;
};

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  action, 
  onExecute, 
  disabled = false 
}) => {
  const Icon = getActionIcon(action.action);
  
  const handleClick = () => {
    if (disabled) return;
    onExecute(action.action, action.data);
  };

  if (action.type === 'card') {
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg border border-primary/20 hover:border-primary/40 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">{action.label}</CardTitle>
            </div>
            {action.variant === 'primary' && (
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            )}
          </div>
          {action.description && (
            <CardDescription className="text-xs text-muted-foreground">
              {action.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-end">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant={action.variant || 'outline'}
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className="h-8 text-xs gap-2 min-w-0 flex-shrink-0"
    >
      <Icon className="h-3 w-3" />
      {action.label}
    </Button>
  );
};