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
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {/* AI Recommendation CTA */}
      {canFollow && (
        <>
          <Button
            onClick={followRecommendation}
            disabled={disabledFollow}
            aria-label={recommendation ? `Follow AI: ${recommendation.action.replace('_',' ')} at ${recommendation.confidence}% confidence` : 'Follow AI recommendation'}
            variant="secondary"
            size="default"
            className="h-11 px-4 md:px-5"
          >
            <Zap className="mr-2 h-4 w-4" aria-hidden="true" />
            <span className="font-medium">Follow AI ({recommendation?.confidence}%)</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11" 
                aria-label="Why this recommendation?"
              >
                <Info className="h-4 w-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base">Why this recommendation?</span>
                <Badge variant="outline" className="ml-auto">{recommendation?.confidence}%</Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Model</span>
                <span className="font-mono">heuristic-v1</span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {(() => {
                  const secs = recommendedAtRef.current ? Math.max(0, Math.round((Date.now() - recommendedAtRef.current) / 1000)) : 0;
                  return `Generated ${secs}s ago`;
                })()}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{recommendation?.reasoning}</p>
            </PopoverContent>
          </Popover>
        </>
      )}

      {/* Primary actions */}
      {available.includes('submit_for_review') && (
        <Button
          onClick={() => openConfirm('submit_for_review', recommendation?.action === 'submit_for_review')}
          disabled={!!disabled}
          aria-label="Submit content for review"
          size="default"
          className="h-11 px-4 md:px-5 bg-blue-600 hover:bg-blue-700 text-white"
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
          size="default"
          className="h-11 px-4 md:px-5 bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          Approve & Publish
        </Button>
      )}
      
      {available.includes('request_changes') && (
        <Button
          onClick={() => openConfirm('request_changes', recommendation?.action === 'request_changes')}
          disabled={!!disabled || !hasNotes}
          aria-label={!hasNotes ? "Request changes (notes required)" : "Request changes from author"}
          variant="outline"
          size="default"
          className="h-11 px-4 md:px-5 bg-orange-600/10 border-orange-600/30 text-orange-400 hover:bg-orange-600/20"
        >
          Request Changes
        </Button>
      )}
      
      {available.includes('reject') && (
        <Button
          onClick={() => openConfirm('reject', recommendation?.action === 'reject')}
          disabled={!!disabled || !hasNotes}
          aria-label={!hasNotes ? "Reject content (notes required)" : "Reject content"}
          variant="destructive"
          size="default"
          className="h-11 px-4 md:px-5 bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600/20"
        >
          Reject
        </Button>
      )}

      {/* Help - Integrated inline */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-11 w-11 ml-auto" 
            aria-label="Smart Actions help"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="font-semibold text-base mb-3">Smart Actions Help</div>
          <ul className="space-y-2 text-sm text-muted-foreground mb-4">
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Cmd/Ctrl+Enter</kbd>
              <span>Approve (or Submit if draft)</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Shift+Cmd/Ctrl+R</kbd>
              <span>Request changes</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Shift+Cmd/Ctrl+X</kbd>
              <span>Reject</span>
            </li>
          </ul>
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground mb-2">Notes required for Request changes/Reject</p>
            <Link to="/smart-actions/analytics" className="text-sm text-primary hover:underline font-medium">
              View approvals analytics →
            </Link>
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
