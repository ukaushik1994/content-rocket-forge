import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Minimize2, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditor } from '@/components/approval/ContentApprovalEditor';
import { CompactEditingSidebar } from './CompactEditingSidebar';
import { SmartActionBar } from '@/components/smart-actions/SmartActionBar';
import { useContent } from '@/contexts/content';
import { useApproval } from '../context/ApprovalContext';
import { useSmartApprovalRecommendation } from '@/hooks/approval/useSmartApprovalRecommendation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItemType | null;
}

export const ReviewEditorModal: React.FC<ReviewEditorModalProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  const [editedTitle, setEditedTitle] = useState(content?.title || '');
  const [editedContent, setEditedContent] = useState(content?.content || '');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notesCollapsed, setNotesCollapsed] = useState(false);
  const { updateContentItem, approveContent, rejectContent, requestChanges, submitForReview } = useContent();
  const { improveContentWithAI, isImproving } = useApproval();

  const mainKeyword = (content?.metadata?.mainKeyword || content?.keywords?.[0] || '').toString().trim();
  const { recommendation } = useSmartApprovalRecommendation({
    content,
    editedContent,
    editedTitle,
    mainKeyword,
    notes: approvalNotes,
  });

  if (!content) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateContentItem(content.id, {
        title: editedTitle,
        content: editedContent
      });
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveContent(content.id, approvalNotes || undefined);
      toast.success('Content approved and published successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to approve content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!approvalNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setIsSubmitting(true);
    try {
      await rejectContent(content.id, approvalNotes);
      toast.success('Content rejected with feedback provided');
      onClose();
    } catch (error) {
      toast.error('Failed to reject content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!approvalNotes.trim()) {
      toast.error('Please provide specific change requests');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestChanges(content.id, approvalNotes);
      toast.success('Change request sent to author');
      onClose();
    } catch (error) {
      toast.error('Failed to request changes');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    try {
      await submitForReview(content.id, approvalNotes || undefined);
      toast.success('Content submitted for review');
      onClose();
    } catch (error) {
      toast.error('Failed to submit for review');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImprove = async () => {
    try {
      const improvedContent = await improveContentWithAI(content);
      if (improvedContent) {
        toast.success('Content improved with AI assistance');
      }
    } catch (error) {
      toast.error('Failed to improve content');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 border-none overflow-hidden">
        <motion.div 
          className="h-full bg-background flex flex-col relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          
          {/* Main Layout Container */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Enhanced Header */}
              <motion.div 
                className="flex-shrink-0 border-b border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Review & Edit
                    </h2>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                      <span>Enhanced Editor</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Sidebar toggle for mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="lg:hidden h-8 w-8 p-0"
                      title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                    >
                      {sidebarCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Close editor"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Content Editor Area */}
              <motion.div 
                className="flex-1 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <ContentApprovalEditor 
                  content={content} 
                  hideToolsToggle={true}
                  defaultShowSidebar={false}
                />
              </motion.div>
            </div>

            {/* Responsive Sidebar */}
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  className="lg:relative absolute right-0 top-0 h-full z-20 lg:z-auto"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <CompactEditingSidebar
                    content={content}
                    editedTitle={editedTitle}
                    onTitleChange={setEditedTitle}
                    onSave={handleSave}
                    onImprove={handleImprove}
                    isSubmitting={isSubmitting}
                    isImproving={isImproving}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile overlay when sidebar is open */}
            {!sidebarCollapsed && (
              <motion.div
                className="lg:hidden absolute inset-0 bg-background/80 backdrop-blur-sm z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarCollapsed(true)}
              />
            )}
          </div>

          {/* Fixed Notes Section at Bottom */}
          <motion.div 
            className="flex-shrink-0 border-t border-border/50 bg-card/95 backdrop-blur-sm z-30"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="w-full">
              {/* Notes Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-border/30">
                <h4 className="text-sm font-medium text-foreground/90">
                  {content.approval_status === 'pending_review' || content.approval_status === 'in_review' 
                    ? 'Review Notes & Feedback' 
                    : 'Notes'}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotesCollapsed(!notesCollapsed)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  {notesCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {/* Notes Content */}
              <AnimatePresence>
                {!notesCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      {/* Notes Textarea */}
                      <Textarea 
                        placeholder={
                          content.approval_status === 'pending_review' || content.approval_status === 'in_review' 
                            ? "Provide feedback, suggestions, or reasons for your decision..." 
                            : "Add any notes about this content..."
                        }
                        value={approvalNotes} 
                        onChange={(e) => setApprovalNotes(e.target.value)} 
                        className="min-h-[100px] bg-muted/30 border-border/50 focus-visible:ring-primary/50 resize-none" 
                      />
                      
                      {/* Smart Recommendation Alert */}
                      {recommendation && (
                        <Alert className="border-amber-600/30 bg-amber-600/10">
                          <AlertDescription className="text-amber-200 text-sm">
                            <strong>Smart Recommendation:</strong> {recommendation.action === 'approve' ? '✅ Ready to approve' : recommendation.action === 'request_changes' ? '📝 Consider requesting changes' : '❌ May need rejection'}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Action Bar */}
                      <SmartActionBar 
                        context={{
                          contentId: content.id,
                          approvalStatus: content.approval_status,
                          isSubmitting: isSubmitting,
                          hasNotes: !!approvalNotes.trim(),
                        }}
                        recommendation={recommendation}
                        disabled={isSubmitting}
                        hasNotes={!!approvalNotes.trim()}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onRequestChanges={handleRequestChanges}
                        onSubmitForReview={handleSubmitForReview}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};