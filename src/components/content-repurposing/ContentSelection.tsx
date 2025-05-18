
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContentList from './content-selection/ContentList';
import ContentSelectionHeader from './content-selection/ContentSelectionHeader';
import EmptyContentState from './content-selection/EmptyContentState';
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
  selectedContentId?: string;
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
  selectedContentId
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'repurposed'>('new');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter content items based on active tab
  const newContentItems = contentItems.filter(item => 
    !item.metadata?.repurposedFormats?.length
  );
  
  const repurposedContentItems = contentItems.filter(item => 
    item.metadata?.repurposedFormats?.length > 0
  );

  // Apply search filter if searchQuery is not empty
  const filteredNewContent = searchQuery 
    ? newContentItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : newContentItems;

  const filteredRepurposedContent = searchQuery
    ? repurposedContentItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : repurposedContentItems;

  const activeItems = activeTab === 'new' ? filteredNewContent : filteredRepurposedContent;
  const showEmptyState = activeItems.length === 0;

  return (
    <div className="space-y-4">
      <ContentSelectionHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalItems={activeItems.length}
      />
      
      <div className="flex border border-white/10 rounded-md mb-4 overflow-hidden">
        <button 
          className={`flex-1 py-2 text-center transition-colors ${activeTab === 'new' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
          onClick={() => setActiveTab('new')}
        >
          New Content
        </button>
        <button 
          className={`flex-1 py-2 text-center transition-colors ${activeTab === 'repurposed' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
          onClick={() => setActiveTab('repurposed')}
        >
          Repurposed Content
        </button>
      </div>
      
      {showEmptyState ? (
        <EmptyContentState viewType={activeTab} searchQuery={searchQuery} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="overflow-y-auto"
        >
          <ContentList
            contentItems={activeItems}
            onSelectContent={onSelectContent}
            onOpenRepurposedContent={onOpenRepurposedContent}
            onDeleteContent={onDeleteRepurposedContent && ((contentId: string, formatId: string) => {
              if (onDeleteRepurposedContent) {
                return onDeleteRepurposedContent(contentId, formatId);
              }
              return Promise.resolve(false);
            })}
            isDeleting={isDeleting}
            viewType={activeTab}
            selectedContentId={selectedContentId}
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
