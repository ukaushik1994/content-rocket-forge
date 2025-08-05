
import React, { useState, useEffect } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinalReview } from '@/hooks/useFinalReview';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OverviewTab } from '../final-review/tabs/OverviewTab';
import { TechnicalTabContent } from '../final-review/tabs/TechnicalTabContent';
import { RepurposeTab } from '../final-review/tabs/RepurposeTab';
import { FinalReviewQuickActions } from '../final-review/FinalReviewQuickActions';
import { SaveAndExportPanel } from '../final-review/SaveAndExportPanel';
import { useSaveContent } from '@/hooks/final-review/useSaveContent';
import { useChecklistItems } from '../final-review/hooks/useChecklistItems';
import { toast } from 'sonner';
import { 
  generateContentWithTemplate, 
  generateContentByFormatType 
} from '@/services/contentTemplateService';
import { sendChatRequest } from '@/services/aiService';

export const OptimizeAndReviewStep = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { state, dispatch } = useContentBuilder();
  const [generatedFormats, setGeneratedFormats] = useState<Record<string, string>>({});
  
  const {
    isAnalyzing,
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage,
    ctaInfo,
    titleSuggestions,
    serpData,
    generateMeta,
    generateTitleSuggestions,
    analyzeSolutionUsage,
    runAllChecks
  } = useFinalReview();
  
  const { isSaving, isSavedToDraft, handleSaveToDraft, handlePublish } = useSaveContent();
  const { checklistItems, passedChecks, totalChecks, completionPercentage } = useChecklistItems();
  
  // Debug the state when component loads
  useEffect(() => {
    console.log("OptimizeAndReviewStep - Current state:", {
      content: state.content?.substring(0, 50) + '...',
      mainKeyword: state.mainKeyword,
      metaTitle: state.metaTitle,
      metaDescription: state.metaDescription,
      selectedKeywords: state.selectedKeywords,
      seoScore: state.seoScore
    });
  }, [state]);
  
  // Handler for running checks specific to the current tab
  const handleRunTabChecks = () => {
    switch(activeTab) {
      case 'overview':
        runAllChecks();
        break;
      case 'technical':
        generateTitleSuggestions();
        break;
      default:
        runAllChecks();
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const onMetaTitleChange = (value: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: value });
  };
  
  const onMetaDescriptionChange = (value: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: value });
  };

  // Updated function to handle repurposing content with multiple formats using templates
  const handleRepurposeContent = async (contentTypes: string[]) => {
    if (contentTypes.length === 0) {
      toast.error("Please select at least one content format");
      return;
    }
    
    toast.info(`Repurposing content to ${contentTypes.length} format(s)`);
    
    const newGeneratedFormats: Record<string, string> = { ...generatedFormats };
    
    try {
      for (const contentType of contentTypes) {
        toast.info(`Processing: ${contentType} format`);
        
        // Try to generate content using a template for this format type
        const generatedContent = await generateContentByFormatType(
          contentType,
          state.contentTitle || state.mainKeyword,
          {
            content: state.content?.substring(0, 1500) || '',
            keyword: state.mainKeyword
          }
        );
        
        if (generatedContent) {
          newGeneratedFormats[contentType] = generatedContent;
        } else {
          // Fallback to generic generation if no template or generation failed
          const response = await sendChatRequest('openrouter', {
            messages: [
              { 
                role: 'system', 
                content: 'You are an expert content repurposing specialist. Transform the provided content into the requested format while maintaining its core message and value.' 
              },
              { 
                role: 'user', 
                content: `Transform this content titled "${state.contentTitle}" for the ${contentType} format.
                          Content: ${state.content?.substring(0, 1500)}...
                          
                          Make it appropriate for the ${contentType} format with all necessary elements.`
              }
            ]
          });
          
          if (response?.choices?.[0]?.message?.content) {
            newGeneratedFormats[contentType] = response.choices[0].message.content;
          } else {
            toast.error(`Failed to generate content for ${contentType} format`);
          }
        }
      }
      
      setGeneratedFormats(newGeneratedFormats);
      
    } catch (error) {
      console.error("Error repurposing content:", error);
      toast.error("Failed to repurpose content");
    }
  };
  
  // Wrapper functions to convert Promise<string | null> to Promise<void>
  const handleSaveToDraftWrapper = async () => {
    try {
      await handleSaveToDraft();
      // Don't need to return anything for void
    } catch (error) {
      console.error("Error saving to draft:", error);
      toast.error("Failed to save to draft");
    }
  };
  
  const handlePublishWrapper = async () => {
    try {
      await handlePublish();
      // Don't need to return anything for void
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Failed to publish content");
    }
  };
  
  return (
    <div className="space-y-8">
      <SaveAndExportPanel 
        completionPercentage={completionPercentage}
        onSave={handleSaveToDraftWrapper}
        onPublish={handlePublishWrapper}
        isSaving={isSaving}
        isSavedToDraft={isSavedToDraft}
      />
      
      <FinalReviewQuickActions 
        isRunningAllChecks={isRunningAllChecks}
        onRunAllChecks={runAllChecks}
        activeTab={activeTab}
        onRunTabChecks={handleRunTabChecks}
      />
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-2 w-full gap-4 h-auto p-1 bg-transparent">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="technical"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            Technical
          </TabsTrigger>
          <TabsTrigger 
            value="repurpose"
            className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
          >
            Repurpose
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab
            content={state.content}
            checklistItems={checklistItems}
            onRunAllChecks={runAllChecks}
            metaTitle={state.metaTitle}
            metaDescription={state.metaDescription}
            onMetaTitleChange={onMetaTitleChange}
            onMetaDescriptionChange={onMetaDescriptionChange}
            onGenerateMeta={generateMeta}
            solutionIntegrationMetrics={state.solutionIntegrationMetrics}
            selectedSolution={state.selectedSolution}
            isAnalyzing={isAnalyzing}
            onAnalyze={analyzeSolutionUsage}
          />
        </TabsContent>
        
        <TabsContent value="technical">
          <TechnicalTabContent
            documentStructure={state.documentStructure}
            metaTitle={state.metaTitle}
            metaDescription={state.metaDescription}
            serpData={serpData}
          />
        </TabsContent>
        
        <TabsContent value="repurpose">
          <RepurposeTab
            content={state.content || ''}
            title={state.contentTitle || ''}
            isGenerating={isAnalyzing}
            onGenerateRepurposedContent={handleRepurposeContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
