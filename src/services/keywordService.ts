
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export interface Keyword {
  id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  created_at: string;
  user_id: string;
  isUsed?: boolean;
  contentCount?: number;
}

export async function getKeywords(): Promise<Keyword[]> {
  try {
    const { data: keywords, error } = await supabase
      .from("keywords")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }

    // Get content_keywords to determine which keywords are used
    const { data: contentKeywords, error: contentKeywordsError } = await supabase
      .from("content_keywords")
      .select("*");

    if (contentKeywordsError) {
      throw new Error(contentKeywordsError.message);
    }

    // Enhance keywords with usage data
    const enhancedKeywords = keywords.map(keyword => {
      const keywordContentLinks = contentKeywords?.filter(ck => ck.keyword_id === keyword.id) || [];
      return {
        ...keyword,
        isUsed: keywordContentLinks.length > 0,
        contentCount: keywordContentLinks.length
      };
    });

    return enhancedKeywords;
  } catch (error) {
    console.error("Error fetching keywords:", error);
    toast.error("Failed to load keywords");
    return [];
  }
}

export async function addKeyword(keyword: string, volume?: number, difficulty?: number): Promise<Keyword | null> {
  try {
    const { data, error } = await supabase
      .from("keywords")
      .insert({
        keyword,
        search_volume: volume || null,
        difficulty: difficulty || null
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { ...data, isUsed: false, contentCount: 0 };
  } catch (error) {
    console.error("Error adding keyword:", error);
    toast.error(`Failed to add keyword: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
}

export async function updateKeywordUsage(keywordId: string, contentId: string, isUsed: boolean): Promise<boolean> {
  try {
    if (isUsed) {
      // Add relationship between keyword and content
      const { error } = await supabase
        .from("content_keywords")
        .insert({ keyword_id: keywordId, content_id: contentId });
      
      if (error) throw new Error(error.message);
    } else {
      // Remove relationship between keyword and content
      const { error } = await supabase
        .from("content_keywords")
        .delete()
        .match({ keyword_id: keywordId, content_id: contentId });
      
      if (error) throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating keyword usage:", error);
    toast.error(`Failed to update keyword usage: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

export async function deleteKeyword(keywordId: string): Promise<boolean> {
  try {
    // First delete any relationships in content_keywords
    const { error: relationshipError } = await supabase
      .from("content_keywords")
      .delete()
      .match({ keyword_id: keywordId });
    
    if (relationshipError) throw new Error(relationshipError.message);
    
    // Then delete the keyword
    const { error } = await supabase
      .from("keywords")
      .delete()
      .match({ id: keywordId });
    
    if (error) throw new Error(error.message);
    
    return true;
  } catch (error) {
    console.error("Error deleting keyword:", error);
    toast.error(`Failed to delete keyword: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

export async function researchKeyword(keyword: string): Promise<any> {
  // For now, we'll use the existing researchKeyword function in keywordResearchService.ts
  // This is a placeholder that would integrate with that service
  try {
    const { researchKeyword } = await import('./keywordResearchService');
    return await researchKeyword(keyword);
  } catch (error) {
    console.error("Error researching keyword:", error);
    toast.error("Failed to research keyword");
    return null;
  }
}
