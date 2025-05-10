import { ContentBuilderState, ContentBuilderAction, SaveContentParams } from '../types/index';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const createPublishActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Implementation for saving content to draft
  const saveContentToDraft = async (content: SaveContentParams): Promise<string | null> => {
    try {
      // Set saving state to true
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      console.log('Saving content to draft:', content);
      
      // Check that required fields are present
      if (!content.title || !content.content || !content.mainKeyword) {
        console.error('Missing required fields for saving content:', { 
          title: content.title, 
          content: !!content.content, 
          mainKeyword: content.mainKeyword 
        });
        toast.error('Missing required fields for saving content');
        return null;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save content');
        return null;
      }

      // Prepare content data for database
      const contentData = {
        title: content.title,
        content: content.content,
        status: 'draft',
        seo_score: content.seoScore || 0,
        user_id: user.id,
        metadata: {
          mainKeyword: content.mainKeyword,
          secondaryKeywords: content.secondaryKeywords || [],
          contentType: content.contentType,
          metaTitle: content.metaTitle,
          metaDescription: content.metaDescription,
          outline: content.outline || [],
          serpSelections: content.serpSelections || [],
          serpData: content.serpData
        }
      };

      // Save to database
      const { data, error } = await supabase
        .from('content_items')
        .insert(contentData)
        .select()
        .single();

      if (error) throw error;

      // Save keywords if available
      if (content.mainKeyword || (content.secondaryKeywords && content.secondaryKeywords.length > 0)) {
        const keywords = [content.mainKeyword, ...(content.secondaryKeywords || [])];
        
        for (const keyword of keywords) {
          // Check if keyword exists
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.id)
            .single();

          let keywordId;
          
          if (!existingKeyword) {
            // Create new keyword
            const { data: newKeyword, error: keywordError } = await supabase
              .from('keywords')
              .insert({
                keyword,
                user_id: user.id
              })
              .select('id')
              .single();

            if (keywordError) throw keywordError;
            keywordId = newKeyword.id;
          } else {
            keywordId = existingKeyword.id;
          }

          // Create content-keyword relationship
          const { error: relationError } = await supabase
            .from('content_keywords')
            .insert({
              content_id: data.id,
              keyword_id: keywordId
            });

          if (relationError) throw relationError;
        }
      }

      // Update state with saved content info
      if (content.metaTitle) {
        dispatch({ type: 'SET_META_TITLE', payload: content.metaTitle });
      }
      
      if (content.metaDescription) {
        dispatch({ type: 'SET_META_DESCRIPTION', payload: content.metaDescription });
      }
      
      if (content.title) {
        dispatch({ type: 'SET_CONTENT_TITLE', payload: content.title });
      }

      toast.success('Content saved as draft successfully');
      
      // Set saving state to false
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      
      return data.id;
    } catch (error: any) {
      console.error('Error saving content to draft:', error);
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      toast.error(error.message || 'Failed to save content as draft');
      return null;
    }
  };
  
  // Implementation for publishing content
  const saveContentToPublished = async (content: SaveContentParams): Promise<string | null> => {
    try {
      // Set saving state to true
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      console.log('Publishing content:', content);
      
      // Check that required fields are present
      if (!content.title || !content.content || !content.mainKeyword) {
        console.error('Missing required fields for publishing content:', { 
          title: content.title, 
          content: !!content.content, 
          mainKeyword: content.mainKeyword 
        });
        toast.error('Missing required fields for publishing content');
        return null;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to publish content');
        return null;
      }

      // Prepare content data for database
      const contentData = {
        title: content.title,
        content: content.content,
        status: 'published',
        seo_score: content.seoScore || 0,
        user_id: user.id,
        metadata: {
          mainKeyword: content.mainKeyword,
          secondaryKeywords: content.secondaryKeywords || [],
          contentType: content.contentType,
          metaTitle: content.metaTitle,
          metaDescription: content.metaDescription,
          outline: content.outline || [],
          serpSelections: content.serpSelections || [],
          serpData: content.serpData
        }
      };

      // Save to database
      const { data, error } = await supabase
        .from('content_items')
        .insert(contentData)
        .select()
        .single();

      if (error) throw error;

      // Save keywords if available
      if (content.mainKeyword || (content.secondaryKeywords && content.secondaryKeywords.length > 0)) {
        const keywords = [content.mainKeyword, ...(content.secondaryKeywords || [])];
        
        for (const keyword of keywords) {
          // Check if keyword exists
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.id)
            .single();

          let keywordId;
          
          if (!existingKeyword) {
            // Create new keyword
            const { data: newKeyword, error: keywordError } = await supabase
              .from('keywords')
              .insert({
                keyword,
                user_id: user.id
              })
              .select('id')
              .single();

            if (keywordError) throw keywordError;
            keywordId = newKeyword.id;
          } else {
            keywordId = existingKeyword.id;
          }

          // Create content-keyword relationship
          const { error: relationError } = await supabase
            .from('content_keywords')
            .insert({
              content_id: data.id,
              keyword_id: keywordId
            });

          if (relationError) throw relationError;
        }
      }

      // Update state with published content info
      if (content.metaTitle) {
        dispatch({ type: 'SET_META_TITLE', payload: content.metaTitle });
      }
      
      if (content.metaDescription) {
        dispatch({ type: 'SET_META_DESCRIPTION', payload: content.metaDescription });
      }
      
      if (content.title) {
        dispatch({ type: 'SET_CONTENT_TITLE', payload: content.title });
      }

      toast.success('Content published successfully');
      
      // Set saving state to false
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      
      return data.id;
    } catch (error: any) {
      console.error('Error publishing content:', error);
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      toast.error(error.message || 'Failed to publish content');
      return null;
    }
  };

  return {
    saveContentToDraft,
    saveContentToPublished
  };
};
