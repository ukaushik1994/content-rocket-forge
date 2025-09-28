import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AIOutlineGenerator } from '@/components/content-builder/outline/AIOutlineGenerator';

interface StrategyEnhancedOutlineGeneratorProps {
  proposal: any;
}

export function StrategyEnhancedOutlineGenerator({ proposal }: StrategyEnhancedOutlineGeneratorProps) {
  const { state } = useContentBuilder();
  const { selectedSolution, serpSelections } = state;

  const selectedSerpCount = serpSelections.filter(item => item.selected).length;

  return (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="flex items-center justify-between py-2 border-b border-border/50">
        <h3 className="font-medium">"{proposal?.primary_keyword}"</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {selectedSolution && (
            <span>Solution: {selectedSolution.name}</span>
          )}
          <span>{selectedSerpCount} SERP selected</span>
        </div>
      </div>

      {/* Use existing Content Builder AIOutlineGenerator */}
      <AIOutlineGenerator />
    </div>
  );
}