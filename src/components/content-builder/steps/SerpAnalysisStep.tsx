
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { SerpApiKeySetup } from '../serp/SerpApiKeySetup';
import { SerpApiDiagnostics } from './serp-analysis/SerpApiDiagnostics';
import { EnhancedSerpIntegration } from './serp-analysis/EnhancedSerpIntegration';
import { EnhancedSerpStatus } from '../serp/EnhancedSerpStatus';
import { SerpAnalysisResult } from '@/types/serp';
import { getApiKey } from '@/services/apiKeyService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections } = state;
  const [apiKeysStatus, setApiKeysStatus] = useState({
    serpApi: { configured: false, working: false },
    serpstack: { configured: false, working: false }
  });
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [isCheckingKeys, setIsCheckingKeys] = useState(true);
  const [useEnhancedMode, setUseEnhancedMode] = useState(false);
  
  // Check if API keys exist
  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        setIsCheckingKeys(true);
        console.log('🔑 Checking for SERP API keys...');
        
        // Check both API keys
        const serpApiKey = await getApiKey('serp');
        const serpstackKey = await getApiKey('serpstack');
        
        const newStatus = {
          serpApi: { configured: !!serpApiKey, working: false },
          serpstack: { configured: !!serpstackKey, working: false }
        };
        
        setApiKeysStatus(newStatus);
        
        // Enable enhanced mode if we have the keyword-serp function available
        // and at least one API key is configured
        if ((serpApiKey || serpstackKey) && mainKeyword) {
          setUseEnhancedMode(true);
        }
        
        console.log('✅ API keys status checked:', newStatus);
      } catch (error) {
        console.error('Error checking API keys:', error);
      } finally {
        setIsCheckingKeys(false);
      }
    };
    
    const urlParams = new URLSearchParams(window.location.search);
    const showApiSetupParam = urlParams.get('showApiSetup');
    if (showApiSetupParam === 'true') {
      setShowApiSetup(true);
    }
    
    checkApiKeys();
  }, [mainKeyword]);
  
  // Handle status updates from the status component
  const handleStatusChange = (status: any) => {
    setApiKeysStatus(status);
    
    // Enable enhanced mode if we have working APIs
    if ((status.serpApi.working || status.serpstack.working) && mainKeyword) {
      setUseEnhancedMode(true);
    }
  };
  
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
  
  // Loading state
  if (isCheckingKeys) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Show API setup if explicitly requested or no working APIs and no data
  const hasWorkingApis = apiKeysStatus.serpApi.working || apiKeysStatus.serpstack.working;
  const hasConfiguredApis = apiKeysStatus.serpApi.configured || apiKeysStatus.serpstack.configured;
  
  if ((showApiSetup || (!hasConfiguredApis && !serpData)) && !isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Set Up Enhanced SERP Analysis</h2>
          <p className="text-muted-foreground">
            Configure your SERP API keys for comprehensive search data analysis
          </p>
        </div>
        
        {/* Enhanced Status Component */}
        <EnhancedSerpStatus onStatusChange={handleStatusChange} />
        
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="setup">API Key Setup</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <SerpApiKeySetup />
          </TabsContent>
          
          <TabsContent value="diagnostics">
            <SerpApiDiagnostics />
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t want to add API keys now?
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
  
  // Show enhanced mode if available, otherwise fallback to regular mode
  if (useEnhancedMode && hasWorkingApis) {
    return (
      <div className="space-y-6">
        {/* Enhanced Status at the top */}
        <EnhancedSerpStatus onStatusChange={handleStatusChange} />
        
        {/* Enhanced SERP Integration */}
        <EnhancedSerpIntegration />
      </div>
    );
  }
  
  // Regular SERP analysis mode
  return (
    <div className="space-y-6">
      {/* Show status even in regular mode */}
      <EnhancedSerpStatus onStatusChange={handleStatusChange} />
      
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
          <div className="space-y-4">
            <SelectedItemsSidebar 
              serpSelections={serpSelections}
              totalSelected={totalSelected}
              selectedCounts={selectedCounts}
              handleToggleSelection={handleToggleSelection}
            />
            
            {/* Add diagnostics panel for debugging */}
            {(!hasWorkingApis || serpData?.isMockData) && (
              <SerpApiDiagnostics />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
