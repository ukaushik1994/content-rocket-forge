import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Calendar, Archive, Play } from 'lucide-react';
import { type ProposalStatus } from '@/services/proposalStatusService';

interface ProposalStatusFilterProps {
  statusCounts: Record<ProposalStatus, number>;
  selectedStatuses: ProposalStatus[];
  onStatusToggle: (status: ProposalStatus) => void;
  onClearFilters: () => void;
}

export const ProposalStatusFilter = ({ 
  statusCounts, 
  selectedStatuses, 
  onStatusToggle, 
  onClearFilters 
}: ProposalStatusFilterProps) => {
  const statusConfig = {
    available: {
      label: 'Available',
      icon: Play,
      className: 'text-blue-400 bg-blue-500/10 border-blue-400/30'
    },
    scheduled: {
      label: 'Scheduled',
      icon: Calendar,
      className: 'text-purple-400 bg-purple-500/10 border-purple-400/30'
    },
    in_progress: {
      label: 'In Progress',
      icon: Clock,
      className: 'text-yellow-400 bg-yellow-500/10 border-yellow-400/30'
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      className: 'text-green-400 bg-green-500/10 border-green-400/30'
    },
    archived: {
      label: 'Archived',
      icon: Archive,
      className: 'text-gray-400 bg-gray-500/10 border-gray-400/30'
    }
  };

  const totalSelected = selectedStatuses.length;
  const totalProposals = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-white/5 rounded-lg border border-white/10">
      <span className="text-sm font-medium text-white/80 mr-2">Filter by Status:</span>
      
      {(Object.keys(statusConfig) as ProposalStatus[]).map((status) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const count = statusCounts[status] || 0;
        const isSelected = selectedStatuses.includes(status);
        
        return (
          <Button
            key={status}
            variant="outline"
            size="sm"
            onClick={() => onStatusToggle(status)}
            className={`gap-2 transition-all duration-200 ${
              isSelected 
                ? config.className + ' opacity-100'
                : 'text-white/60 bg-white/5 border-white/20 hover:bg-white/10'
            }`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
            <Badge 
              variant="secondary" 
              className="ml-1 text-xs bg-white/20 text-white/80"
            >
              {count}
            </Badge>
          </Button>
        );
      })}
      
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-white/60">
          {totalSelected > 0 ? `${totalSelected} filter${totalSelected > 1 ? 's' : ''} active` : `${totalProposals} total`}
        </span>
        {totalSelected > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-white/60 hover:text-white/80"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};