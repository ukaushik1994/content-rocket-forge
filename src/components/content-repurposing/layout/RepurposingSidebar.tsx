
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentSelection from '../ContentSelection';
import { GeneratedContentFormat } from '../hooks/repurposing/types';
import { ContentItemType } from '@/contexts/content/types';

interface RepurposingSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: GeneratedContentFormat | null;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onDeleteRepurposedContent?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
  selectedContentId?: string;
}

const RepurposingSidebar: React.FC<RepurposingSidebarProps> = ({
  isOpen,
  onToggle,
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  onCopyToClipboard,
  onDownloadAsText,
  onDeleteRepurposedContent,
  isDeleting,
  selectedContentId
}) => {
  return (
    <>
      {/* Sidebar Toggle Button - Always visible */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={`absolute top-4 z-50 bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-white/10
          transition-all duration-300 ${isOpen ? 'left-[300px]' : 'left-[30px]'}`}
      >
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      
      {/* Sidebar Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 h-full z-40 bg-black border-r border-white/10"
            style={{ paddingTop: '64px' }} // Space for Navbar
          >
            <div className="h-full overflow-y-auto p-4 pb-16">
              <div className="mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                  Content Selection
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select content to repurpose for different formats
                </p>
              </div>
              
              <ContentSelection 
                contentItems={contentItems}
                onSelectContent={onSelectContent}
                onOpenRepurposedContent={onOpenRepurposedContent}
                repurposedDialogOpen={repurposedDialogOpen}
                onCloseRepurposedDialog={onCloseRepurposedDialog}
                selectedRepurposedContent={selectedRepurposedContent}
                onCopyToClipboard={onCopyToClipboard}
                onDownloadAsText={onDownloadAsText}
                onDeleteRepurposedContent={onDeleteRepurposedContent}
                isDeleting={isDeleting}
                selectedContentId={selectedContentId}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Collapsed Mini Sidebar */}
      {!isOpen && (
        <div 
          className="fixed left-0 top-0 h-full z-40 w-[50px] bg-black border-r border-white/10"
          style={{ paddingTop: '64px' }} // Space for Navbar
        >
          <div className="flex flex-col items-center pt-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center mb-4">
              <span className="text-white font-bold">{contentItems.length}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RepurposingSidebar;
