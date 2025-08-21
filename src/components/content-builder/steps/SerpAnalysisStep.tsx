import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SerpApiKeySetup } from '../serp/SerpApiKeySetup';
import { SerpApiDiagnostics } from './serp-analysis/SerpApiDiagnostics';
import { EnhancedSerpIntegration } from './serp-analysis/EnhancedSerpIntegration';
import { EnhancedSerpStatus } from '../serp/EnhancedSerpStatus';
import { EnhancedSerpAnalysis } from '../serp/EnhancedSerpAnalysis';
import { SerpAnalysisResult } from '@/types/serp';
import { EnhancedSerpResult } from '@/services/enhancedSerpService';
import { getApiKey } from '@/services/apiKeyService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Settings } from 'lucide-react';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections, navigateToStep } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections } = state;
  const [apiKeysStatus, setApiKeysStatus] = useState({
    serpApi: { configured: false, working: false },
    serpstack: { configured: false, working: false }
  });
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [isCheckingKeys, setIsCheckingKeys] = useState(true);
  const [useEnhancedMode, setUseEnhancedMode] = useState(false);

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

  const handleStatusChange = (status: any) => {
    setApiKeysStatus(status);

    // Enable enhanced mode if we have working APIs
    if ((status.serpApi.working || status.serpstack.working) && mainKeyword) {
      setUseEnhancedMode(true);
    }
  };

  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });

  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword);
    }
  };

  const handleContinueWithSelections = () => {
    if (totalSelected === 0) return;

    // Mark the step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });

    // Generate outline from selections
    generateOutlineFromSelections();
  };

  const handleToggleSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };

  const handleAddToContent = (content: string, type: string) => {
    handleToggleSelection(type, content);
  };

  const handleSerpDataChange = (data: EnhancedSerpResult | null) => {
    if (data && !serpData) {
      // Convert EnhancedSerpResult to SerpAnalysisResult for backward compatibility
      const convertedData = {
        keyword: data.keyword,
        searchVolume: data.searchVolume,
        keywordDifficulty: data.keywordDifficulty,
        competitionScore: data.competitionScore,
        entities: data.entities,
        peopleAlsoAsk: data.questions.map(q => ({
          question: q.question,
          source: q.source
        })),
        headings: data.headings.map(h => ({
          text: h.text,
          level: h.level,
          subtext: h.subtext
        })),
        contentGaps: data.contentGaps,
        topResults: data.serp_blocks.organic.slice(0, 10).map((result, index) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet || '',
          position: index + 1
        })),
        relatedSearches: data.related_keywords.map(kw => ({
          query: kw.title,
          volume: kw.volume
        })),
        keywords: data.keywords,
        recommendations: data.recommendations,
        isMockData: data.isMockData
      };
      
      dispatch({ type: 'SET_SERP_DATA', payload: convertedData });
    }
  };

  const handleRegularSerpDataChange = (data: SerpAnalysisResult) => {
    dispatch({ type: 'SET_SERP_DATA', payload: data });
  };

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

  if (isCheckingKeys) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Better handling of empty keyword case with context state checking
  if (!mainKeyword || mainKeyword.trim() === '') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              No Keyword Selected
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please select a keyword first to analyze SERP data and competition.
            </p>
            <button
              onClick={() => navigateToStep(0)}
              className="w-full px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg transition-colors"
            >
              Go to Keyword Selection
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasWorkingApis = apiKeysStatus.serpApi.working || apiKeysStatus.serpstack.working;
  const hasConfiguredApis = apiKeysStatus.serpApi.configured || apiKeysStatus.serpstack.configured;

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
              Enhanced SERP Analysis
            </div>
            <Badge className={`${overallStatus.color} hover:${overallStatus.color}/80`}>
              {overallStatus.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-2 rounded bg-white/5">
              <span className="text-sm">SerpAPI (Enhanced)</span>
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
              <span className="text-sm">Serpstack (Fallback)</span>
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
                Configure API Keys for Full Analysis
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show enhanced analysis if API is available */}
      {hasWorkingApis && mainKeyword ? (
        <div className="w-full">
          <EnhancedSerpAnalysis 
            keyword={mainKeyword}
            onDataUpdate={handleSerpDataChange}
          />
        </div>
      ) : (
        <>
          {/* Show API setup or legacy analysis */}
          {(showApiSetup || (!hasConfiguredApis && !serpData)) && !isAnalyzing ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Set Up Enhanced SERP Analysis</h2>
                <p className="text-muted-foreground">
                  Configure your SERP API keys for comprehensive search data analysis with all 9 sections
                </p>
              </div>

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
                  Continue with basic analysis
                </button>
              </div>
            </div>
          ) : (
            <>
              <SerpAnalysisHeader
                mainKeyword={mainKeyword}
                isAnalyzing={isAnalyzing}
                totalSelected={totalSelected}
                handleReanalyze={handleReanalyze}
                handleContinueWithSelections={handleContinueWithSelections}
              />

              <div className="w-full">
                <SerpAnalysisPanel 
                  serpData={serpData}
                  isLoading={isAnalyzing}
                  mainKeyword={mainKeyword}
                  onAddToContent={handleAddToContent}
                  onRetry={handleReanalyze}
                  onSerpDataChange={handleRegularSerpDataChange}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
