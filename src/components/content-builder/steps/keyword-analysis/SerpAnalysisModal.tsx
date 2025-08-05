
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
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { analyzeSerpstackKeyword, testSerpstackConnection } from '@/services/serpstackService';
import { analyzeKeywordEnhanced } from '@/services/enhancedSerpService';
import { transformSerpData } from '@/services/serpDataTransformer';
import EnhancedSerpModal from './EnhancedSerpModal';
import { toast } from 'sonner';

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
  
  // Debug logging
  console.log('🔍 SerpAnalysisModal Debug:', {
    isOpen,
    keyword,
    serpData: !!serpData,
    currentSerpData: !!providerData[activeProvider],
    isLoadingProvider
  });
  
  // Get current data based on active provider
  const currentSerpData = providerData[activeProvider];
  
  // Always render the modal when open, even without data
  if (!isOpen) {
    return null;
  }

  const selectedCount = serpSelections.filter(item => item.selected).length;

  // Function to fetch data from alternative provider with robust error handling
  const fetchFromProvider = async (provider: 'serpapi' | 'serpstack') => {
    setIsLoadingProvider(true);
    console.log(`🔄 Attempting to fetch data from ${provider}...`);
    
    try {
      let data;
      const providerName = provider === 'serpapi' ? 'SerpAPI' : 'Serpstack';
      
      if (provider === 'serpapi') {
        data = await analyzeKeywordEnhanced(keyword);
      } else {
        // Use enhanced Serpstack service with fallback
        try {
          data = await analyzeSerpstackKeyword(keyword);
        } catch (serpstackError: any) {
          console.warn(`⚠️ Serpstack failed: ${serpstackError.message}`);
          
          // If Serpstack fails due to rate limits, automatically try SerpAPI
          if (serpstackError.message?.includes('rate limit') || 
              serpstackError.message?.includes('exceeded')) {
            toast.error(`Serpstack rate limit exceeded, trying SerpAPI...`);
            
            // Auto-switch to SerpAPI
            setActiveProvider('serpapi');
            data = await analyzeKeywordEnhanced(keyword);
            
            if (data) {
              toast.success('Successfully switched to SerpAPI due to Serpstack rate limits');
            }
          } else {
            throw serpstackError;
          }
        }
      }
      
      if (data) {
        setProviderData(prev => ({
          ...prev,
          [provider === 'serpstack' && data ? 'serpapi' : provider]: data
        }));
        
        // Update parent with the new data
        onSerpDataUpdate?.(data);
        
        const dataStats = {
          faqs: data.peopleAlsoAsk?.length || 0,
          entities: data.entities?.length || 0,
          competitors: data.topResults?.length || 0,
          headings: data.headings?.length || 0,
          gaps: data.contentGaps?.length || 0
        };
        
        toast.success(`${providerName} loaded successfully!`, {
          description: `${dataStats.faqs} FAQs • ${dataStats.entities} entities • ${dataStats.competitors} competitors • ${dataStats.headings} headings • ${dataStats.gaps} content gaps`,
          duration: 6000
        });
      } else {
        // Try alternative provider automatically
        const alternativeProvider = provider === 'serpapi' ? 'serpstack' : 'serpapi';
        toast.error(`${providerName} returned no data, trying ${alternativeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}...`);
        
        if (!providerData[alternativeProvider]) {
          setActiveProvider(alternativeProvider);
          await fetchFromProvider(alternativeProvider);
        }
      }
    } catch (error: any) {
      console.error(`💥 Error fetching from ${provider}:`, error);
      
      // Attempt fallback to other provider
      const alternativeProvider = provider === 'serpapi' ? 'serpstack' : 'serpapi';
      
      if (!providerData[alternativeProvider]) {
        toast.error(`${provider === 'serpapi' ? 'SerpAPI' : 'Serpstack'} failed, trying ${alternativeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}...`);
        
        try {
          setActiveProvider(alternativeProvider);
          await fetchFromProvider(alternativeProvider);
        } catch (fallbackError) {
          console.error(`💥 Both providers failed:`, fallbackError);
          toast.error(`Both providers failed. Please check your API keys and try again later.`);
        }
      } else {
        // Switch to provider that has data
        setActiveProvider(alternativeProvider);
        toast.error(`${provider === 'serpapi' ? 'SerpAPI' : 'Serpstack'} failed, switched to ${alternativeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}`);
      }
    } finally {
      setIsLoadingProvider(false);
    }
  };

  // Function to switch provider with smart data checking
  const switchProvider = (provider: 'serpapi' | 'serpstack') => {
    console.log(`🔄 Switching to provider: ${provider}`);
    setActiveProvider(provider);
    
    // If we don't have data for this provider, fetch it
    if (!providerData[provider]) {
      console.log(`📊 No data found for ${provider}, fetching...`);
      fetchFromProvider(provider);
    } else {
      console.log(`✅ Using existing data for ${provider}`);
      // Update parent with existing data
      onSerpDataUpdate?.(providerData[provider]);
      
      // Show success message with data stats
      const data = providerData[provider];
      const dataStats = {
        faqs: data?.peopleAlsoAsk?.length || 0,
        entities: data?.entities?.length || 0,
        competitors: data?.topResults?.length || 0
      };
      
      toast.success(`Switched to ${provider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}`, {
        description: `${dataStats.faqs} FAQs • ${dataStats.entities} entities • ${dataStats.competitors} competitors`,
        duration: 3000
      });
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-background/95 backdrop-blur-xl border border-border shadow-2xl z-50">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        </div>

        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg backdrop-blur-sm border border-white/10">
                <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  SERP Analysis
                </div>
                <div className="text-sm text-gray-400 font-mono">{keyword}</div>
              </div>
            </motion.div>
            
            {/* API Provider Selector */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-xs text-gray-400 font-medium">Data Source:</div>
              <div className="flex bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={activeProvider === 'serpapi' ? 'default' : 'ghost'}
                  onClick={() => switchProvider('serpapi')}
                  disabled={isLoadingProvider}
                  className={`text-xs h-8 px-3 transition-all duration-300 ${
                    activeProvider === 'serpapi' 
                      ? 'bg-gradient-to-r from-primary/30 to-blue-500/30 text-white border border-white/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isLoadingProvider && activeProvider === 'serpapi' ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Database className="h-3 w-3 mr-1" />
                  )}
                  SerpAPI
                  {providerData.serpapi && (
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full ml-1" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant={activeProvider === 'serpstack' ? 'default' : 'ghost'}
                  onClick={() => switchProvider('serpstack')}
                  disabled={isLoadingProvider}
                  className={`text-xs h-8 px-3 transition-all duration-300 ${
                    activeProvider === 'serpstack' 
                      ? 'bg-gradient-to-r from-primary/30 to-blue-500/30 text-white border border-white/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isLoadingProvider && activeProvider === 'serpstack' ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Database className="h-3 w-3 mr-1" />
                  )}
                  Serpstack
                  {providerData.serpstack && (
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full ml-1" />
                  )}
                </Button>
              </div>
            </motion.div>
            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 px-3 py-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                  <span className="font-mono">{selectedCount}</span>
                  <span>selected</span>
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEnhancedModal(true)}
                  className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30 hover:bg-purple-500/30"
                >
                  <Database className="h-3 w-3 mr-1" />
                  Enhanced View
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogTitle>
      </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden relative z-10">
          <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-sm border border-white/10 p-1 rounded-xl">
            {tabs.map((tab, index) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="relative flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/5 data-[state=active]:border-white/20 transition-all duration-300 rounded-lg group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className={`p-1 rounded bg-gradient-to-r ${tab.color} bg-opacity-20`}>
                    <tab.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <Badge variant="outline" className="ml-1 text-xs bg-white/10 border-white/20 text-white font-mono">
                      {tab.count}
                    </Badge>
                  )}
                  {/* Show capability indicator for active tab */}
                  {activeTab === tab.id && tab.capability && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="text-[9px] text-gray-400 bg-black/40 px-2 py-1 rounded border border-white/10">
                        {tab.capability}
                      </div>
                    </div>
                  )}
                </motion.div>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg -z-10"
                    layoutId="activeTabBackground"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-6 h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeProvider}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLoadingProvider ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-lg font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Loading {activeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'} data...
                      </p>
                      <p className="text-sm text-gray-400">
                        Fetching fresh SERP analysis
                      </p>
                    </div>
                  </div>
                ) : !currentSerpData ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center max-w-md">
                      <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        No data available for "{keyword}"
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {keyword ? 
                          `No SERP data available from ${activeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}. We'll try both providers to get the best data.` :
                          'Please enter a keyword first to analyze SERP data.'
                        }
                      </p>
                      {keyword && (
                        <div className="space-y-3">
                          <Button 
                            onClick={() => fetchFromProvider(activeProvider)}
                            className="bg-primary hover:bg-primary/90 w-full"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry {activeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}
                          </Button>
                          
                          <Button 
                            onClick={() => {
                              const alternativeProvider = activeProvider === 'serpapi' ? 'serpstack' : 'serpapi';
                              switchProvider(alternativeProvider);
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Try {activeProvider === 'serpapi' ? 'Serpstack' : 'SerpAPI'} Instead
                          </Button>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 Tip: Different providers may have different rate limits and data coverage
                          </p>
                        </div>
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
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
        
        <motion.div 
          className="flex justify-between items-center pt-4 border-t border-white/10 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-mono">{selectedCount}</span>
            <span>items selected for content generation</span>
          </div>
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-primary/20 to-blue-500/20 hover:from-primary/30 hover:to-blue-500/30 border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            Done
          </Button>
        </motion.div>
        
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
