
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpSelection } from '@/contexts/content-builder/types';
import { QuestionsTab } from './tabs/QuestionsTab';
import { HeadingsTab } from './tabs/HeadingsTab';
import { ContentGapsTab } from './tabs/ContentGapsTab';
import { KeywordsTab } from './tabs/KeywordsTab';
import { RelatedSearchesTab } from './tabs/RelatedSearchesTab';
import { TrendingUp, HelpCircle, Heading, Star, Tag, CheckCircle, Zap, Search, RefreshCw, Database } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { analyzeSerpstackKeyword, testSerpstackConnection } from '@/services/serpstackService';
import { analyzeKeywordEnhanced } from '@/services/enhancedSerpService';
import { transformSerpData } from '@/services/serpDataTransformer';
import EnhancedSerpModal from './EnhancedSerpModal';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';

interface SerpAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  serpData: SerpAnalysisResult | null;
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
  keyword: string;
  onSerpDataUpdate?: (data: SerpAnalysisResult | null) => void;
}

export function SerpAnalysisModal({
  isOpen,
  onClose,
  serpData,
  serpSelections,
  onToggleSelection,
  keyword,
  onSerpDataUpdate
}: SerpAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState('questions');
  const [activeProvider, setActiveProvider] = useState<'serpapi' | 'serpstack'>('serpapi');
  const [isLoadingProvider, setIsLoadingProvider] = useState(false);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [providerData, setProviderData] = useState<{
    serpapi: SerpAnalysisResult | null;
    serpstack: SerpAnalysisResult | null;
  }>({
    serpapi: serpData,
    serpstack: null
  });
  const { openSettings } = useSettings();
  
  // Initialize provider data when modal opens and serpData is available
  React.useEffect(() => {
    if (isOpen && serpData && !providerData.serpapi) {
      console.log('🔧 Initializing provider data with serpData');
      setProviderData(prev => ({
        ...prev,
        serpapi: serpData
      }));
    }
  }, [isOpen, serpData]);

  // Debug logging
  console.log('🔍 SerpAnalysisModal Debug:', {
    isOpen,
    keyword,
    serpData: !!serpData,
    currentSerpData: !!providerData[activeProvider],
    isLoadingProvider,
    activeProvider
  });
  
  // Get current data based on active provider
  const currentSerpData = providerData[activeProvider] || serpData;
  
  // Always render the modal when open, even without data
  if (!isOpen) {
    return null;
  }

  const selectedCount = serpSelections.filter(item => item.selected).length;

  // Function to fetch data from alternative provider
  const fetchFromProvider = async (provider: 'serpapi' | 'serpstack') => {
    setIsLoadingProvider(true);
    console.log(`🚀 Fetching data from ${provider} for keyword: ${keyword}`);
    
    try {
      let data;
      if (provider === 'serpapi') {
        console.log('📡 Calling analyzeKeywordEnhanced for SerpAPI...');
        data = await analyzeKeywordEnhanced(keyword);
      } else {
        console.log('📡 Calling analyzeSerpstackKeyword for Serpstack...');
        data = await analyzeSerpstackKeyword(keyword);
      }
      
      console.log(`📊 ${provider} returned data:`, !!data);
      
      if (data) {
        setProviderData(prev => ({
          ...prev,
          [provider]: data
        }));
        
        // Always notify parent when we get data, regardless of active provider
        onSerpDataUpdate?.(data);
        
        const providerName = provider === 'serpapi' ? 'SerpAPI' : 'Serpstack';
        const dataStats = {
          faqs: data.peopleAlsoAsk?.length || 0,
          entities: data.entities?.length || 0,
          competitors: data.topResults?.length || 0,
          headings: data.headings?.length || 0,
          gaps: data.contentGaps?.length || 0
        };
        
        toast.success(`${providerName} loaded: ${dataStats.faqs} FAQs, ${dataStats.entities} entities, ${dataStats.competitors} competitors, ${dataStats.headings} headings, ${dataStats.gaps} gaps!`, {
          duration: 5000
        });
        
        return data;
      } else {
        const errorMsg = `Failed to load data from ${provider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}. Please check your API key and try again.`;
        console.error(errorMsg);
        toast.error(errorMsg, { duration: 8000 });
        return null;
      }
    } catch (error: any) {
      console.error(`Error fetching from ${provider}:`, error);
      const errorMsg = `Error loading data from ${provider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}: ${error.message || 'Unknown error'}`;
      toast.error(errorMsg, { 
        duration: 8000,
        action: {
          label: "Check Settings",
          onClick: () => openSettings('api')
        }
      });
      return null;
    } finally {
      setIsLoadingProvider(false);
    }
  };

  // Function to switch provider
  const switchProvider = async (provider: 'serpapi' | 'serpstack') => {
    console.log(`🔄 Switching to provider: ${provider}`);
    setActiveProvider(provider);
    
    // If we don't have data for this provider, fetch it
    if (!providerData[provider]) {
      console.log(`📡 No data for ${provider}, fetching...`);
      await fetchFromProvider(provider);
    } else {
      console.log(`📋 Using existing ${provider} data`);
      // Update parent with existing data
      onSerpDataUpdate?.(providerData[provider]);
    }
  };
  
  // Provider-specific capabilities and data counts
  const getProviderCapabilities = (provider: 'serpapi' | 'serpstack') => {
    const data = providerData[provider];
    if (!data) return null;
    
    return {
      serpapi: {
        knowledgeGraph: !!(data as any).knowledgeGraph,
        featuredSnippets: (data.featuredSnippets?.length || 0) > 0,
        localResults: ((data as any).localResults?.length || 0) > 0,
        shoppingResults: ((data as any).shoppingResults?.length || 0) > 0,
        multimedia: ((data as any).multimedia?.images?.length || 0) + ((data as any).multimedia?.videos?.length || 0) > 0,
        topStories: ((data as any).topStories?.length || 0) > 0
      },
      serpstack: {
        enhancedPAA: (data.peopleAlsoAsk?.length || 0) > 4,
        smartHeadings: (data.headings?.length || 0) > 3,
        contentGaps: (data.contentGaps?.length || 0) > 2,
        entityExtraction: (data.entities?.length || 0) > 5,
        competitorAnalysis: (data.topResults?.length || 0) > 5
      }
    }[provider];
  };

  const tabs = [
    { 
      id: 'questions', 
      label: 'FAQ Questions', 
      icon: HelpCircle, 
      count: currentSerpData?.peopleAlsoAsk?.length || 0, 
      color: 'from-purple-500 to-pink-500',
      capability: activeProvider === 'serpapi' ? 'Enhanced PAA' : 'Smart FAQ Extraction'
    },
    { 
      id: 'headings', 
      label: 'SERP Headings', 
      icon: Heading, 
      count: currentSerpData?.headings?.length || 0, 
      color: 'from-green-500 to-emerald-500',
      capability: activeProvider === 'serpapi' ? 'Title Analysis' : 'Smart Headings'
    },
    { 
      id: 'gaps', 
      label: 'Content Gaps', 
      icon: Star, 
      count: currentSerpData?.contentGaps?.length || 0, 
      color: 'from-orange-500 to-red-500',
      capability: 'Gap Analysis'
    },
    { 
      id: 'keywords', 
      label: 'Keywords', 
      icon: Tag, 
      count: currentSerpData?.keywords?.length || 0, 
      color: 'from-indigo-500 to-purple-500',
      capability: 'Keyword Discovery'
    },
    { 
      id: 'related', 
      label: 'Related Searches', 
      icon: Search, 
      count: currentSerpData?.relatedSearches?.length || 0, 
      color: 'from-teal-500 to-cyan-500',
      capability: 'Search Expansion'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-card border border-border shadow-2xl z-50">

        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">
                  SERP Analysis
                </div>
                <div className="text-sm text-muted-foreground font-mono">{keyword}</div>
              </div>
            </div>
            
            {/* API Provider Selector */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground font-medium">Data Source:</div>
              <div className="flex bg-muted/50 border border-border/50 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={activeProvider === 'serpapi' ? 'default' : 'ghost'}
                  onClick={() => switchProvider('serpapi')}
                  disabled={isLoadingProvider}
                  className="text-xs h-8 px-3"
                >
                  {isLoadingProvider && activeProvider === 'serpapi' ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Database className="h-3 w-3 mr-1" />
                  )}
                  SerpAPI
                  {providerData.serpapi && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant={activeProvider === 'serpstack' ? 'default' : 'ghost'}
                  onClick={() => switchProvider('serpstack')}
                  disabled={isLoadingProvider}
                  className="text-xs h-8 px-3"
                >
                  {isLoadingProvider && activeProvider === 'serpstack' ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Database className="h-3 w-3 mr-1" />
                  )}
                  Serpstack
                  {providerData.serpstack && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1" />
                  )}
                </Button>
              </div>
            </div>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-mono">{selectedCount}</span>
                  <span>selected</span>
                </Badge>
              </div>
            )}
        </DialogTitle>
      </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden relative z-10">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 border border-border/50 p-1 rounded-xl">
            {tabs.map((tab, index) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="relative flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground transition-all duration-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-primary/10">
                    <tab.icon className="h-3 w-3 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <Badge variant="outline" className="ml-1 text-xs font-mono">
                      {tab.count}
                    </Badge>
                  )}
                  {/* Show capability indicator for active tab */}
                  {activeTab === tab.id && tab.capability && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="text-[9px] text-muted-foreground bg-muted px-2 py-1 rounded border border-border">
                        {tab.capability}
                      </div>
                    </div>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-6 h-[60vh]">
            <div key={`${activeTab}-${activeProvider}`}>
                {isLoadingProvider ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-lg font-medium text-foreground">
                        Loading {activeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'} data...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Fetching fresh SERP analysis
                      </p>
                    </div>
                  </div>
                ) : !currentSerpData ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        No data available for "{keyword}"
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {keyword ? 
                          `No SERP data available from ${activeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}. Try switching providers or fetch fresh data.` :
                          'Please enter a keyword first to analyze SERP data.'
                        }
                      </p>
                      {keyword && (
                        <Button 
                          onClick={() => fetchFromProvider(activeProvider)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Fetch Data from {activeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <TabsContent value="questions" className="mt-0">
                      <QuestionsTab 
                        questions={currentSerpData.peopleAlsoAsk || []}
                        serpSelections={serpSelections}
                        onToggleSelection={onToggleSelection}
                      />
                    </TabsContent>
                    
                    <TabsContent value="headings" className="mt-0">
                      <HeadingsTab 
                        headings={currentSerpData.headings || []}
                        serpSelections={serpSelections}
                        onToggleSelection={onToggleSelection}
                      />
                    </TabsContent>
                    
                    <TabsContent value="gaps" className="mt-0">
                      <ContentGapsTab 
                        contentGaps={currentSerpData.contentGaps || []}
                        serpSelections={serpSelections}
                        onToggleSelection={onToggleSelection}
                      />
                    </TabsContent>
                    
                    <TabsContent value="keywords" className="mt-0">
                      <KeywordsTab 
                        keywords={currentSerpData.keywords || []}
                        serpSelections={serpSelections}
                        onToggleSelection={onToggleSelection}
                      />
                    </TabsContent>

                    <TabsContent value="related" className="mt-0">
                      <RelatedSearchesTab 
                        relatedSearches={currentSerpData.relatedSearches || []}
                        serpSelections={serpSelections}
                        onToggleSelection={onToggleSelection}
                      />
                    </TabsContent>
                  </>
                )}
              </div>
          </ScrollArea>
        </Tabs>
        
        <div className="flex justify-between items-center pt-4 border-t border-white/10 relative z-10">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-mono">{selectedCount}</span>
            <span>items selected for content generation</span>
          </div>
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-primary/20 to-blue-500/20 hover:from-primary/30 hover:to-blue-500/30 border border-white/20 backdrop-blur-sm transition-colors duration-200"
          >
            Done
          </Button>
        </div>
        
        {/* Enhanced Modal */}
        <EnhancedSerpModal
          isOpen={showEnhancedModal}
          onClose={() => setShowEnhancedModal(false)}
          serpData={currentSerpData}
          selections={serpSelections}
          onToggleSelection={onToggleSelection}
          keyword={keyword}
          normalizedData={currentSerpData ? transformSerpData(currentSerpData) : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
