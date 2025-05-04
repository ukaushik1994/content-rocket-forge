
import { ContentItemType } from '../types';

type UpdateContentFunction = (id: string, updates: Partial<ContentItemType>) => Promise<void>;

export const createUtilityActions = (
  updateContentItem: UpdateContentFunction,
  contentItems: ContentItemType[]
) => {
  const getContentItem = (id: string) => {
    return contentItems.find(item => item.id === id);
  };

  const publishContent = async (id: string) => {
    return updateContentItem(id, { 
      status: 'published',
      updated_at: new Date().toISOString()
    });
  };

  return {
    getContentItem,
    publishContent
  };
};
