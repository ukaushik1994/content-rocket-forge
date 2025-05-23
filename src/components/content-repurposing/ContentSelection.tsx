
import React, { useState, memo, useMemo } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import ContentSelectionHeader from './content-selection/ContentSelectionHeader';
import ContentList from './content-selection/ContentList';
import EmptyContentState from './content-selection/EmptyContentState';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import RepurposedContentDialog from './RepurposedContentDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContentSelectionProps {
  contentItems: ContentItemType[];
  onSelectContent: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: GeneratedContentFormat | null;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onDeleteRepurposedContent?: (contentId: string, formatId: string) => Promise<boolean>;
  onFormatChange?: (contentId: string, formatId: string) => void;
  isDeleting?: boolean;
  isLoadingFormat?: boolean;
  generatedFormats?: string[];
  savedContentFormats?: string[];
}

const ContentSelection: React.FC<ContentSelectionProps> = memo(({
  contentItems = [],
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  onCopyToClipboard,
  onDownloadAsText,
  onDeleteRepurposedContent,
  onFormatChange,
  isDeleting = false,
  isLoadingFormat = false,
  generatedFormats = [],
  savedContentFormats = []
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isMobile = useIsMobile();
  
  // Deduplicate content items before filtering
  const uniqueContentItems = useMemo(() => {
    if (!contentItems || !Array.isArray(contentItems)) {
      return [];
    }
    
    const uniqueMap = new Map<string, ContentItemType>();
    contentItems.forEach(item => {
      if (item && item.id) {
        uniqueMap.set(item.id, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [contentItems]);
  
  // Filter content items based on search query
  const filteredItems = useMemo(() => {
    return uniqueContentItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [uniqueContentItems, searchQuery]);
  
  return (
    <div>
      <ContentSelectionHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalItems={uniqueContentItems.length}
      />
      
      {uniqueContentItems.length === 0 ? (
        <EmptyContentState />
      ) : (
        <ContentList
          contentItems={filteredItems}
          onSelectContent={onSelectContent}
          onOpenRepurposedContent={onOpenRepurposedContent}
          isMobile={isMobile}
        />
      )}
      
      <RepurposedContentDialog
        open={repurposedDialogOpen}
        onClose={onCloseRepurposedDialog}
        content={selectedRepurposedContent}
        onCopy={onCopyToClipboard}
        onDownload={onDownloadAsText}
        onDelete={onDeleteRepurposedContent}
        onFormatChange={onFormatChange}
        isDeleting={isDeleting}
        isSaving={isLoadingFormat}
        generatedFormats={generatedFormats}
      />
    </div>
  );
});

ContentSelection.displayName = 'ContentSelection';

export default ContentSelection;
