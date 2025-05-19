
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';

export interface SelectedCountsType {
  [key: string]: number;
}

export interface SerpSelectionStatsProps {
  serpSelections: SerpSelection[];
}

export const SerpSelectionStats = ({ serpSelections = [] }: SerpSelectionStatsProps) => {
  // Count selected items by type
  const selectedCounts: SelectedCountsType = {};
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
