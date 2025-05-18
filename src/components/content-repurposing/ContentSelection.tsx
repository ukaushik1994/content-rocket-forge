import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContentList from './content-selection/ContentList';
import ContentSelectionHeader from './ContentSelectionHeader';
import EmptyContentState from './EmptyContentState';
import RepurposedContentDialog from './RepurposedContentDialog';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import { ContentItemType } from '@/contexts/content/types';

interface ContentSelectionProps {
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
}

const ContentSelection: React.FC<ContentSelectionProps> = ({
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
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'repurposed'>('new');

  // Filter content items based on active tab
  const newContentItems = contentItems.filter(item => 
    !item.metadata?.repurposedFormats?.length
  );
  
  const repurposedContentItems = contentItems.filter(item => 
    item.metadata?.repurposedFormats?.length > 0
  );

  const showEmptyState = (activeTab === 'new' && newContentItems.length === 0) || 
                        (activeTab === 'repurposed' && repurposedContentItems.length === 0);

  return (
    <div className="space-y-8">
      <ContentSelectionHeader 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {showEmptyState ? (
        <EmptyContentState viewType={activeTab} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ContentList
            contentItems={activeTab === 'new' ? newContentItems : repurposedContentItems}
            onSelectContent={onSelectContent}
            onOpenRepurposedContent={onOpenRepurposedContent}
            onDeleteContent={onDeleteRepurposedContent}
            isDeleting={isDeleting}
            viewType={activeTab}
          />
        </motion.div>
      )}
      
      {/* Repurposed Content Dialog */}
      <RepurposedContentDialog
        open={repurposedDialogOpen}
        onClose={onCloseRepurposedDialog}
        content={selectedRepurposedContent}
        onCopy={onCopyToClipboard}
        onDownload={onDownloadAsText}
        onDelete={onDeleteRepurposedContent}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ContentSelection;
