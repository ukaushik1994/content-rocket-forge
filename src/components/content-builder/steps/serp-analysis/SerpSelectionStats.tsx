
import { SerpSelection } from '@/contexts/content-builder/types';

interface SerpSelectionStatsProps {
  serpSelections: SerpSelection;
}

export const SerpSelectionStats = ({ serpSelections }: SerpSelectionStatsProps) => {
  // Convert the selection object to an array of arrays and calculate counts
  const selectionCounts = Object.entries(serpSelections)
    .filter(([key]) => key !== 'filter') // Filter out non-array properties
    .map(([key, values]) => ({
      type: key,
      count: Array.isArray(values) ? values.length : 0
    }));
  
  // Calculate total count of all selections
  const totalCount = selectionCounts.reduce((sum, item) => sum + item.count, 0);
  
  return {
    selectedCounts: selectionCounts,
    totalSelected: totalCount
  };
};
