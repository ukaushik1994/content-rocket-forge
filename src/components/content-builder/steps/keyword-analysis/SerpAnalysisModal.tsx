
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
  const [providerData, setProviderData] = useState<{
    serpapi: SerpAnalysisResult | null;
    serpstack: SerpAnalysisResult | null;
  }>({
    serpapi: serpData,
    serpstack: null
  });
  
  // Get current data based on active provider
  const currentSerpData = providerData[activeProvider];
  
  if (!currentSerpData && !isLoadingProvider) {
    return null;
  }

  const selectedCount = serpSelections.filter(item => item.selected).length;

  // Function to fetch data from alternative provider
  const fetchFromProvider = async (provider: 'serpapi' | 'serpstack') => {
    setIsLoadingProvider(true);
    try {
      const apiProvider = provider === 'serpapi' ? 'serp' : 'serpstack';
      const data = await analyzeKeywordSerp(keyword, true, apiProvider);
      
      if (data) {
        setProviderData(prev => ({
          ...prev,
          [provider]: data
        }));
        
        // If this is the active provider, notify parent
        if (provider === activeProvider) {
          onSerpDataUpdate?.(data);
        }
        
        toast.success(`Successfully loaded data from ${provider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}`);
      } else {
        toast.error(`Failed to load data from ${provider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}`);
      }
    } catch (error) {
      console.error(`Error fetching from ${provider}:`, error);
      toast.error(`Error loading data from ${provider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}`);
    } finally {
      setIsLoadingProvider(false);
    }
  };

  // Function to switch provider
  const switchProvider = (provider: 'serpapi' | 'serpstack') => {
    setActiveProvider(provider);
    
    // If we don't have data for this provider, fetch it
    if (!providerData[provider]) {
      fetchFromProvider(provider);
    } else {
      // Update parent with existing data
      onSerpDataUpdate?.(providerData[provider]);
    }
  };
  
  const tabs = [
    { id: 'questions', label: 'FAQ Questions', icon: HelpCircle, count: currentSerpData?.peopleAlsoAsk?.length || 0, color: 'from-purple-500 to-pink-500' },
    { id: 'headings', label: 'SERP Headings', icon: Heading, count: currentSerpData?.headings?.length || 0, color: 'from-green-500 to-emerald-500' },
    { id: 'gaps', label: 'Content Gaps', icon: Star, count: currentSerpData?.contentGaps?.length || 0, color: 'from-orange-500 to-red-500' },
    { id: 'keywords', label: 'Keywords', icon: Tag, count: currentSerpData?.keywords?.length || 0, color: 'from-indigo-500 to-purple-500' },
    { id: 'related', label: 'Related Searches', icon: Search, count: currentSerpData?.relatedSearches?.length || 0, color: 'from-teal-500 to-cyan-500' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/20 shadow-2xl">
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
                    <div className="text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-lg font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                        No data from {activeProvider === 'serpapi' ? 'SerpAPI' : 'Serpstack'}
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        Click the button above to fetch data from this provider
                      </p>
                      <Button 
                        onClick={() => fetchFromProvider(activeProvider)}
                        className="bg-gradient-to-r from-primary/20 to-blue-500/20 hover:from-primary/30 hover:to-blue-500/30 border border-white/20"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Fetch Data
                      </Button>
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
      </DialogContent>
    </Dialog>
  );
}
