
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { KeywordSuggestions } from '../keyword/KeywordSuggestions';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { ClusterSelection } from '../keyword/ClusterSelection';
import { SavedKeywords } from '../keyword/SavedKeywords';
import { SerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { ContentCluster } from '@/contexts/content-builder/types';
import { Loader2, Search, ChevronRight, Sparkles } from 'lucide-react';

// Mock data for clusters until we integrate with backend
const mockClusters: ContentCluster[] = [{
  id: '1',
  name: 'SEO Optimization',
  keywords: ['seo strategy', 'keyword research', 'backlink building', 'content optimization']
}, {
  id: '2',
  name: 'Content Marketing',
  keywords: ['blog strategy', 'content planning', 'editorial calendar', 'content distribution']
}, {
  id: '3',
  name: 'Social Media',
  keywords: ['social media marketing', 'engagement strategies', 'social analytics', 'platform optimization']
}];

export const KeywordSelectionStep = () => {
  const {
    state,
    dispatch,
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections
  } = useContentBuilder();
  
  const {
    mainKeyword,
    selectedKeywords,
    selectedCluster,
    serpData,
    isAnalyzing
  } = state;
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [clusters, setClusters] = useState<ContentCluster[]>(mockClusters);
  const [activeTab, setActiveTab] = useState('research');
  
  useEffect(() => {
    // Check if we have completed the requirements to move forward
    if (mainKeyword && selectedKeywords.length > 0) {
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 0
      });

      // Also mark SERP analysis step as completed
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 2
      });
    }
  }, [mainKeyword, selectedKeywords, dispatch]);
  
  const handleKeywordSearch = async (keyword: string, searchSuggestions: string[]) => {
    setSuggestions(searchSuggestions);

    // Set the main keyword
    dispatch({
      type: 'SET_MAIN_KEYWORD',
      payload: keyword
    });

    // Add it to selected keywords if not already there
    if (!selectedKeywords.includes(keyword)) {
      dispatch({
        type: 'ADD_KEYWORD',
        payload: keyword
      });
    }

    // Automatically start SERP analysis when a keyword is entered
    await analyzeKeyword(keyword);
  };
  
  const handleAddKeyword = (kw: string) => {
    dispatch({
      type: 'ADD_KEYWORD',
      payload: kw
    });
  };
  
  const handleRemoveKeyword = (kw: string) => {
    dispatch({
      type: 'REMOVE_KEYWORD',
      payload: kw
    });
  };
  
  const handleSelectCluster = (cluster: ContentCluster) => {
    dispatch({
      type: 'SELECT_CLUSTER',
      payload: cluster
    });
  };
  
  const handleClearCluster = () => {
    dispatch({
      type: 'SELECT_CLUSTER',
      payload: null
    });
  };
  
  return (
    <div className="space-y-8">
      {/* Header with animation */}
      <div className="relative overflow-hidden rounded-lg glass-panel border border-white/10 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Start Your Content Journey</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your main keyword below to analyze search trends and discover content opportunities
          </p>
        </div>
      </div>
      
      {/* Keyword search section */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="main-keyword" className="text-base font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Main Keyword
            </Label>
            <div className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
              Power your content with the right keywords
            </div>
          </div>
          <div className="backdrop-blur-sm bg-white/5 rounded-lg p-0.5 border border-white/10 shadow-inner">
            <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Suggestions */}
            <div className="animate-fade-in">
              <KeywordSuggestions suggestions={suggestions} onAddKeyword={handleAddKeyword} />
            </div>
            
            {/* Selected Keywords */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <SelectedKeywords keywords={selectedKeywords} onRemoveKeyword={handleRemoveKeyword} />
            </div>
          </div>
          
          {/* Right column for saved keywords or clusters */}
          <div className="space-y-4">
            <div className="glass-panel border border-white/10 rounded-lg p-4 shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                Content Strategy Tips
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="bg-primary/20 text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5">1</span>
                  <span>Choose a primary keyword with good search volume</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary/20 text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5">2</span>
                  <span>Select related keywords to expand your content's reach</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary/20 text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5">3</span>
                  <span>Analyze SERP data to understand what content performs best</span>
                </li>
              </ul>
            </div>
            
            <SavedKeywords />
          </div>
        </div>
        
        {/* SERP Analysis Section */}
        {mainKeyword && (
          <div className="mt-8 border-t border-white/10 pt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-1 bg-primary rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">SERP Analysis Results</h3>
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
              <div className="h-1 w-1 bg-primary rounded-full"></div>
            </div>
            
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-30 pointer-events-none rounded-lg"></div>
              
              <SerpAnalysisPanel 
                serpData={serpData} 
                isLoading={isAnalyzing} 
                mainKeyword={mainKeyword} 
                onAddToContent={addContentFromSerp} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
