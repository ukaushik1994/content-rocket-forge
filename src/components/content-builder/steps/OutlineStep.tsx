import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { ContentTitleCard } from '../outline/ContentTitleCard';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';
import { OutlineTable } from '../outline/OutlineTable';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export const OutlineStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { outline, serpSelections } = state;
  
  useEffect(() => {
    // Mark as complete if we have an outline with at least 3 sections
    if (outline && outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    }
  }, [outline, dispatch]);
  
  const handleSaveOutline = (updatedOutline: any[]) => {
    console.log('Saving outline:', updatedOutline);
    dispatch({ type: 'SET_OUTLINE', payload: updatedOutline });
  };

  const hasSerpSelections = serpSelections.some(item => item.selected);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Content Outline</h3>
          <p className="text-sm text-muted-foreground">
            Create and edit your content structure
          </p>
        </div>
      </div>

      {/* Content title with edit option */}
      <ContentTitleCard />

      {/* Selected Items Summary */}
      <SelectedSerpItemsCard />

      {/* AI Outline Generator */}
      <AIOutlineGenerator />

      {/* Outline Table */}
      <Card>
        <CardContent className="pt-6">
          <OutlineTable 
            outline={outline || []} 
            onSave={handleSaveOutline} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
