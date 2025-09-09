import { useState, useEffect } from 'react';
import { overdueContentService, OverdueContentItem } from '@/services/overdueContentService';
import { toast } from 'sonner';

export const useOverdueContentMonitor = () => {
  const [overdueItems, setOverdueItems] = useState<OverdueContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check for overdue content on component mount and periodically
  useEffect(() => {
    checkOverdueContent();

    // Set up periodic checking every hour
    const interval = setInterval(checkOverdueContent, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkOverdueContent = async () => {
    try {
      setLoading(true);
      const items = await overdueContentService.checkOverdueContent();
      setOverdueItems(items);
      setLastChecked(new Date());
      
      // Show notification if there are overdue items
      if (items.length > 0) {
        const criticalCount = items.filter(item => item.days_overdue >= 7).length;
        const moderateCount = items.filter(item => item.days_overdue >= 3 && item.days_overdue < 7).length;
        
        if (criticalCount > 0) {
          toast.error(`${criticalCount} content pieces are critically overdue (7+ days)`, {
            description: 'Consider moving them back to proposals for rescheduling',
            action: {
              label: 'View Calendar',
              onClick: () => window.location.href = '/research/content-strategy#calendar'
            }
          });
        } else if (moderateCount > 0) {
          toast.warning(`${moderateCount} content pieces are overdue`, {
            description: 'Please review and update their status',
            action: {
              label: 'View Calendar', 
              onClick: () => window.location.href = '/research/content-strategy#calendar'
            }
          });
        }
      }
      
    } catch (error) {
      console.error('Error checking overdue content:', error);
    } finally {
      setLoading(false);
    }
  };

  const processOverdueContent = async () => {
    try {
      setLoading(true);
      const result = await overdueContentService.processOverdueContent();
      
      if (result.restored > 0) {
        toast.success(`Processed overdue content: ${result.restored} items restored to proposals`);
        // Refresh the overdue list
        await checkOverdueContent();
      }
      
      return result;
      
    } catch (error) {
      console.error('Error processing overdue content:', error);
      toast.error('Failed to process overdue content');
      return { checked: 0, restored: 0, notificationsCreated: 0 };
    } finally {
      setLoading(false);
    }
  };

  const restoreOverdueItems = async (itemsToRestore: OverdueContentItem[]) => {
    try {
      setLoading(true);
      const result = await overdueContentService.restoreOverdueToProposals(itemsToRestore);
      
      if (result.restored > 0) {
        toast.success(`Restored ${result.restored} overdue items back to proposals`);
        // Refresh the overdue list
        await checkOverdueContent();
      }
      
      return result;
      
    } catch (error) {
      console.error('Error restoring overdue items:', error);
      toast.error('Failed to restore overdue items');
      return { restored: 0, errors: itemsToRestore.length };
    } finally {
      setLoading(false);
    }
  };

  return {
    overdueItems,
    loading,
    lastChecked,
    checkOverdueContent,
    processOverdueContent,
    restoreOverdueItems,
    hasOverdueContent: overdueItems.length > 0,
    criticalOverdueCount: overdueItems.filter(item => item.days_overdue >= 7).length,
    moderateOverdueCount: overdueItems.filter(item => item.days_overdue >= 3 && item.days_overdue < 7).length
  };
};