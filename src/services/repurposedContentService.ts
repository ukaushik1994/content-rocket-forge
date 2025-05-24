
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
      console.log('[repurposedContentService] Saving repurposed content:', data);
      
      // Check if content already exists and update instead of insert
      const { data: existingContent } = await supabase
        .from('repurposed_contents')
        .select('id')
        .eq('content_id', data.contentId)
        .eq('format_code', data.formatCode)
        .eq('user_id', data.userId)
        .maybeSingle();

      let result;
      
      if (existingContent) {
        // Update existing content
        const { data: updatedData, error } = await supabase
          .from('repurposed_contents')
          .update({
            content: data.content,
            title: data.title,
            updated_at: new Date().toISOString(),
            status: 'saved'
          })
          .eq('id', existingContent.id)
          .select()
          .single();
          
        if (error) throw error;
        result = updatedData;
        console.log('[repurposedContentService] Updated existing content:', result);
      } else {
        // Insert new content
        const { data: insertedData, error } = await supabase
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
        result = insertedData;
        console.log('[repurposedContentService] Inserted new content:', result);
      }
      
      // Update content item metadata to include this format
      await this.syncContentItemMetadata(data.contentId);
      
      return result;
    } catch (error: any) {
      console.error('[repurposedContentService] Error saving repurposed content:', error);
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
      console.error('[repurposedContentService] Error fetching repurposed content:', error);
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
      console.error('[repurposedContentService] Error fetching all repurposed content:', error);
      return [];
    }
  },

  async getRepurposedFormatsForContent(contentId: string): Promise<string[]> {
    try {
      console.log('[repurposedContentService] Getting formats for content:', contentId);
      const { data, error } = await supabase
        .from('repurposed_contents')
        .select('format_code')
        .eq('content_id', contentId)
        .eq('status', 'saved');

      if (error) throw error;
      
      const formats = data?.map(item => item.format_code) || [];
      console.log('[repurposedContentService] Found formats:', formats);
      return formats;
    } catch (error: any) {
      console.error('[repurposedContentService] Error fetching repurposed formats:', error);
      return [];
    }
  },

  async getRepurposedContentMap(contentId: string): Promise<Record<string, string>> {
    try {
      console.log('[repurposedContentService] Getting content map for content:', contentId);
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
      
      console.log('[repurposedContentService] Content map:', contentMap);
      return contentMap;
    } catch (error: any) {
      console.error('[repurposedContentService] Error fetching repurposed content map:', error);
      return {};
    }
  },

  async syncContentItemMetadata(contentId: string): Promise<void> {
    try {
      console.log('[repurposedContentService] Syncing metadata for content:', contentId);
      
      // Get all repurposed formats for this content
      const repurposedFormats = await this.getRepurposedFormatsForContent(contentId);
      const repurposedContentMap = await this.getRepurposedContentMap(contentId);
      
      // Get current metadata
      const { data: currentContent, error: fetchError } = await supabase
        .from('content_items')
        .select('metadata')
        .eq('id', contentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const currentMetadata = currentContent?.metadata || {};
      
      // Update the content item's metadata
      const updatedMetadata = {
        ...currentMetadata,
        repurposedFormats,
        repurposedContentMap,
        lastSynced: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('content_items')
        .update({
          metadata: updatedMetadata
        })
        .eq('id', contentId);

      if (error) throw error;
      
      console.log('[repurposedContentService] Metadata synced successfully:', {
        contentId,
        formatsCount: repurposedFormats.length,
        contentMapKeys: Object.keys(repurposedContentMap)
      });
    } catch (error: any) {
      console.error('[repurposedContentService] Error syncing content item metadata:', error);
      // Don't throw here to avoid breaking the main operation
    }
  },

  async deleteRepurposedContent(contentId: string, formatCode: string): Promise<boolean> {
    try {
      console.log('[repurposedContentService] Deleting content:', { contentId, formatCode });
      
      // Delete from repurposed_contents table
      const { error } = await supabase
        .from('repurposed_contents')
        .delete()
        .eq('content_id', contentId)
        .eq('format_code', formatCode);

      if (error) throw error;
      
      // Sync metadata after deletion
      await this.syncContentItemMetadata(contentId);
      
      console.log('[repurposedContentService] Content deleted successfully');
      return true;
    } catch (error: any) {
      console.error('[repurposedContentService] Error deleting repurposed content:', error);
      toast.error('Failed to delete content: ' + error.message);
      return false;
    }
  },

  async saveAllRepurposedContent(contentId: string, userId: string, generatedContents: Record<string, string>, originalTitle: string): Promise<string[]> {
    const savedFormats: string[] = [];
    
    console.log('[repurposedContentService] Saving all content:', {
      contentId,
      formatCount: Object.keys(generatedContents).length,
      originalTitle
    });
    
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
    
    console.log('[repurposedContentService] Saved formats:', savedFormats);
    return savedFormats;
  }
};
