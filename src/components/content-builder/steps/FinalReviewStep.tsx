
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, BarChart2, Settings, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Import tab content components
import { ContentTabContent, SeoTabContent, TechnicalTabContent } from '../final-review/tabs';
import { FinalReviewHeader } from '../final-review/FinalReviewHeader';

export const FinalReviewStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    metaTitle, 
    metaDescription, 
    documentStructure, 
    selectedSolution,
    solutionIntegrationMetrics,
    selectedKeywords,
    seoScore,
    serpData,
    contentTitle
  } = state;
  
  const { 
    isAnalyzing, 
    isGeneratingTitles,
    keywordUsage, 
    ctaInfo, 
    titleSuggestions,
    generateMeta, 
    generateTitleSuggestions,
    analyzeSolutionUsage, 
    checkStepCompletion 
  } = useFinalReview();

  const [activeTab, setActiveTab] = useState("content");
  const [isRunningAllChecks, setIsRunningAllChecks] = useState(false);
  
  // Debug current state
  useEffect(() => {
    console.log("[FinalReviewStep] Current state:", { 
      metaTitle, 
      contentTitle, 
      metaDescription
    });
  }, [metaTitle, contentTitle, metaDescription]);
  
  // Set meta information when component mounts if not already set
  useEffect(() => {
    if (content && mainKeyword && !metaTitle && !metaDescription) {
      console.log("[FinalReviewStep] No meta information detected, generating...");
      generateMeta();
    }
  }, [content, mainKeyword, metaTitle, metaDescription]);
  
  // Check if step can be completed
  useEffect(() => {
    checkStepCompletion();
  }, [metaTitle, metaDescription, documentStructure]);
  
  // Update meta information
  const handleMetaTitleChange = (value: string) => {
    console.log("[FinalReviewStep] Setting meta title to:", value);
    // Update both metaTitle and contentTitle for consistency
    dispatch({ type: 'SET_META_TITLE', payload: value });
    dispatch({ type: 'SET_CONTENT_TITLE', payload: value });
    
    // Verify the update
    setTimeout(() => {
      console.log("[FinalReviewStep] Updated state:", {
        metaTitle: state.metaTitle,
        contentTitle: state.contentTitle
      });
    }, 100);
  };
  
  const handleMetaDescriptionChange = (value: string) => {
    console.log("[FinalReviewStep] Setting meta description to:", value);
    dispatch({ type: 'SET_META_DESCRIPTION', payload: value });
  };
  
  // Build checklist items
  const checklistItems = [
    {
      title: 'Document has exactly one H1 tag',
      passed: !!documentStructure?.hasSingleH1
    },
    {
      title: 'Document has logical heading hierarchy',
      passed: !!documentStructure?.hasLogicalHierarchy
    },
    {
      title: 'Meta title includes primary keyword',
      passed: !!metaTitle && mainKeyword ? metaTitle.toLowerCase().includes(mainKeyword.toLowerCase()) : false
    },
    {
      title: 'Meta description is 50-160 characters',
      passed: !!metaDescription && metaDescription.length >= 50 && metaDescription.length <= 160
    },
    {
      title: 'Content has call-to-action',
      passed: ctaInfo.hasCTA
    },
    {
      title: 'Solution features are incorporated',
      passed: !!solutionIntegrationMetrics && solutionIntegrationMetrics.featureIncorporation > 50
    },
    {
      title: 'Solution is positioned effectively',
      passed: !!solutionIntegrationMetrics && solutionIntegrationMetrics.positioningScore > 70
    },
    {
      title: 'Primary keyword has optimal density (0.5% - 3%)',
      passed: keywordUsage.some(k => k.keyword === mainKeyword && 
        parseFloat(k.density) >= 0.5 && 
        parseFloat(k.density) <= 3)
    },
    {
      title: 'Secondary keywords are included in content',
      passed: selectedKeywords.filter(k => k !== mainKeyword).some(k => 
        keywordUsage.some(usage => usage.keyword === k && usage.count > 0)
      )
    }
  ];

  const passedChecks = checklistItems.filter(check => check.passed).length;
  const totalChecks = checklistItems.length;
  const completionPercentage = Math.round((passedChecks / totalChecks) * 100);
  
  const runAllChecks = async () => {
    console.log("[FinalReviewStep] Running all checks");
    setIsRunningAllChecks(true);
    
    try {
      if (!metaTitle || !metaDescription) {
        await generateMeta();
      }
      
      if (!solutionIntegrationMetrics && selectedSolution) {
        await analyzeSolutionUsage();
      }
      
      if (titleSuggestions.length === 0) {
        await generateTitleSuggestions();
      }
      
      toast.success("All checks completed");
    } catch (error) {
      console.error("[FinalReviewStep] Error running checks:", error);
      toast.error("Some checks failed to complete");
    } finally {
      setIsRunningAllChecks(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FinalReviewHeader 
          completionPercentage={completionPercentage}
          passedChecks={passedChecks}
          totalChecks={totalChecks}
          seoScore={seoScore}
        />
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        <Button 
          onClick={runAllChecks}
          disabled={isRunningAllChecks}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
        >
          {isRunningAllChecks ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running Checks...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Run All Checks
            </>
          )}
        </Button>
      </motion.div>
      
      {/* Main Content Area with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-card shadow-lg rounded-lg p-1 mb-6 border border-purple-500/20">
            <TabsList className="w-full grid grid-cols-3 gap-1">
              <TabsTrigger value="content" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <FileText className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <BarChart2 className="h-4 w-4" />
                <span>SEO</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <Settings className="h-4 w-4" />
                <span>Technical</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Content Tab */}
          <TabsContent value="content" className="mt-0">
            <ContentTabContent 
              content={content} 
              checklistItems={checklistItems}
              onRunAllChecks={runAllChecks}
            />
          </TabsContent>
          
          {/* SEO Tab */}
          <TabsContent value="seo" className="mt-0">
            <SeoTabContent 
              keywordUsage={keywordUsage}
              mainKeyword={mainKeyword}
              selectedKeywords={selectedKeywords}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              onMetaTitleChange={handleMetaTitleChange}
              onMetaDescriptionChange={handleMetaDescriptionChange}
              onGenerateMeta={generateMeta}
              solutionIntegrationMetrics={solutionIntegrationMetrics}
              selectedSolution={selectedSolution}
              isAnalyzing={isAnalyzing}
              onAnalyze={analyzeSolutionUsage}
              titleSuggestions={titleSuggestions}
              isGeneratingTitles={isGeneratingTitles}
              onGenerateTitleSuggestions={generateTitleSuggestions}
            />
          </TabsContent>
          
          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-0">
            <TechnicalTabContent 
              documentStructure={documentStructure}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              serpData={serpData}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
