
import { SerpSelection } from '@/contexts/content-builder/types';

export interface SerpSelectionStatsResult {
  selectedCounts: {
    keyword: number;
    question: number;
    snippet: number;
    entity: number;
    heading: number;
    contentGap: number;
    topRank: number;
  };
  totalSelected: number;
}

export const SerpSelectionStats = ({ serpSelections }: { serpSelections: SerpSelection[] }): SerpSelectionStatsResult => {
  const selectedItems = serpSelections.filter(item => item.selected);
  
  const selectedCounts = {
    keyword: selectedItems.filter(item => item.type === 'keyword').length,
    question: selectedItems.filter(item => item.type === 'question').length,
    snippet: selectedItems.filter(item => item.type === 'snippet').length,
    entity: selectedItems.filter(item => item.type === 'entity').length,
    heading: selectedItems.filter(item => item.type === 'heading').length,
    contentGap: selectedItems.filter(item => item.type === 'contentGap').length,
    topRank: selectedItems.filter(item => item.type === 'topRank').length
  };
  
  const totalSelected = selectedItems.length;
  
  return {
    selectedCounts,
    totalSelected
  };
};
