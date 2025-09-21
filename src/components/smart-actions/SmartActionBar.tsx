import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Brain, Zap, Info, CheckCircle, HelpCircle } from 'lucide-react';
import { computeAvailableActions } from '@/services/smart-actions/resolver';
import type { SmartContext, SmartRecommendation, SmartAction } from '@/services/smart-actions/types';
import { logApprovalAction } from '@/services/smart-actions/logging';
import { Link } from 'react-router-dom';

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

  const recommendedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (recommendation) {
      recommendedAtRef.current = Date.now();
    }
  }, [recommendation]);

  const [pendingAction, setPendingAction] = useState<{ action: SmartAction; accepted: boolean } | null>(null);
  const openConfirm = (action: SmartAction, accepted: boolean) => setPendingAction({ action, accepted });
  const closeConfirm = () => setPendingAction(null);

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
    openConfirm(recommendation.action, true);
  };


  const canFollow = !!recommendation && available.includes(recommendation.action);
  const requiresNotes = recommendation?.action === 'request_changes' || recommendation?.action === 'reject';
  const disabledFollow = !!disabled || (requiresNotes && !hasNotes);

  if (available.length === 0) return null;

  const confirmLabel = pendingAction?.action === 'approve'
    ? 'Approve & Publish'
    : pendingAction?.action === 'request_changes'
    ? 'Request Changes'
    : pendingAction?.action === 'reject'
    ? 'Reject'
    : 'Submit for Review';

  return (
    <div className="flex items-center gap-2">
      {/* AI Recommendation CTA */}
      {canFollow && (
        <div className="flex items-center gap-2">
          <Button
            onClick={followRecommendation}
            disabled={disabledFollow}
            aria-label={recommendation ? `Follow AI: ${recommendation.action.replace('_',' ')} at ${recommendation.confidence}% confidence` : 'Follow AI recommendation'}
            variant="secondary"
            className="inline-flex items-center"
          >
            <Zap className="mr-2 h-4 w-4" aria-hidden="true" />
            Follow AI ({recommendation?.confidence}% )
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Why this recommendation?">
                <Info className="h-4 w-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4" />
                <span className="font-medium">Why this recommendation?</span>
                <Badge variant="outline">{recommendation?.confidence}%</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Model</span>
                <span>heuristic-v1</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {(() => {
                  const secs = recommendedAtRef.current ? Math.max(0, Math.round((Date.now() - recommendedAtRef.current) / 1000)) : 0;
                  return `Generated ${secs}s ago`;
                })()}
              </div>
              <p className="text-muted-foreground">{recommendation?.reasoning}</p>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Primary actions (unchanged behavior) */}
      {available.includes('submit_for_review') && (
        <Button
          onClick={() => openConfirm('submit_for_review', recommendation?.action === 'submit_for_review')}
          disabled={!!disabled}
          aria-label="Submit content for review"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          Submit for Review
        </Button>
      )}

      {available.includes('approve') && (
        <Button
          onClick={() => openConfirm('approve', recommendation?.action === 'approve')}
          disabled={!!disabled}
          aria-label="Approve and publish content"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          Approve & Publish
        </Button>
      )}
      {available.includes('request_changes') && (
        <Button
          onClick={() => openConfirm('request_changes', recommendation?.action === 'request_changes')}
          disabled={!!disabled || !hasNotes}
          aria-label="Request changes from author"
          variant="outline"
          className="bg-orange-600/10 border-orange-600/30 text-orange-400 hover:bg-orange-600/20"
        >
          Request Changes
        </Button>
      )}
      {available.includes('reject') && (
        <Button
          onClick={() => openConfirm('reject', recommendation?.action === 'reject')}
          disabled={!!disabled || !hasNotes}
          variant="destructive"
          className="bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600/20"
        >
          Reject
        </Button>
      )}

      {/* In-app Help */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Smart Actions help">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 text-sm">
          <div className="font-medium mb-2">Smart Actions Help</div>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Cmd/Ctrl+Enter: Approve (or Submit if draft)</li>
            <li>Shift+Cmd/Ctrl+R: Request changes</li>
            <li>Shift+Cmd/Ctrl+X: Reject</li>
            <li>Notes required for Request changes/Reject</li>
          </ul>
          <div className="mt-3 text-xs">
            <Link to="/smart-actions/analytics" className="story-link text-primary">View approvals analytics</Link>
          </div>
        </PopoverContent>
      </Popover>
      {/* Confirm Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && closeConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === 'approve' && 'Confirm approval'}
              {pendingAction?.action === 'request_changes' && 'Confirm request for changes'}
              {pendingAction?.action === 'reject' && 'Confirm rejection'}
              {pendingAction?.action === 'submit_for_review' && 'Confirm submit for review'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will be recorded. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingAction) return;
                await record(pendingAction.action, pendingAction.accepted);
                switch (pendingAction.action) {
                  case 'approve':
                    onApprove?.();
                    break;
                  case 'request_changes':
                    onRequestChanges?.();
                    break;
                  case 'reject':
                    onReject?.();
                    break;
                  case 'submit_for_review':
                    onSubmitForReview?.();
                    break;
                }
                closeConfirm();
              }}
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
