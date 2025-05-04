
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DocumentStructureCard } from '../final-review/DocumentStructureCard';
import { MetaInformationCard } from '../final-review/MetaInformationCard';
import { SolutionIntegrationCard } from '../final-review/SolutionIntegrationCard';
import { KeywordUsageSummaryCard } from '../final-review/KeywordUsageSummaryCard';
import { FinalChecklistCard } from '../final-review/FinalChecklistCard';
import { ContentReviewCard } from '../final-review/ContentReviewCard';
import { FinalReviewHeader } from '../final-review/FinalReviewHeader';
import { CheckCircle, FileText, BarChart2, Settings, Tag, CheckSquare, FileCode, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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
    seoScore
  } = state;
  
  const { 
    isAnalyzing, 
    keywordUsage, 
    ctaInfo, 
    generateMeta, 
    analyzeSolutionUsage, 
    checkStepCompletion 
  } = useFinalReview();

  const [activeTab, setActiveTab] = useState("content");
  
  // Set meta information when component mounts if not already set
  useEffect(() => {
    if (content && mainKeyword && !metaTitle && !metaDescription) {
      generateMeta();
    }
  }, []);
  
  // Check if step can be completed
  useEffect(() => {
    checkStepCompletion();
  }, [metaTitle, metaDescription, documentStructure]);
  
  // Update meta information
  const handleMetaTitleChange = (value: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: value });
  };
  
  const handleMetaDescriptionChange = (value: string) => {
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
  
  const runAllChecks = () => {
    if (!metaTitle || !metaDescription) {
      generateMeta();
    }
    
    if (!solutionIntegrationMetrics && selectedSolution) {
      analyzeSolutionUsage();
    }
    
    toast.success("All checks completed");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Summary Stats */}
      <FinalReviewHeader 
        completionPercentage={completionPercentage}
        passedChecks={passedChecks}
        totalChecks={totalChecks}
        seoScore={seoScore}
      />
      
      {/* Main Content Area with Tabs */}
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-card shadow-sm rounded-lg p-1 mb-6">
          <TabsList className="w-full grid grid-cols-3 gap-1">
            <TabsTrigger value="content" className="flex gap-2 items-center">
              <FileText className="h-4 w-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex gap-2 items-center">
              <BarChart2 className="h-4 w-4" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex gap-2 items-center">
              <Settings className="h-4 w-4" />
              <span>Technical</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Content Tab */}
        <TabsContent value="content" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content area */}
            <div className="lg:col-span-2">
              <ContentReviewCard content={content} />
            </div>
            
            {/* Side panel */}
            <div className="space-y-6">
              <FinalChecklistCard checks={checklistItems} />
              <Button 
                onClick={runAllChecks} 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Run All Checks
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* SEO Tab */}
        <TabsContent value="seo" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main SEO area */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <KeywordUsageSummaryCard 
                keywordUsage={keywordUsage} 
                mainKeyword={mainKeyword}
                selectedKeywords={selectedKeywords}
              />
              <MetaInformationCard 
                metaTitle={metaTitle || ''} 
                metaDescription={metaDescription || ''}
                onMetaTitleChange={handleMetaTitleChange}
                onMetaDescriptionChange={handleMetaDescriptionChange}
                onGenerateMeta={generateMeta}
              />
            </div>
            
            {/* Side panel */}
            <div className="space-y-6">
              <SolutionIntegrationCard 
                metrics={solutionIntegrationMetrics}
                solution={selectedSolution}
                isAnalyzing={isAnalyzing}
                onAnalyze={analyzeSolutionUsage}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Technical Tab */}
        <TabsContent value="technical" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main technical area */}
            <div className="lg:col-span-2">
              <DocumentStructureCard documentStructure={documentStructure} />
            </div>
            
            {/* Side panel */}
            <div>
              <Card className="h-full bg-gradient-to-br from-violet-500/5 to-indigo-500/5 shadow-md">
                <CardHeader className="pb-2 border-b bg-gradient-to-r from-muted/30 to-transparent">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                    Technical Validation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="bg-card/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <FileCode className="h-4 w-4 text-green-500" />
                        <h3 className="text-sm font-medium">HTML Structure</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Ensures proper HTML5 semantic structure for better accessibility and SEO.
                      </p>
                      {!!documentStructure?.hasSingleH1 && !!documentStructure?.hasLogicalHierarchy ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">Valid HTML structure</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-amber-500">Structure needs improvement</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-card/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-medium">Metadata</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Validates meta title and description for search engine optimization.
                      </p>
                      {!!metaTitle && !!metaDescription && metaTitle.length <= 60 && metaDescription.length >= 50 && metaDescription.length <= 160 ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">Valid metadata</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-amber-500">Metadata needs improvement</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for layout purposes
const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`bg-card border rounded-lg overflow-hidden ${className || ''}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`p-4 ${className || ''}`}>
      {children}
    </div>
  );
};

const CardContent = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`p-4 ${className || ''}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <h3 className={`text-lg font-medium ${className || ''}`}>
      {children}
    </h3>
  );
};
