import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { processDueContentNotifications } from '@/services/dueContentNotificationService';

/**
 * Hook to check for due content and create notifications
 * Runs on mount, every 30 minutes, and on calendar changes
 */
export const useDueContentNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      console.log('⏸️ useDueContentNotifications: No user, skipping');
      return;
    }

    console.log('🔔 useDueContentNotifications: Setting up due content checks for user:', user.id);

    // Check immediately on mount
    processDueContentNotifications(user.id);

    // Check every 30 minutes
    const interval = setInterval(() => {
      console.log('⏰ useDueContentNotifications: Running scheduled check...');
      processDueContentNotifications(user.id);
    }, 30 * 60 * 1000); // 30 minutes

    // Subscribe to realtime calendar changes
    const channel = supabase
      .channel('calendar-due-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_calendar',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 useDueContentNotifications: Calendar changed, checking for due content...', payload);
          processDueContentNotifications(user.id);
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 useDueContentNotifications: Cleaning up...');
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    checkNow: () => {
      if (user?.id) {
        processDueContentNotifications(user.id);
      }
    }
  };
};
