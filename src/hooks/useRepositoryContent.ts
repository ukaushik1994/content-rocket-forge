import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';

export type ContentSourceType = 'original' | 'repurposed';

export interface UnifiedContentItem {
  id: string;
  title: string;
  content: string;
  status: string;
  sourceType: ContentSourceType;
  formatCode: string;
  contentType?: string;
  sourceContentId?: string;
  sourceContentTitle?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  // Original content item reference (for originals)
  originalItem?: ContentItemType;
}

export type RepositoryCategory = 'all' | 'socials' | 'email' | 'blog' | 'scripts' | 'campaigns';

const SOCIAL_FORMAT_CODES = [
  'social-twitter', 'social-linkedin', 'social-facebook', 'social-instagram',
  'twitter', 'linkedin', 'facebook', 'instagram',
  'carousel', 'meme', 'social', 'social-media'
];

const EMAIL_FORMAT_CODES = ['email', 'email-marketing'];
const BLOG_FORMAT_CODES = ['blog', 'blog/content', 'content'];
const SCRIPT_FORMAT_CODES = ['script', 'video'];

export function categoryMatchesItem(category: RepositoryCategory, item: UnifiedContentItem): boolean {
  if (category === 'all') return true;

  const fc = item.formatCode?.toLowerCase() || '';
  const ct = item.contentType?.toLowerCase() || '';

  switch (category) {
    case 'socials':
      return SOCIAL_FORMAT_CODES.includes(fc) || ct === 'social_post';
    case 'email':
      return EMAIL_FORMAT_CODES.includes(fc) || ct === 'email';
    case 'blog':
      return BLOG_FORMAT_CODES.includes(fc) || ct === 'article' || ct === 'blog' || ct === 'glossary';
    case 'scripts':
      return SCRIPT_FORMAT_CODES.includes(fc);
    default:
      return false;
  }
}

export function useRepositoryContent() {
  const { user } = useAuth();
  const { contentItems, loading: contentLoading } = useContent();
  const [repurposedItems, setRepurposedItems] = useState<any[]>([]);
  const [repurposedLoading, setRepurposedLoading] = useState(true);

  const fetchRepurposed = useCallback(async () => {
    if (!user) {
      setRepurposedItems([]);
      setRepurposedLoading(false);
      return;
    }
    try {
      setRepurposedLoading(true);
      const { data, error } = await supabase
        .from('repurposed_contents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRepurposedItems(data || []);
    } catch (err) {
      console.error('Error fetching repurposed content:', err);
      setRepurposedItems([]);
    } finally {
      setRepurposedLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRepurposed();
  }, [fetchRepurposed]);

  // Build a map of content_id -> title for back-linking
  const contentTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    contentItems.forEach(item => map.set(item.id, item.title));
    return map;
  }, [contentItems]);

  // Merge into unified list
  const unifiedItems = useMemo<UnifiedContentItem[]>(() => {
    const originals: UnifiedContentItem[] = contentItems.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      status: item.status,
      sourceType: 'original' as const,
      formatCode: item.content_type,
      contentType: item.content_type,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      metadata: item.metadata as Record<string, any>,
      originalItem: item,
    }));

    const repurposed: UnifiedContentItem[] = repurposedItems.map(item => ({
      id: item.id,
      title: item.title || 'Untitled',
      content: item.content || '',
      status: item.status || 'draft',
      sourceType: 'repurposed' as const,
      formatCode: item.format_code,
      sourceContentId: item.content_id,
      sourceContentTitle: contentTitleMap.get(item.content_id) || 'Original Content',
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      metadata: item.metadata as Record<string, any>,
    }));

    return [...originals, ...repurposed].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [contentItems, repurposedItems, contentTitleMap]);

  // Count by category
  const categoryCounts = useMemo(() => ({
    all: unifiedItems.length,
    socials: unifiedItems.filter(i => categoryMatchesItem('socials', i)).length,
    email: unifiedItems.filter(i => categoryMatchesItem('email', i)).length,
    blog: unifiedItems.filter(i => categoryMatchesItem('blog', i)).length,
    scripts: unifiedItems.filter(i => categoryMatchesItem('scripts', i)).length,
  }), [unifiedItems]);

  return {
    unifiedItems,
    loading: contentLoading || repurposedLoading,
    categoryCounts,
    refreshRepurposed: fetchRepurposed,
  };
}
