
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { CountrySelector } from '@/components/content-builder/keyword/CountrySelector';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections, setSelectedRegions } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections, selectedRegions } = state;
  
  // Get selection statistics
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  // Use the first region as the selected one, or default to 'us'
  const selectedRegion = selectedRegions.length > 0 ? selectedRegions[0] : 'us';
  
  // Handle changing the selected country/region
  const handleCountryChange = (country: string) => {
    setSelectedRegions([country]);
    if (mainKeyword) {
      analyzeKeyword(mainKeyword, [country]);
    }
  };
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword, [selectedRegion]);
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
  
  // Set default region on component mount if not already set
  useEffect(() => {
    if (selectedRegions.length === 0) {
      setSelectedRegions(['us']);
    }
  }, [selectedRegions, setSelectedRegions]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <SerpAnalysisHeader
          mainKeyword={mainKeyword}
          isAnalyzing={isAnalyzing}
          totalSelected={totalSelected}
          handleReanalyze={handleReanalyze}
          handleContinueWithSelections={handleContinueWithSelections}
        />
        
        <CountrySelector 
          selectedCountry={selectedRegion}
          onCountryChange={handleCountryChange}
        />
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
