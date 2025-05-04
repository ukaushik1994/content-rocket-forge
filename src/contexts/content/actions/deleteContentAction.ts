
import { supabase } from '@/integrations/supabase/client';
import { ContentItemType } from '../types';
import { toast } from 'sonner';
import { toastConfig } from './index';

export const createDeleteContentAction = (
  contentItems: ContentItemType[],
  setContentItems: React.Dispatch<React.SetStateAction<ContentItemType[]>>,
  userId?: string
) => {
  return async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to delete content', toastConfig.error);
      return;
    }

    try {
      // First delete associated keyword relationships
      const { error: relationsError } = await supabase
        .from('content_keywords')
        .delete()
        .eq('content_id', id);
        
      if (relationsError) throw relationsError;
      
      // Then delete the content item
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      toast.success('Content deleted successfully', toastConfig.success);
      
      // Update local state
      setContentItems(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting content item:', error);
      toast.error(error.message || 'Error deleting content', toastConfig.error);
      
      // Fallback for development: Delete from memory if database fails
      if (process.env.NODE_ENV === 'development') {
        setContentItems(prev => prev.filter(item => item.id !== id));
        toast.info('Deleted content from memory (development mode)', toastConfig.info);
      }
    }
  };
};
