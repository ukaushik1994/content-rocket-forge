import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SerpApiKeySetup } from '../serp/SerpApiKeySetup';
import { SerpApiDiagnostics } from './serp-analysis/SerpApiDiagnostics';
import { SerpDataManager } from '../serp/SerpDataManager';
import { DataValidationProvider } from '../serp/DataValidationProvider';
import { EnhancedSerpStatus } from '../serp/EnhancedSerpStatus';
import { SimplifiedSerpAnalysis } from '../serp/SimplifiedSerpAnalysis';
import { SerpDebugPanel } from '../serp/debug/SerpDebugPanel';
import { SerpAnalysisResult } from '@/types/serp';
import { EnhancedSerpResult } from '@/services/enhancedSerpService';
import { getApiKey } from '@/services/apiKeyService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface SerpAnalysisStepProps {
  proposal?: any;
}

export const SerpAnalysisStep = ({ proposal }: SerpAnalysisStepProps = {}) => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections, navigateToStep, setMainKeyword } = useContentBuilder();
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
        
        // Check both API keys once
        const serpApiKey = await getApiKey('serp');
        const serpstackKey = await getApiKey('serpstack');

        const newStatus = {
          serpApi: { configured: !!serpApiKey, working: !!serpApiKey },
          serpstack: { configured: !!serpstackKey, working: !!serpstackKey }
        };

        setApiKeysStatus(newStatus);
        
        // Enable enhanced mode if we have API keys OR proposal data
        const hasApiKeys = serpApiKey || serpstackKey;
        const hasProposalData = proposal?.serp_data && Object.keys(proposal.serp_data).length > 0;
        
        if ((hasApiKeys || hasProposalData)) {
          setUseEnhancedMode(true);
        }

        // If we have proposal SERP data, convert and inject it with feedback
        if (hasProposalData && !serpData) {
          injectProposalSerpData();
        } else if (!hasApiKeys && !hasProposalData) {
          toast.info('No SERP data available. You can skip this step or add API keys.');
        }

      } catch (error) {
        console.error('❌ Error checking API keys:', error);
      } finally {
        setIsCheckingKeys(false);
      }
    };

    const injectProposalSerpData = () => {
      if (!proposal?.serp_data) return;

      try {
        const targetKeyword = mainKeyword || proposal.primary_keyword;
        let serpDataEntry = proposal.serp_data[targetKeyword] || Object.values(proposal.serp_data)[0];

        if (serpDataEntry) {
          // Convert to expected format
          const convertedData = {
            keyword: serpDataEntry.keyword || targetKeyword,
            searchVolume: serpDataEntry.searchVolume || 1000,
            keywordDifficulty: serpDataEntry.keywordDifficulty || 50,
            competitionScore: serpDataEntry.competitionScore || 0.5,
            entities: serpDataEntry.entities || [],
            peopleAlsoAsk: (serpDataEntry.peopleAlsoAsk || []).map(q => ({
              question: q.question || q,
              source: q.source || 'proposal'
            })),
            headings: (serpDataEntry.headings || []).map(h => ({
              text: h.text || h,
              level: h.level || 'h2',
              subtext: h.subtext || ''
            })),
            contentGaps: serpDataEntry.contentGaps || [],
            topResults: (serpDataEntry.topResults || []).map((result, index) => ({
              title: result.title || '',
              link: result.link || '',
              snippet: result.snippet || '',
              position: result.position || index + 1
            })),
            relatedSearches: (serpDataEntry.relatedSearches || serpDataEntry.keywords || []).map(kw => ({
              query: typeof kw === 'string' ? kw : kw.query || kw.keyword,
              volume: typeof kw === 'object' ? kw.volume : undefined
            })),
            keywords: serpDataEntry.keywords || [],
            recommendations: serpDataEntry.recommendations || [],
            isMockData: serpDataEntry.isMockData !== false
          };
          
          // Calculate stats for feedback
          const stats = {
            paa: convertedData.peopleAlsoAsk?.length || 0,
            headings: convertedData.headings?.length || 0,
            results: convertedData.topResults?.length || 0
          };
          
          dispatch({ type: 'SET_SERP_DATA', payload: convertedData });
          toast.success(`Loaded ${stats.paa} PAA questions, ${stats.headings} headings, ${stats.results} top results from proposal`);
        }
      } catch (error) {
        console.error('❌ Error converting proposal SERP data:', error);
        toast.error('Failed to load SERP data from proposal');
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const showApiSetupParam = urlParams.get('showApiSetup');
    if (showApiSetupParam === 'true') {
      setShowApiSetup(true);
    }

    // Auto-set proposal keyword if available and no main keyword is set
    if (proposal?.primary_keyword && !mainKeyword) {
      console.log('🎯 Auto-setting keyword from proposal:', proposal.primary_keyword);
      setMainKeyword(proposal.primary_keyword);
    }

    // Only run once when component mounts
    checkApiKeys();
  }, []); // Run once on mount only

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
      payload: { 
        id: `${type}-${Date.now()}`,
        type, 
        content 
      }
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
              Keyword Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-muted-foreground mb-4">
              <p className="font-medium">Keyword Detection</p>
              <p className="text-sm">Main keyword: {mainKeyword || 'Not set'}</p>
              <p className="text-sm">Proposal keyword: {proposal?.primary_keyword || 'Not available'}</p>
            </div>
            {proposal?.primary_keyword && (
              <Button 
                onClick={() => {
                  console.log('Setting keyword from proposal:', proposal.primary_keyword);
                  setMainKeyword(proposal.primary_keyword);
                }}
                variant="default"
              >
                Use "{proposal.primary_keyword}"
              </Button>
            )}
            <Button
              onClick={() => navigateToStep(0)}
              variant="outline"
            >
              Go to Keyword Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasWorkingApis = apiKeysStatus.serpApi.working || apiKeysStatus.serpstack.working;
  const hasConfiguredApis = apiKeysStatus.serpApi.configured || apiKeysStatus.serpstack.configured;
  const hasProposalData = proposal?.serp_data && Object.keys(proposal.serp_data).length > 0;
  const hasAnySerpData = serpData || hasProposalData;

  console.log('🎯 Debug render state:', {
    hasWorkingApis,
    hasConfiguredApis,
    hasProposalData,
    hasAnySerpData,
    useEnhancedMode,
    serpDataAvailable: !!serpData,
    isAnalyzing
  });

  const overallStatus = getOverallApiStatus();
  const StatusIcon = overallStatus.icon;

  return (
    <DataValidationProvider>
      <SerpDataManager proposal={proposal} autoLoad={true}>
        <div className="space-y-6">

            {/* Show enhanced analysis if API is available OR we have proposal data */}
            {(hasWorkingApis || hasProposalData) && mainKeyword ? (
              <div className="w-full">
                <SimplifiedSerpAnalysis 
                  keyword={mainKeyword}
                  onDataUpdate={handleSerpDataChange}
                  proposalData={hasProposalData ? proposal?.serp_data : null}
                />
              </div>
          ) : (
            <>
              {/* Show API setup or legacy analysis */}
              {(showApiSetup || (!hasConfiguredApis && !hasAnySerpData)) && !isAnalyzing ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Set Up Enhanced SERP Analysis</h2>
                    <p className="text-muted-foreground">
                      Configure your SERP API keys for comprehensive search data analysis with all 9 sections
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

                  <div className="text-center mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Don&apos;t want to add API keys now?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={handleReanalyze}
                        className="text-sm text-neon-purple hover:text-neon-blue underline"
                      >
                        Continue with basic analysis
                      </button>
                      <span className="text-muted-foreground">or</span>
                      <button 
                        onClick={() => handleContinueWithSelections()}
                        className="text-sm text-neon-purple hover:text-neon-blue underline"
                      >
                        Skip SERP Analysis
                      </button>
                    </div>
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
                      proposalData={hasProposalData ? proposal?.serp_data : null}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </SerpDataManager>
    </DataValidationProvider>
  );
};
