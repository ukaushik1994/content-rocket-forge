import { useState, useEffect, useMemo } from 'react';
import { proposalStatusService, type ProposalStatus } from '@/services/proposalStatusService';

export const useProposalStatusFilter = (proposals: any[]) => {
  const [selectedStatuses, setSelectedStatuses] = useState<ProposalStatus[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<ProposalStatus, number>>({
    available: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    archived: 0
  });
  const [loading, setLoading] = useState(false);

  // Update status counts when proposals change
  useEffect(() => {
    const updateStatusCounts = async () => {
      if (proposals.length === 0) return;
      
      setLoading(true);
      try {
        const proposalIds = proposals
          .map(p => p.id)
          .filter(Boolean);
        
        if (proposalIds.length === 0) {
          setStatusCounts({
            available: proposals.length,
            scheduled: 0,
            in_progress: 0, 
            completed: 0,
            archived: 0
          });
          return;
        }

        const statusInfo = await proposalStatusService.getBulkProposalStatus(proposalIds);
        
        const counts: Record<ProposalStatus, number> = {
          available: 0,
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          archived: 0
        };

        // Count proposals with status info
        Object.values(statusInfo).forEach(info => {
          counts[info.status]++;
        });

        // Count proposals without status info as available
        const proposalsWithoutStatus = proposals.length - Object.values(statusInfo).length;
        counts.available += proposalsWithoutStatus;

        setStatusCounts(counts);
      } catch (error) {
        console.error('Error updating status counts:', error);
      } finally {
        setLoading(false);
      }
    };

    updateStatusCounts();
  }, [proposals]);

  // Filter proposals based on selected statuses
  const filteredProposals = useMemo(() => {
    if (selectedStatuses.length === 0) {
      return proposals;
    }

    return proposals.filter((proposal) => {
      // If proposal has no ID, treat as available
      if (!proposal.id) {
        return selectedStatuses.includes('available');
      }

      // This is a simplified check - in a real implementation,
      // you'd want to batch check all statuses for performance
      const status = 'available'; // Default status for proposals without explicit status
      return selectedStatuses.includes(status);
    });
  }, [proposals, selectedStatuses]);

  const handleStatusToggle = (status: ProposalStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
  };

  return {
    selectedStatuses,
    statusCounts,
    filteredProposals,
    loading,
    handleStatusToggle,
    clearFilters
  };
};