import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Search, 
  Bot, 
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Zap,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisProgress } from './optimization/components/AnalysisProgress';
import { EnhancedHighlightedContentViewer } from './optimization/components/EnhancedHighlightedContentViewer';
import { OptimizationSuggestionsPanel } from './optimization/components/OptimizationSuggestionsPanel';
import { useContentOptimizer } from './optimization/useContentOptimizer';
import { OptimizationSuggestion } from './optimization/types';
import { analyzeContentForHighlights, HighlightAnalysisResult } from '@/services/contentHighlightingService';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';
import { toast } from 'sonner';

interface AutoOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

type WorkflowStep = 'analysis' | 'suggestions' | 'optimization' | 'results';

interface SuggestionCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact?: 'high' | 'medium' | 'low';
    category: string;
  }>;
}

export const AutoOptimizeModal: React.FC<AutoOptimizeModalProps> = ({
  isOpen,
  onClose,
  content,
  onContentUpdate
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('analysis');
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [highlightAnalysis, setHighlightAnalysis] = useState<HighlightAnalysisResult | null>(null);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  
  const { 
    state, 
    saveOptimizationSelections, 
    getOptimizationSelections, 
    applyOptimizationChanges
  } = useContentBuilder();
  
  const { isEnabled, hasProviders, activeProviders, refreshStatus } = useAIServiceStatus();

  const {
    isAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    qualitySuggestions,
    selectedSuggestions,
    analyzeContent,
    toggleSuggestion,
    getTotalSuggestionCount
  } = useContentOptimizer(content);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('analysis');
      setOptimizationProgress(0);
      setHighlightAnalysis(null);
      setSelectedHighlights([]);
      
      // Load saved selections if available
      const savedSelections = getOptimizationSelections();
      if (savedSelections) {
        setSelectedHighlights(savedSelections.highlights);
      }
    }
  }, [isOpen, getOptimizationSelections]);

  // Normalize suggestions to a common format
  const normalizeSuggestion = (suggestion: any) => ({
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    priority: typeof suggestion.priority === 'number' 
      ? (suggestion.priority >= 8 ? 'high' : suggestion.priority >= 5 ? 'medium' : 'low')
      : suggestion.priority,
    impact: suggestion.impact,
    category: suggestion.category || 'content'
  });

  // Organize suggestions into categories
  const suggestionCategories: SuggestionCategory[] = [
    {
      id: 'seo',
      title: 'SEO & Keywords',
      icon: Search,
      color: 'text-green-600',
      suggestions: [...contentSuggestions.filter(s => s.category === 'seo' || s.category === 'keywords'), ...qualitySuggestions.filter(s => s.category === 'seo' || s.category === 'keywords')].map(normalizeSuggestion)
    },
    {
      id: 'ai-detection',
      title: 'AI Humanization',
      icon: Bot,
      color: 'text-purple-600',
      suggestions: aiDetectionSuggestions.map(normalizeSuggestion)
    },
    {
      id: 'serp',
      title: 'SERP Integration',
      icon: TrendingUp,
      color: 'text-blue-600',
      suggestions: serpIntegrationSuggestions.map(normalizeSuggestion)
    },
    {
      id: 'content',
      title: 'Content Quality',
      icon: Lightbulb,
      color: 'text-orange-600',
      suggestions: [...contentSuggestions.filter(s => s.category === 'content' || s.category === 'structure'), ...qualitySuggestions.filter(s => s.category === 'content' || s.category === 'structure')].map(normalizeSuggestion)
    },
    {
      id: 'solution',
      title: 'Solution Integration',
      icon: Target,
      color: 'text-indigo-600',
      suggestions: [...solutionSuggestions, ...qualitySuggestions.filter(s => s.category === 'solution')].map(normalizeSuggestion)
    }
  ].filter(category => category.suggestions.length > 0);

  const handleStartAnalysis = async () => {
    // Check AI service status before starting
    if (!isEnabled) {
      toast.error('AI service is disabled. Please enable it in Settings to use auto-optimization.');
      return;
    }

    if (!hasProviders) {
      toast.error('No AI providers configured. Please add at least one API key in Settings to use auto-optimization.');
      return;
    }

    // Refresh status to get current provider information
    await refreshStatus();
    
    if (activeProviders === 0) {
      toast.error(`No AI providers are currently working. Please check your API keys in Settings.`);
      return;
    }

    setCurrentStep('analysis');
    
    try {
      await analyzeContent();
      
      // Move to suggestions step after analysis
      setTimeout(() => {
        if (getTotalSuggestionCount() > 0) {
          setCurrentStep('suggestions');
        } else {
          toast.info('No optimization suggestions found - your content looks great!');
          onClose();
        }
      }, 1000);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast.error(`Analysis failed: ${error.message || 'Please check your AI provider configuration and try again.'}`);
      setCurrentStep('analysis');
    }
  };

  const handleOptimize = async () => {
    if (selectedSuggestions.length === 0) {
      toast.error('Please select at least one suggestion');
      return;
    }

    setCurrentStep('optimization');
    setOptimizationProgress(0);

    const progressInterval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const selectedSuggestionObjects = suggestionCategories
        .flatMap(cat => cat.suggestions)
        .filter(s => selectedSuggestions.includes(s.id))
        .map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          type: getOptimizationType(s.category),
          priority: s.priority,
          category: s.category
        } as OptimizationSuggestion));

      const analysis = analyzeContentForHighlights(
        content,
        selectedSuggestionObjects,
        state.mainKeyword,
        state.selectedKeywords
      );
      
      clearInterval(progressInterval);
      setOptimizationProgress(100);
      setHighlightAnalysis(analysis);
      
      setTimeout(() => setCurrentStep('results'), 500);
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Optimization error:', error);
      toast.error('Analysis failed - please check your connection and try again');
      setCurrentStep('suggestions');
    }
  };

  const handleApplyChanges = async () => {
    try {
      await saveOptimizationSelections(selectedSuggestions, selectedHighlights);
      const updatedContent = await applyOptimizationChanges(selectedHighlights, content);
      onContentUpdate(updatedContent);
      
      toast.success(`Applied ${selectedSuggestions.length} suggestions and ${selectedHighlights.length} highlights!`);
      onClose();
    } catch (error) {
      console.error('Error applying changes:', error);
      toast.error('Failed to apply changes - please try again');
    }
  };

  // Helper functions for highlight selection
  const toggleHighlight = (highlightId: string) => {
    setSelectedHighlights(prev => 
      prev.includes(highlightId)
        ? prev.filter(id => id !== highlightId)
        : [...prev, highlightId]
    );
  };

  const selectAllHighlights = () => {
    if (highlightAnalysis) {
      setSelectedHighlights(highlightAnalysis.highlights.map(h => h.id));
    }
  };

  const clearAllHighlights = () => {
    setSelectedHighlights([]);
  };

  // Helper functions for suggestion selection
  const selectAllHighPriority = () => {
    const highPrioritySuggestions = suggestionCategories
      .flatMap(cat => cat.suggestions)
      .filter(s => s.priority === 'high')
      .map(s => s.id);
    highPrioritySuggestions.forEach(id => {
      if (!selectedSuggestions.includes(id)) {
        toggleSuggestion(id);
      }
    });
  };

  const clearAllSuggestions = () => {
    selectedSuggestions.forEach(id => toggleSuggestion(id));
  };

  const selectAllInCategory = (categoryId: string) => {
    const category = suggestionCategories.find(c => c.id === categoryId);
    if (category) {
      category.suggestions.forEach(suggestion => {
        if (!selectedSuggestions.includes(suggestion.id)) {
          toggleSuggestion(suggestion.id);
        }
      });
    }
  };

  // Helper function to map categories to optimization types
  const getOptimizationType = (category: string): OptimizationSuggestion['type'] => {
    switch (category) {
      case 'solution': return 'solution';
      case 'seo':
      case 'keywords': return 'serp_integration';
      default: return 'content';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const renderAnalysisStep = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            {isAnalyzing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Sparkles className="w-8 h-8 text-white" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isAnalyzing ? 'Analyzing Your Content' : 'Ready to Optimize'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isAnalyzing 
              ? 'Our AI is analyzing your content for SEO, readability, and optimization opportunities...'
              : 'Click the button below to start a comprehensive analysis of your content.'
            }
          </p>
        </div>
        
        {!isAnalyzing && (
          <div className="space-y-4">
            {!hasProviders ? (
              <div className="max-w-md mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">AI Service Not Available</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  No AI providers are configured. You need to add at least one API key to use auto-optimization.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('/settings', '_blank')}
                  className="w-full"
                >
                  Configure AI Providers
                </Button>
              </div>
            ) : activeProviders === 0 ? (
              <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">AI Providers Unavailable</span>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  Your AI providers are not working properly. Please check your API keys and try again.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshStatus}
                  className="w-full"
                >
                  Refresh Status
                </Button>
              </div>
            ) : (
              <Button onClick={handleStartAnalysis} size="lg" className="gap-2">
                <Zap className="w-4 h-4" />
                Start Analysis ({activeProviders} AI provider{activeProviders !== 1 ? 's' : ''} ready)
              </Button>
            )}
          </div>
        )}
      </motion.div>

      <AnalysisProgress isAnalyzing={isAnalyzing} onAnalysisComplete={() => {}} />
    </div>
  );

  const renderSuggestionsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <h3 className="text-xl font-semibold mb-2">Optimization Suggestions</h3>
        <p className="text-muted-foreground">
          Found {getTotalSuggestionCount()} opportunities to improve your content
        </p>
      </div>

      <div className="space-y-4">
        {suggestionCategories.map((category) => (
          <Card key={category.id} className="border-l-4 border-l-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                  <CardTitle className="text-base">{category.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {category.suggestions.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectAllInCategory(category.id)}
                  className="text-xs"
                >
                  Select All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <Checkbox
                    checked={selectedSuggestions.includes(suggestion.id)}
                    onCheckedChange={() => toggleSuggestion(suggestion.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </Badge>
                      {suggestion.impact && (
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">
                          {suggestion.impact} impact
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {selectedSuggestions.length} of {getTotalSuggestionCount()} suggestions selected
        </p>
        <Button onClick={handleOptimize} disabled={selectedSuggestions.length === 0} className="gap-2">
          <ArrowRight className="w-4 h-4" />
          Optimize Content
        </Button>
      </div>
    </motion.div>
  );

  const renderOptimizationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8"
    >
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Optimizing Content</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Applying {selectedSuggestions.length} optimizations to improve your content...
        </p>
        
        <div className="max-w-md mx-auto">
          <Progress value={optimizationProgress} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">{Math.round(optimizationProgress)}% complete</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none max-h-none p-0 overflow-hidden">
        <div className="h-full bg-background flex flex-col">
          
          {/* Header */}
          <div className="flex-shrink-0 border-b border-border bg-card/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">Auto-Optimize Content</DialogTitle>
                <p className="text-muted-foreground">Analyze and optimize your content with AI-powered suggestions</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Two-column layout for results step */}
          {currentStep === 'results' && highlightAnalysis ? (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Panel - Suggestions */}
              <div className="w-[40%] border-r border-border overflow-y-auto">
                <div className="p-6">
                  <OptimizationSuggestionsPanel
                    suggestionCategories={suggestionCategories}
                    selectedSuggestions={selectedSuggestions}
                    onToggleSuggestion={toggleSuggestion}
                    onSelectAllInCategory={selectAllInCategory}
                    onSelectAllHighPriority={selectAllHighPriority}
                    onClearAll={clearAllSuggestions}
                    totalSuggestionCount={getTotalSuggestionCount()}
                  />
                  
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep('suggestions')}>
                      Back
                    </Button>
                    <Button onClick={handleApplyChanges} className="gap-2 flex-1">
                      <Save className="w-4 h-4" />
                      Apply Changes ({selectedSuggestions.length + selectedHighlights.length})
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Content with highlights */}
              <div className="w-[60%] overflow-y-auto">
                <div className="p-6">
                  <EnhancedHighlightedContentViewer
                    analysisResult={highlightAnalysis}
                    selectedHighlights={selectedHighlights}
                    onHighlightToggle={toggleHighlight}
                    onSelectAll={selectAllHighlights}
                    onClearAll={clearAllHighlights}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Single column layout for other steps
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {currentStep === 'analysis' && renderAnalysisStep()}
                {currentStep === 'suggestions' && renderSuggestionsStep()}
                {currentStep === 'optimization' && renderOptimizationStep()}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};