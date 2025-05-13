
/**
 * Service for processing SERP data into usable format
 */
import { SerpApiResponse } from './serpApiService';

export const serpProcessingService = {
  /**
   * Process raw SERP data into a standardized format for the application
   */
  processSerpData: (data: SerpApiResponse, mainKeyword: string) => {
    // Process and transform the data as needed
    return {
      ...data,
      mainKeyword,
      processed: true,
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Convert SERP selections to outline sections
   */
  convertSelectionsToOutline: (selections: any[]) => {
    // Map selections to outline sections
    return selections
      .filter(item => item.selected)
      .map(item => ({
        id: `outline-${Math.random().toString(36).substr(2, 9)}`,
        title: typeof item.content === 'string' ? 
          item.content.substring(0, 60) + (item.content.length > 60 ? '...' : '') : 
          'New Section',
        content: '',
        type: 'heading',
        level: 1,
        metadata: {
          source: 'serp',
          type: item.type
        }
      }));
  }
};
