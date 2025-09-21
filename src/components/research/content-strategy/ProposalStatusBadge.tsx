import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle2, Clock, Archive, Play } from 'lucide-react';
import { proposalStatusService, type ProposalStatus, type ProposalStatusInfo } from '@/services/proposalStatusService';

interface ProposalStatusBadgeProps {
  proposalId: string;
  showDetails?: boolean;
  size?: 'sm' | 'md';
}

export const ProposalStatusBadge = ({ proposalId, showDetails = false, size = 'sm' }: ProposalStatusBadgeProps) => {
  const [statusInfo, setStatusInfo] = useState<ProposalStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const info = await proposalStatusService.getProposalStatus(proposalId);
        setStatusInfo(info);
      } catch (error) {
        console.error('Error loading proposal status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [proposalId]);

  if (loading) {
    return (
      <Badge variant="outline" className="text-xs">
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        Loading...
      </Badge>
    );
  }

  if (!statusInfo) {
    return (
      <Badge variant="outline" className="text-xs text-gray-400 bg-gray-500/10 border-gray-400/30">
        Unknown
      </Badge>
    );
  }

  const getStatusConfig = (status: ProposalStatus) => {
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          icon: Play,
          className: 'text-blue-400 bg-blue-500/10 border-blue-400/30'
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          icon: Calendar,
          className: 'text-purple-400 bg-purple-500/10 border-purple-400/30'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: Clock,
          className: 'text-yellow-400 bg-yellow-500/10 border-yellow-400/30'
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle2,
          className: 'text-green-400 bg-green-500/10 border-green-400/30'
        };
      case 'archived':
        return {
          label: 'Archived',
          icon: Archive,
          className: 'text-gray-400 bg-gray-500/10 border-gray-400/30'
        };
      default:
        return {
          label: 'Unknown',
          icon: Play,
          className: 'text-gray-400 bg-gray-500/10 border-gray-400/30'
        };
    }
  };

  const config = getStatusConfig(statusInfo.status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1">
      <Badge 
        variant="outline" 
        className={`${size === 'sm' ? 'text-xs' : 'text-sm'} ${config.className}`}
        title={showDetails ? `In Calendar: ${statusInfo.inCalendar ? 'Yes' : 'No'} | Content Created: ${statusInfo.inContentRepository ? 'Yes' : 'No'}` : undefined}
      >
        <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        {config.label}
      </Badge>
      
      {showDetails && (
        <>
          {statusInfo.inCalendar && (
            <Badge variant="outline" className="text-xs text-purple-400 bg-purple-500/10 border-purple-400/30">
              📅 In Calendar
            </Badge>
          )}
          {statusInfo.inContentRepository && (
            <Badge variant="outline" className="text-xs text-green-400 bg-green-500/10 border-green-400/30">
              📝 Content Created
            </Badge>
          )}
        </>
      )}
    </div>
  );
};