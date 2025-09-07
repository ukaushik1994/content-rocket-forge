import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  GitBranch, 
  FileText,
  Archive,
  Star
} from 'lucide-react';
import { ProposalLifecycleStatus } from '@/services/proposalLifecycleService';

interface ProposalStatusBadgeProps {
  status: ProposalLifecycleStatus;
  completionPercentage?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'detailed';
}

export const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({
  status,
  completionPercentage = 0,
  showProgress = false,
  size = 'md',
  variant = 'default'
}) => {
  const getStatusConfig = (status: ProposalLifecycleStatus) => {
    switch (status) {
      case 'generated':
        return {
          label: 'Generated',
          icon: Star,
          color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          description: 'AI proposal created'
        };
      case 'selected':
        return {
          label: 'Selected',
          icon: CheckCircle,
          color: 'bg-green-500/10 text-green-600 border-green-500/20',
          description: 'Added to strategy'
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          icon: Calendar,
          color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          description: 'Added to calendar'
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          icon: GitBranch,
          color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          description: 'Content development'
        };
      case 'review':
        return {
          label: 'Review',
          icon: AlertCircle,
          color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
          description: 'Under review'
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          description: 'Content completed'
        };
      case 'published':
        return {
          label: 'Published',
          icon: FileText,
          color: 'bg-green-600/10 text-green-700 border-green-600/20',
          description: 'Content live'
        };
      case 'archived':
        return {
          label: 'Archived',
          icon: Archive,
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          description: 'Proposal archived'
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (variant === 'detailed') {
    return (
      <div className="flex flex-col gap-1">
        <div className={`
          inline-flex items-center gap-1.5 rounded-md border font-medium
          ${config.color} ${sizeClasses[size]}
        `}>
          <IconComponent className={iconSizes[size]} />
          <span>{config.label}</span>
          {completionPercentage > 0 && (
            <span className="text-xs opacity-75">
              {completionPercentage}%
            </span>
          )}
        </div>
        
        {showProgress && completionPercentage > 0 && (
          <div className="flex items-center gap-2">
            <Progress 
              value={completionPercentage} 
              className="h-2 flex-1"
            />
            <span className="text-xs text-muted-foreground">
              {completionPercentage}%
            </span>
          </div>
        )}
        
        {variant === 'detailed' && (
          <span className="text-xs text-muted-foreground">
            {config.description}
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`
        inline-flex items-center gap-1.5 
        ${config.color} ${sizeClasses[size]}
      `}
    >
      <IconComponent className={iconSizes[size]} />
      <span>{config.label}</span>
      {completionPercentage > 0 && showProgress && (
        <span className="text-xs opacity-75">
          {completionPercentage}%
        </span>
      )}
    </Badge>
  );
};