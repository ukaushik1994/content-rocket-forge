import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { ProposalStatusBadge } from '../components/ProposalStatusBadge';
import { CrossTabActions } from '../components/CrossTabActions';
import { format, parseISO, isAfter } from 'date-fns';

interface MinimalPipelineCardProps {
  item: any;
  stageIndex: number;
  totalStages: number;
  stages: Array<{ id: string; label: string; color: string }>;
  onEdit: (item: any) => void;
  onDelete: (itemId: string) => void;
  onStageChange: (item: any, newStage: string) => void;
  onSyncProposal?: (proposalId: string, action: string, data?: any) => Promise<void>;
}

export const MinimalPipelineCard: React.FC<MinimalPipelineCardProps> = ({
  item,
  stageIndex,
  totalStages,
  stages,
  onEdit,
  onDelete,
  onStageChange,
  onSyncProposal
}) => {
  const getTypeIcon = (type: string) => {
    const icons = { blog: '📝', social: '📱', video: '🎬', email: '✉️' };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-destructive/20 text-destructive-foreground border-destructive/50',
      medium: 'bg-warning/20 text-warning-foreground border-warning/50',
      low: 'bg-success/20 text-success-foreground border-success/50'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const isOverdue = item.due_date && isAfter(new Date(), parseISO(item.due_date));

  return (
    <Card className="group hover:shadow-md transition-all duration-200 bg-card border-border/50">
      <CardContent className="p-3 space-y-2">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm flex-shrink-0">{getTypeIcon(item.content_type)}</span>
            <div className="flex flex-wrap gap-1 items-center min-w-0">
              <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </Badge>
              {item.source_proposal_id && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/30">
                  AI
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-2 w-2 mr-1" />
                  Late
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {item.source_proposal_id && onSyncProposal && (
              <CrossTabActions 
                proposalId={item.source_proposal_id}
                onAction={onSyncProposal}
                compact
                size="sm"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-2 pr-2">
          {item.title}
        </h4>

        {/* Status and Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {item.due_date && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={isOverdue ? 'text-destructive' : ''}>
                  {format(parseISO(item.due_date), 'MMM d')}
                </span>
              </div>
            )}
            {item.progress_percentage > 0 && (
              <span>{item.progress_percentage}%</span>
            )}
          </div>
          
          {item.source_proposal_id && (
            <ProposalStatusBadge proposalId={item.source_proposal_id} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-1 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStageChange(item, stages[stageIndex - 1]?.id)}
            disabled={stageIndex === 0}
            className="h-6 px-2 text-xs disabled:opacity-30"
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            {stageIndex + 1}/{totalStages}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStageChange(item, stages[stageIndex + 1]?.id)}
            disabled={stageIndex === totalStages - 1}
            className="h-6 px-2 text-xs disabled:opacity-30"
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};