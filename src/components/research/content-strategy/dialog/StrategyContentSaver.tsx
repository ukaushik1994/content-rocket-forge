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


  // Enhanced save completion handler - no delays, direct completion
  const handleSaveComplete = async (contentId: string) => {
    if (!proposal?.id || !contentId) {
      console.warn('Missing proposal ID or content ID, skipping completion');
      onSaveComplete();
      return;
    }

    try {
      toast.info('Marking proposal as completed...');
      
      // Call the edge function directly to mark proposal as completed
      const { data, error } = await supabase.functions.invoke('complete-proposal', {
        body: {
          proposal_id: proposal.id,
          content_id: contentId
        }
      });
      
      if (error) {
        console.error('Failed to complete proposal:', error);
        toast.error('Failed to mark proposal as completed. Content was saved successfully.');
      } else {
        console.log('Proposal completed successfully:', data);
        toast.success(`Content saved! Proposal "${proposal.title}" marked as completed.`);
      }
    } catch (error) {
      console.error('Error completing proposal:', error);
      toast.error('Failed to mark proposal as completed. Content was saved successfully.');
    } finally {
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
      </div>
      
      <SaveStep onSaveComplete={handleSaveComplete} />
    </div>
  );
}