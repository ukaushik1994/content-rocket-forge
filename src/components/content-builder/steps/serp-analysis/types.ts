
import { SerpSelection } from '@/contexts/content-builder/types';

export interface SelectedItemsGroupProps {
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
  competitorCount?: number;
}

export interface SelectedCountsType {
  keyword: number;
  question: number;
  snippet: number;
  competitor: number;
  entity: number;
  heading: number;
  contentGap: number;
  topRank: number;
}

export interface SelectedItemsSidebarProps {
  serpSelections: SerpSelection[];
  totalSelected: number;
  selectedCounts: SelectedCountsType;
  handleToggleSelection: (type: string, content: string) => void;
}
