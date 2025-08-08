
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '../types';
import { toast } from 'sonner';
import { logActivity } from '@/services/activityLogger';
import { pushAlert } from '@/services/notificationsService';

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
  const submitForReview = async (id: string, notes?: string) => {
    if (!userId) {
      toast.error('You must be logged in to submit content for review', toastConfig.error);
      return;
    }

    try {
      await updateContentItem(id, {
        approval_status: 'pending_review',
        submitted_for_review_at: new Date().toISOString()
      });
      
      // Create approval record with enhanced data
      const { error: approvalError } = await supabase
        .from('content_approvals')
        .insert({
          content_id: id,
          reviewer_id: userId,
          status: 'pending_review',
          comments: notes || null,
          assigned_at: new Date().toISOString(),
          priority: 'medium'
        });

      if (approvalError) throw approvalError;
      
      await logActivity({
        userId,
        contentId: id,
        module: 'approval',
        action: 'submit_for_review',
        changeSummary: notes ? 'Submitted for review with notes' : 'Submitted for review',
        notes: notes || undefined,
        details: { comments: notes }
      });
      await pushAlert({
        userId,
        title: 'Submitted for review',
        message: 'Your content was submitted for review.',
        module: 'approval',
        severity: 'info',
        linkUrl: `/content-approval`
      });
      
      toast.success('Content submitted for review successfully', toastConfig.success);
    } catch (error: any) {
      console.error('Error submitting content for review:', error);
      toast.error('Failed to submit content for review: ' + error.message, toastConfig.error);
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

      // Update approval record
      const { error: approvalError } = await supabase
        .from('content_approvals')
        .upsert({
          content_id: id,
          reviewer_id: userId,
          status: 'approved',
          comments: comments || null,
          reviewed_at: new Date().toISOString(),
          approval_notes: comments || null
        });

      if (approvalError) throw approvalError;

      toast.success('Content approved and published successfully', toastConfig.success);
    } catch (error: any) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content: ' + error.message, toastConfig.error);
    }
  };

  const rejectContent = async (id: string, comments: string) => {
    if (!userId) {
      toast.error('You must be logged in to reject content', toastConfig.error);
      return;
    }

    if (!comments.trim()) {
      toast.error('Please provide a reason for rejection', toastConfig.error);
      return;
    }

    try {
      // Update content status
      await updateContentItem(id, {
        approval_status: 'rejected'
      });

      // Update approval record
      const { error: approvalError } = await supabase
        .from('content_approvals')
        .upsert({
          content_id: id,
          reviewer_id: userId,
          status: 'rejected',
          comments,
          reviewed_at: new Date().toISOString(),
          approval_notes: comments
        });

      if (approvalError) throw approvalError;

      toast.success('Content rejected with feedback provided', toastConfig.success);
    } catch (error: any) {
      console.error('Error rejecting content:', error);
      toast.error('Failed to reject content: ' + error.message, toastConfig.error);
    }
  };

  const requestChanges = async (id: string, comments: string) => {
    if (!userId) {
      toast.error('You must be logged in to request changes', toastConfig.error);
      return;
    }

    if (!comments.trim()) {
      toast.error('Please provide specific change requests', toastConfig.error);
      return;
    }

    try {
      // Update content status
      await updateContentItem(id, {
        approval_status: 'needs_changes'
      });

      // Update approval record
      const { error: approvalError } = await supabase
        .from('content_approvals')
        .upsert({
          content_id: id,
          reviewer_id: userId,
          status: 'needs_changes',
          comments,
          reviewed_at: new Date().toISOString(),
          approval_notes: comments
        });

      if (approvalError) throw approvalError;

      toast.success('Change request sent to content author', toastConfig.success);
    } catch (error: any) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes: ' + error.message, toastConfig.error);
    }
  };

  const addApprovalComment = async (approvalId: string, comment: string, type: 'general' | 'suggestion' | 'issue' | 'praise' = 'general') => {
    if (!userId) {
      toast.error('You must be logged in to add comments', toastConfig.error);
      return;
    }

    if (!comment.trim()) {
      toast.error('Comment cannot be empty', toastConfig.error);
      return;
    }

    try {
      const { error } = await supabase
        .from('approval_comments')
        .insert({
          approval_id: approvalId,
          reviewer_id: userId,
          comment: comment.trim(),
          comment_type: type
        });

      if (error) throw error;

      toast.success('Comment added successfully', toastConfig.success);
    } catch (error: any) {
      console.error('Error adding approval comment:', error);
      toast.error('Failed to add comment: ' + error.message, toastConfig.error);
    }
  };

  const assignReviewer = async (contentId: string, reviewerId: string, dueDate?: string, priority: string = 'medium') => {
    if (!userId) {
      toast.error('You must be logged in to assign reviewers', toastConfig.error);
      return;
    }

    try {
      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('approval_assignments')
        .insert({
          content_id: contentId,
          reviewer_id: reviewerId,
          assigned_by: userId,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          priority
        });

      if (assignmentError) throw assignmentError;

      // Update content status to in_review
      await updateContentItem(contentId, {
        approval_status: 'in_review',
        reviewer_id: reviewerId,
        review_deadline: dueDate ? new Date(dueDate).toISOString() : null
      });

      toast.success('Reviewer assigned successfully', toastConfig.success);
    } catch (error: any) {
      console.error('Error assigning reviewer:', error);
      toast.error('Failed to assign reviewer: ' + error.message, toastConfig.error);
    }
  };

  const getApprovalHistory = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select('*')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching approval history:', error);
      return [];
    }
  };

  return {
    submitForReview,
    approveContent,
    rejectContent,
    requestChanges,
    addApprovalComment,
    assignReviewer,
    getApprovalHistory
  };
};
