
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OutlineTable } from '../outline/OutlineTable';
import { ContentTitleCard } from '../outline/ContentTitleCard';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';
import { v4 as uuid } from 'uuid';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';

export const OutlineStep = () => {
  const { state, setOutline, setOutlineSections, navigateToStep } = useContentBuilder();
  const { serpSelections = [] } = state;
  const [generatingOutline, setGeneratingOutline] = useState(false);
  
  // Convert string[] outline to OutlineSection[] if it's not already
  const getOutlineSections = (): OutlineSection[] => {
    if (state.outlineSections && state.outlineSections.length > 0) {
      return state.outlineSections;
    }
    
    if (state.outline && state.outline.length > 0) {
      return state.outline.map((title) => ({
        id: uuid(),
        title: title,
        level: 1,
      }));
    }
    
    return [];
  };
  
  const outlineSections = getOutlineSections();
  
  const handleUpdateOutline = (updatedOutline: OutlineSection[]) => {
    setOutlineSections(updatedOutline);
    // Extract titles for the simpler outline array
    setOutline(updatedOutline.map(section => section.title));
  };
  
  const handleFinishOutline = () => {
    if (outlineSections.length > 0) {
      navigateToStep(4); // Navigate to Content Writing step
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Content Title */}
      <ContentTitleCard 
        title={state.contentTitle || ''}
        suggestedTitles={state.suggestedTitles || []}
        onTitleChange={(title: string) => {
          /* Handle title change */
        }}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main outline editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Content Outline</CardTitle>
            </CardHeader>
            <CardContent>
              <OutlineTable 
                outline={outlineSections}
                onChange={handleUpdateOutline}
                onFinish={handleFinishOutline}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected SERP items */}
          <SelectedSerpItemsCard 
            serpSelections={serpSelections.filter(item => item.selected)} 
          />
          
          {/* AI Outline Generator */}
          <AIOutlineGenerator />
        </div>
      </div>
    </div>
  );
};
