
import { SerpSelection } from '@/contexts/content-builder/types';
import { SelectedCountsType } from './types';

export const SerpSelectionStats = ({ serpSelections }: { serpSelections: SerpSelection[] }) => {
  // Initialize counts
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
  
  // Count selected items by type
  serpSelections.forEach(item => {
    if (item.selected) {
      // Map the actual types used in the SERP components to our counter structure
      switch (item.type) {
        case 'keyword':
        case 'relatedSearch':
          selectedCounts.keyword++;
          break;
        case 'question':
        case 'peopleAlsoAsk':
          selectedCounts.question++;
          break;
        case 'snippet':
        case 'featuredSnippet':
          selectedCounts.snippet++;
          break;
        case 'competitor':
          selectedCounts.competitor++;
          break;
        case 'entity':
          selectedCounts.entity++;
          break;
        case 'heading':
          selectedCounts.heading++;
          break;
        case 'contentGap':
          selectedCounts.contentGap++;
          break;
        case 'topRank':
          selectedCounts.topRank++;
          break;
        default:
          // For other types, no counting
          break;
      }
    }
  });
  
  // Calculate total selected items
  const totalSelected = Object.values(selectedCounts).reduce((sum, count) => sum + count, 0);
  
  return {
    selectedCounts,
    totalSelected
  };
};
