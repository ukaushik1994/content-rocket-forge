
import { ContentBuilderState, ContentBuilderAction, SaveContentParams } from '../types/index';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const createPublishActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Implementation for saving content to draft
  const saveContentToDraft = async (): Promise<string | null> => {
    try {
      // Set saving state to true
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      console.log('Saving content to draft with enhanced metadata');
      
      // Check that required fields are present
      if (!state.contentTitle || !state.content || !state.mainKeyword) {
        console.error('Missing required fields for saving content:', { 
          title: state.contentTitle, 
          content: !!state.content, 
          mainKeyword: state.mainKeyword 
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

      // Prepare enhanced metadata structure
      const enhancedMetadata = {
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords || [],
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        outline: state.outline || [],
        serpSelections: state.serpSelections || [],
        serpData: state.serpData,
        serpMetrics: state.comprehensiveSerpData ? {
          totalResults: state.comprehensiveSerpData.totalResults,
          competitorAnalyzed: state.comprehensiveSerpData.competitors?.length || 0,
          contentGapsFound: state.serpSelections.filter(s => s.type === 'contentGap').length,
          avgCompetitorLength: state.comprehensiveSerpData.avgContentLength || 0
        } : null,
        // Enhanced analytics data
        comprehensiveAnalytics: state.comprehensiveAnalytics,
        documentStructure: state.documentStructure,
        solutionIntegrationMetrics: state.solutionIntegrationMetrics,
        selectedSolution: state.selectedSolution ? {
          id: state.selectedSolution.id,
          name: state.selectedSolution.name,
          category: state.selectedSolution.category
        } : null,
        contentIntent: state.contentIntent,
        contentFormat: state.contentFormat,
        additionalInstructions: state.additionalInstructions,
        // SEO and optimization data
        seoImprovements: state.seoImprovements,
        optimizationSkipped: state.optimizationSkipped,
        analysisTimestamp: new Date().toISOString()
      };

      // Prepare content data for database
      const contentData = {
        title: state.contentTitle,
        content: state.content,
        status: 'draft',
        seo_score: state.comprehensiveAnalytics?.contentQualityMetrics.overallScore || state.seoScore || 0,
        user_id: user.id,
        metadata: enhancedMetadata
      };

      // Save to database
      const { data, error } = await supabase
        .from('content_items')
        .insert(contentData)
        .select()
        .single();

      if (error) throw error;

      // Save keywords if available
      if (state.mainKeyword || (state.selectedKeywords && state.selectedKeywords.length > 0)) {
        const keywords = [state.mainKeyword, ...(state.selectedKeywords || [])];
        
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

      toast.success('Content saved as draft with enhanced analytics');
      
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
  const saveContentToPublished = async (): Promise<string | null> => {
    try {
      // Set saving state to true
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      console.log('Publishing content with enhanced metadata');
      
      // Check that required fields are present
      if (!state.contentTitle || !state.content || !state.mainKeyword) {
        console.error('Missing required fields for publishing content');
        toast.error('Missing required fields for publishing content');
        return null;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to publish content');
        return null;
      }

      // Prepare enhanced metadata structure (same as draft)
      const enhancedMetadata = {
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords || [],
        contentType: state.contentType,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        outline: state.outline || [],
        serpSelections: state.serpSelections || [],
        serpData: state.serpData,
        serpMetrics: state.comprehensiveSerpData ? {
          totalResults: state.comprehensiveSerpData.totalResults,
          competitorAnalyzed: state.comprehensiveSerpData.competitors?.length || 0,
          contentGapsFound: state.serpSelections.filter(s => s.type === 'contentGap').length,
          avgCompetitorLength: state.comprehensiveSerpData.avgContentLength || 0
        } : null,
        comprehensiveAnalytics: state.comprehensiveAnalytics,
        documentStructure: state.documentStructure,
        solutionIntegrationMetrics: state.solutionIntegrationMetrics,
        selectedSolution: state.selectedSolution ? {
          id: state.selectedSolution.id,
          name: state.selectedSolution.name,
          category: state.selectedSolution.category
        } : null,
        contentIntent: state.contentIntent,
        contentFormat: state.contentFormat,
        additionalInstructions: state.additionalInstructions,
        seoImprovements: state.seoImprovements,
        optimizationSkipped: state.optimizationSkipped,
        analysisTimestamp: new Date().toISOString()
      };

      // Prepare content data for database
      const contentData = {
        title: state.contentTitle,
        content: state.content,
        status: 'published',
        seo_score: state.comprehensiveAnalytics?.contentQualityMetrics.overallScore || state.seoScore || 0,
        user_id: user.id,
        metadata: enhancedMetadata
      };

      // Save to database
      const { data, error } = await supabase
        .from('content_items')
        .insert(contentData)
        .select()
        .single();

      if (error) throw error;

      // Save keywords (same as draft process)
      if (state.mainKeyword || (state.selectedKeywords && state.selectedKeywords.length > 0)) {
        const keywords = [state.mainKeyword, ...(state.selectedKeywords || [])];
        
        for (const keyword of keywords) {
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.id)
            .single();

          let keywordId;
          
          if (!existingKeyword) {
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

          const { error: relationError } = await supabase
            .from('content_keywords')
            .insert({
              content_id: data.id,
              keyword_id: keywordId
            });

          if (relationError) throw relationError;
        }
      }

      toast.success('Content published successfully with enhanced analytics');
      
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
