import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';
import { useContent } from '@/contexts/content';
import { supabase } from '@/integrations/supabase/client';
import { ComprehensiveSerpData, SerpMetrics, CompetitorAnalysis, RankingOpportunities, SerpSelectionStats } from '@/types/serp-metrics';


// AI preamble patterns that indicate a title is actually AI response text
const AI_PREAMBLE_PATTERNS = [
  /^here\s+are/i,
  /^sure[,!]/i,
  /^i['']ll/i,
  /^let\s+me/i,
  /^certainly/i,
  /^of\s+course/i,
  /^great[,!]/i,
  /^absolutely/i,
  /^\d+\s+(unique|creative|compelling|engaging)/i,
];

function sanitizeTitle(
  contentTitle: string | null | undefined,
  metaTitle: string | null | undefined,
  mainKeyword: string | null | undefined,
  content: string | null | undefined
): string {
  // Check if contentTitle looks like AI preamble
  if (contentTitle) {
    const isAIPreamble = contentTitle.length > 100 || 
      AI_PREAMBLE_PATTERNS.some(p => p.test(contentTitle));
    
    if (!isAIPreamble) {
      return contentTitle.substring(0, 120);
    }
  }
  
  // Fall back to metaTitle
  if (metaTitle && metaTitle.length <= 120) {
    return metaTitle;
  }
  
  // Try extracting from content H1
  if (content) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1].length <= 120) {
      return h1Match[1];
    }
  }
  
  // Final fallback
  return mainKeyword || 'Untitled Content';
}

/**
 * Hook for managing content saving and publishing functionality
 */
export const useSaveContent = () => {
  const { state, saveContentToDraft, saveContentToPublished } = useContentBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  const { refreshContent } = useContent();
  const navigate = useNavigate();
  // Remove optimization metadata functionality

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
  // Store reuse metadata for this content to prevent future reuse
  const recordReuseHistory = async (contentId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const selectedFaqs = state.serpSelections
        .filter(s => s.selected && (s.type === 'question' || s.type === 'peopleAlsoAsk'))
        .map(s => s.content);
      const selectedHeadings = state.serpSelections
        .filter(s => s.selected && s.type === 'heading')
        .map(s => s.content);
      const selectedTitles = [state.contentTitle || state.metaTitle].filter(Boolean) as string[];

      const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

      if ((unique(selectedFaqs).length + unique(selectedHeadings).length + unique(selectedTitles).length) === 0) {
        return;
      }

      await supabase.from('content_reuse_history').insert({
        user_id: user.user.id,
        content_id: contentId,
        primary_keyword: state.mainKeyword,
        used_faqs: unique(selectedFaqs),
        used_headings: unique(selectedHeadings),
        used_titles: unique(selectedTitles),
      });
    } catch (e) {
      console.warn('[useSaveContent] Failed to record reuse history (non-critical):', e);
    }
  };

  const handleSaveToDraft = async (): Promise<string | null> => {
    try {
      setIsSaving(true);
      console.log('[useSaveContent] Starting save to draft process');
      
      // Auto-generate meta information if missing (Phase 4: Data Validation)
      let finalMetaTitle = state.metaTitle;
      let finalMetaDescription = state.metaDescription;
      
      if (!finalMetaTitle || !finalMetaDescription) {
        console.log('[useSaveContent] Meta information missing, auto-generating...');
        
        // Import utilities
        const { extractTitleFromContent } = await import('@/utils/content/extractTitle');
        const { generateMetaSuggestions } = await import('@/utils/seo/meta/generateMetaSuggestions');
        
        // Generate missing meta information
        if (!finalMetaTitle) {
          finalMetaTitle = extractTitleFromContent(state.content) || state.contentTitle || state.mainKeyword;
          console.log('[useSaveContent] Auto-generated meta_title:', finalMetaTitle);
        }
        
        if (!finalMetaDescription) {
          const suggestions = generateMetaSuggestions(state.content, state.mainKeyword, state.contentTitle);
          finalMetaDescription = suggestions.metaDescription;
          console.log('[useSaveContent] Auto-generated meta_description:', finalMetaDescription);
        }
        
        toast.warning('Auto-generated meta information', {
          description: 'Meta title and description were created automatically from your content',
          duration: 4000
        });
      }
      
      // Extract comprehensive SERP data
      const comprehensiveSerpData = extractComprehensiveSerpData();
      
      // Remove optimization metadata
      const optimizationMetadata = null;
      
      // Prepare content for saving with extended metadata
      // Sanitize title: strip AI preamble and truncate
      const sanitizedTitle = sanitizeTitle(
        state.contentTitle, 
        state.metaTitle, 
        state.mainKeyword, 
        state.content
      );
      
      const saveParams: SaveContentParams = {
        title: sanitizedTitle,
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
      
      // Prepare comprehensive metadata with optimization insights
      const metadata = {
        contentType: saveParams.contentType,
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDescription,
        outline: saveParams.outline,
        serpSelections: saveParams.serpSelections,
        
        // CRITICAL: Strategy source tracking for proposal completion
        ...(state.strategySource && {
          source_proposal_id: state.strategySource.proposal_id,
          proposal_id: state.strategySource.proposal_id, // Duplicate for backward compatibility
          strategySource: state.strategySource,
          priority_tag: state.strategySource.priority_tag,
          estimated_impressions: state.strategySource.estimated_impressions
        }),
        
        // Solution integration data
        selectedSolution: state.selectedSolution ? {
          id: state.selectedSolution.id,
          name: state.selectedSolution.name,
          logoUrl: state.selectedSolution.logoUrl,
          category: state.selectedSolution.category,
          features: state.selectedSolution.features,
          useCases: state.selectedSolution.useCases,
          painPoints: state.selectedSolution.painPoints,
          targetAudience: state.selectedSolution.targetAudience
        } : null,
        
        // Solution integration metrics (if available)
        solutionIntegrationMetrics: state.solutionIntegrationMetrics ? 
          JSON.parse(JSON.stringify(state.solutionIntegrationMetrics)) : null,
        
        // SEO and optimization scores
        seoScore: state.seoScore || 0,
        seoImprovements: state.seoImprovements ? 
          JSON.parse(JSON.stringify(state.seoImprovements)) : [],
        optimizationSkipped: state.optimizationSkipped || false,
        
        // Enhanced SERP data - convert to plain objects
        comprehensiveSerpData: comprehensiveSerpData ? JSON.parse(JSON.stringify(comprehensiveSerpData)) : null,
        serpMetrics: comprehensiveSerpData?.serpMetrics ? JSON.parse(JSON.stringify(comprehensiveSerpData.serpMetrics)) : null,
        competitorAnalysis: comprehensiveSerpData?.competitorAnalysis ? JSON.parse(JSON.stringify(comprehensiveSerpData.competitorAnalysis)) : null,
        rankingOpportunities: comprehensiveSerpData?.rankingOpportunities ? JSON.parse(JSON.stringify(comprehensiveSerpData.rankingOpportunities)) : null,
        selectionStats: comprehensiveSerpData?.selectionStats ? JSON.parse(JSON.stringify(comprehensiveSerpData.selectionStats)) : null,
        
        // Keywords and content insights
        mainKeyword: saveParams.mainKeyword,
        secondaryKeywords: saveParams.secondaryKeywords,
        
        // Document structure and quality
        documentStructure: state.documentStructure ? 
          JSON.parse(JSON.stringify(state.documentStructure)) : null,
          
        // Content creation metadata
        contentFormat: state.contentFormat,
        contentIntent: state.contentIntent,
        additionalInstructions: state.additionalInstructions,
        location: state.location,
        
        // Timestamps and tracking
        analysisTimestamp: comprehensiveSerpData?.analysisTimestamp || new Date().toISOString(),
        lastOptimized: new Date().toISOString(),
        
        // Content metrics
        wordCount: saveParams.content?.split(' ').length || 0,
        readingTime: Math.ceil((saveParams.content?.split(' ').length || 0) / 200),
        
        // Comprehensive optimization metadata
        optimizationMetadata: optimizationMetadata ? 
          JSON.parse(JSON.stringify(optimizationMetadata)) : null
      };
      
      // Check for existing content to prevent duplicates
      const { data: existingContent } = await supabase
        .from('content_items')
        .select('id')
        .eq('title', saveParams.title)
        .eq('user_id', user.user.id)
        .eq('status', 'draft')
        .maybeSingle();
        
      if (existingContent) {
        // Update existing content instead of creating duplicate
        const { data: contentItem, error: contentError } = await supabase
          .from('content_items')
          .update({
            content: saveParams.content,
            seo_score: state.seoScore || 0,
            meta_title: finalMetaTitle,
            meta_description: finalMetaDescription,
            metadata: metadata,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContent.id)
          .select()
          .single();
          
        if (contentError || !contentItem) {
          console.error('[useSaveContent] Error updating content:', contentError);
          throw new Error(contentError?.message || 'Failed to update content');
        }
        
        console.log('[useSaveContent] Updated existing content:', existingContent.id);
        await recordReuseHistory(existingContent.id);
        return existingContent.id;
      }
      
      // Save new content item with comprehensive metadata
      console.log('[useSaveContent] Saving with meta info:', {
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDescription,
        willSaveToTopLevel: true,
        willSaveToMetadata: true
      });
      
      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .insert({
          title: saveParams.title,
          content: saveParams.content,
          user_id: user.user.id,
          status: 'draft',
          seo_score: state.seoScore || 0,
          meta_title: finalMetaTitle,
          meta_description: finalMetaDescription,
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
      await recordReuseHistory(contentId);
      
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
      
      // Content saved successfully - no need for context save
      
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
      
      // Auto-generate meta information if missing (Phase 4: Data Validation)
      let finalMetaTitle = state.metaTitle;
      let finalMetaDescription = state.metaDescription;
      
      if (!finalMetaTitle || !finalMetaDescription) {
        console.log('[useSaveContent] Meta information missing, auto-generating before publish...');
        
        // Import utilities
        const { extractTitleFromContent } = await import('@/utils/content/extractTitle');
        const { generateMetaSuggestions } = await import('@/utils/seo/meta/generateMetaSuggestions');
        
        // Generate missing meta information
        if (!finalMetaTitle) {
          finalMetaTitle = extractTitleFromContent(state.content) || state.contentTitle || state.mainKeyword;
          console.log('[useSaveContent] Auto-generated meta_title:', finalMetaTitle);
        }
        
        if (!finalMetaDescription) {
          const suggestions = generateMetaSuggestions(state.content, state.mainKeyword, state.contentTitle);
          finalMetaDescription = suggestions.metaDescription;
          console.log('[useSaveContent] Auto-generated meta_description:', finalMetaDescription);
        }
        
        toast.warning('Auto-generated meta information', {
          description: 'Meta title and description were created automatically from your content',
          duration: 4000
        });
      }
      
      // Extract comprehensive SERP data
      const comprehensiveSerpData = extractComprehensiveSerpData();
      
      // Remove optimization metadata
      const optimizationMetadata = null;
      
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
      
      // Prepare comprehensive metadata with optimization insights
      const metadata = {
        contentType: publishParams.contentType,
        metaTitle: publishParams.metaTitle,
        metaDescription: publishParams.metaDescription,
        outline: publishParams.outline,
        serpSelections: publishParams.serpSelections,
        
        // CRITICAL: Strategy source tracking for proposal completion
        ...(state.strategySource && {
          source_proposal_id: state.strategySource.proposal_id,
          proposal_id: state.strategySource.proposal_id, // Duplicate for backward compatibility
          strategySource: state.strategySource,
          priority_tag: state.strategySource.priority_tag,
          estimated_impressions: state.strategySource.estimated_impressions
        }),
        
        // Solution integration data
        selectedSolution: state.selectedSolution ? {
          id: state.selectedSolution.id,
          name: state.selectedSolution.name,
          logoUrl: state.selectedSolution.logoUrl,
          category: state.selectedSolution.category,
          features: state.selectedSolution.features,
          useCases: state.selectedSolution.useCases,
          painPoints: state.selectedSolution.painPoints,
          targetAudience: state.selectedSolution.targetAudience
        } : null,
        
        // Solution integration metrics (if available)
        solutionIntegrationMetrics: state.solutionIntegrationMetrics ? 
          JSON.parse(JSON.stringify(state.solutionIntegrationMetrics)) : null,
        
        // SEO and optimization scores
        seoScore: publishParams.seoScore || 0,
        seoImprovements: state.seoImprovements ? 
          JSON.parse(JSON.stringify(state.seoImprovements)) : [],
        optimizationSkipped: state.optimizationSkipped || false,
        
        // Enhanced SERP data - convert to plain objects
        comprehensiveSerpData: comprehensiveSerpData ? JSON.parse(JSON.stringify(comprehensiveSerpData)) : null,
        serpMetrics: comprehensiveSerpData?.serpMetrics ? JSON.parse(JSON.stringify(comprehensiveSerpData.serpMetrics)) : null,
        competitorAnalysis: comprehensiveSerpData?.competitorAnalysis ? JSON.parse(JSON.stringify(comprehensiveSerpData.competitorAnalysis)) : null,
        rankingOpportunities: comprehensiveSerpData?.rankingOpportunities ? JSON.parse(JSON.stringify(comprehensiveSerpData.rankingOpportunities)) : null,
        selectionStats: comprehensiveSerpData?.selectionStats ? JSON.parse(JSON.stringify(comprehensiveSerpData.selectionStats)) : null,
        
        // Keywords and content insights
        mainKeyword: publishParams.mainKeyword,
        secondaryKeywords: publishParams.secondaryKeywords,
        
        // Document structure and quality
        documentStructure: state.documentStructure ? 
          JSON.parse(JSON.stringify(state.documentStructure)) : null,
          
        // Content creation metadata
        contentFormat: state.contentFormat,
        contentIntent: state.contentIntent,
        additionalInstructions: state.additionalInstructions,
        location: state.location,
        
        // Timestamps and tracking
        analysisTimestamp: comprehensiveSerpData?.analysisTimestamp || new Date().toISOString(),
        lastOptimized: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        
        // Content metrics
        wordCount: publishParams.content?.split(' ').length || 0,
        readingTime: Math.ceil((publishParams.content?.split(' ').length || 0) / 200),
        
        // Comprehensive optimization metadata
        optimizationMetadata: optimizationMetadata ? 
          JSON.parse(JSON.stringify(optimizationMetadata)) : null
      };
      
      // Check for existing published content to prevent duplicates
      const { data: existingContent } = await supabase
        .from('content_items')
        .select('id')
        .eq('title', publishParams.title)
        .eq('user_id', user.user.id)
        .eq('status', 'published')
        .maybeSingle();
        
      if (existingContent) {
        // Update existing published content instead of creating duplicate
        const { data: contentItem, error: contentError } = await supabase
          .from('content_items')
          .update({
            content: publishParams.content,
            seo_score: publishParams.seoScore || 0,
            meta_title: finalMetaTitle,
            meta_description: finalMetaDescription,
            metadata: metadata,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContent.id)
          .select()
          .single();
          
        if (contentError || !contentItem) {
          throw new Error(contentError?.message || 'Failed to update published content');
        }
        
        console.log('[useSaveContent] Updated existing published content:', existingContent.id);
        await recordReuseHistory(existingContent.id);
        return existingContent.id;
      }
      
      // Save new published content item with comprehensive metadata
      console.log('[useSaveContent] Publishing with meta info:', {
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDescription,
        willSaveToTopLevel: true,
        willSaveToMetadata: true
      });
      
      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .insert({
          title: publishParams.title,
          content: publishParams.content,
          user_id: user.user.id,
          status: 'published',
          seo_score: publishParams.seoScore || 0,
          meta_title: finalMetaTitle,
          meta_description: finalMetaDescription,
          metadata: metadata
        })
        .select()
        .single();
        
      if (contentError || !contentItem) {
        throw new Error(contentError?.message || 'Failed to publish content');
      }
      
      const contentId = contentItem.id as string;
      await recordReuseHistory(contentId);
      
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
      
      // Content published successfully - no need for context save
      
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
