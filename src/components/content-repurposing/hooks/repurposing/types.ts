
import { ContentItemType } from '@/contexts/content/types';

export interface GeneratedContentFormat {
  content: string;
  formatId: string;
  contentId: string;
  title: string;
}

export interface ContentRepurposingState {
  content: ContentItemType | null;
  selectedFormats: string[];
  generatedContents: Record<string, string>;
  isGenerating: boolean;
  activeFormat: string | null;
  repurposedDialogOpen: boolean;
  selectedRepurposedContent: GeneratedContentFormat | null;
  isDeleting: boolean;
}

export interface ContentRepurposingActions {
  setSelectedFormats: (formats: string[]) => void;
  setActiveFormat: (format: string | null) => void;
  handleContentSelection: (contentId: string) => void;
  handleGenerateContent: (contentTypeIds: string[]) => void;
  handleOpenRepurposedContent: (contentId: string, formatId: string) => void;
  handleCloseRepurposedDialog: () => void;
  copyToClipboard: (content: string) => void;
  downloadAsText: (content: string, formatName: string) => void;
  saveAsNewContent: (formatId: string, generatedContent: string) => Promise<boolean>;
  findRepurposedContent: (originalContentId: string, formatId: string) => ContentItemType | null;
  deleteRepurposedContent: (contentId: string) => Promise<boolean>;
}

export type ContentRepurposingHook = ContentRepurposingState & ContentRepurposingActions;
