
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle2, BarChart3, FileText, Target, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { useContentOptimizer } from './useContentOptimizer';
import { useContentQualityIntegration } from './hooks/useContentQualityIntegration';
import { EnhancedSerpItemsReference } from './components/EnhancedSerpItemsReference';
import { EnhancedSuggestionSection } from './components/EnhancedSuggestionSection';
import { UnifiedSuggestion } from './types';
import { 
  generateOptimizationSessionId, 
  logOptimizationActivity, 
  generateOptimizationReasoning,
  OptimizationSettings,
  SuggestionForLogging
} from '@/services/contentOptimizationService';
import { toast } from 'sonner';

interface AutoOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

export function AutoOptimizeDialog({ isOpen, onClose, content, onContentUpdate }: AutoOptimizeDialogProps) {
  const [sessionId] = useState(() => generateOptimizationSessionId());
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
    solutionSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion,
    incorporateAllSerpItems
  } = useContentOptimizer(content);

  const {
    completionPercentage,
    qualitySuggestions,
    categorizedSuggestions,
    hasFailedChecks,
    passedChecks,
    totalChecks
  } = useContentQualityIntegration();

  // Initialize analysis when dialog opens
  React.useEffect(() => {
    if (isOpen && !isAnalyzing && !contentSuggestions.length && !qualitySuggestions.length) {
      analyzeContent();
    }
  }, [isOpen, isAnalyzing, contentSuggestions, qualitySuggestions, analyzeContent]);

  const handleApplySuggestions = async () => {
    const startTime = Date.now();
    
    try {
      // Get all suggestions for reasoning generation
      const allSuggestionsList: SuggestionForLogging[] = [
        ...contentSuggestions,
        ...solutionSuggestions,
        ...aiDetectionSuggestions,
        ...serpIntegrationSuggestions,
        ...qualitySuggestions
      ];

      const selectedSuggestionsList = allSuggestionsList.filter(s => selectedSuggestions.includes(s.id));
      const reasoning = generateOptimizationReasoning(selectedSuggestionsList, content, optimizationSettings);
      
      // Log optimization attempt
      const logId = await logOptimizationActivity(
        null, // content ID - could be passed from parent if available
        sessionId,
        content.length,
        allSuggestionsList,
        selectedSuggestionsList,
        [],
        reasoning,
        optimizationSettings,
        false // success - will update after optimization
      );

      const optimizedContent = await optimizeContent();
      
      if (optimizedContent && optimizedContent !== content) {
        const endTime = Date.now();
        const performanceMetrics = {
          optimizationTime: endTime - startTime,
          contentLengthChange: optimizedContent.length - content.length,
          suggestionCount: selectedSuggestions.length
        };

        // Update log with success
        if (logId) {
          await logOptimizationActivity(
            null,
            sessionId,
            content.length,
            allSuggestionsList,
            selectedSuggestionsList,
            [],
            reasoning,
            optimizationSettings,
            true,
            optimizedContent.length,
            performanceMetrics
          );
        }

        onContentUpdate(optimizedContent);
        toast.success(`Content optimized successfully! Applied ${selectedSuggestions.length} improvements.`, {
          description: `Content length changed from ${content.length} to ${optimizedContent.length} characters.`
        });
        onClose();
      } else {
        toast.error('Optimization failed or no changes were made. Please try again with different suggestions.');
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Failed to optimize content. Please check your connection and try again.');
    }
  };

  const handleIncorporateAllSerp = () => {
    incorporateAllSerpItems();
  };

  // Convert OptimizationSuggestion to UnifiedSuggestion
  const convertToUnified = (suggestions: any[]): UnifiedSuggestion[] => {
    return suggestions.map(s => ({
      ...s,
      type: s.type as any,
      priority: s.priority as any
    }));
  };

  const allSuggestions = [
    ...convertToUnified(contentSuggestions),
    ...convertToUnified(solutionSuggestions),
    ...convertToUnified(aiDetectionSuggestions),
    ...convertToUnified(serpIntegrationSuggestions),
    ...qualitySuggestions
  ];

  const hasSuggestions = allSuggestions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Glass-morphism background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-900/40 to-black/50 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-accent/5" />
        <div className="relative z-10 border border-white/10 rounded-lg overflow-hidden">
          
          <DialogHeader className="pb-6 px-6 pt-6 bg-gradient-to-r from-background/80 to-background/60 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    AI Content Optimization
                  </span>
                </DialogTitle>
                <DialogDescription className="mt-2 text-muted-foreground">
                  Advanced content analysis with detailed reasoning and optimization tracking
                </DialogDescription>
              </div>
              
              {/* Floating action area */}
              {selectedSuggestions.length > 0 && (
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedSuggestions.length}</div>
                    <div className="text-xs text-muted-foreground">Selected</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Quality Overview */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 rounded-xl bg-background/40 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-primary mb-1">{completionPercentage}%</div>
                <div className="text-xs text-muted-foreground">Quality Score</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/40 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-500 mb-1">{passedChecks}</div>
                <div className="text-xs text-muted-foreground">Checks Passed</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/40 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-amber-500 mb-1">{allSuggestions.length}</div>
                <div className="text-xs text-muted-foreground">Suggestions</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/40 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-500 mb-1">{content.split(' ').length}</div>
                <div className="text-xs text-muted-foreground">Words</div>
              </div>
            </div>
          </DialogHeader>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Analyzing content quality and generating optimization suggestions...
            </p>
            <div className="mt-4 space-y-2 text-center">
              <div className="text-xs text-muted-foreground">• Checking document structure</div>
              <div className="text-xs text-muted-foreground">• Validating SEO elements</div>
              <div className="text-xs text-muted-foreground">• Analyzing keyword usage</div>
              <div className="text-xs text-muted-foreground">• Evaluating solution integration</div>
            </div>
          </div>
        ) : (
          <>
            {hasSuggestions ? (
              <div className="flex-1 overflow-hidden px-6">
                <Tabs defaultValue="quality" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-4 bg-background/60 backdrop-blur-sm border border-white/10">
                    <TabsTrigger 
                      value="quality" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Quality ({qualitySuggestions.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="content" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30"
                    >
                      <FileText className="h-4 w-4" />
                      Content ({contentSuggestions.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="serp" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30"
                    >
                      <Target className="h-4 w-4" />
                      SERP ({serpIntegrationSuggestions.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="ai" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30"
                    >
                      <Zap className="h-4 w-4" />
                      AI ({aiDetectionSuggestions.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto mt-4 space-y-4">
                    <TabsContent value="quality" className="space-y-4 mt-0">
                      <EnhancedSerpItemsReference onIncorporateAllSerp={handleIncorporateAllSerp} />
                      
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
                          <h3 className="text-lg font-medium mb-2">Excellent Quality!</h3>
                          <p className="text-muted-foreground">All quality checks passed. Your content is optimized.</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="content" className="space-y-4 mt-0">
                      <EnhancedSuggestionSection
                        title="Content Quality Suggestions"
                        suggestions={convertToUnified(contentSuggestions)}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                      
                      <EnhancedSuggestionSection
                        title="Solution Integration"
                        suggestions={convertToUnified(solutionSuggestions)}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                    </TabsContent>
                    
                    <TabsContent value="serp" className="space-y-4 mt-0">
                      <EnhancedSerpItemsReference onIncorporateAllSerp={handleIncorporateAllSerp} />
                      
                      <EnhancedSuggestionSection
                        title="SERP Integration Opportunities"
                        suggestions={convertToUnified(serpIntegrationSuggestions)}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                    </TabsContent>
                    
                    <TabsContent value="ai" className="space-y-4 mt-0">
                      <EnhancedSuggestionSection
                        title="AI Content Humanization"
                        suggestions={convertToUnified(aiDetectionSuggestions)}
                        selectedSuggestions={selectedSuggestions}
                        onToggleSuggestion={toggleSuggestion}
                        showCategory={false}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
                
                <div className="mt-6 pt-4 border-t border-white/10" />
                
                <div className="flex justify-between items-center p-4 bg-background/40 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {selectedSuggestions.length} of {allSuggestions.length} suggestions selected
                    </div>
                    {selectedSuggestions.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs text-primary font-medium">Ready to optimize</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                      className="border-white/20 hover:bg-white/10 backdrop-blur-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleApplySuggestions}
                      disabled={isOptimizing || selectedSuggestions.length === 0}
                      className="bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 border-0 text-primary-foreground font-medium"
                    >
                      {isOptimizing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Applying Optimizations...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Apply {selectedSuggestions.length} Optimization{selectedSuggestions.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
                  <CheckCircle2 className="w-16 h-16 text-green-500 relative z-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center">Outstanding Content Quality!</h3>
                <p className="text-center text-muted-foreground mb-8 max-w-md">
                  Your content has passed all quality checks with flying colors. No optimization suggestions needed.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-green-500 mb-2">{passedChecks}/{totalChecks}</div>
                    <div className="text-sm text-muted-foreground">Quality Checks</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-500 mb-2">{completionPercentage}%</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
                <Button 
                  onClick={onClose} 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-3 text-lg font-medium shadow-lg shadow-primary/25"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Perfect! Close
                </Button>
              </div>
            )}
          </>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
