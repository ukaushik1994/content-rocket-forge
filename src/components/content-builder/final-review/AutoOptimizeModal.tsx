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
import { useContentOptimizer } from './optimization/useContentOptimizer';
import { OptimizationSuggestion } from './optimization/types';
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
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const {
    isAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    qualitySuggestions,
    analyzeContent,
    optimizeContent,
    getTotalSuggestionCount
  } = useContentOptimizer(content);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('analysis');
      setOptimizedContent('');
      setOptimizationProgress(0);
      setSelectedSuggestions([]);
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
      suggestions: contentSuggestions.filter(s => s.category === 'seo' || s.category === 'keywords').map(normalizeSuggestion)
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
      suggestions: [...contentSuggestions.filter(s => s.category === 'content' || s.category === 'structure'), ...qualitySuggestions].map(normalizeSuggestion)
    },
    {
      id: 'solution',
      title: 'Solution Integration',
      icon: Target,
      color: 'text-indigo-600',
      suggestions: solutionSuggestions.map(normalizeSuggestion)
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
        setSelectedSuggestions(highPrioritySuggestions);
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

    const result = await optimizeContent();
    
    clearInterval(progressInterval);
    setOptimizationProgress(100);

    if (result) {
      setOptimizedContent(result);
      setTimeout(() => setCurrentStep('results'), 500);
    } else {
      toast.error('Optimization failed');
      setCurrentStep('suggestions');
    }
  };

  const handleApplyChanges = () => {
    onContentUpdate(optimizedContent);
    toast.success('Content updated successfully!');
    onClose();
  };

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const selectAllInCategory = (categoryId: string) => {
    const category = suggestionCategories.find(c => c.id === categoryId);
    if (category) {
      const categoryIds = category.suggestions.map(s => s.id);
      setSelectedSuggestions(prev => [...new Set([...prev, ...categoryIds])]);
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

      <ScrollArea className="max-h-96">
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
      </ScrollArea>

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
    const improvementPercentage = Math.round(((optimizedContent.length - content.length) / content.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold mb-2">Optimization Complete!</h3>
          <p className="text-muted-foreground">
            Applied {selectedSuggestions.length} improvements to your content
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center p-4">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">+{Math.abs(improvementPercentage)}%</p>
            <p className="text-xs text-muted-foreground">Content Length</p>
          </Card>
          <Card className="text-center p-4">
            <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{selectedSuggestions.length}</p>
            <p className="text-xs text-muted-foreground">Improvements</p>
          </Card>
          <Card className="text-center p-4">
            <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">Enhanced</p>
            <p className="text-xs text-muted-foreground">Quality</p>
          </Card>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3">Content Preview</h4>
          <ScrollArea className="h-32 p-3 border rounded-lg bg-muted/50">
            <p className="text-sm whitespace-pre-wrap">{optimizedContent.substring(0, 500)}...</p>
          </ScrollArea>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setCurrentStep('suggestions')} className="gap-2">
            Back to Suggestions
          </Button>
          <Button onClick={handleApplyChanges} className="flex-1 gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Apply Changes
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Auto-Optimize Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
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