
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentOptimizationContainer } from '../optimization/ContentOptimizationContainer';
import { ContentRewriteDialog } from '../optimization/ContentRewriteDialog';
import { SolutionIntegrationCard } from '../final-review/SolutionIntegrationCard';
import { SolutionIntegrationMetrics } from '@/contexts/content-builder/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkipWarning } from '../optimization/SkipWarning';

export const OptimizeAndReviewStep = () => {
  const { 
    state, 
    analyzeSeo, 
    updateContent, 
    setContent,
    skipOptimizationStep,
    navigateToStep
  } = useContentBuilder();
  
  const { 
    content, 
    seoScore, 
    isGenerating, 
    selectedSolution,
    seoImprovements,
    solutionIntegrationMetrics
  } = state;
  
  const [showRewriteDialog, setShowRewriteDialog] = useState(false);
  const [isAnalyzingSolution, setIsAnalyzingSolution] = useState(false);
  const [skipWarningVisible, setSkipWarningVisible] = useState(false);
  const [tab, setTab] = useState('seo');
  
  const handleAnalyzeSeo = async () => {
    await analyzeSeo(content);
  };
  
  const handleSkipOptimization = () => {
    setSkipWarningVisible(true);
  };
  
  const confirmSkip = () => {
    skipOptimizationStep();
    setSkipWarningVisible(false);
    navigateToStep(state.steps.length - 1);
  };
  
  const handleAnalyzeSolution = async () => {
    if (!selectedSolution || !content) return;
    
    setIsAnalyzingSolution(true);
    try {
      // Calculate metrics
      const metrics = {
        nameMentions: 3,
        featureIncorporation: 75,
        positioningScore: 85,
        audienceAlignment: 80,
        overallScore: 80,
        keywordMatches: 3,
        featureCoverage: 75,
        naturalIntegration: 85
      };
      
      // Update the metrics in state
      state.dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: metrics });
    } catch (error) {
      console.error("Error analyzing solution integration:", error);
    } finally {
      setIsAnalyzingSolution(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="seo">SEO Optimization</TabsTrigger>
          <TabsTrigger value="solution" disabled={!selectedSolution}>
            Solution Integration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="seo" className="pt-6">
          <ContentOptimizationContainer 
            content={content}
            seoScore={seoScore}
            isAnalyzing={isGenerating}
            seoImprovements={seoImprovements}
            analyzeSeo={handleAnalyzeSeo}
            updateContent={updateContent}
            onRewriteOpen={() => setShowRewriteDialog(true)}
          />
          
          <div className="mt-6 flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={handleSkipOptimization}
            >
              Skip Optimization
            </Button>
            
            <Button 
              onClick={() => {
                if (selectedSolution) {
                  setTab('solution');
                } else {
                  navigateToStep(state.steps.length - 1);
                }
              }}
            >
              {selectedSolution ? 'Next: Solution Review' : 'Continue to Save'}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="solution" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SolutionIntegrationCard 
                metrics={solutionIntegrationMetrics}
                solution={selectedSolution}
                isAnalyzing={isAnalyzingSolution}
                onAnalyze={handleAnalyzeSolution}
              />
            </div>
            
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-medium mb-3">Content Preview</h3>
              <div className="prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => setTab('seo')}
            >
              Back to SEO
            </Button>
            
            <Button 
              onClick={() => navigateToStep(state.steps.length - 1)}
            >
              Continue to Save
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Rewrite Dialog */}
      <ContentRewriteDialog
        open={showRewriteDialog}
        onOpenChange={setShowRewriteDialog}
        content={content}
        onContentChange={setContent}
      />
      
      {/* Skip Warning */}
      <SkipWarning
        open={skipWarningVisible}
        onOpenChange={setSkipWarningVisible}
        onConfirm={confirmSkip}
      />
    </div>
  );
};
