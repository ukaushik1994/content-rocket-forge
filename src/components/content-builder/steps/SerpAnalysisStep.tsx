
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { SerpApiKeySetup } from '../serp/SerpApiKeySetup';
import { DataForSeoApiSetup } from '../serp/DataForSeoApiSetup';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { getPreferredSerpProvider } from '@/services/serpApiService';
import { getActiveProvider } from '@/services/serp/SerpApiService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections, changeSerpProvider } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections } = state;
  const [apiKeyExists, setApiKeyExists] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<SerpProvider>(getPreferredSerpProvider());
  const [activeTab, setActiveTab] = useState<string>('serpapi');
  
  // Check if API key exists
  useEffect(() => {
    const checkApiKey = async () => {
      // Check localStorage first for any provider key
      const serpApiKey = localStorage.getItem('serp_api_key');
      const dataForSeoKey = localStorage.getItem('dataforseo_api_key');
      
      if (serpApiKey || dataForSeoKey) {
        setApiKeyExists(true);
        
        // Set the current provider to the one with an API key
        if (serpApiKey) {
          setCurrentProvider('serpapi');
          setActiveTab('serpapi');
        } else if (dataForSeoKey) {
          setCurrentProvider('dataforseo');
          setActiveTab('dataforseo');
        }
        return;
      }
      
      // We could also check Supabase here if necessary
      // For now, let's assume we're just using localStorage
      setApiKeyExists(false);
    };
    
    checkApiKey();
  }, []);
  
  // Get selection statistics
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword, currentProvider, true);
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
  
  // Handle provider change
  const handleProviderChange = async (provider: SerpProvider) => {
    setCurrentProvider(provider);
    
    // If a provider is changed and we have a keyword, reanalyze with the new provider
    if (provider !== currentProvider && mainKeyword) {
      await changeSerpProvider(provider);
    }
  };

  // Handle when an API key is configured
  const handleApiConfigured = async () => {
    setApiKeyExists(true);
    
    // Get the active provider
    const activeProvider = getActiveProvider();
    setCurrentProvider(activeProvider);
    
    // If we have a keyword, analyze it with the new provider
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword, activeProvider, true);
    }
  };
  
  // If no API key exists, show the setup component
  if (!apiKeyExists && !serpData) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Set Up SERP API Access</h2>
          <p className="text-muted-foreground">
            To see real search data, you need to add your SERP API key
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="serpapi">SERP API</TabsTrigger>
            <TabsTrigger value="dataforseo">DataForSEO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="serpapi" className="mt-4">
            <SerpApiKeySetup onConfigured={handleApiConfigured} />
          </TabsContent>
          
          <TabsContent value="dataforseo" className="mt-4">
            <DataForSeoApiSetup onConfigured={handleApiConfigured} />
          </TabsContent>
        </Tabs>
        
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
        currentProvider={serpData?.provider || currentProvider}
        onProviderChange={handleProviderChange}
      />
      
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
