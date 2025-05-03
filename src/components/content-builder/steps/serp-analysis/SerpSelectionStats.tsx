
import React from 'react';
import { SerpSelection } from '@/contexts/content-builder/types';

interface SerpSelectionStatsProps {
  serpSelections: SerpSelection[];
}

export function SerpSelectionStats({ serpSelections }: SerpSelectionStatsProps) {
  // Calculate selected counts
  const selectedCounts = {
    keyword: getSelectedCountByType('keyword'),
    question: getSelectedCountByType('question'),
    snippet: getSelectedCountByType('snippet'),
    competitor: getSelectedCountByType('competitor')
  };
  
  const totalSelected = Object.values(selectedCounts).reduce((acc, count) => acc + count, 0);
  
  // Helper function to get selected count by type
  function getSelectedCountByType(type: string): number {
    return serpSelections.filter(item => item.type === type && item.selected).length;
  }
  
  return { selectedCounts, totalSelected };
}
