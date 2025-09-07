import { useEffect } from 'react';
import { proposalManagement } from '@/services/proposalManagement';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

export const useProposalRestoration = () => {
  const { refreshData } = useContentStrategy();

  useEffect(() => {
    let isMounted = true;
    
    // Check for overdue proposals every hour
    const checkOverdue = async () => {
      if (!isMounted) return;
      
      try {
        await proposalManagement.checkAndRestoreOverdueProposals();
        if (isMounted) {
          await refreshData();
        }
      } catch (error) {
        console.error('Error in automatic proposal restoration:', error);
      }
    };

    // Check immediately on mount
    checkOverdue();

    // Set up interval to check every hour (3600000 ms)
    const interval = setInterval(checkOverdue, 3600000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Remove refreshData dependency to prevent infinite loop

  // Manual trigger for checking overdue proposals
  const checkOverdueProposals = async () => {
    try {
      await proposalManagement.checkAndRestoreOverdueProposals();
      await refreshData();
    } catch (error) {
      console.error('Error checking overdue proposals:', error);
      throw error;
    }
  };

  return {
    checkOverdueProposals
  };
};