import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { computeAvailableActions } from '@/services/smart-actions/resolver';
import type { SmartContext } from '@/services/smart-actions/types';

interface SmartActionBarProps {
  context: SmartContext;
  disabled?: boolean;
  hasNotes?: boolean;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onReject?: () => void;
  onSubmitForReview?: () => void;
  className?: string;
}

// Minimal, inline-friendly action bar that renders only the needed buttons.
// Phase 1: no behavior change, styling mirrors existing buttons.
export const SmartActionBar: React.FC<SmartActionBarProps> = ({
  context,
  disabled,
  hasNotes,
  onApprove,
  onRequestChanges,
  onReject,
  onSubmitForReview,
}) => {
  const available = computeAvailableActions(context);

  if (available.length === 0) return null;

  return (
    <>
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
    </>
  );
};
