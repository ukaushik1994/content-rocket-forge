import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, BarChart3, FileText, Target, Zap, Sparkles, Brain, Eye, Wand2 } from 'lucide-react';
import { useContentOptimizer } from './useContentOptimizer';
import { useContentQualityIntegration } from './hooks/useContentQualityIntegration';
import { EnhancedSerpItemsReference } from './components/EnhancedSerpItemsReference';
import { EnhancedSuggestionSection } from './components/EnhancedSuggestionSection';
import { UnifiedSuggestion } from './types';
import { SimpleAIServiceIndicator } from '../../ai/SimpleAIServiceIndicator';
import { toast } from 'sonner';

interface OptimizedAutoOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

interface OptimizationSettings {
  tone: 'professional' | 'casual' | 'technical' | 'friendly' | 'authoritative';
  audience: 'beginner' | 'intermediate' | 'expert' | 'general';
  seoFocus: 'light' | 'moderate' | 'aggressive';
  contentLength: 'shorter' | 'maintain' | 'longer';
  creativity: number;
  preserveStructure: boolean;
  includeExamples: boolean;
  enhanceReadability: boolean;
  customInstructions: string;
}

export function OptimizedAutoOptimizeDialog({ 
  isOpen, 
  onClose, 
  content, 
  onContentUpdate 
}: OptimizedAutoOptimizeDialogProps) {
  const [currentTab, setCurrentTab] = useState('analysis');
  const [isClosing, setIsClosing] = useState(false);
  const [analysisTimeout, setAnalysisTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [optimizationSettings] = useState<OptimizationSettings>({
    tone: 'professional',
    audience: 'general',
    seoFocus: 'moderate',
    contentLength: 'maintain',
    creativity: 50,
    preserveStructure: true,
    includeExamples: true,
    enhanceReadability: true,
    customInstructions: ''
  });

  const {
    isAnalyzing,
    isOptimizing,
    contentSuggestions,
    aiDetectionSuggestions,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion,
    clearAnalysis
  } = useContentOptimizer(content);

  const {
    completionPercentage,
    qualitySuggestions,
    categorizedSuggestions,
    hasFailedChecks,
    passedChecks,
    totalChecks
  } = useContentQualityIntegration();

  // Debounced analysis with cleanup
  const debouncedAnalyze = useCallback(() => {
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (isOpen && !isAnalyzing && !isOptimizing) {
        analyzeContent();
      }
    }, 500);
    
    setAnalysisTimeout(timeout);
  }, [isOpen, isAnalyzing, isOptimizing, analyzeContent, analysisTimeout]);

  // Initialize analysis when dialog opens with timeout
  useEffect(() => {
    if (isOpen && !isAnalyzing && !contentSuggestions.length && !qualitySuggestions.length) {
      debouncedAnalyze();
    }
    
    return () => {
      if (analysisTimeout) {
        clearTimeout(analysisTimeout);
      }
    };
  }, [isOpen, isAnalyzing, contentSuggestions.length, qualitySuggestions.length, debouncedAnalyze, analysisTimeout]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && !isClosing) {
      // Clear all analysis data and timeouts
      clearAnalysis();
      if (analysisTimeout) {
        clearTimeout(analysisTimeout);
        setAnalysisTimeout(null);
      }
      setCurrentTab('analysis');
    }
  }, [isOpen, isClosing, clearAnalysis, analysisTimeout]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    
    // Clear any ongoing operations
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
      setAnalysisTimeout(null);
    }
    
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 100);
  }, [onClose, analysisTimeout]);

  const handleAdvancedOptimization = useCallback(async () => {
    if (isOptimizing || selectedSuggestions.length === 0) return;
    
    try {
      const optimizedContent = await Promise.race([
        optimizeContent(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Optimization timeout')), 30000)
        )
      ]);
      
      if (optimizedContent && optimizedContent !== content) {
        onContentUpdate(optimizedContent);
        setCurrentTab('analysis');
        toast.success(`Applied ${selectedSuggestions.length} optimization(s) successfully!`);
      } else {
        toast.error('No optimizations could be applied. Please try different suggestions.');
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Optimization failed. Please try again.');
    }
  }, [isOptimizing, selectedSuggestions.length, optimizeContent, content, onContentUpdate]);

  const convertToUnified = useCallback((suggestions: any[]): UnifiedSuggestion[] => {
    return suggestions.map(s => ({
      ...s,
      type: s.type as any,
      priority: s.priority as any
    }));
  }, []);

  const allSuggestions = React.useMemo(() => [
    ...convertToUnified(contentSuggestions),
    ...convertToUnified(aiDetectionSuggestions),
    ...qualitySuggestions
  ], [contentSuggestions, aiDetectionSuggestions, qualitySuggestions, convertToUnified]);

  const hasSuggestions = allSuggestions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-md border border-border/50">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Content Optimization
              </DialogTitle>
              <DialogDescription>
                AI-powered content analysis and optimization
              </DialogDescription>
            </div>
            
            <SimpleAIServiceIndicator size="md" />
          </div>
          
          {/* Quality Overview */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-4 gap-4 p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
                <div className="text-xs text-muted-foreground">Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{passedChecks}</div>
                <div className="text-xs text-muted-foreground">Checks Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{allSuggestions.length}</div>
                <div className="text-xs text-muted-foreground">Suggestions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{content.split(' ').length}</div>
                <div className="text-xs text-muted-foreground">Words</div>
              </div>
            </div>
            
            {/* Optimization Action Button */}
            {selectedSuggestions.length > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Ready to Optimize</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSuggestions.length} optimization{selectedSuggestions.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <Button 
                    onClick={handleAdvancedOptimization}
                    disabled={isOptimizing}
                    className="ml-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Apply {selectedSuggestions.length} Optimization{selectedSuggestions.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Analyzing content for optimization opportunities...
            </p>
            <div className="mt-4 space-y-2 text-center">
              <div className="text-xs text-muted-foreground">• Content structure analysis</div>
              <div className="text-xs text-muted-foreground">• SEO and readability optimization</div>
              <div className="text-xs text-muted-foreground">• Quality assessment</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Suggestions ({allSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="quality" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Quality
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="analysis" className="space-y-4 mt-0">
                  {hasSuggestions ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Content Quality ({contentSuggestions.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {contentSuggestions.slice(0, 3).map(suggestion => (
                                <div key={suggestion.id} className="text-xs p-2 bg-muted/30 rounded">
                                  <div className="font-medium">{suggestion.title}</div>
                                  <div className="text-muted-foreground">{suggestion.description}</div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              AI Humanization ({aiDetectionSuggestions.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {aiDetectionSuggestions.slice(0, 3).map(suggestion => (
                                <div key={suggestion.id} className="text-xs p-2 bg-muted/30 rounded">
                                  <div className="font-medium">{suggestion.title}</div>
                                  <div className="text-muted-foreground">{suggestion.description}</div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-medium mb-2">Excellent Content Quality!</h3>
                      <p className="text-muted-foreground">Your content meets all quality standards.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="suggestions" className="space-y-4 mt-0">
                  <Tabs defaultValue="quality" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="quality">Quality ({qualitySuggestions.length})</TabsTrigger>
                      <TabsTrigger value="content">Content ({contentSuggestions.length})</TabsTrigger>
                      <TabsTrigger value="ai">AI Humanization ({aiDetectionSuggestions.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="quality" className="space-y-4">
                      {hasFailedChecks ? (
                        <div className="space-y-4">
                          <EnhancedSuggestionSection
                            title="Critical Issues"
                            suggestions={categorizedSuggestions.critical}
                            selectedSuggestions={selectedSuggestions}
                            onToggleSuggestion={toggleSuggestion}
                          />
                          <EnhancedSuggestionSection
                            title="Major Improvements"
                            suggestions={categorizedSuggestions.major}
                            selectedSuggestions={selectedSuggestions}
                            onToggleSuggestion={toggleSuggestion}
                          />
                          <EnhancedSuggestionSection
                            title="Minor Enhancements"
                            suggestions={categorizedSuggestions.minor}
                            selectedSuggestions={selectedSuggestions}
                            onToggleSuggestion={toggleSuggestion}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                          <h3 className="text-lg font-medium mb-2">All Quality Checks Passed!</h3>
                          <p className="text-muted-foreground">Your content is optimized and ready.</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="content">
                      <EnhancedSuggestionSection
                        title="Content & SEO Improvements"
                        suggestions={convertToUnified(contentSuggestions)}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                    </TabsContent>
                    
                    <TabsContent value="ai">
                      <EnhancedSuggestionSection
                        title="AI Content Humanization"
                        suggestions={convertToUnified(aiDetectionSuggestions)}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                
                <TabsContent value="quality" className="space-y-4 mt-0">
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-medium mb-2">Quality Analysis</h3>
                    <p className="text-muted-foreground">
                      {completionPercentage}% quality score with {passedChecks} checks passed
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4 mt-0">
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-medium mb-2">Preview Mode</h3>
                    <p className="text-muted-foreground">
                      Select suggestions to preview optimized content
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}