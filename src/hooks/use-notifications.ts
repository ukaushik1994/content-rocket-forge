import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  EnhancedDashboardAlert,
  fetchEnhancedAlerts,
  subscribeToEnhancedAlerts,
  pushEnhancedAlert,
  markMultipleRead,
  archiveMultiple,
  NotificationPriority
} from '@/services/enhancedNotificationsService';
import { toast } from 'sonner';

export interface UseNotificationsOptions {
  autoRefresh?: boolean;
  priority?: NotificationPriority;
  category?: string;
  limit?: number;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { user } = useAuth();
  const { autoRefresh = true, priority, category, limit = 50 } = options;
  
  const [notifications, setNotifications] = useState<EnhancedDashboardAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchEnhancedAlerts(user.id, {
        limit,
        priority,
        category,
        grouped: true,
      });
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit, priority, category]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !autoRefresh) return;

    fetchNotifications();

    const unsubscribe = subscribeToEnhancedAlerts(
      user.id,
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
      },
      (updatedNotification) => {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === updatedNotification.id
              ? updatedNotification
              : notification
          )
        );
      }
    );

    return () => unsubscribe();
  }, [user?.id, autoRefresh, fetchNotifications]);

  // Push notification
  const pushNotification = useCallback(async (params: Parameters<typeof pushEnhancedAlert>[0]) => {
    if (!user?.id) return;
    
    try {
      await pushEnhancedAlert({ ...params, userId: user.id });
      await fetchNotifications(); // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to push notification';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [user?.id, fetchNotifications]);

  // Bulk mark as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!user?.id || notificationIds.length === 0) return;
    
    try {
      await markMultipleRead(user.id, notificationIds);
      setNotifications(prev =>
        prev.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, status: 'read', is_read: true }
            : notification
        )
      );
      toast.success(`Marked ${notificationIds.length} notifications as read`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notifications as read';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [user?.id]);

  // Bulk archive
  const archiveNotifications = useCallback(async (notificationIds: string[]) => {
    if (!user?.id || notificationIds.length === 0) return;
    
    try {
      await archiveMultiple(user.id, notificationIds);
      setNotifications(prev =>
        prev.filter(notification => !notificationIds.includes(notification.id))
      );
      toast.success(`Archived ${notificationIds.length} notifications`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive notifications';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [user?.id]);

  // Computed values
  const unreadCount = notifications.filter(n => n.status === 'unread' || n.is_read === false).length;
  const categories = Array.from(new Set(notifications.map(n => n.module).filter(Boolean)));
  const hasNotifications = notifications.length > 0;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    categories,
    hasNotifications,
    // Actions
    fetchNotifications,
    pushNotification,
    markAsRead,
    archiveNotifications,
    // Shortcuts
    markAllAsRead: () => {
      const unreadIds = notifications
        .filter(n => n.status === 'unread' || n.is_read === false)
        .map(n => n.id);
      return markAsRead(unreadIds);
    },
    refresh: fetchNotifications,
  };
};