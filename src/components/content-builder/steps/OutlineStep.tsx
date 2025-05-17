
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OutlineEditor } from '../outline/OutlineEditor';
import { TitleGenerator } from '../outline/TitleGenerator';
import { OutlineGenerator } from '../outline/ai-generator/OutlineGenerator';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';
import { SerpSelectedItemsSidebar } from '../serp/SerpSelectedItemsSidebar';

export const OutlineStep = () => {
  const { state, setContentTitle } = useContentBuilder();
  const { contentTitle, mainKeyword, outline, outlineSections, serpSelections } = state;
  
  const [title, setTitle] = useState(contentTitle || `Complete Guide to ${mainKeyword || 'the Topic'}`);

  // Update the content title in the global state when local title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setContentTitle(newTitle);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SERP Selected Items Sidebar - Left */}
        <div className="lg:col-span-1">
          <SerpSelectedItemsSidebar serpSelections={serpSelections} />
        </div>

        {/* Main content area - Center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title input area */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-white/30"
              placeholder={`Complete Guide to ${mainKeyword || 'the Topic'}`}
            />
          </div>

          {/* Outline editor */}
          <OutlineEditor 
            outlineSections={outlineSections}
            mainKeyword={mainKeyword}
          />
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <TitleGenerator />
          <OutlineGenerator />
        </div>
      </div>
    </div>
  );
};
