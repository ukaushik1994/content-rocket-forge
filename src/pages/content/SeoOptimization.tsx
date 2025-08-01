
import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentInput } from '@/components/seo-optimization/ContentInput';
import { ConfigurationPanel } from '@/components/seo-optimization/ConfigurationPanel';
import { AnalysisResults } from '@/components/seo-optimization/AnalysisResults';
import { RecommendationsPanel } from '@/components/seo-optimization/RecommendationsPanel';
import { SerpAnalysis } from '@/components/seo-optimization/SerpAnalysis';
import { useSeoOptimization } from '@/hooks/useSeoOptimization';
import { Zap, FileText, Target, Search } from 'lucide-react';

const SeoOptimization = () => {
  const {
    content,
    setContent,
    configuration,
    setConfiguration,
    analysisResults,
    recommendations,
    serpData,
    isAnalyzing,
    analyzeContent,
    applyRecommendation,
    exportResults
  } = useSeoOptimization();

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, [setContent]);

  const handleAnalyze = useCallback(() => {
    if (content && configuration.targetKeyword) {
      analyzeContent();
    }
  }, [content, configuration.targetKeyword, analyzeContent]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>SEO Optimization | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">SEO Optimization</h1>
                <p className="text-muted-foreground mt-1">
                  Analyze and improve your existing content with AI-powered recommendations
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Input and Configuration */}
            <div className="lg:col-span-1 space-y-6">
              <ContentInput
                content={content}
                onChange={handleContentChange}
                isAnalyzing={isAnalyzing}
              />
              
              <ConfigurationPanel
                configuration={configuration}
                onChange={setConfiguration}
                onAnalyze={handleAnalyze}
                canAnalyze={!!content && !!configuration.targetKeyword}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Right Column - Analysis Results */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="serp" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    SERP Data
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="mt-6">
                  <AnalysisResults
                    results={analysisResults}
                    isAnalyzing={isAnalyzing}
                  />
                </TabsContent>

                <TabsContent value="recommendations" className="mt-6">
                  <RecommendationsPanel
                    recommendations={recommendations}
                    onApplyRecommendation={applyRecommendation}
                    isAnalyzing={isAnalyzing}
                  />
                </TabsContent>

                <TabsContent value="serp" className="mt-6">
                  <SerpAnalysis
                    serpData={serpData}
                    keyword={configuration.targetKeyword}
                    isAnalyzing={isAnalyzing}
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Optimized Content Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-4 min-h-[400px]">
                        {content ? (
                          <div className="prose prose-sm max-w-none">
                            {content.split('\n').map((paragraph, index) => (
                              <p key={index} className="mb-4 last:mb-0">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Add content and run analysis to see the optimized preview
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeoOptimization;
