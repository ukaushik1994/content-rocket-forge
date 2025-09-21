import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const completeProposalNow = async () => {
  try {
    console.log('Calling complete-proposal function...');
    
    const { data, error } = await supabase.functions.invoke('complete-proposal', {
      body: {
        proposal_id: 'ac0f0728-8c30-460a-9900-ccc7fcff1861',
        content_id: 'c8c7f609-956d-43f6-9c4b-57ce30d28f3c'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      toast.error('Failed to complete proposal: ' + error.message);
      return false;
    }

    console.log('Edge function response:', data);
    toast.success('Proposal marked as completed successfully!');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Unexpected error completing proposal');
    return false;
  }
};

// Make it available globally for testing
(window as any).completeProposalNow = completeProposalNow;

console.log('Complete proposal function loaded. Run: completeProposalNow() to test');