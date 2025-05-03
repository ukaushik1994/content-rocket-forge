
import { ContentBuilderState, ContentBuilderAction } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Actions related to saving and publishing content
 */
export const createPublishActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Save content as draft
  const saveContentAsDraft = async () => {
    try {
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save content');
        return false;
      }
      
      // Prepare content data
      const contentData = {
        title: state.contentTitle || `Content about ${state.primaryKeyword || state.mainKeyword}`,
        content: state.content,
        status: 'draft',
        seo_score: state.seoScore || 0,
        user_id: user.id
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('content_items')
        .insert(contentData)
        .select('id')
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add keywords if available
      if ((state.selectedKeywords && state.selectedKeywords.length > 0) || state.primaryKeyword) {
        const allKeywords = [...(state.selectedKeywords || [])];
        
        if (state.primaryKeyword && !allKeywords.includes(state.primaryKeyword)) {
          allKeywords.push(state.primaryKeyword);
        }
        
        if (state.mainKeyword && !allKeywords.includes(state.mainKeyword)) {
          allKeywords.push(state.mainKeyword);
        }
        
        // Create and link keywords
        for (const keyword of allKeywords) {
          // First check if keyword exists
          const { data: existingKeyword, error: keywordError } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.id)
            .single();
            
          if (keywordError && keywordError.code !== 'PGRST116') {
            console.error('Error checking keyword:', keywordError);
            continue;
          }
          
          let keywordId;
          
          if (!existingKeyword) {
            // Create keyword if it doesn't exist
            const { data: newKeyword, error: createError } = await supabase
              .from('keywords')
              .insert({ keyword, user_id: user.id })
              .select('id')
              .single();
              
            if (createError) {
              console.error('Error creating keyword:', createError);
              continue;
            }
            
            keywordId = newKeyword.id;
          } else {
            keywordId = existingKeyword.id;
          }
          
          // Link keyword to content
          await supabase
            .from('content_keywords')
            .insert({
              content_id: data.id,
              keyword_id: keywordId
            });
        }
      }
      
      toast.success('Content saved as draft');
      return data.id;
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error(`Failed to save content: ${error.message}`);
      return false;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };

  // Publish content
  const publishContent = async () => {
    try {
      dispatch({ type: 'SET_IS_PUBLISHING', payload: true });
      
      // First save as draft to get the id
      const contentId = await saveContentAsDraft();
      
      if (!contentId) {
        throw new Error('Failed to save content before publishing');
      }
      
      // Update status to published
      const { error } = await supabase
        .from('content_items')
        .update({ status: 'published' })
        .eq('id', contentId);
        
      if (error) {
        throw error;
      }
      
      toast.success('Content published successfully!');
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
      return contentId;
    } catch (error: any) {
      console.error('Error publishing content:', error);
      toast.error(`Failed to publish content: ${error.message}`);
      return false;
    } finally {
      dispatch({ type: 'SET_IS_PUBLISHING', payload: false });
    }
  };

  return {
    saveContentAsDraft,
    publishContent
  };
};
