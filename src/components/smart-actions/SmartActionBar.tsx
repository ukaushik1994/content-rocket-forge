import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Brain, Zap, Info, CheckCircle } from 'lucide-react';
import { computeAvailableActions } from '@/services/smart-actions/resolver';
import type { SmartContext, SmartRecommendation } from '@/services/smart-actions/types';
import { logApprovalAction } from '@/services/smart-actions/logging';

interface SmartActionBarProps {
  context: SmartContext;
  disabled?: boolean;
  hasNotes?: boolean;
  recommendation?: SmartRecommendation | null;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onReject?: () => void;
  onSubmitForReview?: () => void;
  className?: string;
}

// Phase 2: Adds optional AI recommendation CTA + "Why?" popover. No backend dependency.
export const SmartActionBar: React.FC<SmartActionBarProps> = ({
  context,
  disabled,
  hasNotes,
  recommendation,
  onApprove,
  onRequestChanges,
  onReject,
  onSubmitForReview,
}) => {
  const available = computeAvailableActions(context);
  const mountedAtRef = useRef<number>(Date.now());
  const contentId = context.contentId;

  const record = async (action: 'approve' | 'request_changes' | 'reject' | 'submit_for_review', accepted: boolean) => {
    const latencyMs = Date.now() - mountedAtRef.current;
    await logApprovalAction({
      contentId,
      action,
      acceptedRecommendation: accepted,
      source: 'user',
      latencyMs,
    });
  };

  const followRecommendation = async () => {
    if (!recommendation) return;
    const accepted = true;
    switch (recommendation.action) {
      case 'approve':
        await record('approve', accepted);
        return onApprove?.();
      case 'request_changes':
        await record('request_changes', accepted);
        return onRequestChanges?.();
      case 'reject':
        await record('reject', accepted);
        return onReject?.();
      case 'submit_for_review':
        await record('submit_for_review', accepted);
        return onSubmitForReview?.();
    }
  };

  const canFollow = !!recommendation && available.includes(recommendation.action);

  if (available.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {/* AI Recommendation CTA */}
      {canFollow && (
        <div className="flex items-center gap-2">
          <Button
            onClick={followRecommendation}
            disabled={!!disabled}
            variant="secondary"
            className="inline-flex items-center"
          >
            <Zap className="mr-2 h-4 w-4" />
            Follow AI ({recommendation?.confidence}% )
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4" />
                <span className="font-medium">Why this recommendation?</span>
                <Badge variant="outline">{recommendation?.confidence}%</Badge>
              </div>
              <p className="text-muted-foreground">{recommendation?.reasoning}</p>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Primary actions (unchanged behavior) */}
      {available.includes('submit_for_review') && (
        <Button
          onClick={async () => { await record('submit_for_review', recommendation?.action === 'submit_for_review'); onSubmitForReview?.(); }}
          disabled={!!disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Submit for Review
        </Button>
      )}

      {available.includes('approve') && (
        <Button
          onClick={async () => { await record('approve', recommendation?.action === 'approve'); onApprove?.(); }}
          disabled={!!disabled}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve & Publish
        </Button>
      )}
      {available.includes('request_changes') && (
        <Button
          onClick={async () => { await record('request_changes', recommendation?.action === 'request_changes'); onRequestChanges?.(); }}
          disabled={!!disabled || !hasNotes}
          variant="outline"
          className="bg-orange-600/10 border-orange-600/30 text-orange-400 hover:bg-orange-600/20"
        >
          Request Changes
        </Button>
      )}
      {available.includes('reject') && (
        <Button
          onClick={async () => { await record('reject', recommendation?.action === 'reject'); onReject?.(); }}
          disabled={!!disabled || !hasNotes}
          variant="destructive"
          className="bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600/20"
        >
          Reject
        </Button>
      )}
    </div>
  );
};
