
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { SerpApiKeySetup } from '../serp/SerpApiKeySetup';
import { SerpApiDiagnostics } from './serp-analysis/SerpApiDiagnostics';
import { SerpAnalysisResult } from '@/types/serp';
import { getApiKey } from '@/services/apiKeyService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { testSerpApiKeyComprehensive } from '@/utils/apiKeyTestUtils';
import { toast } from 'sonner';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections } = state;
  const [apiKeyExists, setApiKeyExists] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [apiKeySource, setApiKeySource] = useState<'settings' | 'none'>('none');
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [keyTestResult, setKeyTestResult] = useState<any>(null);
  
  // Check if API key exists and test it
  useEffect(() => {
    const checkAndTestApiKey = async () => {
      try {
        setIsCheckingKey(true);
        console.log('🔑 Checking for SERP API key...');
        
        // Check unified API key service
        const settingsApiKey = await getApiKey('serp');
        if (settingsApiKey) {
          console.log('✅ SERP API key found in settings, testing functionality...');
          setApiKeyExists(true);
          setApiKeySource('settings');
          
          // Test the API key functionality
          try {
            const testResult = await testSerpApiKeyComprehensive(settingsApiKey);
            setKeyTestResult(testResult);
            
            if (testResult.edgeFunction.success) {
              console.log('✅ API key test successful');
              toast.success('SERP API key is working correctly');
            } else {
              console.warn('⚠️ API key test failed:', testResult.edgeFunction.error);
              toast.warning(`API key issue: ${testResult.edgeFunction.error}`);
            }
          } catch (testError) {
            console.error('❌ Error testing API key:', testError);
            toast.error('Failed to test API key functionality');
          }
          
          return;
        }
        
        // No API key found
        console.log('❌ No SERP API key found');
        setApiKeyExists(false);
        setApiKeySource('none');
      } catch (error) {
        console.error('Error checking API key:', error);
        setApiKeyExists(false);
        setApiKeySource('none');
      } finally {
        setIsCheckingKey(false);
      }
    };
    
    const urlParams = new URLSearchParams(window.location.search);
    const showApiSetupParam = urlParams.get('showApiSetup');
    if (showApiSetupParam === 'true') {
      setShowApiSetup(true);
    }
    
    checkAndTestApiKey();
  }, []);
  
  // Get selection statistics
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      console.log('🔄 Reanalyzing keyword:', mainKeyword);
      await analyzeKeyword(mainKeyword);
    }
  };
  
  // Handle continuing with selected items
  const handleContinueWithSelections = () => {
    if (totalSelected === 0) {
      toast.warning('Please select at least one item before continuing');
      return;
    }
    
    console.log('✅ Continuing with', totalSelected, 'selected items');
    
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
    if (data) {
      console.log('📊 Updating SERP data:', {
        isMockData: data.isMockData,
        itemCounts: {
          keywords: data.keywords?.length || 0,
          headings: data.headings?.length || 0,
          questions: data.peopleAlsoAsk?.length || 0,
          entities: data.entities?.length || 0
        }
      });
      dispatch({ type: 'SET_SERP_DATA', payload: data });
    }
  };
  
  // Loading state
  if (isCheckingKey) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Checking API configuration...</p>
        </div>
      </div>
    );
  }
  
  // Show API setup if explicitly requested or if no key exists and no data is available
  if ((showApiSetup || (!apiKeyExists && !serpData)) && !isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Set Up SERP API Access</h2>
          <p className="text-muted-foreground">
            {apiKeySource === 'settings' 
              ? keyTestResult?.edgeFunction.success 
                ? 'Your API key is working correctly'
                : 'Your API key needs attention'
              : 'To see real search data, you need to add your SERP API key'}
          </p>
        </div>
        
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
          <div className="space-y-4">
            <SelectedItemsSidebar 
              serpSelections={serpSelections}
              totalSelected={totalSelected}
              selectedCounts={selectedCounts}
              handleToggleSelection={handleToggleSelection}
            />
            
            {/* Show diagnostics when there are issues */}
            {(!apiKeyExists || serpData?.isMockData || keyTestResult?.edgeFunction.success === false) && (
              <SerpApiDiagnostics />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
