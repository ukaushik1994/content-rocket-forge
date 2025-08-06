import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';
import { useContent } from '@/contexts/content';
import { supabase } from '@/integrations/supabase/client';
import { ComprehensiveSerpData, SerpMetrics, CompetitorAnalysis, RankingOpportunities, SerpSelectionStats } from '@/types/serp-metrics';

/**
 * Hook for managing content saving and publishing functionality
 */
export const useSaveContent = () => {
  const { state, saveContentToDraft, saveContentToPublished } = useContentBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  const { refreshContent } = useContent();
  const navigate = useNavigate();

  // Helper function to extract comprehensive SERP data
  const extractComprehensiveSerpData = (): ComprehensiveSerpData | null => {
    if (!state.serpData) return null;

    // Extract SEO metrics
    const serpMetrics: SerpMetrics = {
      keyword: state.mainKeyword,
      searchVolume: state.serpData.searchVolume,
      keywordDifficulty: state.serpData.keywordDifficulty,
      competitionScore: state.serpData.competitionScore,
      intent: state.serpData.commercialSignals?.commercialIntent === 'high' ? 'commercial' : 'informational'
    };

    // Extract competitor analysis
    const competitorAnalysis: CompetitorAnalysis = {
      topCompetitors: state.serpData.topResults?.slice(0, 5).map((result: any, index: number) => ({
        domain: new URL(result.link || '').hostname,
        title: result.title,
        position: result.position || index + 1,
        snippet: result.snippet,
        features: []
      })) || [],
      commonFeatures: [
        ...(state.serpData.featuredSnippets?.length > 0 ? ['Featured Snippets'] : []),
        ...(state.serpData.peopleAlsoAsk?.length > 0 ? ['People Also Ask'] : []),
        ...(state.serpData.localResults?.length > 0 ? ['Local Results'] : [])
      ],
      gapOpportunities: state.serpData.contentGaps?.map((gap: any) => gap.topic) || []
    };

    // Extract ranking opportunities
    const rankingOpportunities: RankingOpportunities = {
      featuredSnippetChance: state.serpData.featuredSnippets?.length > 0 ? 'high' : 'low',
      paaOpportunities: state.serpData.peopleAlsoAsk?.length || 0,
      imageOpportunities: state.serpData.multimediaOpportunities?.some((m: any) => m.type === 'images') || false,
      videoOpportunities: state.serpData.multimediaOpportunities?.some((m: any) => m.type === 'videos') || false,
      localOpportunities: state.serpData.localResults?.length > 0 || false,
      recommendedContentLength: competitorAnalysis.averageWordCount || 1500,
      missingTopics: state.serpData.contentGaps?.map((gap: any) => gap.topic) || []
    };

    // Extract selection statistics
    const selectionStats: SerpSelectionStats = {
      totalSelected: state.serpSelections.length,
      byType: {
        questions: state.serpSelections.filter(s => s.type === 'question').length,
        featuredSnippets: state.serpSelections.filter(s => s.type === 'featuredSnippet').length,
        relatedSearches: state.serpSelections.filter(s => s.type === 'relatedSearch').length,
        entities: state.serpSelections.filter(s => s.type === 'entity').length,
        headings: state.serpSelections.filter(s => s.type === 'heading').length,
        contentGaps: state.serpSelections.filter(s => s.type === 'contentGap').length
      },
      selections: state.serpSelections.map(selection => ({
        type: selection.type,
        content: selection.content,
        source: selection.source,
        priority: 'medium' // Default priority
      }))
    };

    return {
      serpMetrics,
      competitorAnalysis,
      rankingOpportunities,
      selectionStats,
      rawSerpData: state.serpData,
      analysisTimestamp: new Date().toISOString()
    };
  };

  const handleSaveToDraft = async (): Promise<string | null> => {
    try {
      setIsSaving(true);
      console.log('[useSaveContent] Starting save to draft process');
      
      // Extract comprehensive SERP data
      const comprehensiveSerpData = extractComprehensiveSerpData();
      
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
      
      console.log('[useSaveContent] Saving content with comprehensive SERP data:', {
        title: saveParams.title,
        contentLength: saveParams.content?.length,
        mainKeyword: saveParams.mainKeyword,
        secondaryKeywords: saveParams.secondaryKeywords?.length,
        outline: saveParams.outline?.length,
        serpSelections: saveParams.serpSelections?.length,
        comprehensiveSerpData: !!comprehensiveSerpData
      });
      
      // Save to database
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }
      
      // Prepare metadata as plain object for JSON storage
      const metadata = {
        contentType: saveParams.contentType,
        metaTitle: saveParams.metaTitle,
        metaDescription: saveParams.metaDescription,
        outline: saveParams.outline,
        serpSelections: saveParams.serpSelections,
        // Enhanced SERP data - convert to plain objects
        comprehensiveSerpData: comprehensiveSerpData ? JSON.parse(JSON.stringify(comprehensiveSerpData)) : null,
        serpMetrics: comprehensiveSerpData?.serpMetrics ? JSON.parse(JSON.stringify(comprehensiveSerpData.serpMetrics)) : null,
        competitorAnalysis: comprehensiveSerpData?.competitorAnalysis ? JSON.parse(JSON.stringify(comprehensiveSerpData.competitorAnalysis)) : null,
        rankingOpportunities: comprehensiveSerpData?.rankingOpportunities ? JSON.parse(JSON.stringify(comprehensiveSerpData.rankingOpportunities)) : null,
        selectionStats: comprehensiveSerpData?.selectionStats ? JSON.parse(JSON.stringify(comprehensiveSerpData.selectionStats)) : null,
        analysisTimestamp: comprehensiveSerpData?.analysisTimestamp
      };
      
      // Save the content item first with comprehensive metadata
      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .insert({
          title: saveParams.title,
          content: saveParams.content,
          user_id: user.user.id,
          status: 'draft',
          seo_score: state.seoScore || 0,
          metadata: metadata
        })
        .select()
        .single();
        
      if (contentError || !contentItem) {
        console.error('[useSaveContent] Error saving content:', contentError);
        throw new Error(contentError?.message || 'Failed to save content');
      }
      
      const contentId = contentItem.id as string;
      console.log('[useSaveContent] Content saved with comprehensive SERP data, ID:', contentId);
      
      // Now save the keywords if any
      if (saveParams.mainKeyword || (saveParams.secondaryKeywords && saveParams.secondaryKeywords.length > 0)) {
        const allKeywords = [
          saveParams.mainKeyword,
          ...(saveParams.secondaryKeywords || [])
        ].filter(Boolean) as string[];
        
        // Remove duplicates to prevent constraint violations
        const uniqueKeywords = [...new Set(allKeywords)];
        
        // Save any new keywords
        const keywords = [];
        for (const keyword of uniqueKeywords) {
          // Check if keyword exists first
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.user.id)
            .maybeSingle();
            
          if (existingKeyword) {
            keywords.push(existingKeyword.id);
          } else {
            // Insert new keyword with conflict handling
            const { data: newKeyword, error: keywordError } = await supabase
              .from('keywords')
              .insert({
                keyword: keyword,
                user_id: user.user.id
              })
              .select('id')
              .maybeSingle();
              
            if (!keywordError && newKeyword) {
              keywords.push(newKeyword.id);
            }
          }
        }
        
        // Link keywords to content with conflict handling
        if (keywords.length > 0) {
          const contentKeywords = keywords.map(keywordId => ({
            content_id: contentId,
            keyword_id: keywordId
          }));
          
          const { error: linkError } = await supabase
            .from('content_keywords')
            .upsert(contentKeywords, { 
              onConflict: 'content_id,keyword_id',
              ignoreDuplicates: true 
            });
            
          if (linkError) {
            console.warn('[useSaveContent] Error linking keywords (non-critical):', linkError);
          }
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
      toast.success('Content saved to drafts with comprehensive SERP analysis');
      console.log('[useSaveContent] Save completed successfully, ID:', contentId);
      
      // Don't navigate immediately, let the SaveAndExportPanel handle the published URL dialog
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
      
      // Extract comprehensive SERP data
      const comprehensiveSerpData = extractComprehensiveSerpData();
      
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
      
      console.log('[useSaveContent] Publishing content with comprehensive SERP data:', publishParams);
      
      // Save to database
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error('User not authenticated');
      }
      
      // Prepare metadata as plain object for JSON storage
      const metadata = {
        contentType: publishParams.contentType,
        metaTitle: publishParams.metaTitle,
        metaDescription: publishParams.metaDescription,
        outline: publishParams.outline,
        serpSelections: publishParams.serpSelections,
        // Enhanced SERP data - convert to plain objects
        comprehensiveSerpData: comprehensiveSerpData ? JSON.parse(JSON.stringify(comprehensiveSerpData)) : null,
        serpMetrics: comprehensiveSerpData?.serpMetrics ? JSON.parse(JSON.stringify(comprehensiveSerpData.serpMetrics)) : null,
        competitorAnalysis: comprehensiveSerpData?.competitorAnalysis ? JSON.parse(JSON.stringify(comprehensiveSerpData.competitorAnalysis)) : null,
        rankingOpportunities: comprehensiveSerpData?.rankingOpportunities ? JSON.parse(JSON.stringify(comprehensiveSerpData.rankingOpportunities)) : null,
        selectionStats: comprehensiveSerpData?.selectionStats ? JSON.parse(JSON.stringify(comprehensiveSerpData.selectionStats)) : null,
        analysisTimestamp: comprehensiveSerpData?.analysisTimestamp
      };
      
      // Save the content item first with comprehensive metadata
      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .insert({
          title: publishParams.title,
          content: publishParams.content,
          user_id: user.user.id,
          status: 'published',
          seo_score: publishParams.seoScore || 0,
          metadata: metadata
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
        
        // Remove duplicates to prevent constraint violations
        const uniqueKeywords = [...new Set(allKeywords)];
        
        // Save any new keywords
        const keywords = [];
        for (const keyword of uniqueKeywords) {
          // Check if keyword exists first
          const { data: existingKeyword } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.user.id)
            .maybeSingle();
            
          if (existingKeyword) {
            keywords.push(existingKeyword.id);
          } else {
            // Insert new keyword with conflict handling
            const { data: newKeyword, error: keywordError } = await supabase
              .from('keywords')
              .insert({
                keyword: keyword,
                user_id: user.user.id
              })
              .select('id')
              .maybeSingle();
              
            if (!keywordError && newKeyword) {
              keywords.push(newKeyword.id);
            }
          }
        }
        
        // Link keywords to content with conflict handling
        if (keywords.length > 0) {
          const contentKeywords = keywords.map(keywordId => ({
            content_id: contentId,
            keyword_id: keywordId
          }));
          
          const { error: linkError } = await supabase
            .from('content_keywords')
            .upsert(contentKeywords, { 
              onConflict: 'content_id,keyword_id',
              ignoreDuplicates: true 
            });
            
          if (linkError) {
            console.warn('[useSaveContent] Error linking keywords (non-critical):', linkError);
          }
        }
      }
      
      // Try publishing using content builder context (legacy)
      if (saveContentToPublished) {
        await saveContentToPublished(publishParams);
      }
      
      // Force refresh the content list
      await refreshContent();
      
      toast.success('Content published successfully with comprehensive SERP analysis');
      
      // Don't navigate immediately, let the SaveAndExportPanel handle the published URL dialog
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
