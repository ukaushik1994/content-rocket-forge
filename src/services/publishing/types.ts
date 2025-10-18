export interface PublishInput {
  title: string;
  slug?: string;
  excerpt?: string;
  contentMd: string;
  coverImageUrl?: string;
  tags?: string[];
  categories?: string[];
  status?: 'draft' | 'publish' | 'future';
  scheduledAt?: Date;
}

export interface PublishResult {
  ok: boolean;
  postId?: string;
  url?: string;
  error?: string;
}
