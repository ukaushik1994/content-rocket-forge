import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { X, FileText, Clock, User, Hash } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditor } from '@/components/approval/ContentApprovalEditor';
import { formatDistanceToNow } from 'date-fns';

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
  if (!content) return null;

  const wordCount = content.content ? content.content.split(/\s+/).filter(Boolean).length : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 border border-white/10 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
        <motion.div 
          className="h-full flex flex-col"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Modern Header with Metrics */}
          <div className="flex-shrink-0 border-b border-white/10 bg-gray-800/50 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Review & Edit
                  </h2>
                  <Badge 
                    variant="outline" 
                    className="bg-primary/10 border-primary/30 text-primary text-xs"
                  >
                    {content.approval_status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
                  </Badge>
                </div>
                <h3 className="text-lg text-white/90 line-clamp-2 mb-3" title={content.title}>
                  {content.title}
                </h3>
                
                {/* Content Metrics */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}</span>
                  </div>
                  {content.keywords && content.keywords.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      <span>{content.keywords.length} keywords</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 p-0 hover:bg-white/10 border border-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Keywords Display */}
            {content.keywords && content.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.keywords.slice(0, 6).map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs"
                  >
                    {keyword}
                  </Badge>
                ))}
                {content.keywords.length > 6 && (
                  <Badge
                    variant="outline"
                    className="bg-white/5 text-white/60 border-white/20 text-xs"
                  >
                    +{content.keywords.length - 6} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Content Area with ScrollArea */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-6">
                <ContentApprovalEditor 
                  content={content} 
                  hideToolsToggle={false}
                  defaultShowSidebar={true}
                />
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};