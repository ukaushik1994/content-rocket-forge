
import { ContentItemType } from '@/contexts/content/types';

export interface ContentGenerationState {
  selectedFormats: string[];
  generatedContents: Record<string, string>;
  isGenerating: boolean;
  activeFormat: string | null;
  savedContentFormats: string[];
  isInitialized: boolean;
}

export interface ContentGenerationOptions {
  content: ContentItemType | null;
}

export interface GenerationHookReturn {
  selectedFormats: string[];
  generatedContents: Record<string, string>;
  isGenerating: boolean;
  activeFormat: string | null;
  savedContentFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
  setActiveFormat: (format: string | null) => void;
  handleGenerateContent: (contentTypeIds: string[]) => Promise<void>;
  markAsSaved: (formatId: string) => Promise<boolean>;
  saveAllFormats: () => Promise<string[]>;
  fetchAvailableFormats: () => Promise<any[]>;
}
