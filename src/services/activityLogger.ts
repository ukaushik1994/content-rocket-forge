import { supabase } from '@/integrations/supabase/client';

export type ActivityLogPayload = {
  userId: string;
  contentId?: string;
  contentType?: string; // e.g. 'blog', 'article'
  module: string;       // e.g. 'editor', 'approval', 'seo'
  action: string;       // e.g. 'update', 'note_added', 'approve'
  changeSummary?: string;
  notes?: string;
  prompt?: string;
  details?: Record<string, any>;
  contentSnapshot?: Record<string, any> | null;
};

export async function logActivity(payload: ActivityLogPayload) {
  try {
    const {
      userId,
      contentId,
      contentType,
      module,
      action,
      changeSummary,
      notes,
      prompt,
      details,
      contentSnapshot,
    } = payload;

    // content_activity_log requires: user_id, content_type (existing schema)
    const { error } = await supabase.from('content_activity_log').insert({
      user_id: userId,
      content_id: contentId ?? null,
      content_type: contentType ?? (details?.content_type ?? 'blog'),
      module: module ?? null,
      action,
      change_summary: changeSummary ?? null,
      notes: notes ?? null,
      prompt: prompt ?? null,
      metadata: details ?? {},
      content_snapshot: contentSnapshot ?? null,
    });

    if (error) {
      console.warn('logActivity insert failed:', error);
    }
  } catch (e) {
    console.warn('logActivity error:', e);
  }
}
