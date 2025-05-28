
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle2, BarChart3, FileText, Target, Zap } from 'lucide-react';
import { useContentOptimizer } from './useContentOptimizer';
import { useContentQualityIntegration } from './hooks/useContentQualityIntegration';
import { EnhancedSerpItemsReference } from './components/EnhancedSerpItemsReference';
import { EnhancedSuggestionSection } from './components/EnhancedSuggestionSection';
import { UnifiedSuggestion } from './types';

interface AutoOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

export function AutoOptimizeDialog({ isOpen, onClose, content, onContentUpdate }: AutoOptimizeDialogProps) {
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
    const optimizedContent = await optimizeContent();
    if (optimizedContent) {
      onContentUpdate(optimizedContent);
      onClose();
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
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-background/95 backdrop-blur-md border border-border/50">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            AI Content Optimization
          </DialogTitle>
          <DialogDescription>
            Comprehensive content analysis and optimization suggestions based on quality checklist and SERP data
          </DialogDescription>
          
          {/* Quality Overview */}
          <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-background/50 rounded-lg border border-border/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
              <div className="text-xs text-muted-foreground">Quality Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{passedChecks}</div>
              <div className="text-xs text-muted-foreground">Checks Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">{qualitySuggestions.length}</div>
              <div className="text-xs text-muted-foreground">Improvements</div>
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
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="quality" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="quality" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Quality ({qualitySuggestions.length})
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Content ({contentSuggestions.length})
                    </TabsTrigger>
                    <TabsTrigger value="serp" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      SERP ({serpIntegrationSuggestions.length})
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex items-center gap-2">
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
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {selectedSuggestions.length} of {allSuggestions.length} suggestions selected
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleApplySuggestions}
                      disabled={isOptimizing || selectedSuggestions.length === 0}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      {isOptimizing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Optimizing...
                        </>
                      ) : (
                        `Apply ${selectedSuggestions.length} Suggestions`
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Content looks great!</h3>
                <p className="text-center text-muted-foreground mb-4">
                  All quality checks passed and no optimization suggestions needed.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-lg font-bold text-green-500">{passedChecks}/{totalChecks}</div>
                    <div className="text-xs text-muted-foreground">Quality Checks</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-lg font-bold text-blue-500">{completionPercentage}%</div>
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                  </div>
                </div>
                <Button onClick={onClose} className="mt-6">
                  Close
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
