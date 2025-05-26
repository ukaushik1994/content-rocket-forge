
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { ContentTitleCard } from '../outline/ContentTitleCard';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';
import { OutlineTable } from '../outline/OutlineTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { TitleGenerationButton } from './writing/TitleGenerationButton';
import { Button } from '@/components/ui/button';

export const OutlineStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { outline, serpSelections, contentTitle } = state;
  
  useEffect(() => {
    // Mark as complete if we have an outline with at least 3 sections
    if (outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    }
  }, [outline, dispatch]);
  
  const handleSaveOutline = (updatedOutline: string[]) => {
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

      {/* Title Generation Card */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between gap-2">
            <div>Content Title</div>
            <TitleGenerationButton />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contentTitle ? (
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue font-medium text-lg">
              {contentTitle}
            </p>
          ) : (
            <p className="text-muted-foreground text-base">
              No title set. Generate one with the button above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Selected Items Summary */}
      <SelectedSerpItemsCard />

      {/* AI Outline Generator */}
      <AIOutlineGenerator />

      {/* Outline Table */}
      <Card>
        <CardContent className="pt-6">
          <OutlineTable 
            outline={outline} 
            onSave={handleSaveOutline} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
