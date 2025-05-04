
import { createAddContentAction } from './addContentAction';
import { createUpdateContentAction } from './updateContentAction';
import { createDeleteContentAction } from './deleteContentAction';
import { createUtilityActions } from './utilityActions';
import { ContentItemType } from '../types';

// Standard toast configuration
export const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true },
  info: { duration: 4000, closeButton: true }
};

export const createContentActions = (
  contentItems: ContentItemType[],
  setContentItems: React.Dispatch<React.SetStateAction<ContentItemType[]>>,
  userId?: string
) => {
  // Create all action creators with shared state
  const addContentItem = createAddContentAction(contentItems, setContentItems, userId);
  const updateContentItem = createUpdateContentAction(contentItems, setContentItems, userId);
  const deleteContentItem = createDeleteContentAction(contentItems, setContentItems, userId);
  const { getContentItem, publishContent } = createUtilityActions(updateContentItem, contentItems);

  return {
    addContentItem,
    updateContentItem,
    deleteContentItem,
    getContentItem,
    publishContent
  };
};
