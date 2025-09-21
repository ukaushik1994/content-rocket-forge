import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Manually recover existing content by linking it to proposals and marking them as completed
 */
export const recoverExistingProposals = async () => {
  try {
    console.log('Starting manual proposal recovery...');

    // Update existing "Workforce Retention" content to include proposal_id
    const contentId = 'c8c7f609-956d-43f6-9c4b-57ce30d28f3c';
    const proposalId = '044b28dc-dd8d-4f22-bd43-fb0b66b159c9';

    // Get current content metadata
    const { data: content, error: contentError } = await supabase
      .from('content_items')
      .select('metadata')
      .eq('id', contentId)
      .single();

    if (contentError) {
      console.error('Error fetching content:', contentError);
      return;
    }

    // Update content metadata to include proposal_id
    const currentMetadata = (content.metadata as Record<string, any>) || {};
    const updatedMetadata = {
      ...currentMetadata,
      proposal_id: proposalId
    };

    const { error: updateError } = await supabase
      .from('content_items')
      .update({ metadata: updatedMetadata })
      .eq('id', contentId);

    if (updateError) {
      console.error('Error updating content metadata:', updateError);
      return;
    }

    console.log('Successfully updated content metadata with proposal_id');

    // Use the complete-proposal edge function to mark proposal as completed
    const { data, error: functionError } = await supabase.functions.invoke('complete-proposal', {
      body: {
        proposal_id: proposalId,
        content_id: contentId
      }
    });

    if (functionError) {
      console.error('Error calling complete-proposal function:', functionError);
      toast.error('Failed to complete proposal recovery');
      return;
    }

    console.log('Successfully completed proposal via edge function:', data);
    toast.success('Workforce Retention proposal marked as completed');
    
    return { success: true, proposalId, contentId };
  } catch (error) {
    console.error('Error in manual proposal recovery:', error);
    toast.error('Failed to recover existing proposals');
    return { success: false, error };
  }
};