import { ContentBuilderState, ContentBuilderAction, SaveContentParams } from '../types/index';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { proposalKeywordSync } from '@/services/proposalKeywordSync';
import { extractTitleFromContent } from '@/utils/content/extractTitle';

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

      // Get proposal_id from strategy source or metadata
      const proposalId = state.strategySource?.proposal_id || (content.metadata as any)?.source_proposal_id || (content.metadata as any)?.proposal_id;

      // Extract title from content if not explicitly provided
      const extractedTitle = extractTitleFromContent(content.content);
      const finalTitle = extractedTitle || content.title || 'Untitled';

      // Enrich metadata with proposal data from strategySource and database
      let proposalMetadata: Record<string, any> = {};
      
      // Start with data from strategySource if available
      if (state.strategySource) {
        proposalMetadata = {
          priority_tag: state.strategySource.priority_tag,
          estimated_impressions: state.strategySource.estimated_impressions,
          meta_suggestions: state.strategySource.meta_suggestions
        };
      }

      // Fetch full proposal data if proposalId exists to preserve ALL proposal information
      if (proposalId) {
        try {
          const { data: fullProposal, error: proposalError } = await supabase
            .from('ai_strategy_proposals')
            .select('priority_tag, estimated_impressions, related_keywords, content_suggestions, serp_data, proposal_data, content_type, strategy_session_id')
            .eq('id', proposalId)
            .single();

          if (!proposalError && fullProposal) {
            // Merge all proposal data into metadata
            proposalMetadata = {
              ...proposalMetadata,
              priority_tag: fullProposal.priority_tag,
              estimated_impressions: fullProposal.estimated_impressions,
              related_keywords: fullProposal.related_keywords,
              content_suggestions: fullProposal.content_suggestions,
              serp_data: fullProposal.serp_data,
              proposal_data: fullProposal.proposal_data,
              proposal_content_type: fullProposal.content_type,
              strategy_session_id: fullProposal.strategy_session_id
            };
            console.log('[SaveContent] Enriched metadata with full proposal data:', proposalMetadata);
          }
        } catch (error) {
          console.error('[SaveContent] Error fetching proposal data for metadata enrichment:', error);
        }
      }

      // Prepare content data for database with FLAT metadata structure
      const contentData = {
        title: finalTitle,
        meta_title: content.metaTitle || finalTitle,
        meta_description: content.metaDescription,
        content: content.content,
        status: 'draft',
        seo_score: content.seoScore || 0,
        user_id: user.id,
        keywords: [content.mainKeyword, ...(content.secondaryKeywords || [])].filter(Boolean),
        metadata: {
          // CRITICAL: Flat structure for database trigger compatibility
          proposal_id: proposalId || null,
          source_proposal_id: proposalId || null,
          mainKeyword: content.mainKeyword,
          secondaryKeywords: content.secondaryKeywords || [],
          contentType: content.contentType,
          outline: JSON.stringify(content.outline || []),
          serpSelections: JSON.stringify(content.serpSelections || []),
          serpData: content.serpData ? JSON.stringify(content.serpData) : null,
          // Flatten proposal metadata to avoid nesting issues
          ...(proposalMetadata || {}),
          ...(content.metadata || {})
        }
      };

      // CRITICAL VALIDATION: Ensure proposal_id is set
      if (!contentData.metadata.proposal_id && proposalId) {
        console.error('[CRITICAL] proposal_id missing from metadata, adding manually');
        contentData.metadata.proposal_id = proposalId;
      }

      console.log('[SaveContent] Final metadata structure:', JSON.stringify(contentData.metadata, null, 2));

      // Save to database
      const { data, error } = await supabase
        .from('content_items')
        .insert(contentData)
        .select()
        .single();

      if (error) throw error;

      // Save keywords to unified library
      if (content.mainKeyword || (content.secondaryKeywords && content.secondaryKeywords.length > 0)) {
        const allKeywords = [content.mainKeyword, ...(content.secondaryKeywords || [])].filter(Boolean);
        
        for (const [index, keyword] of allKeywords.entries()) {
          try {
            // Save to unified keyword library
            const unifiedKeyword = await keywordLibraryService.upsertKeyword({
              keyword,
              source_type: 'content_draft',
              source_id: data.id
            });

            // Track keyword usage
            await keywordLibraryService.trackKeywordUsage(
              unifiedKeyword.id,
              data.id,
              'content_item',
              index === 0 ? 'primary' : 'secondary'
            );
          } catch (keywordError) {
            console.error(`Error saving keyword "${keyword}" to unified library:`, keywordError);
          }
        }
      }

      // Auto-sync proposal keywords if content originated from a proposal
      if (proposalId) {
        try {
          
          // Get proposal data to sync its keywords
          const { data: proposal } = await supabase
            .from('ai_strategy_proposals')
            .select('primary_keyword, related_keywords')
            .eq('id', proposalId)
            .single();

          if (proposal) {
            const proposalKeywords = [proposal.primary_keyword, ...(proposal.related_keywords || [])].filter(Boolean);
            
            for (const keyword of proposalKeywords) {
              try {
                await keywordLibraryService.upsertKeyword({
                  keyword,
                  source_type: 'strategy_proposal',
                  source_id: proposalId
                });
              } catch (error) {
                console.error(`Error syncing proposal keyword "${keyword}":`, error);
              }
            }
          }
        } catch (error) {
          console.error('Error syncing proposal keywords:', error);
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
      
      // Auto-track completion if content was created from a proposal
      if (proposalId) {
        console.log('Content created from proposal, will be auto-completed by database trigger');
      }
      
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

      // Get proposal_id from strategy source or metadata
      const proposalId = state.strategySource?.proposal_id || (content.metadata as any)?.source_proposal_id || (content.metadata as any)?.proposal_id;

      // Extract title from content if not explicitly provided
      const extractedTitle = extractTitleFromContent(content.content);
      const finalTitle = extractedTitle || content.title || 'Untitled';

      // Enrich metadata with proposal data from strategySource and database
      let proposalMetadata: Record<string, any> = {};
      
      // Start with data from strategySource if available
      if (state.strategySource) {
        proposalMetadata = {
          priority_tag: state.strategySource.priority_tag,
          estimated_impressions: state.strategySource.estimated_impressions,
          meta_suggestions: state.strategySource.meta_suggestions
        };
      }

      // Fetch full proposal data if proposalId exists to preserve ALL proposal information
      if (proposalId) {
        try {
          const { data: fullProposal, error: proposalError } = await supabase
            .from('ai_strategy_proposals')
            .select('priority_tag, estimated_impressions, related_keywords, content_suggestions, serp_data, proposal_data, content_type, strategy_session_id')
            .eq('id', proposalId)
            .single();

          if (!proposalError && fullProposal) {
            // Merge all proposal data into metadata
            proposalMetadata = {
              ...proposalMetadata,
              priority_tag: fullProposal.priority_tag,
              estimated_impressions: fullProposal.estimated_impressions,
              related_keywords: fullProposal.related_keywords,
              content_suggestions: fullProposal.content_suggestions,
              serp_data: fullProposal.serp_data,
              proposal_data: fullProposal.proposal_data,
              proposal_content_type: fullProposal.content_type,
              strategy_session_id: fullProposal.strategy_session_id
            };
            console.log('[PublishContent] Enriched metadata with full proposal data:', proposalMetadata);
          }
        } catch (error) {
          console.error('[PublishContent] Error fetching proposal data for metadata enrichment:', error);
        }
      }

      // Prepare content data for database with FLAT metadata structure
      const contentData = {
        title: finalTitle,
        meta_title: content.metaTitle || finalTitle,
        meta_description: content.metaDescription,
        content: content.content,
        status: 'published',
        seo_score: content.seoScore || 0,
        user_id: user.id,
        keywords: [content.mainKeyword, ...(content.secondaryKeywords || [])].filter(Boolean),
        metadata: {
          // CRITICAL: Flat structure for database trigger compatibility
          proposal_id: proposalId || null,
          source_proposal_id: proposalId || null,
          mainKeyword: content.mainKeyword,
          secondaryKeywords: content.secondaryKeywords || [],
          contentType: content.contentType,
          outline: JSON.stringify(content.outline || []),
          serpSelections: JSON.stringify(content.serpSelections || []),
          serpData: content.serpData ? JSON.stringify(content.serpData) : null,
          // Flatten proposal metadata to avoid nesting issues
          ...(proposalMetadata || {}),
          ...(content.metadata || {})
        }
      };

      // CRITICAL VALIDATION: Ensure proposal_id is set
      if (!contentData.metadata.proposal_id && proposalId) {
        console.error('[CRITICAL] proposal_id missing from metadata, adding manually');
        contentData.metadata.proposal_id = proposalId;
      }

      console.log('[PublishContent] Final metadata structure:', JSON.stringify(contentData.metadata, null, 2));

      // Save to database
      const { data, error } = await supabase
        .from('content_items')
        .insert(contentData)
        .select()
        .single();

      if (error) throw error;

      // Save keywords to unified library
      if (content.mainKeyword || (content.secondaryKeywords && content.secondaryKeywords.length > 0)) {
        const allKeywords = [content.mainKeyword, ...(content.secondaryKeywords || [])].filter(Boolean);
        
        for (const [index, keyword] of allKeywords.entries()) {
          try {
            // Save to unified keyword library
            const unifiedKeyword = await keywordLibraryService.upsertKeyword({
              keyword,
              source_type: 'content_published',
              source_id: data.id
            });

            // Track keyword usage
            await keywordLibraryService.trackKeywordUsage(
              unifiedKeyword.id,
              data.id,
              'content_item',
              index === 0 ? 'primary' : 'secondary'
            );
          } catch (keywordError) {
            console.error(`Error saving keyword "${keyword}" to unified library:`, keywordError);
          }
        }
      }

      // Auto-sync proposal keywords if content originated from a proposal
      if (proposalId) {
        try {
          
          // Get proposal data to sync its keywords
          const { data: proposal } = await supabase
            .from('ai_strategy_proposals')
            .select('primary_keyword, related_keywords')
            .eq('id', proposalId)
            .single();

          if (proposal) {
            const proposalKeywords = [proposal.primary_keyword, ...(proposal.related_keywords || [])].filter(Boolean);
            
            for (const keyword of proposalKeywords) {
              try {
                await keywordLibraryService.upsertKeyword({
                  keyword,
                  source_type: 'strategy_proposal',
                  source_id: proposalId
                });
              } catch (error) {
                console.error(`Error syncing proposal keyword "${keyword}":`, error);
              }
            }
          }
        } catch (error) {
          console.error('Error syncing proposal keywords:', error);
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
      
      // Auto-track completion if content was created from a proposal
      if (proposalId) {
        console.log('Content published from proposal, will be auto-completed by database trigger');
      }
      
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
