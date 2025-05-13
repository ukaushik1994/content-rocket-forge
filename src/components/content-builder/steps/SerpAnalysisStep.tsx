
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections, selectedRegions } = state;
  
  // Add state for using mock data
  const [useMockData, setUseMockData] = useState(false);
  
  // Get selection statistics
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      // Pass refresh = true to force refresh the data
      await analyzeKeyword(mainKeyword, true, selectedRegions);
    }
  };
  
  // Handle continuing with selected items
  const handleContinueWithSelections = () => {
    if (totalSelected === 0) return;
    
    // Mark the step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    
    // Generate outline from selections
    generateOutlineFromSelections();
  };
  
  // Helper function to toggle selection state
  const handleToggleSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };
  
  // Function to handle adding content from SERP items
  const handleAddToContent = (content: string, type: string) => {
    handleToggleSelection(type, content);
  };

  // Toggle mock data usage
  const handleToggleMockData = () => {
    const newValue = !useMockData;
    setUseMockData(newValue);
    toast.info(`Mock SERP data ${newValue ? 'enabled' : 'disabled'}`);
    
    // If enabling mock data, automatically reanalyze with mock data
    if (newValue && mainKeyword) {
      // Set refresh to true and pass the selected regions
      analyzeKeyword(mainKeyword, true, selectedRegions);
    }
  };
  
  return (
    <div className="space-y-6">
      <SerpAnalysisHeader
        mainKeyword={mainKeyword}
        isAnalyzing={isAnalyzing}
        totalSelected={totalSelected}
        handleReanalyze={handleReanalyze}
        handleContinueWithSelections={handleContinueWithSelections}
      />
      
      {/* Add mock data toggle button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToggleMockData}
          className={`flex items-center gap-2 ${useMockData ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' : 'bg-white/5'}`}
        >
          <Eye size={16} />
          {useMockData ? 'Using Mock Data' : 'Use Mock Data'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-220px)]">
        <div className="lg:col-span-3">
          <SerpAnalysisPanel 
            serpData={serpData}
            isLoading={isAnalyzing}
            mainKeyword={mainKeyword}
            onAddToContent={handleAddToContent}
            onRetry={handleReanalyze}
          />
        </div>
        
        <div className="lg:col-span-1 relative h-full">
          <SelectedItemsSidebar 
            serpSelections={serpSelections}
            totalSelected={totalSelected}
            selectedCounts={selectedCounts}
            handleToggleSelection={handleToggleSelection}
          />
        </div>
      </div>
    </div>
  );
};
