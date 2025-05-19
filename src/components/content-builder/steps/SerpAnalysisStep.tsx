
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SerpAnalysisHeader } from '../serp/SerpAnalysisHeader';
import { SerpLoadingState } from '../serp/loading-state';
import { SerpAnalysisPanel } from '../serp/SerpAnalysisPanel';
import { SerpApiKeySetup } from '../serp/SerpApiKeySetup';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { SelectedItemsContent } from './serp-analysis/SelectedItemsContent';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';

// Add mock props for components that need them
interface SerpApiKeySetupProps {
  onApiKeySet: () => void;
}

interface SerpLoadingStateProps {
  keyword?: string;
  onCancel?: () => void;
}

interface SerpAnalysisHeaderProps {
  keyword?: string;
  totalSelected?: number;
  onGenerateOutline?: () => void;
  onSkip?: () => void;
}

interface SelectedItemsContentProps {
  selectedCounts?: any;
  totalSelected?: number;
  onGenerateOutline?: () => void;
}

export const SerpAnalysisStep = () => {
  const { state, analyzeKeyword, generateOutlineFromSelections, navigateToStep } = useContentBuilder();
  const { mainKeyword, isAnalyzing, serpSelections = [] } = state;
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [apiKeyChecked, setApiKeyChecked] = useState(false);
  
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  // Handle analyzing the main keyword
  useEffect(() => {
    const checkApiKey = async () => {
      // In a real implementation, you would check if the API key is set
      // For demo purposes, we'll just set it to true
      setApiKeyChecked(true);
      
      if (mainKeyword && !state.serpData) {
        await analyzeKeyword(mainKeyword);
      }
    };
    
    checkApiKey();
  }, [mainKeyword, analyzeKeyword, state.serpData]);
  
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  const handleGenerateOutline = () => {
    generateOutlineFromSelections();
  };
  
  const handleSkip = () => {
    navigateToStep(3); // Navigate to Outline step
  };
  
  // If SERP API key is not set, show the setup screen
  if (!apiKeyChecked) {
    return <SerpApiKeySetup onApiKeySet={() => setApiKeyChecked(true)} />;
  }
  
  // If currently analyzing, show loading state
  if (isAnalyzing) {
    return (
      <SerpLoadingState 
        keyword={mainKeyword} 
        onCancel={() => console.log('Cancel analysis')} 
      />
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SerpAnalysisHeader 
        keyword={mainKeyword}
        totalSelected={totalSelected}
        onGenerateOutline={handleGenerateOutline}
        onSkip={handleSkip}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex mt-6">
        {/* Main content - SERP Analysis */}
        <div className={`transition-all duration-300 ease-in-out ${showSidebar ? 'w-2/3 pr-6' : 'w-full'}`}>
          <SerpAnalysisPanel 
            serpData={state.serpData ? {
              ...state.serpData,
              keyword: state.serpData.query // Add the keyword property expected by SerpAnalysisResult
            } : null} 
            isLoading={false}
            mainKeyword={mainKeyword}
            onAddToContent={() => {}}
          />
        </div>
        
        {/* Selections sidebar */}
        {showSidebar && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-1/3 border-l pl-6"
          >
            <SelectedItemsSidebar 
              selectedCounts={selectedCounts} 
              totalSelected={totalSelected} 
              serpSelections={serpSelections}
              handleToggleSelection={() => {}}
            />
          </motion.div>
        )}
        
        {/* Mobile sidebar toggle */}
        <Button 
          variant="outline" 
          size="icon"
          className="fixed bottom-6 right-6 z-10 md:hidden rounded-full shadow-lg"
          onClick={handleToggleSidebar}
        >
          <LayoutGrid size={20} />
        </Button>
      </div>
      
      {/* Selection content (mobile view) */}
      <div className="md:hidden mt-6">
        {!showSidebar && totalSelected > 0 && (
          <SelectedItemsContent 
            selectedCounts={selectedCounts}
            totalSelected={totalSelected}
            onGenerateOutline={handleGenerateOutline}
          />
        )}
      </div>
    </div>
  );
};
