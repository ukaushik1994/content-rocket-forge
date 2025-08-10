export type SmartAction = 'approve' | 'request_changes' | 'reject' | 'submit_for_review';

export interface SmartRecommendation {
  action: SmartAction;
  confidence: number; // 0-100
  reasoning: string;
}

export interface SmartContext {
  contentId?: string;
  approvalStatus?: string; // 'draft' | 'pending_review' | 'in_review' | ...
  isSubmitting?: boolean;
  hasNotes?: boolean;
}
