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
  isSaving?: boolean;
  setIsSaving?: (saving: boolean) => void;
}

export function StrategyContentSaver({ 
  proposal, 
  onSaveComplete,
  isSaving,
  setIsSaving
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
  
  // Auto-save when step loads
  useEffect(() => {
    const autoSave = async () => {
      const { content, mainKeyword, contentTitle } = state;
      
      // Only auto-save if we have all required data and haven't saved yet
      if (content && mainKeyword && contentTitle?.trim()) {
        console.log('[StrategyContentSaver] Auto-triggering save on mount');
        // Use setTimeout to ensure component is fully mounted
        setTimeout(() => {
          const saveButton = document.querySelector('[data-auto-save-trigger]') as HTMLButtonElement;
          if (saveButton) {
            saveButton.click();
          }
        }, 100);
      }
    };
    
    autoSave();
  }, []); // Only run once on mount
  
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
    // CRITICAL: Wrap entire function in error boundary
    try {
      if (setIsSaving) setIsSaving(true);
      
      // Validate contentId first
      if (!contentId || contentId.trim() === '') {
        throw new Error('Invalid contentId received');
      }
      
      console.log('[StrategyContentSaver] Starting save completion for ID:', contentId);
      
      setIsValidatingCompletion(true);
      
      // Reduced timeout for faster failure detection
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Validation timeout - operation took too long')), 3000)
      );
      
      const completionPromise = (async () => {
        if (proposal?.id) {
          // Verify content was saved - wrapped in try-catch
          let savedContent;
          try {
            const { data, error: fetchError } = await supabase
              .from('content_items')
              .select('metadata, id')
              .eq('id', contentId)
              .single();
            
            if (fetchError) throw fetchError;
            savedContent = data;
          } catch (verifyError) {
            console.error('[StrategyContentSaver] Failed to verify content:', verifyError);
            throw new Error('Content verification failed');
          }
          
          console.log('[StrategyContentSaver] Verified content metadata:', savedContent?.metadata);
          
          // Validate metadata structure
          const metadata = savedContent?.metadata as Record<string, any> | null;
          if (!metadata?.proposal_id && !metadata?.source_proposal_id) {
            console.error('[StrategyContentSaver] CRITICAL: Missing proposal_id in metadata!');
            // Attempt to fix by updating the record
            try {
              const { error: updateError } = await supabase
                .from('content_items')
                .update({ 
                  metadata: { 
                    ...(metadata || {}), 
                    proposal_id: proposal.id,
                    source_proposal_id: proposal.id 
                  } 
                })
                .eq('id', contentId);
              
              if (updateError) throw updateError;
              console.log('[StrategyContentSaver] Fixed missing proposal_id in metadata');
            } catch (fixError) {
              console.error('[StrategyContentSaver] Failed to fix metadata:', fixError);
              throw new Error('Metadata repair failed');
            }
          }
          
          // Reduced wait time for trigger
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Validate proposal completion
          const wasCompleted = await validateProposalCompletion(contentId);
          
          if (!wasCompleted) {
            console.warn('[StrategyContentSaver] Trigger did not complete proposal, attempting manual completion');
            await completeProposalManually(contentId);
          } else {
            console.log('[StrategyContentSaver] ✅ Proposal successfully completed');
            toast.success(`Content saved! Proposal "${proposal.title}" marked as completed.`);
          }
        }
      })();
      
      // Race with timeout
      await Promise.race([completionPromise, timeoutPromise]);
      
      // Success path
      console.log('[StrategyContentSaver] ✅ Save completed successfully');
      setIsValidatingCompletion(false);
      if (setIsSaving) setIsSaving(false);
      onSaveComplete();
      
    } catch (error) {
      // COMPREHENSIVE ERROR RECOVERY
      console.error('[StrategyContentSaver] ❌ Save completion error:', error);
      
      // Determine error type for user feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('timeout')) {
        toast.error('Validation timed out - content saved but proposal status unknown');
      } else if (errorMessage.includes('Invalid contentId')) {
        toast.error('Failed to save content - invalid ID generated');
      } else if (errorMessage.includes('Metadata')) {
        toast.error('Content saved but metadata validation failed');
      } else {
        toast.error('Save completed but validation failed - check proposal status manually');
      }
      
      // ALWAYS clear loading states and close modal to prevent hang
      setIsValidatingCompletion(false);
      if (setIsSaving) setIsSaving(false);
      
      // Close modal even on error - content is saved, just validation failed
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
          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-medium text-primary">
                Saving and validating proposal completion...
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              This may take a few seconds
            </p>
          </div>
        )}
      </div>
      
      <SaveStep onSaveComplete={handleSaveComplete} />
    </div>
  );
}