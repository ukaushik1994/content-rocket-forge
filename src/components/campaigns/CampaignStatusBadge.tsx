import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileEdit, Lightbulb, Zap, CheckCircle, Archive } from 'lucide-react';
import { CampaignStatus } from '@/types/campaign-types';
import { cn } from '@/lib/utils';

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

const statusConfig: Record<CampaignStatus, { 
  color: string; 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = {
  draft: { 
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', 
    icon: FileEdit,
    label: 'Draft'
  },
  planned: { 
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', 
    icon: Lightbulb,
    label: 'Planned'
  },
  active: { 
    color: 'bg-green-500/20 text-green-300 border-green-500/30', 
    icon: Zap,
    label: 'Active'
  },
  completed: { 
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', 
    icon: CheckCircle,
    label: 'Completed'
  },
  archived: { 
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', 
    icon: Archive,
    label: 'Archived'
  },
};

export const CampaignStatusBadge = ({ status, className }: CampaignStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1',
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
