import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContextualAction } from '@/services/aiService';
import { ArrowRight, Zap, BarChart3, FileText, Settings } from 'lucide-react';

interface QuickActionButtonProps {
  action: ContextualAction;
  onActionClick?: (action: ContextualAction) => void;
}

const getActionIcon = (type: string) => {
  switch (type) {
    case 'content-creation':
      return <FileText className="w-4 h-4" />;
    case 'keyword-analysis':
      return <BarChart3 className="w-4 h-4" />;
    case 'workflow':
      return <Zap className="w-4 h-4" />;
    case 'navigate':
      return <Settings className="w-4 h-4" />;
    default:
      return <ArrowRight className="w-4 h-4" />;
  }
};

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  action, 
  onActionClick 
}) => {
  const handleClick = () => {
    onActionClick?.(action);
  };

  return (
    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
          {getActionIcon(action.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{action.label}</h4>
          {action.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {action.description}
            </p>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </Card>
  );
};