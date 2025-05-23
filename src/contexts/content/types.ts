
export type ContentItemType = {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'approved' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  seo_score: number;
  keywords: string[];
  user_id: string;
  metadata?: {
    metaTitle?: string;
    metaDescription?: string;
    outline?: string[];
    serpSelections?: any[];
    serpData?: any;
    notes?: string;
    repurposedFormats?: string[];  // Array of format IDs that have been repurposed
    [key: string]: any;  // Allow for additional properties
  };
};

export type ContentContextType = {
  contentItems: ContentItemType[];
  loading: boolean;
  addContentItem: (item: Omit<ContentItemType, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateContentItem: (id: string, updates: Partial<ContentItemType>) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  getContentItem: (id: string) => ContentItemType | undefined;
  publishContent: (id: string) => Promise<void>;
  refreshContent: () => Promise<void>;
};

export const initialContent: ContentItemType[] = [
  {
    id: '1',
    title: 'Top 10 Project Management Tools for Remote Teams',
    content: 'Content about project management tools...',
    status: 'published',
    created_at: new Date(2025, 3, 28).toISOString(),
    updated_at: new Date(2025, 3, 28).toISOString(),
    seo_score: 87,
    keywords: ['project management', 'remote work', 'productivity tools'],
    user_id: 'placeholder-user-id',
    metadata: {
      repurposedFormats: ['linkedin-post', 'tweet-thread', 'newsletter']
    }
  },
  {
    id: '2',
    title: 'Email Marketing Best Practices in 2025',
    content: 'Content about email marketing...',
    status: 'draft',
    created_at: new Date(2025, 3, 25).toISOString(),
    updated_at: new Date(2025, 3, 27).toISOString(),
    seo_score: 74,
    keywords: ['email marketing', 'digital marketing', 'marketing automation'],
    user_id: 'placeholder-user-id',
    metadata: {
      repurposedFormats: ['youtube-script', 'infographic-text']
    }
  },
  {
    id: '3',
    title: 'How to Choose the Best CRM for Your Business',
    content: 'Content about selecting a CRM system...',
    status: 'approved',
    created_at: new Date(2025, 4, 1).toISOString(),
    updated_at: new Date(2025, 4, 1).toISOString(),
    seo_score: 91,
    keywords: ['crm', 'sales software', 'customer relationship'],
    user_id: 'placeholder-user-id',
  },
];
