
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { ContentTitleCard } from '../outline/ContentTitleCard';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';

export const OutlineStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { outline } = state;
  
  useEffect(() => {
    // Mark as complete if we have an outline with at least 3 sections
    if (outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    }
  }, [outline, dispatch]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Content Outline</h3>
          <p className="text-sm text-muted-foreground">
            Create your content structure using AI.
          </p>
        </div>
      </div>

      {/* Content title with edit option */}
      <ContentTitleCard />

      {/* Selected Items Summary - Now appears ABOVE AI Outline Generator */}
      <SelectedSerpItemsCard />

      {/* AI Outline Generator */}
      <AIOutlineGenerator />
    </div>
  );
}
