
import { SerpSelection } from '@/contexts/content-builder/types';
import { Dispatch, SetStateAction } from 'react';

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
  [key: string]: number; // Add index signature for string keys
}

export interface SelectedItemsSidebarProps {
  serpSelections: SerpSelection[];
  totalSelected: number;
  selectedCounts: SelectedCountsType;
  handleToggleSelection: (type: string, content: string) => void;
}

export interface SelectedItemsContentProps {
  selectedCounts: SelectedCountsType;
  totalSelected: number;
  onGenerateOutline?: () => void;
  serpSelections?: SerpSelection[];
  selectedTab?: string;
  setSelectedTab?: Dispatch<SetStateAction<string>>;
}
