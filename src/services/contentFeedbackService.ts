/**
 * Content Feedback Service
 * Tracks user editing patterns on AI-generated content to learn preferences
 */
import { supabase } from '@/integrations/supabase/client';

interface EditPattern {
  originalWordCount: number;
  editedWordCount: number;
  lengthRatio: number;
  headingsAdded: number;
  headingsRemoved: number;
  significantEdit: boolean;
}

/**
 * Compare original vs edited content and track the edit pattern
 */
export async function trackContentEdit(
  contentId: string,
  originalContent: string,
  editedContent: string
): Promise<void> {
  try {
    const originalWords = originalContent.split(/\s+/).length;
    const editedWords = editedContent.split(/\s+/).length;
    const lengthRatio = editedWords / Math.max(originalWords, 1);

    const originalH2s = (originalContent.match(/<h2/gi) || originalContent.match(/^##\s/gm) || []).length;
    const editedH2s = (editedContent.match(/<h2/gi) || editedContent.match(/^##\s/gm) || []).length;

    const pattern: EditPattern = {
      originalWordCount: originalWords,
      editedWordCount: editedWords,
      lengthRatio: Math.round(lengthRatio * 100) / 100,
      headingsAdded: Math.max(0, editedH2s - originalH2s),
      headingsRemoved: Math.max(0, originalH2s - editedH2s),
      significantEdit: Math.abs(lengthRatio - 1) > 0.15 // >15% change = significant
    };

    // Only track significant edits
    if (!pattern.significantEdit) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase as any).from('content_generation_feedback').insert({
      user_id: user.id,
      content_id: contentId,
      feedback_type: 'edit_pattern',
      feedback_data: pattern
    });

    console.log('📊 Tracked content edit pattern:', pattern);
  } catch (err) {
    console.warn('Failed to track content edit (non-blocking):', err);
  }
}

/**
 * Get aggregated edit preferences for the current user
 * Returns learned preferences like "user tends to shorten content"
 */
export async function getEditPreferences(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await (supabase as any).from('content_generation_feedback')
      .select('feedback_data')
      .eq('user_id', user.id)
      .eq('feedback_type', 'edit_pattern')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!data || data.length < 3) return null; // Need at least 3 edits to learn

    const ratios = data.map((d: any) => d.feedback_data?.lengthRatio || 1);
    const avgRatio = ratios.reduce((a: number, b: number) => a + b, 0) / ratios.length;

    if (avgRatio < 0.75) return 'User consistently shortens AI content — write more concisely, target 20% fewer words.';
    if (avgRatio > 1.25) return 'User consistently expands AI content — write with more depth and detail, target 20% more words.';

    return null;
  } catch {
    return null;
  }
}
