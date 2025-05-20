
import { ContentItemType } from '@/contexts/content/types';

/**
 * Helper function to ensure returned content matches ContentItemType interface
 */
export const ensureContentItemFormat = (item: any): ContentItemType => {
  // Make sure we have all required fields, including keywords
  return {
    ...item,
    keywords: item.keywords || [],
  };
};
