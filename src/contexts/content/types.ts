
export type ContentStatus = 'draft' | 'approved' | 'published' | 'archived';

// Define the shape of metadata to ensure consistency
export interface ContentMetadata {
  metaTitle?: string;
  metaDescription?: string;
  outline?: string[];
  serpSelections?: any[];
  serpData?: any;
  [key: string]: any; // Allow for additional properties
}

export interface ContentItemType {
  id: string;
  title: string;
  content: string;
  status: ContentStatus;
  seo_score?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  keywords?: string[];
  metadata: ContentMetadata;
}
