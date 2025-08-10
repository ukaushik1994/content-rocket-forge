import { useEffect, useMemo, useState } from 'react';
import type { ContentItemType } from '@/contexts/content/types';
import type { SmartRecommendation } from '@/services/smart-actions/types';
import { getSmartRecommendation } from '@/services/aiService/smartApproval';

interface Params {
  content: ContentItemType;
  editedContent?: string;
  editedTitle?: string;
  mainKeyword?: string;
  notes?: string;
}

export function useSmartApprovalRecommendation({ content, editedContent, editedTitle, mainKeyword, notes }: Params) {
  const [recommendation, setRecommendation] = useState<SmartRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputs = useMemo(() => ({
    approvalStatus: content.approval_status,
    title: editedTitle ?? content.title,
    body: editedContent ?? content.content,
    keyword: mainKeyword ?? (content.metadata?.mainKeyword as string | undefined) ?? content.keywords?.[0],
    notes: notes ?? '',
  }), [content.approval_status, content.title, content.content, editedTitle, editedContent, mainKeyword, notes, content.metadata, content.keywords]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const rec = await getSmartRecommendation({
          approvalStatus: inputs.approvalStatus,
          title: inputs.title,
          content: inputs.body,
          mainKeyword: inputs.keyword,
          notes: inputs.notes,
        });
        if (!cancelled) setRecommendation(rec);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to get recommendation');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [inputs]);

  const refresh = async () => {
    const rec = await getSmartRecommendation({
      approvalStatus: inputs.approvalStatus,
      title: inputs.title,
      content: inputs.body,
      mainKeyword: inputs.keyword,
      notes: inputs.notes,
    });
    setRecommendation(rec);
  };

  return { recommendation, isLoading, error, refresh };
}
