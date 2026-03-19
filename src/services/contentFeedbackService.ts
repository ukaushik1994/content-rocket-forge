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
  shortened?: boolean;
  expanded?: boolean;
  patterns?: string[];
}

// Generic filler phrases the user might remove
const GENERIC_PHRASES = /in today's (digital|fast-paced|modern|competitive)|it's important to note|as we all know|at the end of the day|in conclusion|without further ado|needless to say|it goes without saying/gi;

// Example / specificity indicators
const EXAMPLE_PHRASES = /for example|for instance|such as|e\.g\.|like this|here's how|consider this|case in point/gi;

// Data / statistics indicators
const DATA_PHRASES = /\d+%|\d+\s*(million|billion|thousand|users|customers|companies)|according to|study shows|research indicates|data suggests|survey found/gi;

/**
 * Detect specific editing patterns between original and edited content
 */
function detectPatterns(original: string, edited: string): string[] {
  const patterns: string[] = [];

  // 1. Paragraph splitting: user broke long paragraphs into shorter ones
  const origParagraphs = original.split(/\n\n+/).filter(p => p.trim().length > 0);
  const editedParagraphs = edited.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (editedParagraphs.length > origParagraphs.length * 1.3 && editedParagraphs.length - origParagraphs.length >= 2) {
    patterns.push('splits_long_paragraphs');
  }

  // 2. Example adding: user added examples/specifics
  const origExamples = (original.match(EXAMPLE_PHRASES) || []).length;
  const editedExamples = (edited.match(EXAMPLE_PHRASES) || []).length;
  if (editedExamples > origExamples + 1) {
    patterns.push('adds_examples');
  }

  // 3. Generic phrase removal: user removed filler language
  const origGeneric = (original.match(GENERIC_PHRASES) || []).length;
  const editedGeneric = (edited.match(GENERIC_PHRASES) || []).length;
  if (origGeneric > 0 && editedGeneric < origGeneric) {
    patterns.push('removes_generic_filler');
  }

  // 4. Data/statistics addition: user added numbers and data
  const origData = (original.match(DATA_PHRASES) || []).length;
  const editedData = (edited.match(DATA_PHRASES) || []).length;
  if (editedData > origData + 1) {
    patterns.push('adds_data_statistics');
  }

  // 5. Heading consolidation: user reduced or restructured headings
  const countHeadings = (text: string) => {
    const html = (text.match(/<h[2-4]/gi) || []).length;
    const md = (text.match(/^#{2,4}\s/gm) || []).length;
    return html + md;
  };
  const origHeadings = countHeadings(original);
  const editedHeadings = countHeadings(edited);
  if (origHeadings > 3 && editedHeadings < origHeadings * 0.7) {
    patterns.push('consolidates_headings');
  }
  if (editedHeadings > origHeadings + 2) {
    patterns.push('adds_more_structure');
  }

  // 6. List conversion: user converted prose to lists
  const origLists = (original.match(/<li|^[-*]\s/gm) || []).length;
  const editedLists = (edited.match(/<li|^[-*]\s/gm) || []).length;
  if (editedLists > origLists + 2) {
    patterns.push('converts_to_lists');
  }

  return patterns;
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

    const countH2 = (text: string) => {
      return (text.match(/<h2/gi) || []).length + (text.match(/^##\s/gm) || []).length;
    };
    const originalH2s = countH2(originalContent);
    const editedH2s = countH2(editedContent);

    const patterns = detectPatterns(originalContent, editedContent);

    const pattern: EditPattern = {
      originalWordCount: originalWords,
      editedWordCount: editedWords,
      lengthRatio: Math.round(lengthRatio * 100) / 100,
      headingsAdded: Math.max(0, editedH2s - originalH2s),
      headingsRemoved: Math.max(0, originalH2s - editedH2s),
      significantEdit: Math.abs(lengthRatio - 1) > 0.15 || patterns.length > 0,
      shortened: lengthRatio < 0.85,
      expanded: lengthRatio > 1.15,
      patterns
    };

    // Track if significant edit OR has detected patterns
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

    if (!data || data.length < 3) return null;

    const preferences: string[] = [];

    // Length preferences
    const ratios = data.map((d: any) => d.feedback_data?.lengthRatio || 1);
    const avgRatio = ratios.reduce((a: number, b: number) => a + b, 0) / ratios.length;

    if (avgRatio < 0.75) preferences.push('User consistently shortens AI content — write more concisely, target 20% fewer words.');
    if (avgRatio > 1.25) preferences.push('User consistently expands AI content — write with more depth and detail, target 20% more words.');

    // Pattern-based preferences
    const allPatterns: string[] = data.flatMap((d: any) => d.feedback_data?.patterns || []);
    const patternCounts: Record<string, number> = {};
    for (const p of allPatterns) {
      patternCounts[p] = (patternCounts[p] || 0) + 1;
    }

    const threshold = Math.ceil(data.length * 0.3); // 30% occurrence = recurring
    const patternMessages: Record<string, string> = {
      splits_long_paragraphs: 'User prefers shorter paragraphs — keep paragraphs to 2-3 sentences max.',
      adds_examples: 'User frequently adds examples — include concrete examples and real-world scenarios in generated content.',
      removes_generic_filler: 'User removes generic phrases — avoid filler language like "in today\'s digital world" or "it\'s important to note".',
      adds_data_statistics: 'User adds data and statistics — include relevant numbers, percentages, and research references.',
      consolidates_headings: 'User consolidates headings — use fewer, more meaningful section headers.',
      adds_more_structure: 'User adds more structure — use more subheadings and clear section breaks.',
      converts_to_lists: 'User converts prose to lists — use bullet points and numbered lists where appropriate.'
    };

    for (const [pattern, count] of Object.entries(patternCounts)) {
      if (count >= threshold && patternMessages[pattern]) {
        preferences.push(patternMessages[pattern]);
      }
    }

    return preferences.length > 0 ? preferences.join('\n') : null;
  } catch {
    return null;
  }
}
