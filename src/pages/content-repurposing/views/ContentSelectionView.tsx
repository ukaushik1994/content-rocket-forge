
import React from 'react';
import ContentSelection from '@/components/content-repurposing/ContentSelection';
import { ContentItemType } from '@/contexts/content/types';
import { GeneratedContentFormat } from '@/components/content-repurposing/hooks/repurposing/types';

interface ContentSelectionViewProps {
  contentItems: ContentItemType[];
  onSelectContent: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: GeneratedContentFormat | null;
  copyToClipboard: (text: string) => void;
  downloadAsText: (text: string, formatName: string) => void;
  deleteRepurposedContent: boolean;
  handleFormatChange: (contentId: string, formatId: string) => void;
  isDeleting: boolean;
  generatedFormats: string[];
}

const ContentSelectionView: React.FC<ContentSelectionViewProps> = ({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  copyToClipboard,
  downloadAsText,
  deleteRepurposedContent,
  handleFormatChange,
  isDeleting,
  generatedFormats
}) => {
  return (
    <ContentSelection
      contentItems={contentItems}
      onSelectContent={onSelectContent}
      onOpenRepurposedContent={onOpenRepurposedContent}
      repurposedDialogOpen={repurposedDialogOpen}
      onCloseRepurposedDialog={onCloseRepurposedDialog}
      selectedRepurposedContent={selectedRepurposedContent}
      onCopyToClipboard={copyToClipboard}
      onDownloadAsText={downloadAsText}
      onDeleteRepurposedContent={async (contentId: string, formatId: string) => {
        return false; // This needs to be passed a function, will be handled by parent
      }}
      onFormatChange={handleFormatChange}
      isDeleting={isDeleting}
      generatedFormats={generatedFormats}
    />
  );
};

export default ContentSelectionView;
