import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsConnectionStatus {
  hasGoogleAnalytics: boolean;
  hasSearchConsole: boolean;
  hasAnyAnalytics: boolean;
  hasPublishedContent: boolean;
  loading: boolean;
  error: string | null;
}

export const useAnalyticsConnection = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<AnalyticsConnectionStatus>({
    hasGoogleAnalytics: false,
    hasSearchConsole: false,
    hasAnyAnalytics: false,
    hasPublishedContent: false,
    loading: true,
    error: null
  });

  const checkAnalyticsConnection = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      // Check for API keys (use metadata view for security - no encrypted_key exposed)
      const { data: apiKeys, error: apiError } = await supabase
        .from('api_keys_metadata')
        .select('service')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('service', ['google-analytics', 'google-search-console']);

      if (apiError) throw apiError;

      const hasGoogleAnalytics = apiKeys?.some(key => key.service === 'google-analytics') || false;
      const hasSearchConsole = apiKeys?.some(key => key.service === 'google-search-console') || false;

      // Check for published content with URLs
      const { data: publishedContent, error: contentError } = await supabase
        .from('content_items')
        .select('id, published_url')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .not('published_url', 'is', null)
        .limit(1);

      if (contentError) throw contentError;

      const hasPublishedContent = (publishedContent?.length || 0) > 0;

      setStatus({
        hasGoogleAnalytics,
        hasSearchConsole,
        hasAnyAnalytics: hasGoogleAnalytics || hasSearchConsole,
        hasPublishedContent,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error checking analytics connection:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to check analytics connection'
      }));
    }
  };

  useEffect(() => {
    checkAnalyticsConnection();
  }, [user]);

  return {
    ...status,
    refreshConnection: checkAnalyticsConnection
  };
};