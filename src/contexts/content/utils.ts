
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from './types';
import { toast } from 'sonner';

// Helper function to fetch keywords for a single content item
export const fetchItemKeywords = async (item: any): Promise<ContentItemType> => {
  try {
    // Fetch keyword relationships for this item
    const { data: relations, error: relationsError } = await supabase
      .from('content_keywords')
      .select('keyword_id')
      .eq('content_id', item.id);
    
    if (relationsError) throw relationsError;
    
    if (!relations || relations.length === 0) {
      // No keywords for this item
      return {
        ...item,
        content: item.content || '',
        keywords: [],
        status: item.status as 'draft' | 'published' | 'archived'
      };
    }
    
    // Get the keyword IDs
    const keywordIds = relations.map(rel => rel.keyword_id);
    
    // Fetch the actual keywords
    const { data: keywordsData, error: keywordsError } = await supabase
      .from('keywords')
      .select('keyword')
      .in('id', keywordIds);
    
    if (keywordsError) throw keywordsError;
    
    // Extract the keyword texts
    const keywords = keywordsData ? keywordsData.map(kw => kw.keyword) : [];
    
    return {
      ...item,
      content: item.content || '',
      keywords,
      status: item.status as 'draft' | 'published' | 'archived'
    };
  } catch (error) {
    console.error('Error fetching keywords for content item:', error);
    return {
      ...item,
      content: item.content || '',
      keywords: [],
      status: item.status as 'draft' | 'published' | 'archived'
    };
  }
};

// Function to process content items with keywords
export const processContentItems = async (contentData: any[]): Promise<ContentItemType[]> => {
  try {
    // Get all content IDs to fetch their associated keywords
    const contentIds = contentData.map(item => item.id);
    
    // Fetch the keyword relationships
    const { data: keywordRelations, error: relationsError } = await supabase
      .from('content_keywords')
      .select('content_id, keyword_id')
      .in('content_id', contentIds);
    
    if (relationsError) throw relationsError;
    
    // Get unique keyword IDs to fetch the actual keyword texts
    const keywordIds = keywordRelations ? 
      [...new Set(keywordRelations.map(rel => rel.keyword_id))] 
      : [];
    
    let keywordMap: Record<string, string> = {};
    
    // Only fetch keywords if there are any relationships
    if (keywordIds.length > 0) {
      const { data: keywordsData, error: keywordsError } = await supabase
        .from('keywords')
        .select('id, keyword')
        .in('id', keywordIds);
      
      if (keywordsError) throw keywordsError;
      
      // Create a map of keyword IDs to their text values
      keywordMap = (keywordsData || []).reduce((acc, kw) => {
        acc[kw.id] = kw.keyword;
        return acc;
      }, {} as Record<string, string>);
    }
    
    // Map content data with their keywords
    const mappedData: ContentItemType[] = contentData.map(item => {
      // Find all keyword relations for this content item
      const itemKeywordRelations = keywordRelations ? 
        keywordRelations.filter(rel => rel.content_id === item.id) 
        : [];
        
      // Get the actual keyword texts using the map
      const itemKeywords = itemKeywordRelations
        .map(rel => keywordMap[rel.keyword_id])
        .filter(kw => kw !== undefined);
      
      return {
        id: item.id,
        title: item.title,
        content: item.content || '',
        status: item.status as 'draft' | 'published' | 'archived',
        created_at: item.created_at,
        updated_at: item.updated_at,
        seo_score: item.seo_score || 0,
        keywords: itemKeywords,
        user_id: item.user_id,
      };
    });
    
    return mappedData;
  } catch (error) {
    console.error('Error processing content items:', error);
    toast.error('Failed to process content items');
    return [];
  }
};
