import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';
import { contentAiAnalysisService, ContentAnalysisRecord } from '@/services/contentAiAnalysisService';

export function useContentAnalysis(contentId?: string | null) {
  const [data, setData] = useState<ContentAnalysisRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!contentId) return;
    try {
      setLoading(true);
      setError(null);
      const existing = await contentAiAnalysisService.getExistingAnalysis(contentId);
      setData(existing);
    } catch (e: any) {
      console.error('Failed to load analysis:', e);
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  const analyzeOnce = useCallback(async (item: ContentItemType) => {
    try {
      setLoading(true);
      setError(null);
      const result = await contentAiAnalysisService.analyzeOnce(item);
      if (!result) throw new Error('No analysis returned');
      setData(result);
      toast.success('Analysis completed');
      return result;
    } catch (e: any) {
      console.error('Analyze once failed:', e);
      setError('Analyze failed');
      toast.error('Analyze failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reanalyze = useCallback(async (item: ContentItemType) => {
    try {
      setLoading(true);
      setError(null);
      const result = await contentAiAnalysisService.reanalyze(item);
      if (!result) throw new Error('No analysis returned');
      setData(result);
      toast.success('Reanalyzed successfully');
      return result;
    } catch (e: any) {
      console.error('Reanalyze failed:', e);
      setError('Reanalyze failed');
      toast.error('Reanalyze failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, analyzeOnce, reanalyze };
}
