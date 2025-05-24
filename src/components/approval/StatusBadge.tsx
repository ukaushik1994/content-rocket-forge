
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle2, XCircle, Edit, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  'draft': { 
    label: 'Draft', 
    icon: Edit, 
    className: 'bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30' 
  },
  'pending_review': { 
    label: 'Pending Review', 
    icon: Clock, 
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30' 
  },
  'in_review': { 
    label: 'In Review', 
    icon: AlertCircle, 
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30' 
  },
  'approved': { 
    label: 'Approved', 
    icon: CheckCircle2, 
    className: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30' 
  },
  'rejected': { 
    label: 'Rejected', 
    icon: XCircle, 
    className: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30' 
  },
  'needs_changes': { 
    label: 'Needs Changes', 
    icon: AlertCircle, 
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30' 
  },
  'published': { 
    label: 'Published', 
    icon: CheckCircle2, 
    className: 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30' 
  },
  'archived': { 
    label: 'Archived', 
    icon: Archive, 
    className: 'bg-gray-600/20 text-gray-400 border-gray-600/30 hover:bg-gray-600/30' 
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className 
}) => {
  const config = statusConfig[status as keyof typeof statusConfig];
  
  if (!config) {
    return (
      <Badge variant="outline" className={cn('bg-gray-500/20 text-gray-400', className)}>
        {status}
      </Badge>
    );
  }

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.className,
        sizeClasses[size],
        'transition-all duration-200 font-medium',
        showIcon && 'flex items-center gap-1.5',
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};
