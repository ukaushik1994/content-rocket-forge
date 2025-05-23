
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from './types';
import { repurposedContentService } from '@/services/repurposedContentService';

export const fetchItemKeywords = async (item: ContentItemType): Promise<ContentItemType> => {
  try {
    // Fetch keywords for this content item
    const { data: keywordRelations, error: relationsError } = await supabase
      .from('content_keywords')
      .select('keyword_id')
      .eq('content_id', item.id);
    
    if (relationsError) {
      console.error('Error fetching keyword relations:', relationsError);
      return { ...item, keywords: [] };
    }
    
    if (!keywordRelations || keywordRelations.length === 0) {
      return { ...item, keywords: [] };
    }
    
    const keywordIds = keywordRelations.map(rel => rel.keyword_id);
    
    const { data: keywords, error: keywordsError } = await supabase
      .from('keywords')
      .select('keyword')
      .in('id', keywordIds);
    
    if (keywordsError) {
      console.error('Error fetching keywords:', keywordsError);
      return { ...item, keywords: [] };
    }
    
    const keywordTexts = keywords ? keywords.map(k => k.keyword) : [];
    
    return {
      ...item,
      keywords: keywordTexts
    };
  } catch (error) {
    console.error('Error in fetchItemKeywords:', error);
    return { ...item, keywords: [] };
  }
};

export const fetchRepurposedContentData = async (item: ContentItemType): Promise<ContentItemType> => {
  try {
    // Get repurposed formats and content from the database
    const [repurposedFormats, repurposedContentMap] = await Promise.all([
      repurposedContentService.getRepurposedFormatsForContent(item.id),
      repurposedContentService.getRepurposedContentMap(item.id)
    ]);

    // Update metadata with database data
    const updatedMetadata = {
      ...item.metadata,
      repurposedFormats,
      repurposedContentMap,
      lastSynced: new Date().toISOString()
    };

    return {
      ...item,
      metadata: updatedMetadata
    };
  } catch (error) {
    console.error('Error fetching repurposed content data:', error);
    return item;
  }
};

export const processContentItems = async (contentData: any[]): Promise<ContentItemType[]> => {
  const processedItems = await Promise.all(
    contentData.map(async (dbItem) => {
      // Convert database item to ContentItemType
      let item: ContentItemType = {
        id: dbItem.id,
        title: dbItem.title || '',
        content: dbItem.content || '',
        status: dbItem.status as 'draft' | 'approved' | 'published' | 'archived',
        created_at: dbItem.created_at,
        updated_at: dbItem.updated_at,
        seo_score: dbItem.seo_score || 0,
        keywords: [], // Will be populated below
        user_id: dbItem.user_id,
        metadata: dbItem.metadata || {}
      };

      // Fetch keywords
      item = await fetchItemKeywords(item);
      
      // Fetch repurposed content data from database
      item = await fetchRepurposedContentData(item);
      
      return item;
    })
  );
  
  return processedItems;
};
