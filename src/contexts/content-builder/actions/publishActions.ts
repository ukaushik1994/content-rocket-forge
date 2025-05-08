
import { ContentBuilderState, ContentBuilderAction, SaveContentParams } from '../types/index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      
      // Save SERP selections if available
      if (state.serpSelections && state.serpSelections.length > 0) {
        content.serpSelections = state.serpSelections;
      }
      
      // Save outline if available
      if (state.outline && state.outline.length > 0) {
        content.outline = state.outline;
      }
      
      // Prepare metadata for storing in the database
      const metadata = {
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        outline: content.outline || [],
        serpSelections: content.serpSelections || [],
        serpData: content.serpData || {},
        mainKeyword: content.mainKeyword,
        secondaryKeywords: content.secondaryKeywords || []
      };
      
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        toast.error('You need to be logged in to save content');
        return null;
      }
      
      // Save to Supabase database
      const { data, error } = await supabase
        .from('content_items')
        .insert({
          title: content.title,
          content: content.content,
          status: 'draft',
          seo_score: content.seoScore || 0,
          metadata: metadata,
          user_id: user.id
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Error saving content to Supabase:', error);
        toast.error('Failed to save content to draft');
        
        // Return null on error
        return null;
      }
      
      console.log('Content saved to database with ID:', data?.id);
      
      // Add keywords to the content if they exist
      if (content.mainKeyword || (content.secondaryKeywords && content.secondaryKeywords.length > 0)) {
        const keywords = [content.mainKeyword, ...(content.secondaryKeywords || [])].filter(Boolean);
        
        for (const keywordText of keywords) {
          // First check if keyword exists
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keywordText)
            .eq('user_id', user.id)
            .maybeSingle();
            
          let keywordId;
          
          if (!existingKeyword) {
            // Create the keyword if it doesn't exist
            const { data: newKeyword, error: keywordError } = await supabase
              .from('keywords')
              .insert({
                keyword: keywordText,
                user_id: user.id
              })
              .select('id')
              .single();
              
            if (keywordError) {
              console.error('Error creating keyword:', keywordError);
              continue;
            }
            
            keywordId = newKeyword.id;
          } else {
            keywordId = existingKeyword.id;
          }
          
          // Create the relationship between content item and keyword
          await supabase
            .from('content_keywords')
            .insert({
              content_id: data.id,
              keyword_id: keywordId
            });
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
      
      // Set saving state to false
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      
      toast.success('Content saved to drafts successfully');
      return data.id;
    } catch (error) {
      console.error('Error saving content to draft:', error);
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      toast.error('Error saving content to draft');
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
      
      // Save SERP selections if available
      if (state.serpSelections && state.serpSelections.length > 0) {
        content.serpSelections = state.serpSelections;
      }
      
      // Save outline if available
      if (state.outline && state.outline.length > 0) {
        content.outline = state.outline;
      }
      
      // Prepare metadata for storing in the database
      const metadata = {
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        outline: content.outline || [],
        serpSelections: content.serpSelections || [],
        serpData: content.serpData || {},
        mainKeyword: content.mainKeyword,
        secondaryKeywords: content.secondaryKeywords || []
      };
      
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        toast.error('You need to be logged in to publish content');
        return null;
      }
      
      // Save to Supabase database
      const { data, error } = await supabase
        .from('content_items')
        .insert({
          title: content.title,
          content: content.content,
          status: 'published', // Status set to published
          seo_score: content.seoScore || 0,
          metadata: metadata,
          user_id: user.id
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Error publishing content to Supabase:', error);
        toast.error('Failed to publish content');
        
        // Return null on error
        return null;
      }
      
      console.log('Content published to database with ID:', data?.id);
      
      // Add keywords to the content if they exist
      if (content.mainKeyword || (content.secondaryKeywords && content.secondaryKeywords.length > 0)) {
        const keywords = [content.mainKeyword, ...(content.secondaryKeywords || [])].filter(Boolean);
        
        for (const keywordText of keywords) {
          // First check if keyword exists
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keywordText)
            .eq('user_id', user.id)
            .maybeSingle();
            
          let keywordId;
          
          if (!existingKeyword) {
            // Create the keyword if it doesn't exist
            const { data: newKeyword, error: keywordError } = await supabase
              .from('keywords')
              .insert({
                keyword: keywordText,
                user_id: user.id
              })
              .select('id')
              .single();
              
            if (keywordError) {
              console.error('Error creating keyword:', keywordError);
              continue;
            }
            
            keywordId = newKeyword.id;
          } else {
            keywordId = existingKeyword.id;
          }
          
          // Create the relationship between content item and keyword
          await supabase
            .from('content_keywords')
            .insert({
              content_id: data.id,
              keyword_id: keywordId
            });
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
      
      // Set saving state to false
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      
      toast.success('Content published successfully');
      return data.id;
    } catch (error) {
      console.error('Error publishing content:', error);
      dispatch({ type: 'SET_IS_SAVING', payload: false });
      toast.error('Error publishing content');
      return null;
    }
  };

  return {
    saveContentToDraft,
    saveContentToPublished
  };
};
