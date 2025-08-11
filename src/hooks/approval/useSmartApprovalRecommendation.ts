import { useEffect, useMemo, useRef } from 'react';
import type { ContentItemType } from '@/contexts/content/types';
import type { SmartRecommendation } from '@/services/smart-actions/types';
import { getSmartRecommendation } from '@/services/aiService/smartApproval';
import { logApprovalRecommendation } from '@/services/smart-actions/logging';
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { getCohort } from '@/services/experiments/ab';

interface Params {
  content: ContentItemType;
  editedContent?: string;
  editedTitle?: string;
  mainKeyword?: string;
  notes?: string;
}

function buildInputs({ content, editedContent, editedTitle, mainKeyword, notes }: Params) {
  return {
    approvalStatus: content.approval_status,
    title: editedTitle ?? content.title,
    body: editedContent ?? content.content,
    keyword: mainKeyword ?? (content.metadata?.mainKeyword as string | undefined) ?? content.keywords?.[0],
    notes: notes ?? '',
  };
}

function buildQueryKey(contentId: string) {
  return ['smart-recommendation', contentId] as const;
}

export function useSmartApprovalRecommendation(params: Params) {
  const inputs = useMemo(() => buildInputs(params), [params.content.approval_status, params.content.title, params.content.content, params.editedTitle, params.editedContent, params.mainKeyword, params.notes, params.content.metadata, params.content.keywords]);
  const loggedForContentRef = useRef<string | null>(null);
  const cohort = getCohort('smartActions');

  const query = useQuery<SmartRecommendation>({
    queryKey: buildQueryKey(params.content.id),
    queryFn: async () => {
      const rec = await getSmartRecommendation({
        approvalStatus: inputs.approvalStatus,
        title: inputs.title,
        content: inputs.body,
        mainKeyword: inputs.keyword,
        notes: inputs.notes,
      });
      return rec;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Log once per content id
  useEffect(() => {
    const rec = query.data;
    if (!rec) return;
    if (loggedForContentRef.current === params.content.id) return;
    loggedForContentRef.current = params.content.id;
    (async () => {
      try {
        await logApprovalRecommendation({
          contentId: params.content.id,
          action: rec.action,
          confidence: rec.confidence,
          reasoning: rec.reasoning,
          model: `heuristic-v1/${cohort}`,
        });
      } catch {
        // noop
      }
    })();
  }, [query.data, params.content.id, cohort]);

  const queryClient = useQueryClient();
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: buildQueryKey(params.content.id) });
  };

  return { recommendation: query.data ?? null, isLoading: query.isLoading, error: (query.error as Error | null)?.message ?? null, refresh };
}

export async function prefetchSmartRecommendation(queryClient: QueryClient, params: Params) {
  const inputs = buildInputs(params);
  const key = buildQueryKey(params.content.id);
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: () => getSmartRecommendation({
      approvalStatus: inputs.approvalStatus,
      title: inputs.title,
      content: inputs.body,
      mainKeyword: inputs.keyword,
      notes: inputs.notes,
    }),
    staleTime: 1000 * 60 * 10,
  });
}

