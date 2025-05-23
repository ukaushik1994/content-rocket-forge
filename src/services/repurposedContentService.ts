
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

  async deleteRepurposedContent(contentId: string, formatCode: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('repurposed_contents')
        .delete()
        .eq('content_id', contentId)
        .eq('format_code', formatCode);

      if (error) throw error;
      
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
    
    return savedFormats;
  }
};
