import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  ExternalLink,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProposalStatusBadge } from '../components/ProposalStatusBadge';
import { CrossTabActions } from '../components/CrossTabActions';
import { format, parseISO, isAfter } from 'date-fns';

interface EnhancedPipelineCardProps {
  item: any;
  stageIndex: number;
  totalStages: number;
  stages: Array<{ id: string; label: string; color: string }>;
  onEdit: (item: any) => void;
  onDelete: (itemId: string) => void;
  onStageChange: (item: any, newStage: string) => void;
  onSyncProposal?: (proposalId: string, action: string, data?: any) => Promise<void>;
}

export const EnhancedPipelineCard: React.FC<EnhancedPipelineCardProps> = ({
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
    const icons = {
      blog: '📝',
      social: '📱', 
      video: '🎬',
      email: '✉️'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[priority as keyof typeof colors];
  };

  const isOverdue = item.due_date && isAfter(new Date(), parseISO(item.due_date));
  const progressColor = item.progress_percentage >= 75 ? 'bg-green-500' : 
                       item.progress_percentage >= 50 ? 'bg-yellow-500' : 
                       item.progress_percentage >= 25 ? 'bg-orange-500' : 'bg-red-500';

  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="group relative overflow-hidden bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-xl border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="relative p-4 space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {/* Content Type Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center border border-white/10">
                <span className="text-lg">{getTypeIcon(item.content_type)}</span>
              </div>
              
              {/* Priority and AI Badge */}
              <div className="flex flex-col gap-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(item.priority)} backdrop-blur-sm`}
                >
                  {item.priority}
                </Badge>
                {item.source_proposal_id && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 border-purple-400/30">
                    AI Generated
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="h-8 w-8 p-0 hover:bg-primary/20 text-muted-foreground hover:text-primary"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="h-8 w-8 p-0 hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Title and Keyword Section */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            {item.target_keyword && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                <span className="font-mono">{item.target_keyword}</span>
              </div>
            )}
          </div>

          {/* Status Badges Section */}
          <div className="flex flex-wrap gap-1">
            {item.source_proposal_id && (
              <ProposalStatusBadge proposalId={item.source_proposal_id} />
            )}
            {isOverdue && (
              <Badge variant="destructive" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
            {item.seo_score > 0 && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-400/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                SEO: {item.seo_score}%
              </Badge>
            )}
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{item.progress_percentage || 0}%</span>
            </div>
            <div className="relative">
              <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                <motion.div 
                  className={`h-full ${progressColor} rounded-full relative overflow-hidden`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress_percentage || 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="space-y-1 text-xs text-muted-foreground">
            {item.assigned_to && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{item.assigned_to}</span>
              </div>
            )}
            {item.due_date && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={isOverdue ? 'text-red-400' : ''}>
                  {format(parseISO(item.due_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {item.word_count > 0 && (
              <div className="flex items-center gap-1">
                <span>📊</span>
                <span>{item.word_count.toLocaleString()} words</span>
              </div>
            )}
          </div>

          {/* Stage Navigation */}
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStageChange(item, stages[stageIndex - 1]?.id)}
              disabled={stageIndex === 0}
              className="h-7 px-2 text-xs hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
            
            {item.source_proposal_id && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                <ExternalLink className="h-3 w-3 mr-1" />
                Linked
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStageChange(item, stages[stageIndex + 1]?.id)}
              disabled={stageIndex === totalStages - 1}
              className="h-7 px-2 text-xs hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {/* Blockers Display */}
          {item.blockers && item.blockers.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex flex-wrap gap-1">
                {item.blockers.slice(0, 2).map((blocker: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="destructive" 
                    className="text-xs bg-red-500/10 text-red-400 border-red-500/30"
                  >
                    🚫 {blocker}
                  </Badge>
                ))}
                {item.blockers.length > 2 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{item.blockers.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
};