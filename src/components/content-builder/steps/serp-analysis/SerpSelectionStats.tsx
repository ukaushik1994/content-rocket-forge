
import { SerpSelection } from '@/contexts/content-builder/types';
import { SelectedCountsType } from './types';

interface SerpSelectionStatsResult {
  selectedCounts: SelectedCountsType;
  totalSelected: number;
}

export const SerpSelectionStats = ({ serpSelections }: { serpSelections: SerpSelection[] }): SerpSelectionStatsResult => {
  const selectedItems = serpSelections.filter(item => item.selected);
  const totalSelected = selectedItems.length;

  const selectedCounts: SelectedCountsType = {
    keyword: selectedItems.filter(item => item.type === 'keyword').length,
    question: selectedItems.filter(item => item.type === 'question').length,
    snippet: selectedItems.filter(item => item.type === 'snippet').length,
    competitor: selectedItems.filter(item => item.type === 'competitor').length,
    entity: selectedItems.filter(item => item.type === 'entity').length,
    heading: selectedItems.filter(item => item.type === 'heading').length,
    contentGap: selectedItems.filter(item => item.type === 'contentGap').length,
    topRank: selectedItems.filter(item => item.type === 'topRank').length,
  };

  return {
    selectedCounts,
    totalSelected
  };
};
