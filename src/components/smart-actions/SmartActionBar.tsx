import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Brain, Zap, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { computeAvailableActions } from '@/services/smart-actions/resolver';
import type { SmartContext, SmartRecommendation } from '@/services/smart-actions/types';

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

  const followRecommendation = () => {
    if (!recommendation) return;
    switch (recommendation.action) {
      case 'approve':
        return onApprove?.();
      case 'request_changes':
        return onRequestChanges?.();
      case 'reject':
        return onReject?.();
      case 'submit_for_review':
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
          onClick={onSubmitForReview}
          disabled={!!disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Submit for Review
        </Button>
      )}

      {available.includes('approve') && (
        <Button
          onClick={onApprove}
          disabled={!!disabled}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve & Publish
        </Button>
      )}
      {available.includes('request_changes') && (
        <Button
          onClick={onRequestChanges}
          disabled={!!disabled || !hasNotes}
          variant="outline"
          className="bg-orange-600/10 border-orange-600/30 text-orange-400 hover:bg-orange-600/20"
        >
          Request Changes
        </Button>
      )}
      {available.includes('reject') && (
        <Button
          onClick={onReject}
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
