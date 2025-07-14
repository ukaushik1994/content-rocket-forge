
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentTypeStep } from './ContentTypeStep';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';
import { OutlineTable } from '../outline/OutlineTable';
import { Separator } from '@/components/ui/separator';
import { FileText, Settings, Zap } from 'lucide-react';
import { SolutionSelector } from './SolutionSelector';

export const ContentTypeAndOutlineStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { outline, serpSelections, contentType, contentFormat, contentIntent } = state;
  
  useEffect(() => {
    // Mark as complete if we have content type selected and outline with at least 3 sections
    if (contentType && outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [contentType, outline, dispatch]);
  
  const handleSaveOutline = (updatedOutline: string[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: updatedOutline });
  };

  const hasSerpSelections = serpSelections.some(item => item.selected);
  
  return (
    <div className="space-y-8">
      {/* Content Type Selection Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Content Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentTypeStep />
        </CardContent>
      </Card>

      <Separator className="bg-white/10" />

      {/* Solution Selector Section */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            Solution Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SolutionSelector />
        </CardContent>
      </Card>

      <Separator className="bg-white/10" />

      {/* Outline Creation Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-medium">Content Outline</h3>
          <p className="text-sm text-muted-foreground ml-2">
            Create and edit your content structure
          </p>
        </div>

        {/* Selected Items Summary & AI Generator - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SelectedSerpItemsCard />
          <AIOutlineGenerator />
        </div>

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
    </div>
  );
};
