
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';
import { useContent } from '@/contexts/content';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing content saving and publishing functionality
 */
export const useSaveContent = () => {
  const { state, saveContentToDraft, saveContentToPublished } = useContentBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  const { refreshContent } = useContent();
  const navigate = useNavigate();

  const handleSaveToDraft = async (): Promise<string | null> => {
    try {
      setIsSaving(true);
      console.log('[useSaveContent] Starting save to draft process');
      
      // Prepare content for saving with extended metadata
      const saveParams: SaveContentParams = {
        title: state.contentTitle || state.metaTitle || state.mainKeyword,
        content: state.content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        status: 'draft',
        notes: '',
        outline: state.outline,
        serpSelections: state.serpSelections,
        serpData: state.serpData
      };
      
      console.log('[useSaveContent] Saving content with params:', {
        title: saveParams.title,
        contentLength: saveParams.content?.length,
        mainKeyword: saveParams.mainKeyword,
        secondaryKeywords: saveParams.secondaryKeywords?.length,
        outline: saveParams.outline?.length,
        serpSelections: saveParams.serpSelections?.length
      });
      
      // Save to database
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }
      
      // Save the content item first
      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .insert({
          title: saveParams.title,
          content: saveParams.content,
          user_id: user.user.id,
          status: 'draft',
          seo_score: state.seoScore || 0,
          metadata: {
            contentType: saveParams.contentType,
            metaTitle: saveParams.metaTitle,
            metaDescription: saveParams.metaDescription,
            outline: saveParams.outline,
            serpSelections: saveParams.serpSelections,
          }
        })
        .select()
        .single();
        
      if (contentError || !contentItem) {
        console.error('[useSaveContent] Error saving content:', contentError);
        throw new Error(contentError?.message || 'Failed to save content');
      }
      
      const contentId = contentItem.id as string;
      console.log('[useSaveContent] Content saved, ID:', contentId);
      
      // Now save the keywords if any
      if (saveParams.mainKeyword || (saveParams.secondaryKeywords && saveParams.secondaryKeywords.length > 0)) {
        const allKeywords = [
          saveParams.mainKeyword,
          ...(saveParams.secondaryKeywords || [])
        ].filter(Boolean) as string[];
        
        // Save any new keywords
        const keywords = [];
        for (const keyword of allKeywords) {
          // Check if keyword exists first
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.user.id)
            .single();
            
          if (existingKeyword) {
            keywords.push(existingKeyword.id);
          } else {
            // Insert new keyword
            const { data: newKeyword, error: keywordError } = await supabase
              .from('keywords')
              .insert({
                keyword: keyword,
                user_id: user.user.id
              })
              .select('id')
              .single();
              
            if (!keywordError && newKeyword) {
              keywords.push(newKeyword.id);
            }
          }
        }
        
        // Link keywords to content
        if (keywords.length > 0) {
          const contentKeywords = keywords.map(keywordId => ({
            content_id: contentId,
            keyword_id: keywordId
          }));
          
          await supabase
            .from('content_keywords')
            .insert(contentKeywords);
        }
      }
      
      // Save using content builder context (legacy)
      if (saveContentToDraft) {
        await saveContentToDraft(saveParams);
      }
      
      // Force refresh the content list to make sure it shows up
      console.log('[useSaveContent] Refreshing content after save');
      await refreshContent();
      
      setIsSavedToDraft(true);
      toast.success('Content saved to drafts successfully');
      console.log('[useSaveContent] Save completed successfully, ID:', contentId);
      
      // Set session storage flags for the drafts page to detect
      sessionStorage.setItem('content_draft_saved', 'true');
      sessionStorage.setItem('content_save_timestamp', Date.now().toString());
      console.log('[useSaveContent] Set session storage flags for draft saved');
      
      // Navigate to drafts page
      setTimeout(() => {
        console.log('[useSaveContent] Navigating to drafts page...');
        navigate('/drafts', { state: { contentRefresh: true } });
      }, 1000);
      
      return contentId;
    } catch (error) {
      console.error('Error saving content to draft:', error);
      toast.error('Failed to save content to drafts');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (): Promise<string | null> => {
    try {
      setIsSaving(true);
      
      // Prepare content for publishing with extended metadata
      const publishParams: SaveContentParams = {
        title: state.contentTitle || state.metaTitle || state.mainKeyword,
        content: state.content,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords,
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        status: 'published',
        notes: '',
        seoScore: state.seoScore,
        outline: state.outline,
        serpSelections: state.serpSelections,
        serpData: state.serpData
      };
      
      console.log('[useSaveContent] Publishing content with params:', publishParams);
      
      // Save to database
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }
      
      // Save the content item first
      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .insert({
          title: publishParams.title,
          content: publishParams.content,
          user_id: user.user.id,
          status: 'published',
          seo_score: publishParams.seoScore || 0,
          metadata: {
            contentType: publishParams.contentType,
            metaTitle: publishParams.metaTitle,
            metaDescription: publishParams.metaDescription,
            outline: publishParams.outline,
            serpSelections: publishParams.serpSelections,
          }
        })
        .select()
        .single();
        
      if (contentError || !contentItem) {
        throw new Error(contentError?.message || 'Failed to publish content');
      }
      
      const contentId = contentItem.id as string;
      
      // Now save the keywords if any
      if (publishParams.mainKeyword || (publishParams.secondaryKeywords && publishParams.secondaryKeywords.length > 0)) {
        const allKeywords = [
          publishParams.mainKeyword,
          ...(publishParams.secondaryKeywords || [])
        ].filter(Boolean) as string[];
        
        // Save any new keywords
        const keywords = [];
        for (const keyword of allKeywords) {
          // Check if keyword exists first
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.user.id)
            .single();
            
          if (existingKeyword) {
            keywords.push(existingKeyword.id);
          } else {
            // Insert new keyword
            const { data: newKeyword, error: keywordError } = await supabase
              .from('keywords')
              .insert({
                keyword: keyword,
                user_id: user.user.id
              })
              .select('id')
              .single();
              
            if (!keywordError && newKeyword) {
              keywords.push(newKeyword.id);
            }
          }
        }
        
        // Link keywords to content
        if (keywords.length > 0) {
          const contentKeywords = keywords.map(keywordId => ({
            content_id: contentId,
            keyword_id: keywordId
          }));
          
          await supabase
            .from('content_keywords')
            .insert(contentKeywords);
        }
      }
      
      // Try publishing using content builder context (legacy)
      if (saveContentToPublished) {
        await saveContentToPublished(publishParams);
      }
      
      // Force refresh the content list
      await refreshContent();
      
      toast.success('Content published successfully');
      
      // Navigate to drafts page with a refresh parameter
      sessionStorage.setItem('from_content_builder', 'true');
      sessionStorage.setItem('content_save_timestamp', Date.now().toString());
      
      setTimeout(() => {
        navigate('/drafts', { 
          state: { contentRefresh: true }
        });
      }, 1000);
      
      return contentId;
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isSavedToDraft,
    handleSaveToDraft,
    handlePublish
  };
};
