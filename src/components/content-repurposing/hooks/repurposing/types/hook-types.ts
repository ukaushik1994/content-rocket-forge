
import { ContentItemType } from '@/contexts/content/types';
import { GeneratedContentFormat } from '../types';

export interface ContentRepurposingHookReturn {
  // Content state
  content: ContentItemType | null;
  contentItems: ContentItemType[];
  
  // Format selection state
  selectedFormats: string[];
  generatedContents: Record<string, string>;
  isGenerating: boolean;
  activeFormat: string | null;
  savedContentFormats: string[];
  
  // Dialog state
  repurposedDialogOpen: boolean;
  selectedRepurposedContent: GeneratedContentFormat | null;
  generatedFormats: string[];
  
  // Loading states
  isDeleting: boolean;
  isSaving: boolean;
  
  // State setters
  setSelectedFormats: (formats: string[]) => void;
  setActiveFormat: (format: string | null) => void;
  
  // Content operations
  handleContentSelection: (content: ContentItemType) => void;
  handleGenerateContent: (contentTypeIds: string[]) => Promise<void>;
  resetContent: () => void;
  
  // Format operations
  handleOpenRepurposedContentWithFormats: (contentId: string, formatId: string) => Promise<void>;
  handleCloseRepurposedDialog: () => void;
  handleFormatChange: (contentId: string, formatId: string) => void;
  handleDeleteActiveFormat: (formatId: string) => Promise<boolean>;
  
  // Content actions
  copyToClipboard: (content: string) => void;
  downloadAsText: (content: string, formatName: string) => void;
  saveAsNewContent: (formatId: string, generatedContent: string) => Promise<boolean>;
  findRepurposedContent: (contentId: string, formatId: string) => Promise<any | null>;
  markAsSaved: (formatId: string) => Promise<boolean>;
  saveAllFormats: () => Promise<string[]>;
}
