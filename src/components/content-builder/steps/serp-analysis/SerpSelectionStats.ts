
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { SelectedCountsType } from './types';

export interface SerpSelectionStatsProps {
  serpSelections: SerpSelection[];
}

export interface SerpSelectionStatsResult {
  selectedCounts: SelectedCountsType;
  totalSelected: number;
}

export const SerpSelectionStats = ({ serpSelections = [] }: SerpSelectionStatsProps): SerpSelectionStatsResult => {
  // Count selected items by type
  const selectedCounts: SelectedCountsType = {
    keyword: 0,
    question: 0,
    snippet: 0,
    competitor: 0,
    entity: 0,
    heading: 0,
    contentGap: 0,
    topRank: 0
  };
  
  let totalSelected = 0;
  
  serpSelections.forEach(item => {
    if (item.selected) {
      selectedCounts[item.type] = (selectedCounts[item.type] || 0) + 1;
      totalSelected++;
    }
  });
  
  return { selectedCounts, totalSelected };
};

export default SerpSelectionStats;
