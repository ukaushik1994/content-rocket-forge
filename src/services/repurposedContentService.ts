
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RepurposedContentData {
  contentId: string;
  formatCode: string;
  content: string;
  title: string;
  userId: string;
}

export interface RepurposedContentRecord {
  id: string;
  content_id: string;
  format_code: string;
  content: string;
  title: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  version: number;
  metadata: any;
}

export const repurposedContentService = {
  async saveRepurposedContent(data: RepurposedContentData): Promise<RepurposedContentRecord | null> {
    try {
      // Save to repurposed_contents table
      const { data: result, error } = await supabase
        .from('repurposed_contents')
        .insert({
          content_id: data.contentId,
          format_code: data.formatCode,
          content: data.content,
          title: data.title,
          user_id: data.userId,
          status: 'saved',
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update content item metadata to include this format
      await this.syncContentItemMetadata(data.contentId);
      
      return result;
    } catch (error: any) {
      console.error('Error saving repurposed content:', error);
      toast.error('Failed to save content: ' + error.message);
      return null;
    }
  },

  async getRepurposedContentByFormat(contentId: string, formatCode: string): Promise<RepurposedContentRecord | null> {
    try {
      const { data, error } = await supabase
        .from('repurposed_contents')
        .select('*')
        .eq('content_id', contentId)
        .eq('format_code', formatCode)
        .eq('status', 'saved')
        .maybeSingle();

      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error fetching repurposed content:', error);
      return null;
    }
  },

  async getAllRepurposedContent(contentId: string): Promise<RepurposedContentRecord[]> {
    try {
      const { data, error } = await supabase
        .from('repurposed_contents')
        .select('*')
        .eq('content_id', contentId)
        .eq('status', 'saved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching all repurposed content:', error);
      return [];
    }
  },

  async getRepurposedFormatsForContent(contentId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('repurposed_contents')
        .select('format_code')
        .eq('content_id', contentId)
        .eq('status', 'saved');

      if (error) throw error;
      
      return data?.map(item => item.format_code) || [];
    } catch (error: any) {
      console.error('Error fetching repurposed formats:', error);
      return [];
    }
  },

  async getRepurposedContentMap(contentId: string): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('repurposed_contents')
        .select('format_code, content')
        .eq('content_id', contentId)
        .eq('status', 'saved');

      if (error) throw error;
      
      const contentMap: Record<string, string> = {};
      data?.forEach(item => {
        contentMap[item.format_code] = item.content;
      });
      
      return contentMap;
    } catch (error: any) {
      console.error('Error fetching repurposed content map:', error);
      return {};
    }
  },

  async syncContentItemMetadata(contentId: string): Promise<void> {
    try {
      // Get all repurposed formats for this content
      const repurposedFormats = await this.getRepurposedFormatsForContent(contentId);
      const repurposedContentMap = await this.getRepurposedContentMap(contentId);
      
      // Update the content item's metadata
      const { error } = await supabase
        .from('content_items')
        .update({
          metadata: {
            repurposedFormats,
            repurposedContentMap,
            lastSynced: new Date().toISOString()
          }
        })
        .eq('id', contentId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error syncing content item metadata:', error);
      // Don't throw here to avoid breaking the main operation
    }
  },

  async deleteRepurposedContent(contentId: string, formatCode: string): Promise<boolean> {
    try {
      // Delete from repurposed_contents table
      const { error } = await supabase
        .from('repurposed_contents')
        .delete()
        .eq('content_id', contentId)
        .eq('format_code', formatCode);

      if (error) throw error;
      
      // Sync metadata after deletion
      await this.syncContentItemMetadata(contentId);
      
      return true;
    } catch (error: any) {
      console.error('Error deleting repurposed content:', error);
      toast.error('Failed to delete content: ' + error.message);
      return false;
    }
  },

  async saveAllRepurposedContent(contentId: string, userId: string, generatedContents: Record<string, string>, originalTitle: string): Promise<string[]> {
    const savedFormats: string[] = [];
    
    for (const [formatCode, content] of Object.entries(generatedContents)) {
      if (!formatCode || !content) continue;
      
      const result = await this.saveRepurposedContent({
        contentId,
        formatCode,
        content,
        title: `${originalTitle} - ${formatCode}`,
        userId
      });
      
      if (result) {
        savedFormats.push(formatCode);
      }
    }
    
    // Final sync after all saves
    if (savedFormats.length > 0) {
      await this.syncContentItemMetadata(contentId);
    }
    
    return savedFormats;
  }
};
