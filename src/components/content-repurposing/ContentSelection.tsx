
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import RepurposedContentDialog from './RepurposedContentDialog';
import ContentSelectionHeader from './content-selection/ContentSelectionHeader';
import EmptyContentState from './content-selection/EmptyContentState';
import ContentList from './content-selection/ContentList';

interface ContentSelectionProps {
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: {
    content: string;
    formatId: string;
    contentId: string;
    title: string;
  } | null;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onDeleteRepurposedContent?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
}

export const ContentSelection: React.FC<ContentSelectionProps> = ({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  onCopyToClipboard,
  onDownloadAsText,
  onDeleteRepurposedContent,
  isDeleting = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // Filter content items based on search query
  const filteredItems = contentItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md border border-white/10">
        <CardHeader className="border-b border-white/10 bg-black/30">
          <ContentSelectionHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalItems={contentItems.length}
          />
        </CardHeader>
        
        <CardContent className="p-6">
          {contentItems.length === 0 ? (
            <EmptyContentState />
          ) : (
            <div className="space-y-6">
              <ContentList
                contentItems={filteredItems}
                onSelectContent={onSelectContent}
                onOpenRepurposedContent={onOpenRepurposedContent}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Repurposed Content Dialog with Delete Button */}
      <RepurposedContentDialog
        open={repurposedDialogOpen}
        onClose={onCloseRepurposedDialog}
        content={selectedRepurposedContent}
        onCopy={onCopyToClipboard}
        onDownload={onDownloadAsText}
        onDelete={onDeleteRepurposedContent}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ContentSelection;
