import { useState, useMemo } from 'react';
import { type ProposalStatus } from '@/services/proposalStatusService';
import { DateRange } from 'react-day-picker';

interface ConsolidatedFilterState {
  statuses: ProposalStatus[];
  categories: string[];
  dateRange?: DateRange;
}

export const useConsolidatedFilters = (proposals: any[]) => {
  const [filters, setFilters] = useState<ConsolidatedFilterState>({
    statuses: [],
    categories: [],
    dateRange: undefined
  });

  // Calculate counts for each filter option
  const statusCounts = useMemo(() => {
    const counts: Record<ProposalStatus, number> = {
      available: 0,
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      archived: 0
    };

    proposals.forEach(proposal => {
      const status = proposal.status || 'available';
      if (counts[status as ProposalStatus] !== undefined) {
        counts[status as ProposalStatus]++;
      }
    });

    return counts;
  }, [proposals]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: proposals.length,
      selected: 0, // This would need to be passed from parent component
      quick_win: 0,
      high_return: 0,
      evergreen: 0
    };

    proposals.forEach(proposal => {
      const priority = proposal.priority_tag || 'evergreen';
      if (counts[priority] !== undefined) {
        counts[priority]++;
      }
    });

    return counts;
  }, [proposals]);

  // Apply filters to proposals
  const filteredProposals = useMemo(() => {
    let filtered = [...proposals];

    // Apply status filters
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(proposal => {
        const status = proposal.status || 'available';
        return filters.statuses.includes(status as ProposalStatus);
      });
    }

    // Apply category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(proposal => {
        // Handle special categories
        if (filters.categories.includes('all')) {
          return true;
        }
        
        const priority = proposal.priority_tag || 'evergreen';
        return filters.categories.includes(priority);
      });
    }

    // Apply date range filter
    if (filters.dateRange?.from) {
      filtered = filtered.filter(proposal => {
        if (!proposal.created_at) return true; // Include proposals without dates
        
        const proposalDate = new Date(proposal.created_at);
        const fromDate = filters.dateRange!.from!;
        const toDate = filters.dateRange!.to || fromDate;
        
        return proposalDate >= fromDate && proposalDate <= toDate;
      });
    }

    return filtered;
  }, [proposals, filters]);

  const hasActiveFilters = () => {
    return filters.statuses.length > 0 || 
           filters.categories.length > 0 || 
           filters.dateRange !== undefined;
  };

  const clearAllFilters = () => {
    setFilters({
      statuses: [],
      categories: [],
      dateRange: undefined
    });
  };

  const updateSelectedCount = (selectedCount: number) => {
    // This would be called from parent to update the selected count
    // for the category filter display
  };

  return {
    filters,
    setFilters,
    filteredProposals,
    statusCounts,
    categoryCounts,
    hasActiveFilters,
    clearAllFilters,
    updateSelectedCount
  };
};