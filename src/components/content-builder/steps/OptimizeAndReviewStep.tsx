
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordOptimizationCard } from './optimize/KeywordOptimizationCard';
import { ContentPreviewCard } from './optimize/ContentPreviewCard';
import { ReadabilityCard } from './optimize/ReadabilityCard';
import { SolutionIntegrationCard } from './optimize/SolutionIntegrationCard';
import { CheckCircle, Save, ArrowRight, FileText } from 'lucide-react';
import { useFinalReview } from '@/hooks/useFinalReview';
import { SeoMetaCard } from './optimize/SeoMetaCard';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { toast } from 'sonner';

export const OptimizeAndReviewStep = () => {
  const { state, dispatch, navigateToStep } = useContentBuilder();
  const { content, mainKeyword } = state;

  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState(state.contentTitle || `${mainKeyword} - Content`);
  const [saveNote, setSaveNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const {
    keywordUsage,
    generateMeta,
  } = useFinalReview();
  
  // Handle save to draft functionality
  const handleSaveToDraft = async () => {
    if (!content || !saveTitle) {
      toast.error('Content and title are required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      toast.success('Content saved to drafts');
      setShowSaveDialog(false);
      
      // Mark step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle skip optimization
  const handleSkipOptimization = () => {
    dispatch({ type: 'SET_OPTIMIZATION_SKIPPED', payload: true });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    toast.info('Optimization step skipped and marked as completed');
    console.info('Optimization step skipped and marked as completed');
  };
  
  // Handle continue to next step
  const handleContinue = () => {
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    navigateToStep(6); // Navigate to Publishing step
  };

  return (
    <div className="space-y-6">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Optimization Cards */}
        <div className="lg:col-span-1 space-y-6">
          <KeywordOptimizationCard keywordUsage={keywordUsage} />
          <ReadabilityCard content={content} />
          {state.selectedSolution && (
            <SolutionIntegrationCard />
          )}
          <SeoMetaCard />
        </div>
        
        {/* Right Column - Content Preview */}
        <div className="lg:col-span-2">
          <ContentPreviewCard content={content} />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={() => setShowSaveDialog(true)}
          className="gap-2 bg-white/5 w-full sm:w-auto"
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="ghost"
            onClick={handleSkipOptimization}
            className="border border-white/10 w-full sm:w-auto"
          >
            Skip Optimization
          </Button>
          
          <Button 
            onClick={handleContinue}
            className="gap-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all w-full sm:w-auto"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Save Dialog */}
      <SaveContentDialog
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        saveTitle={saveTitle}
        setSaveTitle={setSaveTitle}
        saveNote={saveNote}
        setSaveNote={setSaveNote}
        handleSaveToDraft={handleSaveToDraft}
        isSaving={isSaving}
        mainKeyword={mainKeyword}
        content={content}
        outlineLength={state.outline.length}
      />
    </div>
  );
};
