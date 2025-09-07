import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Calendar,
  GitBranch,
  FileText,
  CheckCircle,
  Archive,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useProposalIntegration } from '@/hooks/useProposalIntegration';
import { ProposalContext } from '@/services/proposalLifecycleService';

interface CrossTabActionsProps {
  proposalId: string;
  proposalContext?: ProposalContext;
  onNavigateToTab?: (tab: 'pipeline' | 'calendar') => void;
  compact?: boolean;
}

export const CrossTabActions: React.FC<CrossTabActionsProps> = ({
  proposalId,
  proposalContext,
  onNavigateToTab,
  compact = false
}) => {
  const { 
    getProposalActions, 
    isInPipeline, 
    isInCalendar,
    navigateToProposalInTab,
    loading
  } = useProposalIntegration([proposalId]);

  const actions = getProposalActions(proposalId);
  const inPipeline = isInPipeline(proposalId);
  const inCalendar = isInCalendar(proposalId);

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar': return Calendar;
      case 'plus': return GitBranch;
      case 'edit': return FileText;
      case 'check': return CheckCircle;
      case 'archive': return Archive;
      default: return FileText;
    }
  };

  const getVariantClass = (variant?: string) => {
    switch (variant) {
      case 'destructive': return 'text-destructive hover:text-destructive-foreground';
      case 'outline': return 'text-muted-foreground hover:text-foreground';
      case 'secondary': return 'text-secondary-foreground';
      default: return '';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {/* Quick navigation buttons */}
        {inPipeline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToProposalInTab(proposalId, 'pipeline')}
            className="h-8 w-8 p-0"
            title="View in Pipeline"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
        )}
        
        {inCalendar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToProposalInTab(proposalId, 'calendar')}
            className="h-8 w-8 p-0"
            title="View in Calendar"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        )}

        {/* Actions dropdown */}
        {actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                disabled={loading}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action) => {
                const IconComponent = getActionIcon(action.icon);
                return (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={action.handler}
                    disabled={action.disabled || loading}
                    className={getVariantClass(action.variant)}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Cross-tab navigation */}
      {(inPipeline || inCalendar) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            View in Other Tabs
          </h4>
          <div className="flex gap-2">
            {inPipeline && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToProposalInTab(proposalId, 'pipeline')}
                className="flex items-center gap-2"
              >
                <GitBranch className="h-4 w-4" />
                View in Pipeline
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            
            {inCalendar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToProposalInTab(proposalId, 'calendar')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                View in Calendar
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Available actions */}
      {actions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Available Actions
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {actions.map((action) => {
              const IconComponent = getActionIcon(action.icon);
              return (
                <Button
                  key={action.id}
                  variant={action.variant as any || "outline"}
                  size="sm"
                  onClick={action.handler}
                  disabled={action.disabled || loading}
                  className="flex items-center gap-2 justify-start"
                >
                  <IconComponent className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Context information */}
      {proposalContext && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Status Summary
          </h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-medium">
                {proposalContext.completion_percentage}%
              </span>
            </div>
            {proposalContext.pipeline_item && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pipeline Stage:</span>
                <span className="font-medium capitalize">
                  {proposalContext.pipeline_item.stage}
                </span>
              </div>
            )}
            {proposalContext.calendar_item && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calendar Status:</span>
                <span className="font-medium capitalize">
                  {proposalContext.calendar_item.status}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};