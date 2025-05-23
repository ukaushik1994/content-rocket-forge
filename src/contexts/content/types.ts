
export interface ContentItemType {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  approval_status: 'draft' | 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'needs_changes' | 'published' | 'archived';
  seo_score?: number;
  keywords?: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata?: {
    description?: string;
    author?: string;
    category?: string;
    tags?: string[];
    wordCount?: number;
    readingTime?: number;
    repurposedContentMap?: Record<string, string>;
    metaTitle?: string;
    metaDescription?: string;
    mainKeyword?: string;
    secondaryKeywords?: string[];
    seoScore?: number;
    repurposedFormats?: string[];
  };
  submitted_for_review_at?: string;
  reviewer_id?: string;
  review_deadline?: string;
}

export interface ApprovalType {
  id: string;
  content_id: string;
  reviewer_id: string;
  status: 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'needs_changes';
  comments?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalCommentType {
  id: string;
  approval_id: string;
  reviewer_id: string;
  comment: string;
  comment_type: 'general' | 'suggestion' | 'issue' | 'praise';
  created_at: string;
}

export interface ContentContextType {
  contentItems: ContentItemType[];
  loading: boolean;
  addContentItem: (item: Omit<ContentItemType, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateContentItem: (id: string, updates: Partial<ContentItemType>) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  getContentItem: (id: string) => ContentItemType | undefined;
  publishContent: (id: string) => Promise<void>;
  refreshContent: () => Promise<void>;
  
  // New approval methods
  submitForReview: (id: string) => Promise<void>;
  approveContent: (id: string, comments?: string) => Promise<void>;
  rejectContent: (id: string, comments: string) => Promise<void>;
  requestChanges: (id: string, comments: string) => Promise<void>;
  addApprovalComment: (approvalId: string, comment: string, type?: ApprovalCommentType['comment_type']) => Promise<void>;
}
