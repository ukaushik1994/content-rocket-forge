
import { ContentItemType } from '../types';
import { supabase } from '@/integrations/supabase/client';

type UpdateContentFunction = (id: string, updates: Partial<ContentItemType>) => Promise<void>;

export const createUtilityActions = (
  updateContentItem: UpdateContentFunction,
  contentItems: ContentItemType[]
) => {
  const getContentItem = (id: string) => {
    return contentItems.find(item => item.id === id);
  };

  const publishContent = async (id: string) => {
    await updateContentItem(id, { 
      status: 'published',
      updated_at: new Date().toISOString()
    });

    // Track publish signal (non-blocking)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('content_performance_signals').insert({
          content_id: id,
          user_id: user.id,
          signal_type: 'publish',
          metadata: { source: 'publish_action' }
        }).then(() => {});
      }
    });
  };

  return {
    getContentItem,
    publishContent
  };
};
