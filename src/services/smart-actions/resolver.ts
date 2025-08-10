import { SmartAction, SmartContext, SmartRecommendation } from './types';

export function computeAvailableActions(ctx: SmartContext): SmartAction[] {
  const status = ctx.approvalStatus;
  switch (status) {
    case 'draft':
      return ['submit_for_review'];
    case 'pending_review':
    case 'in_review':
      return ['approve', 'request_changes', 'reject'];
    default:
      return [];
  }
}

export function pickPrimaryAction(
  available: SmartAction[],
  recommendation?: SmartRecommendation | null
): SmartAction | undefined {
  if (recommendation && available.includes(recommendation.action)) {
    return recommendation.action;
  }
  if (available.includes('approve')) return 'approve';
  return available[0];
}
