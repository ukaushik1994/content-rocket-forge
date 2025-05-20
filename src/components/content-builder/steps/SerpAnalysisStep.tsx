
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { SerpApiKeySetup } from '../serp/SerpApiKeySetup';
import { SerpAnalysisResult } from '@/types/serp';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections } = state;
  const [apiKeyExists, setApiKeyExists] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  
  // Check if API key exists and if we should show API setup
  useEffect(() => {
    const checkApiKey = async () => {
      // Check localStorage first
      const localApiKey = localStorage.getItem('serp_api_key');
      if (localApiKey) {
        setApiKeyExists(true);
        return;
      }
      
      // We could also check Supabase here if necessary
      // For now, let's assume we're just using localStorage
      setApiKeyExists(false);
    };
    
    const urlParams = new URLSearchParams(window.location.search);
    const showApiSetupParam = urlParams.get('showApiSetup');
    if (showApiSetupParam === 'true') {
      setShowApiSetup(true);
    }
    
    checkApiKey();
  }, []);
  
  // Get selection statistics
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword);
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
  
  // Handle SERP data changes from the panel component
  const handleSerpDataChange = (data: SerpAnalysisResult | null) => {
    if (data && !serpData) {
      dispatch({ type: 'SET_SERP_DATA', payload: data });
    }
  };
  
  // If API setup is explicitly requested or no API key exists and no data is available
  if ((showApiSetup || (!apiKeyExists && !serpData)) && !isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Set Up SERP API Access</h2>
          <p className="text-muted-foreground">
            To see real search data, you need to add your SERP API key
          </p>
        </div>
        
        <SerpApiKeySetup />
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t want to add an API key now?
          </p>
          <button 
            onClick={handleReanalyze}
            className="text-sm text-neon-purple hover:text-neon-blue underline mt-1"
          >
            Continue with mock data
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <SerpAnalysisHeader
        mainKeyword={mainKeyword}
        isAnalyzing={isAnalyzing}
        totalSelected={totalSelected}
        handleReanalyze={handleReanalyze}
        handleContinueWithSelections={handleContinueWithSelections}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-220px)]">
        <div className="lg:col-span-3">
          <SerpAnalysisPanel 
            serpData={serpData}
            isLoading={isAnalyzing}
            mainKeyword={mainKeyword}
            onAddToContent={handleAddToContent}
            onRetry={handleReanalyze}
            onSerpDataChange={handleSerpDataChange}
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
