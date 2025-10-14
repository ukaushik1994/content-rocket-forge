import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SaveStep } from '@/components/content-builder/steps/save/SaveStep';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    setMetaDescription, 
    setStrategySource,
    saveContentToDraft, 
    saveContentToPublished 
  } = useContentBuilder();
  
  const [isValidatingCompletion, setIsValidatingCompletion] = useState(false);
  
  // Update meta description and strategy source when component mounts
  useEffect(() => {
    const primaryKeyword = proposal?.primary_keyword || '';
    const description = state.selectedSolution 
      ? `Learn about ${primaryKeyword} and discover how ${state.selectedSolution.name} can help.`
      : `A comprehensive guide about ${primaryKeyword}`;
    
    setMetaDescription(description);
    
    // Set the strategy source information
    if (proposal?.id) {
      setStrategySource({
        proposal_id: proposal.id,
        priority_tag: proposal.priority_tag || 'evergreen',
        estimated_impressions: proposal.estimated_impressions || 0,
        meta_suggestions: {
          title: proposal.title || '',
          description: description
        }
      });
    }
  }, [proposal, state.selectedSolution, setMetaDescription, setStrategySource]);

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

  // Enhanced save completion handler
  const handleSaveComplete = async (contentId: string) => {
    if (proposal?.id) {
      // Wait a moment for the trigger to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate that the proposal was marked as completed
      const wasCompleted = await validateProposalCompletion(contentId);
      
      if (!wasCompleted) {
        console.warn('Proposal was not automatically completed, attempting manual completion');
        toast.info('Ensuring proposal completion...');
        await completeProposalManually(contentId);
      } else {
        toast.success(`Content saved! Proposal "${proposal.title}" marked as completed.`);
      }
    }
    
    onSaveComplete();
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