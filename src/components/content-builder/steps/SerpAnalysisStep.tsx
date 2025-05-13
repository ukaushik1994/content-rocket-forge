
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SerpAnalysisHeader } from '../serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '../serp/SerpAnalysisPanel';
import { SerpAnalysisOverview } from '../serp/SerpAnalysisOverview';
import { SerpLoadingState } from '../serp/SerpLoadingState';
import { RegionSelector } from '../keyword/RegionSelector';
import { SelectedItemsContent, SelectedItemsSidebar } from './serp-analysis';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, navigateToStep } = useContentBuilder();
  const [showAllData, setShowAllData] = useState(false);
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');

  // Run initial keyword analysis if it hasn't been done yet
  useEffect(() => {
    const performAnalysis = async () => {
      if (state.mainKeyword && !state.serpData) {
        await analyzeKeyword(state.mainKeyword, state.selectedRegions || ['us']);
        dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
      }
      setIsLoadingInit(false);
    };

    performAnalysis();
  }, [state.mainKeyword, state.serpData, state.selectedRegions, analyzeKeyword, dispatch]);

  const handleRunAnalysis = async () => {
    if (state.mainKeyword) {
      dispatch({ type: 'SET_IS_ANALYZING', payload: true });
      await analyzeKeyword(state.mainKeyword, state.selectedRegions || ['us']);
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };

  const handleNextStep = () => {
    navigateToStep(3);
  };

  if (isLoadingInit || !state.mainKeyword) {
    return <SerpLoadingState isLoading={true} />;
  }

  return (
    <div className="space-y-6">
      <SerpAnalysisHeader 
        mainKeyword={state.mainKeyword}
        isAnalyzing={state.isAnalyzing}
        onAnalyze={handleRunAnalysis}
        hasSelections={state.serpSelections.filter(s => s.selected).length > 0}
        onNextStep={handleNextStep}
        showAllData={showAllData}
        onToggleAllData={() => setShowAllData(!showAllData)}
      />
      
      {/* SERP Analysis Region Selector */}
      <div className="mb-4">
        <RegionSelector 
          selectedRegions={state.selectedRegions || ['us']}
          onChange={(regions) => dispatch({ type: 'SET_SELECTED_REGIONS', payload: regions })}
        />
      </div>

      {/* SERP Analysis Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {state.isAnalyzing ? (
            <SerpLoadingState isLoading={true} />
          ) : (
            <Tabs 
              defaultValue="overview" 
              value={currentTab}
              onValueChange={setCurrentTab}
              className="w-full"
            >
              <TabsList className="w-full mb-4">
                <TabsTrigger value="overview" className="w-full">Overview</TabsTrigger>
                <TabsTrigger value="data" className="w-full">Data</TabsTrigger>
                <TabsTrigger value="selections" className="w-full">Selections ({state.serpSelections.filter(s => s.selected).length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="m-0">
                <SerpAnalysisOverview 
                  serpData={state.serpData}
                  selections={state.serpSelections}
                  maxItemsToShow={showAllData ? 50 : 5}
                />
              </TabsContent>
              
              <TabsContent value="data" className="m-0">
                <SerpAnalysisPanel 
                  serpData={state.serpData} 
                  maxItemsToShow={showAllData ? 50 : 10}
                  mainKeyword={state.mainKeyword}
                  isLoading={false}
                />
              </TabsContent>
              
              <TabsContent value="selections" className="m-0">
                <SelectedItemsContent 
                  serpSelections={state.serpSelections.filter(s => s.selected)}
                  selectedTab="all"
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <div>
          <SelectedItemsSidebar 
            serpSelections={state.serpSelections.filter(s => s.selected)}
            onGenerateOutline={handleNextStep}
          />
        </div>
      </div>
    </div>
  );
};
