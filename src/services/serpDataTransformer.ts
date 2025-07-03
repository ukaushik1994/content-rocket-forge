import { SerpAnalysisResult } from '@/types/serp';
import { EnhancedSerpResult } from './enhancedSerpService';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';

/**
 * Unified SERP data transformer that normalizes all SERP data sources
 * into a consistent format for use throughout the application
 */

export interface NormalizedSerpData {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  competitionScore: number;
  isMockData: boolean;
  dataQuality: string;
  
  // Normalized sections for selection
  sections: {
    keywords: SerpSelection[];
    questions: SerpSelection[];
    entities: SerpSelection[];
    headings: SerpSelection[];
    contentGaps: SerpSelection[];
    topStories: SerpSelection[];
    snippets: SerpSelection[];
    topResults: SerpSelection[];
  };
  
  // Original data for compatibility
  originalData: SerpAnalysisResult | EnhancedSerpResult;
}

/**
 * Transform Enhanced SERP result to normalized format
 */
export function transformEnhancedSerpData(data: EnhancedSerpResult): NormalizedSerpData {
  console.log('🔄 Transforming Enhanced SERP data:', data);

  return {
    keyword: data.keyword,
    searchVolume: data.searchVolume || 0,
    keywordDifficulty: data.keywordDifficulty || 0,
    competitionScore: data.competitionScore || 0,
    isMockData: data.isMockData || false,
    dataQuality: data.dataQuality || 'medium',
    
    sections: {
      keywords: (data.keywords || []).map(keyword => ({
        type: 'keyword',
        content: keyword,
        selected: false,
        source: 'enhanced_serp',
        metadata: { keyword }
      })),
      
      questions: (data.questions || []).map(q => ({
        type: 'question',
        content: q.question,
        selected: false,
        source: 'enhanced_serp',
        metadata: q
      })),
      
      entities: (data.entities || []).map(entity => ({
        type: 'entity',
        content: entity.name,
        selected: false,
        source: 'enhanced_serp',
        metadata: entity
      })),
      
      headings: (data.headings || []).map(heading => ({
        type: 'heading',
        content: heading.text,
        selected: false,
        source: 'enhanced_serp',
        metadata: heading
      })),
      
      contentGaps: (data.contentGaps || []).map(gap => ({
        type: 'contentGap',
        content: gap.topic,
        selected: false,
        source: 'enhanced_serp',
        metadata: gap
      })),
      
      topStories: (data.topStories || []).map(story => ({
        type: 'topStory',
        content: story.title,
        selected: false,
        source: 'enhanced_serp',
        metadata: story
      })),
      
      snippets: (data.featuredSnippets || []).map(snippet => ({
        type: 'snippet',
        content: snippet.title,
        selected: false,
        source: 'enhanced_serp',
        metadata: snippet
      })),
      
      topResults: (data.serp_blocks?.organic || []).slice(0, 10).map((result, index) => ({
        type: 'topResult',
        content: result.title,
        selected: false,
        source: 'enhanced_serp',
        metadata: { ...result, position: index + 1 }
      }))
    },
    
    originalData: data
  };
}

/**
 * Transform Legacy SERP result to normalized format
 */
export function transformLegacySerpData(data: SerpAnalysisResult): NormalizedSerpData {
  console.log('🔄 Transforming Legacy SERP data:', data);

  return {
    keyword: data.keyword,
    searchVolume: data.searchVolume || 0,
    keywordDifficulty: data.keywordDifficulty || 0,
    competitionScore: data.competitionScore || 0,
    isMockData: data.isMockData || false,
    dataQuality: data.dataQuality || 'medium',
    
    sections: {
      keywords: (data.keywords || []).map(keyword => ({
        type: 'keyword',
        content: keyword,
        selected: false,
        source: 'legacy_serp',
        metadata: { keyword }
      })),
      
      questions: (data.peopleAlsoAsk || []).map(q => ({
        type: 'question',
        content: q.question,
        selected: false,
        source: 'legacy_serp',
        metadata: q
      })),
      
      entities: (data.entities || []).map(entity => ({
        type: 'entity',
        content: entity.name,
        selected: false,
        source: 'legacy_serp',
        metadata: entity
      })),
      
      headings: (data.headings || []).map(heading => ({
        type: 'heading',
        content: heading.text,
        selected: false,
        source: 'legacy_serp',
        metadata: heading
      })),
      
      contentGaps: (data.contentGaps || []).map(gap => ({
        type: 'contentGap',
        content: gap.topic,
        selected: false,
        source: 'legacy_serp',
        metadata: gap
      })),
      
      topStories: [], // Legacy format doesn't have top stories
      
      snippets: (data.featuredSnippets || []).map(snippet => ({
        type: 'snippet',
        content: snippet.title,
        selected: false,
        source: 'legacy_serp',
        metadata: snippet
      })),
      
      topResults: (data.topResults || []).map(result => ({
        type: 'topResult',
        content: result.title,
        selected: false,
        source: 'legacy_serp',
        metadata: result
      }))
    },
    
    originalData: data
  };
}

/**
 * Auto-detect and transform any SERP data to normalized format
 */
export function transformSerpData(data: SerpAnalysisResult | EnhancedSerpResult): NormalizedSerpData {
  console.log('🔍 Auto-detecting SERP data type for transformation');
  
  // Check if it's enhanced SERP data by looking for unique properties
  if ('serp_blocks' in data || 'metrics' in data || 'data_sources' in data) {
    console.log('✅ Detected Enhanced SERP data');
    return transformEnhancedSerpData(data as EnhancedSerpResult);
  } else {
    console.log('✅ Detected Legacy SERP data');
    return transformLegacySerpData(data as SerpAnalysisResult);
  }
}

/**
 * Extract all selections from normalized data for context
 */
export function extractAllSelections(normalizedData: NormalizedSerpData): SerpSelection[] {
  const allSelections: SerpSelection[] = [];
  
  // Combine all sections into a single array
  Object.values(normalizedData.sections).forEach(sectionItems => {
    allSelections.push(...sectionItems);
  });
  
  console.log(`📊 Extracted ${allSelections.length} total items for selection`);
  return allSelections;
}

/**
 * Get selection counts by type
 */
export function getSelectionStats(selections: SerpSelection[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  selections.forEach(selection => {
    if (selection.selected) {
      stats[selection.type] = (stats[selection.type] || 0) + 1;
    }
  });
  
  return stats;
}