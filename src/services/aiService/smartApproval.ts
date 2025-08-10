import type { SmartAction, SmartRecommendation } from '@/services/smart-actions/types';

interface BuildPromptParams {
  title?: string;
  content?: string;
  mainKeyword?: string;
  approvalStatus?: string;
  notes?: string;
}

export function buildPrompt({ title, content, mainKeyword, approvalStatus, notes }: BuildPromptParams): string {
  // Placeholder prompt builder for future LLM integration
  const summary = `Title: ${title || ''}\nStatus: ${approvalStatus || ''}\nKeyword: ${mainKeyword || ''}\nNotes: ${notes || ''}\nContent length: ${content?.length || 0}`;
  return `You are a senior editor. Decide to approve, request_changes, or reject.\n${summary}`;
}

// Lightweight heuristic-based recommendation (Phase 2). Replace with LLM in Phase 3+.
export async function getSmartRecommendation(params: BuildPromptParams): Promise<SmartRecommendation> {
  const { title = '', content = '', mainKeyword = '', approvalStatus = 'in_review', notes = '' } = params;

  // Simple signal extraction
  const len = content.trim().length;
  const hasKeywordInTitle = mainKeyword && title.toLowerCase().includes(mainKeyword.toLowerCase());
  const hasKeywordInContent = mainKeyword && content.toLowerCase().includes(mainKeyword.toLowerCase());
  const notesLower = notes.toLowerCase();

  // Hard rules based on notes
  if (/plagiar|offensive|spam|irrelevant/.test(notesLower)) {
    return { action: 'reject', confidence: 85, reasoning: 'Reviewer notes indicate critical issues (policy/quality).' };
  }
  if (/minor|typo|polish|small|nit/.test(notesLower)) {
    return { action: 'request_changes', confidence: 70, reasoning: 'Reviewer notes suggest minor issues needing edits.' };
  }

  // Status-specific suggestion
  if (approvalStatus === 'draft') {
    if (len > 300) {
      return { action: 'submit_for_review', confidence: 75, reasoning: 'Draft appears sufficiently developed to enter review.' } as SmartRecommendation;
    }
    return { action: 'request_changes', confidence: 60, reasoning: 'Draft likely needs more development before review.' } as SmartRecommendation;
  }

  // Heuristic quality scoring
  let score = 0;
  score += Math.min(70, Math.floor(len / 15)); // length proxy up to 70
  if (hasKeywordInTitle) score += 12;
  if (hasKeywordInContent) score += 8;

  // Basic structure signals
  const headings = (content.match(/^#{1,3}\s/mg) || []).length;
  if (headings >= 3) score += 5;

  // Cap score
  score = Math.max(0, Math.min(100, score));

  let action: SmartAction = 'request_changes';
  let reasoning = 'Content quality is moderate; improvements recommended before approval.';
  if (score >= 78) {
    action = 'approve';
    reasoning = 'Content meets quality thresholds with adequate length, structure, and keyword usage.';
  } else if (score <= 45) {
    action = 'reject';
    reasoning = 'Content quality/length appears insufficient; requires substantial revisions.';
  }

  // Confidence proportional to distance from boundary
  const distance = action === 'approve' ? score - 78 : action === 'reject' ? 45 - score : Math.abs(62 - score);
  const confidence = Math.max(55, Math.min(90, 65 + Math.floor(distance / 2)));

  return { action, confidence, reasoning } as SmartRecommendation;
}
