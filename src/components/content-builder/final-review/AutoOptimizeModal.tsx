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
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisProgress } from './optimization/components/AnalysisProgress';
import { HighlightedContentViewer } from './optimization/components/HighlightedContentViewer';
import { useContentOptimizer } from './optimization/useContentOptimizer';
import { OptimizationSuggestion } from './optimization/types';
import { analyzeContentForHighlights, HighlightAnalysisResult } from '@/services/contentHighlightingService';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
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
  const [optimizedContent, setOptimizedContent] = useState<string>('');
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [highlightAnalysis, setHighlightAnalysis] = useState<HighlightAnalysisResult | null>(null);
  
  const { state } = useContentBuilder();

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
    optimizeContent,
    toggleSuggestion,
    getTotalSuggestionCount
  } = useContentOptimizer(content);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('analysis');
      setOptimizedContent('');
      setOptimizationProgress(0);
      setHighlightAnalysis(null);
    }
  }, [isOpen]);

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
    setCurrentStep('analysis');
    await analyzeContent();
    
    // Move to suggestions step after analysis
    setTimeout(() => {
      if (getTotalSuggestionCount() > 0) {
        setCurrentStep('suggestions');
        // Auto-select high priority suggestions
        const highPrioritySuggestions = suggestionCategories
          .flatMap(cat => cat.suggestions)
          .filter(s => s.priority === 'high')
          .map(s => s.id);
        highPrioritySuggestions.forEach(id => toggleSuggestion(id));
      } else {
        toast.info('No optimization suggestions found - your content looks great!');
        onClose();
      }
    }, 1000);
  };

  const handleOptimize = async () => {
    if (selectedSuggestions.length === 0) {
      toast.error('Please select at least one suggestion');
      return;
    }

    setCurrentStep('optimization');
    setOptimizationProgress(0);

    // Simulate progress updates
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
      // Instead of generating new content, create highlight analysis
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

  const handleApplyChanges = () => {
    // For now, we'll keep the original content since we're showing highlights
    // In the future, this could trigger actual content modifications
    toast.success('Optimization areas identified! Use the highlights as a guide to improve your content.');
    onClose();
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

  // Export analysis report
  const exportAnalysisReport = (analysis: HighlightAnalysisResult | null, selectedSuggestionIds: string[]) => {
    if (!analysis) return;
    
    const report = {
      title: 'Content Optimization Analysis Report',
      date: new Date().toLocaleDateString(),
      summary: {
        totalHighlights: analysis.highlights.length,
        highPriority: analysis.highlights.filter(h => h.priority === 'high').length,
        mediumPriority: analysis.highlights.filter(h => h.priority === 'medium').length,
        lowPriority: analysis.highlights.filter(h => h.priority === 'low').length,
        selectedSuggestions: selectedSuggestionIds.length
      },
      highlights: analysis.highlights.map(h => ({
        type: h.type,
        priority: h.priority,
        title: h.suggestion.title,
        description: h.suggestion.description,
        text: h.text.trim(),
        category: h.suggestion.category
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-optimization-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analysis report exported successfully!');
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
          <Button onClick={handleStartAnalysis} size="lg" className="gap-2">
            <Zap className="w-4 h-4" />
            Start Analysis
          </Button>
        )}
      </motion.div>

      <AnalysisProgress 
        isAnalyzing={isAnalyzing} 
        onAnalysisComplete={() => {
          // Analysis progress component will handle its own completion
        }}
      />
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

  const renderResultsStep = () => {
    if (!highlightAnalysis) {
      return <div>Loading analysis...</div>;
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold mb-2">Analysis Complete!</h3>
          <p className="text-muted-foreground">
            Found {highlightAnalysis.highlights.length} areas for optimization in your content
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center p-4">
            <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{highlightAnalysis.highlights.length}</p>
            <p className="text-xs text-muted-foreground">Areas to Improve</p>
          </Card>
          <Card className="text-center p-4">
            <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{selectedSuggestions.length}</p>
            <p className="text-xs text-muted-foreground">Suggestions Applied</p>
          </Card>
          <Card className="text-center p-4">
            <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">Visual</p>
            <p className="text-xs text-muted-foreground">Guide</p>
          </Card>
        </div>

        <Separator />

        <div>
          <HighlightedContentViewer
            analysisResult={highlightAnalysis}
            selectedSuggestions={selectedSuggestions}
            onHighlightClick={(highlight) => {
              console.log('Highlight clicked:', highlight);
            }}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setCurrentStep('suggestions')} className="gap-2">
            Back to Suggestions
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportAnalysisReport(highlightAnalysis, selectedSuggestions)} 
            className="gap-2"
          >
            Export Report
          </Button>
          <Button onClick={handleApplyChanges} className="flex-1 gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Got It
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Auto-Optimize Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <AnimatePresence mode="wait">
            {currentStep === 'analysis' && renderAnalysisStep()}
            {currentStep === 'suggestions' && renderSuggestionsStep()}
            {currentStep === 'optimization' && renderOptimizationStep()}
            {currentStep === 'results' && renderResultsStep()}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};