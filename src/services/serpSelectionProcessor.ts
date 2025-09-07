/**
 * Service for processing SERP data into selectable items
 */

import { SerpSelection } from '@/contexts/content-builder/types';

export interface ProcessedSerpData {
  selections: SerpSelection[];
  stats: {
    keywords: number;
    entities: number;
    questions: number;
    headings: number;
    contentGaps: number;
    total: number;
  };
}

/**
 * Process any SERP data format and extract selections
 */
export const processSerpDataToSelections = (data: any, source: string = 'processed'): ProcessedSerpData => {
  console.log('🔄 Processing SERP data to selections:', { data, source });
  
  const selections: SerpSelection[] = [];
  const stats = {
    keywords: 0,
    entities: 0,
    questions: 0,
    headings: 0,
    contentGaps: 0,
    total: 0
  };

  if (!data) {
    return { selections, stats };
  }

  try {
    // Process keywords
    const keywords = extractArray(data, ['keywords', 'related_keywords', 'relatedSearches']);
    keywords.forEach((item: any) => {
      const content = extractContent(item, ['keyword', 'query', 'title', 'text']);
      if (content) {
        selections.push({
          type: 'keyword',
          content,
          selected: false,
          source,
          metadata: typeof item === 'object' ? item : { keyword: content }
        });
        stats.keywords++;
      }
    });

    // Process entities
    const entities = extractArray(data, ['entities']);
    entities.forEach((item: any) => {
      const content = extractContent(item, ['name', 'title', 'text']);
      if (content) {
        selections.push({
          type: 'entity',
          content,
          selected: false,
          source,
          metadata: typeof item === 'object' ? item : { name: content }
        });
        stats.entities++;
      }
    });

    // Process questions
    const questions = extractArray(data, ['questions', 'peopleAlsoAsk', 'people_also_ask']);
    questions.forEach((item: any) => {
      const content = extractContent(item, ['question', 'title', 'text']);
      if (content) {
        selections.push({
          type: 'question',
          content,
          selected: false,
          source,
          metadata: typeof item === 'object' ? item : { question: content }
        });
        stats.questions++;
      }
    });

    // Process headings
    const headings = extractArray(data, ['headings', 'suggested_headings']);
    headings.forEach((item: any) => {
      const content = extractContent(item, ['text', 'title', 'heading']);
      if (content) {
        selections.push({
          type: 'heading',
          content,
          selected: false,
          source,
          metadata: typeof item === 'object' ? item : { text: content, level: 'h2' }
        });
        stats.headings++;
      }
    });

    // Process content gaps
    const contentGaps = extractArray(data, ['contentGaps', 'content_gaps', 'gaps']);
    contentGaps.forEach((item: any) => {
      const content = extractContent(item, ['topic', 'description', 'gap', 'title', 'text']);
      if (content) {
        selections.push({
          type: 'contentGap',
          content,
          selected: false,
          source,
          metadata: typeof item === 'object' ? item : { topic: content }
        });
        stats.contentGaps++;
      }
    });

    stats.total = selections.length;

    console.log('✅ Processed SERP data:', stats);
    return { selections, stats };

  } catch (error) {
    console.error('❌ Error processing SERP data:', error);
    return { selections, stats };
  }
};

/**
 * Extract arrays from various possible property names
 */
const extractArray = (data: any, possibleKeys: string[]): any[] => {
  for (const key of possibleKeys) {
    if (data[key] && Array.isArray(data[key])) {
      return data[key];
    }
  }
  return [];
};

/**
 * Extract content from various possible property names
 */
const extractContent = (item: any, possibleKeys: string[]): string | null => {
  if (typeof item === 'string') {
    return item.trim() || null;
  }

  if (typeof item === 'object' && item) {
    for (const key of possibleKeys) {
      if (item[key] && typeof item[key] === 'string') {
        const content = item[key].trim();
        if (content) return content;
      }
    }
  }

  // Fallback to string conversion
  const fallback = String(item || '').trim();
  return fallback || null;
};