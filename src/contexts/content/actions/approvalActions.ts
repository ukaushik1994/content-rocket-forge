
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '../types';
import { toast } from 'sonner';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true },
  info: { duration: 4000, closeButton: true }
};

export const createApprovalActions = (
  updateContentItem: (id: string, updates: Partial<ContentItemType>) => Promise<void>,
  userId?: string
) => {
  const submitForReview = async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to submit content for review', toastConfig.error);
      return;
    }

    try {
      await updateContentItem(id, {
        approval_status: 'pending_review',
        submitted_for_review_at: new Date().toISOString()
      });
      
      toast.success('Content submitted for review', toastConfig.success);
    } catch (error: any) {
      console.error('Error submitting content for review:', error);
      toast.error('Failed to submit content for review', toastConfig.error);
    }
  };

  const approveContent = async (id: string, comments?: string) => {
    if (!userId) {
      toast.error('You must be logged in to approve content', toastConfig.error);
      return;
    }

    try {
      // Update content status
      await updateContentItem(id, {
        approval_status: 'approved',
        status: 'published'
      });

      // Create approval record
      const { error: approvalError } = await supabase
        .from('content_approvals')
        .insert({
          content_id: id,
          reviewer_id: userId,
          status: 'approved',
          comments: comments || null,
          reviewed_at: new Date().toISOString()
        });

      if (approvalError) throw approvalError;

      toast.success('Content approved and published', toastConfig.success);
    } catch (error: any) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content', toastConfig.error);
    }
  };

  const rejectContent = async (id: string, comments: string) => {
    if (!userId) {
      toast.error('You must be logged in to reject content', toastConfig.error);
      return;
    }

    try {
      // Update content status
      await updateContentItem(id, {
        approval_status: 'rejected'
      });

      // Create approval record
      const { error: approvalError } = await supabase
        .from('content_approvals')
        .insert({
          content_id: id,
          reviewer_id: userId,
          status: 'rejected',
          comments,
          reviewed_at: new Date().toISOString()
        });

      if (approvalError) throw approvalError;

      toast.success('Content rejected', toastConfig.success);
    } catch (error: any) {
      console.error('Error rejecting content:', error);
      toast.error('Failed to reject content', toastConfig.error);
    }
  };

  const requestChanges = async (id: string, comments: string) => {
    if (!userId) {
      toast.error('You must be logged in to request changes', toastConfig.error);
      return;
    }

    try {
      // Update content status
      await updateContentItem(id, {
        approval_status: 'needs_changes'
      });

      // Create approval record
      const { error: approvalError } = await supabase
        .from('content_approvals')
        .insert({
          content_id: id,
          reviewer_id: userId,
          status: 'needs_changes',
          comments,
          reviewed_at: new Date().toISOString()
        });

      if (approvalError) throw approvalError;

      toast.success('Change request sent', toastConfig.success);
    } catch (error: any) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes', toastConfig.error);
    }
  };

  const addApprovalComment = async (approvalId: string, comment: string, type: 'general' | 'suggestion' | 'issue' | 'praise' = 'general') => {
    if (!userId) {
      toast.error('You must be logged in to add comments', toastConfig.error);
      return;
    }

    try {
      const { error } = await supabase
        .from('approval_comments')
        .insert({
          approval_id: approvalId,
          reviewer_id: userId,
          comment,
          comment_type: type
        });

      if (error) throw error;

      toast.success('Comment added', toastConfig.success);
    } catch (error: any) {
      console.error('Error adding approval comment:', error);
      toast.error('Failed to add comment', toastConfig.error);
    }
  };

  return {
    submitForReview,
    approveContent,
    rejectContent,
    requestChanges,
    addApprovalComment
  };
};
