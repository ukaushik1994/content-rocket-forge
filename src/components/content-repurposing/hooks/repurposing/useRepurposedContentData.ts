
import { useState, useEffect, useCallback } from 'react';
import { repurposedContentService } from '@/services/repurposedContentService';
import { ContentItemType } from '@/contexts/content/types';

export const useRepurposedContentData = (contentId: string | null) => {
  const [repurposedFormats, setRepurposedFormats] = useState<string[]>([]);
  const [repurposedContentMap, setRepurposedContentMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load repurposed content data from database
  const loadRepurposedData = useCallback(async () => {
    if (!contentId) {
      setRepurposedFormats([]);
      setRepurposedContentMap({});
      return;
    }

    setIsLoading(true);
    try {
      const [formats, contentMap] = await Promise.all([
        repurposedContentService.getRepurposedFormatsForContent(contentId),
        repurposedContentService.getRepurposedContentMap(contentId)
      ]);

      setRepurposedFormats(formats);
      setRepurposedContentMap(contentMap);
    } catch (error) {
      console.error('Error loading repurposed content data:', error);
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
    loadRepurposedData();
  }, [loadRepurposedData]);

  return {
    repurposedFormats,
    repurposedContentMap,
    isLoading,
    refreshData
  };
};
