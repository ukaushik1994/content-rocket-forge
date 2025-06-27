
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Settings } from 'lucide-react';

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
  
  // Check if API keys exist and test them immediately
  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        setIsCheckingKeys(true);
        console.log('🔑 Checking and testing SERP API keys...');
        
        // Check both API keys
        const serpApiKey = await getApiKey('serp');
        const serpstackKey = await getApiKey('serpstack');
        
        const newStatus = {
          serpApi: { configured: !!serpApiKey, working: false },
          serpstack: { configured: !!serpstackKey, working: false }
        };
        
        setApiKeysStatus(newStatus);
        
        // Enable enhanced mode if we have at least one API key configured
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
  
  // Get overall API status for quick display
  const getOverallApiStatus = () => {
    const { serpApi, serpstack } = apiKeysStatus;
    
    if (serpApi.working && serpstack.working) {
      return { status: 'excellent', label: 'Both APIs Ready', color: 'bg-green-600', icon: CheckCircle };
    } else if (serpApi.working || serpstack.working) {
      return { status: 'partial', label: 'One API Ready', color: 'bg-yellow-600', icon: AlertTriangle };
    } else if (serpApi.configured || serpstack.configured) {
      return { status: 'configured', label: 'APIs Configured', color: 'bg-blue-600', icon: AlertTriangle };
    } else {
      return { status: 'none', label: 'Setup Required', color: 'bg-red-600', icon: Settings };
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
        
        {/* Enhanced Status Component - Always show at the top */}
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
  
  const overallStatus = getOverallApiStatus();
  const StatusIcon = overallStatus.icon;
  
  return (
    <div className="space-y-6">
      {/* Always show enhanced status at the top of the analysis step */}
      <Card className="border-neon-purple/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <StatusIcon className="h-5 w-5 mr-2 text-neon-purple" />
              SERP API Status
            </div>
            <Badge className={`${overallStatus.color} hover:${overallStatus.color}/80`}>
              {overallStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-2 rounded bg-white/5">
              <span className="text-sm">SerpAPI</span>
              <div className="flex items-center">
                {apiKeysStatus.serpApi.working ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : apiKeysStatus.serpApi.configured ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Settings className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-white/5">
              <span className="text-sm">Serpstack</span>
              <div className="flex items-center">
                {apiKeysStatus.serpstack.working ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : apiKeysStatus.serpstack.configured ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Settings className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
          {!hasWorkingApis && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setShowApiSetup(true)}
                className="text-sm text-neon-purple hover:text-neon-blue underline"
              >
                Configure API Keys
              </button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Show enhanced mode if available, otherwise fallback to regular mode */}
      {useEnhancedMode && hasWorkingApis ? (
        <EnhancedSerpIntegration />
      ) : (
        <>
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
                
                {/* Add diagnostics panel for debugging when needed */}
                {(!hasWorkingApis || serpData?.isMockData) && (
                  <SerpApiDiagnostics />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
