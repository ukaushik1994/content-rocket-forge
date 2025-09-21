import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditor } from '@/components/approval/ContentApprovalEditor';
import { CompactEditingSidebar } from './CompactEditingSidebar';
import { useContent } from '@/contexts/content';
import { useApproval } from '../context/ApprovalContext';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { updateContentItem } = useContent();
  const { improveContentWithAI, isImproving } = useApproval();

  if (!content) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateContentItem(content.id, {
        title: editedTitle
      });
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
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
          className="h-full bg-background flex relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          
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
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};