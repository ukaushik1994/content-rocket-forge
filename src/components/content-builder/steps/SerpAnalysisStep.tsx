
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Import our newly created components
import { SerpAnalysisHeader } from '../serp/SerpAnalysisHeader';
import { SerpLoadingState } from '../serp/SerpLoadingState';
import { SerpAnalysisOverview } from '../serp/SerpAnalysisOverview';
import { SerpQuestionsList } from '../serp/SerpQuestionsList';
import { SerpKeywordList } from '../serp/SerpKeywordList';
import { SerpSnippetsList } from '../serp/SerpSnippetsList';
import { SerpCompetitorsList } from '../serp/SerpCompetitorsList';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, addContentFromSerp, generateOutlineFromSelections, navigateToStep } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections } = state;
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Automatically start analysis if we have a mainKeyword but no serpData
    if (mainKeyword && !serpData && !isAnalyzing) {
      analyzeKeyword(mainKeyword);
    }
    
    // Mark as complete if we have serpData
    if (serpData) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    }
  }, [mainKeyword, serpData, isAnalyzing]);
  
  const handleReanalyze = () => {
    if (mainKeyword) {
      analyzeKeyword(mainKeyword);
    } else {
      toast.error('No keyword selected for analysis');
    }
  };

  const handleToggleSelection = (type: string, content: string) => {
    // Find the item in serpSelections to get its current selected state
    const item = serpSelections.find(item => item.type === type && item.content === content);
    
    // Fix: Include the selected property in the payload, toggling its current value
    dispatch({ 
      type: 'TOGGLE_SERP_SELECTION', 
      payload: { 
        type, 
        content,
        selected: item ? !item.selected : true,  // Toggle the current value or default to true if not found
        source: item?.source // Preserve the source if it exists
      } 
    });
  };

  const handleContinueWithSelections = () => {
    const selectedCount = serpSelections.filter(item => item.selected).length;
    
    if (selectedCount === 0) {
      toast.warning('Please select at least one item to continue');
      return;
    }
    
    generateOutlineFromSelections();
  };
  
  // Count selected items by type
  const selectedCounts = {
    question: serpSelections.filter(s => s.type === 'question' && s.selected).length,
    keyword: serpSelections.filter(s => s.type === 'keyword' && s.selected).length,
    snippet: serpSelections.filter(s => s.type === 'snippet' && s.selected).length,
    competitor: serpSelections.filter(s => s.type === 'competitor' && s.selected).length,
  };

  const totalSelected = Object.values(selectedCounts).reduce((a, b) => a + b, 0);

  // Get serp data by type
  const getItemsByType = (type: string) => {
    return serpSelections.filter(item => item.type === type);
  };
  
  return (
    <div className="space-y-6">
      <SerpAnalysisHeader 
        mainKeyword={mainKeyword}
        isAnalyzing={isAnalyzing}
        totalSelected={totalSelected}
        handleReanalyze={handleReanalyze}
        handleContinueWithSelections={handleContinueWithSelections}
      />
      
      {isAnalyzing || !serpData ? (
        // Fix: Pass isAnalyzing prop to SerpLoadingState
        <SerpLoadingState 
          isLoading={isAnalyzing} 
          navigateToStep={navigateToStep} 
        />
      ) : (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">
              Questions
              {selectedCounts.question > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedCounts.question}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="keywords">
              Keywords
              {selectedCounts.keyword > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedCounts.keyword}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="snippets">
              Snippets
              {selectedCounts.snippet > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedCounts.snippet}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="competitors">
              Competitors
              {selectedCounts.competitor > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedCounts.competitor}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <SerpAnalysisOverview
              serpData={serpData}
              selectedCounts={selectedCounts}
              totalSelected={totalSelected}
              getItemsByType={getItemsByType}
              handleToggleSelection={handleToggleSelection}
            />
          </TabsContent>
          
          <TabsContent value="questions">
            <SerpQuestionsList 
              questions={getItemsByType('question')}
              handleToggleSelection={handleToggleSelection}
            />
          </TabsContent>
          
          <TabsContent value="keywords">
            <SerpKeywordList 
              keywords={getItemsByType('keyword')}
              handleToggleSelection={handleToggleSelection}
            />
          </TabsContent>
          
          <TabsContent value="snippets">
            <SerpSnippetsList 
              snippets={getItemsByType('snippet')}
              handleToggleSelection={handleToggleSelection}
              addContentFromSerp={addContentFromSerp}
            />
          </TabsContent>
          
          <TabsContent value="competitors">
            <SerpCompetitorsList 
              competitors={getItemsByType('competitor')}
              handleToggleSelection={handleToggleSelection}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
