import { useState, useEffect, useMemo } from 'react';
import { proposalStatusService, type ProposalStatus } from '@/services/proposalStatusService';

export const useProposalStatusFilterFixed = (proposals: any[], calendarItems: any[] = []) => {
  const [selectedStatuses, setSelectedStatuses] = useState<ProposalStatus[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<ProposalStatus, number>>({
    available: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    archived: 0
  });
  const [filteredProposals, setFilteredProposals] = useState<any[]>(proposals);
  const [loading, setLoading] = useState(false);

  // Update status counts and filtering when proposals OR calendar items change
  useEffect(() => {
    const updateStatusData = async () => {
      console.log('🔄 Updating proposal status data, proposals count:', proposals.length, 'calendar items:', calendarItems.length);
      if (proposals.length === 0) {
        setStatusCounts({
          available: 0,
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          archived: 0
        });
        setFilteredProposals([]);
        return;
      }
      
      setLoading(true);
      try {
        const proposalIds = proposals
          .map(p => p.id)
          .filter(Boolean);
        
        if (proposalIds.length === 0) {
          const allAvailable = proposals.length;
          setStatusCounts({
            available: allAvailable,
            scheduled: 0,
            in_progress: 0,
            completed: 0,
            archived: 0
          });
          // Apply filtering for proposals without IDs
          if (selectedStatuses.length === 0 || selectedStatuses.includes('available')) {
            setFilteredProposals(proposals);
          } else {
            setFilteredProposals([]);
          }
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
        const proposalsWithStatus = new Set<string>();
        Object.entries(statusInfo).forEach(([proposalId, info]) => {
          counts[info.status]++;
          proposalsWithStatus.add(proposalId);
        });

        // Count proposals without status info as available
        const proposalsWithoutStatus = proposals.filter(p => p.id && !proposalsWithStatus.has(p.id)).length;
        const proposalsWithoutIds = proposals.filter(p => !p.id).length;
        counts.available += proposalsWithoutStatus + proposalsWithoutIds;

        setStatusCounts(counts);

        // Apply filtering
        if (selectedStatuses.length === 0) {
          setFilteredProposals(proposals);
        } else {
          const filtered = proposals.filter((proposal) => {
            if (!proposal.id) {
              return selectedStatuses.includes('available');
            }
            
            const proposalStatus = statusInfo[proposal.id];
            const status = proposalStatus?.status || 'available';
            return selectedStatuses.includes(status);
          });
          setFilteredProposals(filtered);
        }

      } catch (error) {
        console.error('Error updating status data:', error);
        // Fallback: treat all as available
        setStatusCounts({
          available: proposals.length,
          scheduled: 0,
          in_progress: 0,
          completed: 0,
          archived: 0
        });
        setFilteredProposals(selectedStatuses.length === 0 || selectedStatuses.includes('available') ? proposals : []);
      } finally {
        setLoading(false);
      }
    };

    updateStatusData();
  }, [proposals, selectedStatuses, calendarItems]); // Added calendarItems dependency

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