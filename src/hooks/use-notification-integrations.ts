import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import {
  ContentBuilderNotifications,
  ResearchNotifications,
  ContentManagementNotifications,
  AIAnalyticsNotifications,
  SystemNotifications,
  createContentBuilderNotifications,
  createResearchNotifications,
  createContentManagementNotifications,
  createAIAnalyticsNotifications,
  createSystemNotifications,
} from '@/services/notificationIntegrations';

/**
 * Hook to get all notification service instances for the current user
 */
export const useNotificationIntegrations = () => {
  const { user } = useAuth();
  
  const notifications = useMemo(() => {
    if (!user?.id) {
      return {
        contentBuilder: null,
        research: null,
        contentManagement: null,
        aiAnalytics: null,
        system: null,
      };
    }

    return {
      contentBuilder: createContentBuilderNotifications(user.id),
      research: createResearchNotifications(user.id),
      contentManagement: createContentManagementNotifications(user.id),
      aiAnalytics: createAIAnalyticsNotifications(user.id),
      system: createSystemNotifications(user.id),
    };
  }, [user?.id]);

  return notifications;
};

/**
 * Hook to get content builder notifications specifically
 */
export const useContentBuilderNotifications = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user?.id) return null;
    return createContentBuilderNotifications(user.id);
  }, [user?.id]);
};

/**
 * Hook to get research notifications specifically
 */
export const useResearchNotifications = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user?.id) return null;
    return createResearchNotifications(user.id);
  }, [user?.id]);
};

/**
 * Hook to get content management notifications specifically
 */
export const useContentManagementNotifications = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user?.id) return null;
    return createContentManagementNotifications(user.id);
  }, [user?.id]);
};

/**
 * Hook to get AI analytics notifications specifically  
 */
export const useAIAnalyticsNotifications = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user?.id) return null;
    return createAIAnalyticsNotifications(user.id);
  }, [user?.id]);
};

/**
 * Hook to get system notifications specifically
 */
export const useSystemNotifications = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user?.id) return null;
    return createSystemNotifications(user.id);
  }, [user?.id]);
};