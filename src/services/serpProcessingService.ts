
import { SerpApiResponse } from './serpApiService';
import { SerpSelection, OutlineSection } from '@/contexts/content-builder/types';
import { v4 as uuid } from 'uuid';

/**
 * Service for processing SERP data and converting it to formats needed by the application
 */
export const serpProcessingService = {
  /**
   * Process raw SERP data into a format used by the application
   */
  processSerpData: (data: SerpApiResponse, keyword: string) => {
    // Create a processed result object with all the necessary fields
    return {
      keyword,
      keywords: data.keywords || [],
      questions: data.questions || [],
      competitors: data.competitors || [],
      snippets: data.snippets || [],
      isMockData: true,
    };
  },
  
  /**
   * Convert SERP selections to outline sections
   */
  convertSelectionsToOutline: (selections: SerpSelection[]): OutlineSection[] => {
    if (!selections || selections.length === 0) {
      return [];
    }
    
    return selections.map(selection => {
      const section: OutlineSection = {
        id: uuid(),
        title: selection.content,
        type: 'heading',
        level: 2, // A valid level from 1|2|3|4|5|6
        content: ''
      };
      
      if (selection.type === 'question') {
        section.type = 'heading';
        section.level = 3;
      } else if (selection.type === 'keyword') {
        section.type = 'heading';
        section.level = 2;
      }
      
      return section;
    });
  }
};
