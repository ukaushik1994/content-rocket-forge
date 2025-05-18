
import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import ContentSelectionHeader from './content-selection/ContentSelectionHeader';
import ContentList from './content-selection/ContentList';
import EmptyContentState from './content-selection/EmptyContentState';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import RepurposedContentDialog from './RepurposedContentDialog';

interface ContentSelectionProps {
  contentItems: ContentItemType[];
  onSelectContent: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: GeneratedContentFormat | null;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onDeleteRepurposedContent: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
  isSaving?: boolean;
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
  isDeleting = false,
  isSaving = false
}) => {
  // Add state for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  return (
    <div>
      <ContentSelectionHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalItems={contentItems.length}
      />
      
      {contentItems.length === 0 ? (
        <EmptyContentState />
      ) : (
        <ContentList
          contentItems={contentItems}
          onSelectContent={onSelectContent}
          onOpenRepurposedContent={onOpenRepurposedContent}
        />
      )}
      
      <RepurposedContentDialog
        open={repurposedDialogOpen}
        onClose={onCloseRepurposedDialog}
        content={selectedRepurposedContent}
        onCopy={onCopyToClipboard}
        onDownload={onDownloadAsText}
        onDelete={onDeleteRepurposedContent}
        isDeleting={isDeleting}
        isSaving={isSaving}
      />
    </div>
  );
};

export default ContentSelection;
