
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartApprovalActionsProps {
  recommendation?: {
    action: 'approve' | 'request_changes' | 'reject';
    confidence: number;
    reasoning: string;
  };
  onApprove: () => void;
  onRequestChanges: () => void;
  onReject: () => void;
  disabled?: boolean;
  className?: string;
}

export const SmartApprovalActions: React.FC<SmartApprovalActionsProps> = ({
  recommendation,
  onApprove,
  onRequestChanges,
  onReject,
  disabled = false,
  className
}) => {
  const getActionConfig = (action: string) => {
    switch (action) {
      case 'approve':
        return {
          icon: CheckCircle2,
          color: 'bg-green-600 hover:bg-green-700',
          label: 'Approve',
          description: 'Content meets quality standards'
        };
      case 'request_changes':
        return {
          icon: AlertTriangle,
          color: 'bg-yellow-600 hover:bg-yellow-700',
          label: 'Request Changes',
          description: 'Needs improvements before approval'
        };
      case 'reject':
        return {
          icon: XCircle,
          color: 'bg-red-600 hover:bg-red-700',
          label: 'Reject',
          description: 'Requires significant revision'
        };
      default:
        return null;
    }
  };

  const recommendedAction = recommendation ? getActionConfig(recommendation.action) : null;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Smart Approval Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Recommendation */}
        {recommendation && recommendedAction && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">AI Recommendation</span>
              <Badge variant="outline">{recommendation.confidence}% confidence</Badge>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <div className="flex items-center gap-2 mb-2">
                <recommendedAction.icon className="h-4 w-4" />
                <span className="font-medium">{recommendedAction.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
            </div>

            {/* Quick Action Button */}
            <Button
              onClick={
                recommendation.action === 'approve' ? onApprove :
                recommendation.action === 'request_changes' ? onRequestChanges :
                onReject
              }
              disabled={disabled}
              className={cn("w-full", recommendedAction.color)}
            >
              <recommendedAction.icon className="h-4 w-4 mr-2" />
              Follow AI Recommendation: {recommendedAction.label}
            </Button>
          </div>
        )}

        {/* Manual Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Manual Actions</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={recommendation?.action === 'approve' ? 'default' : 'outline'}
              onClick={onApprove}
              disabled={disabled}
              className="justify-start"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant={recommendation?.action === 'request_changes' ? 'default' : 'outline'}
              onClick={onRequestChanges}
              disabled={disabled}
              className="justify-start"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
            <Button
              variant={recommendation?.action === 'reject' ? 'default' : 'outline'}
              onClick={onReject}
              disabled={disabled}
              className="justify-start"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
