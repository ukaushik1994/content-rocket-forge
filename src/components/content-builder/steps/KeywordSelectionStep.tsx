
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { KeywordSuggestions } from '../keyword/KeywordSuggestions';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { ClusterSelection } from '../keyword/ClusterSelection';
import { SavedKeywords } from '../keyword/SavedKeywords';
import { SerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { ContentCluster } from '@/contexts/content-builder/types';
import { Loader2 } from 'lucide-react';

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

  return <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="research">Keyword Research</TabsTrigger>
          <TabsTrigger value="clusters">Keyword Clusters</TabsTrigger>
          <TabsTrigger value="saved">Saved Keywords</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="main-keyword">Main Keyword</Label>
              <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
            </div>

            <KeywordSuggestions suggestions={suggestions} onAddKeyword={handleAddKeyword} />

            <SelectedKeywords keywords={selectedKeywords} onRemoveKeyword={handleRemoveKeyword} />
            
            {mainKeyword && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">SERP Analysis Results</h3>
                <SerpAnalysisPanel 
                  serpData={serpData} 
                  isLoading={isAnalyzing} 
                  mainKeyword={mainKeyword}
                  onAddToContent={addContentFromSerp}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-6 pt-4">
          <ClusterSelection 
            clusters={clusters} 
            selectedCluster={selectedCluster} 
            onSelectCluster={handleSelectCluster} 
            onClearCluster={handleClearCluster} 
          />
        </TabsContent>

        <TabsContent value="saved" className="pt-4">
          <SavedKeywords />
        </TabsContent>
      </Tabs>
    </div>;
};
