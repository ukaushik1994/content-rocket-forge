
import { SerpSelection } from '@/contexts/content-builder/types';

interface SerpSelectionStatsResult {
  totalSelected: number;
  selectedCounts: {
    keyword: number;
    question: number;
    snippet: number;
    competitor: number;
  };
}

export const SerpSelectionStats = ({ 
  serpSelections 
}: { 
  serpSelections: SerpSelection[] 
}): SerpSelectionStatsResult => {
  // Count selected items by type
  const selectedItems = serpSelections.filter(item => item.selected);
  
  const keywordCount = selectedItems.filter(item => item.type === 'keyword').length;
  const questionCount = selectedItems.filter(item => item.type === 'question').length;
  const snippetCount = selectedItems.filter(item => item.type === 'snippet').length;
  const competitorCount = selectedItems.filter(item => item.type === 'competitor').length;
  
  return {
    totalSelected: selectedItems.length,
    selectedCounts: {
      keyword: keywordCount,
      question: questionCount,
      snippet: snippetCount,
      competitor: competitorCount
    }
  };
};
