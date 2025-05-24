
import { SerpSelection } from '@/contexts/content-builder/types';

export interface SerpUsageAnalysis {
  totalSelected: number;
  totalUsed: number;
  usagePercentage: number;
  byType: {
    questions: { selected: number; used: number; percentage: number };
    headings: { selected: number; used: number; percentage: number };
    entities: { selected: number; used: number; percentage: number };
    featuredSnippets: { selected: number; used: number; percentage: number };
    relatedSearches: { selected: number; used: number; percentage: number };
  };
  unusedItems: SerpSelection[];
  suggestions: string[];
}

export const analyzeSerpUsage = (
  content: string,
  serpSelections: SerpSelection[]
): SerpUsageAnalysis => {
  if (!content || !serpSelections || serpSelections.length === 0) {
    return {
      totalSelected: 0,
      totalUsed: 0,
      usagePercentage: 0,
      byType: {
        questions: { selected: 0, used: 0, percentage: 0 },
        headings: { selected: 0, used: 0, percentage: 0 },
        entities: { selected: 0, used: 0, percentage: 0 },
        featuredSnippets: { selected: 0, used: 0, percentage: 0 },
        relatedSearches: { selected: 0, used: 0, percentage: 0 }
      },
      unusedItems: [],
      suggestions: []
    };
  }

  const selectedItems = serpSelections.filter(item => item.selected);
  const contentLower = content.toLowerCase();
  
  // Track usage by type
  const typeAnalysis = {
    questions: { selected: 0, used: 0, items: [] as SerpSelection[] },
    headings: { selected: 0, used: 0, items: [] as SerpSelection[] },
    entities: { selected: 0, used: 0, items: [] as SerpSelection[] },
    featuredSnippets: { selected: 0, used: 0, items: [] as SerpSelection[] },
    relatedSearches: { selected: 0, used: 0, items: [] as SerpSelection[] }
  };

  const unusedItems: SerpSelection[] = [];
  let totalUsed = 0;

  selectedItems.forEach(item => {
    const itemType = getSerpItemType(item.type);
    typeAnalysis[itemType].selected++;
    typeAnalysis[itemType].items.push(item);

    // Check if the item content is used in the content
    const isUsed = checkItemUsage(item.content, contentLower);
    
    if (isUsed) {
      typeAnalysis[itemType].used++;
      totalUsed++;
    } else {
      unusedItems.push(item);
    }
  });

  // Calculate percentages
  const usagePercentage = selectedItems.length > 0 ? Math.round((totalUsed / selectedItems.length) * 100) : 0;

  const byType = {
    questions: {
      selected: typeAnalysis.questions.selected,
      used: typeAnalysis.questions.used,
      percentage: typeAnalysis.questions.selected > 0 ? 
        Math.round((typeAnalysis.questions.used / typeAnalysis.questions.selected) * 100) : 0
    },
    headings: {
      selected: typeAnalysis.headings.selected,
      used: typeAnalysis.headings.used,
      percentage: typeAnalysis.headings.selected > 0 ? 
        Math.round((typeAnalysis.headings.used / typeAnalysis.headings.selected) * 100) : 0
    },
    entities: {
      selected: typeAnalysis.entities.selected,
      used: typeAnalysis.entities.used,
      percentage: typeAnalysis.entities.selected > 0 ? 
        Math.round((typeAnalysis.entities.used / typeAnalysis.entities.selected) * 100) : 0
    },
    featuredSnippets: {
      selected: typeAnalysis.featuredSnippets.selected,
      used: typeAnalysis.featuredSnippets.used,
      percentage: typeAnalysis.featuredSnippets.selected > 0 ? 
        Math.round((typeAnalysis.featuredSnippets.used / typeAnalysis.featuredSnippets.selected) * 100) : 0
    },
    relatedSearches: {
      selected: typeAnalysis.relatedSearches.selected,
      used: typeAnalysis.relatedSearches.used,
      percentage: typeAnalysis.relatedSearches.selected > 0 ? 
        Math.round((typeAnalysis.relatedSearches.used / typeAnalysis.relatedSearches.selected) * 100) : 0
    }
  };

  // Generate suggestions
  const suggestions = generateSerpSuggestions(unusedItems, byType);

  return {
    totalSelected: selectedItems.length,
    totalUsed,
    usagePercentage,
    byType,
    unusedItems,
    suggestions
  };
};

const getSerpItemType = (type: string): keyof SerpUsageAnalysis['byType'] => {
  if (type.includes('question')) return 'questions';
  if (type.includes('heading')) return 'headings';
  if (type.includes('entity')) return 'entities';
  if (type.includes('snippet')) return 'featuredSnippets';
  if (type.includes('search')) return 'relatedSearches';
  return 'entities'; // default fallback
};

const checkItemUsage = (itemContent: string, contentLower: string): boolean => {
  if (!itemContent || !contentLower) return false;
  
  // Clean and normalize the item content
  const cleanItem = itemContent.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Check for exact phrase match
  if (contentLower.includes(cleanItem)) {
    return true;
  }
  
  // Check for partial matches (for longer items)
  if (cleanItem.length > 20) {
    const words = cleanItem.split(' ');
    const significantWords = words.filter(word => word.length > 3);
    
    if (significantWords.length >= 3) {
      const matchedWords = significantWords.filter(word => contentLower.includes(word));
      return matchedWords.length >= Math.ceil(significantWords.length * 0.6);
    }
  }
  
  return false;
};

const generateSerpSuggestions = (
  unusedItems: SerpSelection[],
  byType: SerpUsageAnalysis['byType']
): string[] => {
  const suggestions: string[] = [];
  
  if (unusedItems.length > 0) {
    suggestions.push(`${unusedItems.length} selected SERP items are not integrated into your content`);
  }
  
  if (byType.questions.selected > 0 && byType.questions.percentage < 50) {
    suggestions.push('Consider adding FAQ sections to address selected questions');
  }
  
  if (byType.headings.selected > 0 && byType.headings.percentage < 70) {
    suggestions.push('Use selected headings to improve content structure');
  }
  
  if (byType.entities.selected > 0 && byType.entities.percentage < 60) {
    suggestions.push('Incorporate more selected entities and concepts into your content');
  }
  
  if (byType.featuredSnippets.selected > 0 && byType.featuredSnippets.percentage < 80) {
    suggestions.push('Optimize content to match selected featured snippet formats');
  }
  
  return suggestions;
};
