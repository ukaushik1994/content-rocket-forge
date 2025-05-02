
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { SerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, addContentFromSerp } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing } = state;
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">SERP Analysis for: {mainKeyword}</h3>
          <p className="text-sm text-muted-foreground">
            Analyze search engine results to optimize your content.
          </p>
        </div>
        
        <Button
          onClick={handleReanalyze}
          variant="outline"
          disabled={isAnalyzing || !mainKeyword}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Refresh Analysis'
          )}
        </Button>
      </div>
      
      <SerpAnalysisPanel
        serpData={serpData}
        isLoading={isAnalyzing}
        mainKeyword={mainKeyword}
        onAddToContent={addContentFromSerp}
      />
    </div>
  );
};
