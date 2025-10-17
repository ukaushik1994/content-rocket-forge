import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SaveStep } from '@/components/content-builder/steps/save/SaveStep';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { calculateKeywordUsage, calculateKeywordUsageScore } from '@/utils/seo/keywordAnalysis';
import { calculateContentLengthScore, calculateReadabilityScore, generateRecommendations } from '@/utils/seo/contentAnalysis';
import { getImprovementType } from '@/utils/seo/contentRewriter';
import { determineImpact } from '@/hooks/seo-analysis/utils';
import { analyzeEnhancedSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { v4 as uuidv4 } from 'uuid';

interface StrategyContentSaverProps {
  proposal: any;
  onSaveComplete: () => void;
}

export function StrategyContentSaver({ 
  proposal, 
  onSaveComplete
}: StrategyContentSaverProps) {
  const { 
    state, 
    dispatch,
    setMetaDescription,
    saveContentToDraft, 
    saveContentToPublished 
  } = useContentBuilder();
  
  const [isValidatingCompletion, setIsValidatingCompletion] = useState(false);
  const [hasEnrichedData, setHasEnrichedData] = useState(false);
  
  // Validate that all critical data is present before save
  useEffect(() => {
    if (!proposal) return;
    
    console.log('[StrategyContentSaver] Validating state before save:', {
      hasContent: !!state.content,
      hasTitle: !!state.contentTitle,
      hasMainKeyword: !!state.mainKeyword,
      hasSelectedSolution: !!state.selectedSolution,
      hasSerpData: !!state.serpData,
      hasOutline: state.outline.length > 0,
      hasStrategySource: !!state.strategySource,
      strategySourceProposalId: state.strategySource?.proposal_id,
      metaTitle: state.metaTitle,
      metaDescription: state.metaDescription
    });
    
    // Meta description is now handled by StrategyContextInitializer - removed duplicate logic
    
    // Enrich state with SEO data before saving (complete frontend solution)
    if (state.content && !state.documentStructure && !hasEnrichedData) {
      const docStructure = extractDocumentStructure(state.content);
      dispatch({ type: 'SET_DOCUMENT_STRUCTURE', payload: docStructure });
      
      // Calculate basic SEO score: 70 base + keyword presence bonus
      const hasKeyword = state.mainKeyword && state.content.toLowerCase().includes(state.mainKeyword.toLowerCase());
      const basicScore = hasKeyword ? 75 : 65;
      dispatch({ type: 'SET_SEO_SCORE', payload: basicScore });
      
      console.log('[StrategyContentSaver] Enriched state with SEO data:', {
        documentStructure: docStructure,
        seoScore: basicScore
      });
      
      setHasEnrichedData(true); // Mark as enriched to prevent recalculation
    }
    
    // Generate SEO improvements for repository display
    if (state.content && state.mainKeyword && state.seoImprovements.length === 0) {
      const usage = calculateKeywordUsage(state.content, state.mainKeyword, state.selectedKeywords);
      const keywordUsageScore = calculateKeywordUsageScore(usage, state.mainKeyword);
      const contentLengthScore = calculateContentLengthScore(state.content);
      const readabilityScore = calculateReadabilityScore(state.content);
      
      const recommendations = generateRecommendations(
        state.content,
        keywordUsageScore,
        contentLengthScore,
        readabilityScore,
        usage,
        state.mainKeyword
      );
      
      const seoImprovements = recommendations.map(recommendation => {
        const improvementType = getImprovementType(recommendation);
        return {
          id: uuidv4(),
          type: improvementType,
          recommendation,
          impact: determineImpact(improvementType, keywordUsageScore),
          applied: false
        };
      });
      
      dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: seoImprovements });
      
      console.log('[StrategyContentSaver] Generated SEO improvements:', seoImprovements.length);
    }
    
    // Calculate solution integration metrics
    if (state.content && state.selectedSolution && !state.solutionIntegrationMetrics) {
      const solutionMetrics = analyzeEnhancedSolutionIntegration(
        state.content, 
        state.selectedSolution
      );
      
      const normalizedMetrics = {
        ...solutionMetrics,
        featureIncorporation: Number(solutionMetrics.featureIncorporation || 0),
        positioningScore: Number(solutionMetrics.positioningScore || 0),
        overallScore: Number(solutionMetrics.overallScore || 0),
        naturalIntegration: Number(solutionMetrics.naturalIntegration || 0)
      };
      
      dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: normalizedMetrics });
      
      console.log('[StrategyContentSaver] Calculated solution integration metrics:', normalizedMetrics);
    }
    
    // Warn if critical data is missing
    if (!state.content || state.content.length < 100) {
      console.warn('[StrategyContentSaver] Content appears to be missing or too short');
    }
    if (!state.selectedSolution) {
      console.warn('[StrategyContentSaver] No solution selected - content may lack integration context');
    }
    if (!state.strategySource) {
      console.error('[StrategyContentSaver] CRITICAL: Strategy source not set - proposal completion will fail!');
    }
  }, [proposal, state, setMetaDescription, dispatch]);

  // Validation function to check if proposal was completed
  const validateProposalCompletion = async (contentId: string): Promise<boolean> => {
    if (!proposal?.id) return false;
    
    try {
      setIsValidatingCompletion(true);
      
      // Check if proposal status was updated to completed
      const { data: proposalData, error } = await supabase
        .from('ai_strategy_proposals')
        .select('status, completed_at')
        .eq('id', proposal.id)
        .single();
      
      if (error) {
        console.error('Error checking proposal status:', error);
        return false;
      }
      
      return proposalData?.status === 'completed';
    } catch (error) {
      console.error('Error validating proposal completion:', error);
      return false;
    } finally {
      setIsValidatingCompletion(false);
    }
  };

  // Recovery function to manually complete proposal if trigger failed
  const completeProposalManually = async (contentId: string) => {
    if (!proposal?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('complete-proposal', {
        body: {
          proposal_id: proposal.id,
          content_id: contentId
        }
      });
      
      if (error) {
        console.error('Failed to manually complete proposal:', error);
        toast.error('Failed to mark proposal as completed');
        return;
      }
      
      console.log('Proposal completed manually:', data);
      toast.success('Proposal marked as completed successfully');
    } catch (error) {
      console.error('Error in manual proposal completion:', error);
      toast.error('Failed to mark proposal as completed');
    }
  };

  // Enhanced save completion handler with data validation and timeout protection
  const handleSaveComplete = async (contentId: string) => {
    // Validate contentId first to prevent hanging
    if (!contentId || contentId.trim() === '') {
      console.error('[StrategyContentSaver] Invalid contentId received:', contentId);
      toast.error('Failed to retrieve saved content ID');
      onSaveComplete(); // Still call completion to prevent hang
      return;
    }
    
    console.log('[StrategyContentSaver] Content saved with ID:', contentId);
    console.log('[StrategyContentSaver] Proposal ID:', proposal?.id);
    console.log('[StrategyContentSaver] Strategy source in state:', state.strategySource);
    
    // Wrap everything in timeout protection to prevent indefinite hanging
    const timeoutPromise = new Promise<void>((_, reject) => 
      setTimeout(() => reject(new Error('Save completion timeout')), 5000)
    );
    
    const completionPromise = (async () => {
      if (proposal?.id) {
      // Verify the content was saved with the correct metadata
      const { data: savedContent, error: fetchError } = await supabase
        .from('content_items')
        .select('metadata')
        .eq('id', contentId)
        .single();
      
      if (fetchError) {
        console.error('[StrategyContentSaver] Failed to verify saved content:', fetchError);
      } else {
        console.log('[StrategyContentSaver] Saved content metadata:', savedContent?.metadata);
        
        // Check if source_proposal_id is in metadata (required for trigger)
        const metadata = savedContent?.metadata as Record<string, any> | null;
        const hasProposalId = metadata?.source_proposal_id || metadata?.proposal_id;
        if (!hasProposalId) {
          console.error('[StrategyContentSaver] CRITICAL: Content saved without proposal_id in metadata!');
          console.error('[StrategyContentSaver] This will prevent the completion trigger from working');
        }
      }
      
      // Wait briefly for the trigger to process (reduced from 1500ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Validate that the proposal was marked as completed
      const wasCompleted = await validateProposalCompletion(contentId);
      
      if (!wasCompleted) {
        console.warn('[StrategyContentSaver] Trigger failed, attempting manual completion');
        
        // Double-check before manual completion to avoid duplicates
        await new Promise(resolve => setTimeout(resolve, 500));
        const finalCheck = await validateProposalCompletion(contentId);
        
        if (!finalCheck) {
          toast.info('Ensuring proposal completion...');
          await completeProposalManually(contentId);
        }
      } else {
        console.log('[StrategyContentSaver] Proposal successfully marked as completed');
        toast.success(`Content saved! Proposal "${proposal.title}" marked as completed.`);
      }
      }
    })();
    
    try {
      await Promise.race([completionPromise, timeoutPromise]);
    } catch (error) {
      console.error('[StrategyContentSaver] Save completion error:', error);
      toast.error('Save completed but validation timed out - check proposal status manually');
    } finally {
      // Always close modal, even if validation fails or times out
      onSaveComplete();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Save Your Content</h3>
        <p className="text-muted-foreground">
          Your strategy content for "{proposal?.primary_keyword}" is ready to save
        </p>
        {isValidatingCompletion && (
          <p className="text-sm text-primary mt-2">
            Validating proposal completion...
          </p>
        )}
      </div>
      
      <SaveStep onSaveComplete={handleSaveComplete} />
    </div>
  );
}