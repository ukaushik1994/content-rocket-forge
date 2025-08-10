import { supabase } from '@/integrations/supabase/client';

const isLoggingEnabled = (): boolean => {
  try {
    const v = localStorage.getItem('smart_actions_logging');
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
};

export async function logApprovalRecommendation(params: {
  contentId?: string;
  action: 'approve' | 'request_changes' | 'reject' | 'submit_for_review';
  confidence?: number;
  reasoning?: string;
  model?: string;
}) {
  if (!isLoggingEnabled()) return;
  try {
    if (!params.contentId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Not logged in; skip logging gracefully
    await supabase.from('approval_recommendations').insert({
      content_id: params.contentId,
      user_id: user.id,
      action: params.action,
      confidence: params.confidence ?? null,
      reasoning: params.reasoning ?? null,
      model: params.model ?? 'heuristic-v1'
    } as any);
  } catch (e) {
    console.warn('logApprovalRecommendation failed', e);
  }
}

export async function logApprovalAction(params: {
  contentId?: string;
  action: 'approve' | 'request_changes' | 'reject' | 'submit_for_review';
  acceptedRecommendation?: boolean;
  source?: 'user' | 'ai';
  latencyMs?: number;
}) {
  if (!isLoggingEnabled()) return;
  try {
    if (!params.contentId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Not logged in; skip logging gracefully
    await supabase.from('approval_actions_log').insert({
      content_id: params.contentId,
      user_id: user.id,
      action: params.action,
      source: params.source ?? 'user',
      accepted_recommendation: !!params.acceptedRecommendation,
      latency_ms: params.latencyMs ?? null
    } as any);
  } catch (e) {
    console.warn('logApprovalAction failed', e);
  }
}
