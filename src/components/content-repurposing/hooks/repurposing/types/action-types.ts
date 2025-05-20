
import { ContentItemType } from '@/contexts/content/types';

export interface RepurposedContentRecord {
  id: string;
  content_id: string;
  format_code: string;
  content: string;
  title: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface RepurposedContentData {
  id?: string;
  contentId: string;
  formatId: string;
  title: string;
  content: string;
  status?: string;
  version?: number;
}

export interface ContentActionHookReturn {
  contentItems: ContentItemType[];
  isDeleting: boolean;
  isSaving: boolean;
  findRepurposedContent: (contentId: string, formatId: string) => Promise<RepurposedContentData | null>;
  fetchSavedFormats: (contentId: string) => Promise<string[]>;
  copyToClipboard: (content: string) => void;
  downloadAsText: (content: string, formatName: string) => void;
  saveAsNewContent: (formatId: string, generatedContent: string) => Promise<boolean>;
  deleteRepurposedContent: (contentId: string, formatId: string) => Promise<boolean>;
}
