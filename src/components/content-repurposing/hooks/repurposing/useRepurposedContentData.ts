
import { useState, useEffect, useCallback } from 'react';
import { repurposedContentService } from '@/services/repurposedContentService';

export const useRepurposedContentData = (contentId: string | null) => {
  const [repurposedFormats, setRepurposedFormats] = useState<string[]>([]);
  const [repurposedContentMap, setRepurposedContentMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load repurposed content data from database
  const loadRepurposedData = useCallback(async () => {
    if (!contentId) {
      console.log('[useRepurposedContentData] No contentId provided, clearing data');
      setRepurposedFormats([]);
      setRepurposedContentMap({});
      return;
    }

    setIsLoading(true);
    console.log('[useRepurposedContentData] Loading data for content:', contentId);
    
    try {
      const [formats, contentMap] = await Promise.all([
        repurposedContentService.getRepurposedFormatsForContent(contentId),
        repurposedContentService.getRepurposedContentMap(contentId)
      ]);

      console.log('[useRepurposedContentData] Loaded data:', { 
        formatsCount: formats.length, 
        contentMapKeys: Object.keys(contentMap) 
      });

      setRepurposedFormats(formats);
      setRepurposedContentMap(contentMap);
    } catch (error) {
      console.error('[useRepurposedContentData] Error loading repurposed content data:', error);
      setRepurposedFormats([]);
      setRepurposedContentMap({});
    } finally {
      setIsLoading(false);
    }
  }, [contentId]);

  // Load data when contentId changes
  useEffect(() => {
    loadRepurposedData();
  }, [loadRepurposedData]);

  // Refresh data after operations
  const refreshData = useCallback(() => {
    console.log('[useRepurposedContentData] Refreshing data');
    loadRepurposedData();
  }, [loadRepurposedData]);

  return {
    repurposedFormats,
    repurposedContentMap,
    isLoading,
    refreshData
  };
};
