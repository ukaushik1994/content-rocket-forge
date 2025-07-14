
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  TrendingUp, 
  Eye, 
  Search, 
  Users, 
  BarChart3, 
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { realTimeOptimizer, RealTimeAnalysisResult, OptimizationSuggestion } from '@/services/optimization/RealTimeOptimizationEngine';
import { autoFixEngine } from '@/services/optimization/IntelligentAutoFixEngine';

interface LiveOptimizationPanelProps {
  content: string;
  title: string;
  keywords: string[];
  targetAudience?: string;
  onContentUpdate: (newContent: string) => void;
  onSuggestionApplied?: (suggestion: OptimizationSuggestion) => void;
}

export const LiveOptimizationPanel: React.FC<LiveOptimizationPanelProps> = ({
  content,
  title,
  keywords,
  targetAudience = 'general',
  onContentUpdate,
  onSuggestionApplied
}) => {
  const [analysis, setAnalysis] = useState<RealTimeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingFixes, setProcessingFixes] = useState<Set<string>>(new Set());

  // Debounced analysis
  const analyzeContent = useCallback(async () => {
    if (!content || content.length < 50) return;

    setIsAnalyzing(true);
    try {
      const result = await realTimeOptimizer.analyzeContent(
        content,
        title,
        keywords,
        targetAudience
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Live optimization analysis failed:', error);
      toast.error('Optimization analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, title, keywords, targetAudience]);

  // Trigger analysis when content changes
  useEffect(() => {
    const timer = setTimeout(analyzeContent, 1500); // Debounce for 1.5 seconds
    return () => clearTimeout(timer);
  }, [analyzeContent]);

  const handleApplyFix = async (suggestion: OptimizationSuggestion) => {
    if (!suggestion.autoFixable) {
      toast.info('This suggestion requires manual implementation');
      return;
    }

    setProcessingFixes(prev => new Set(prev).add(suggestion.id));

    try {
      const result = await autoFixEngine.applyAutoFix(suggestion, {
        content,
        title,
        keywords,
        targetAudience,
        preserveFormatting: true,
        preserveStyle: true
      });

      if (result.success) {
        onContentUpdate(result.fixedText);
        onSuggestionApplied?.(suggestion);
        toast.success(`Applied: ${suggestion.title}`);
      } else {
        toast.error(`Fix failed: ${result.explanation}`);
      }
    } catch (error) {
      console.error('Auto-fix failed:', error);
      toast.error('Auto-fix processing failed');
    } finally {
      setProcessingFixes(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestion.id);
        return newSet;
      });
    }
  };

  const handleApplyMultipleFixes = async () => {
    if (!analysis?.suggestions) return;

    const autoFixableSuggestions = analysis.suggestions.filter(s => s.autoFixable);
    if (autoFixableSuggestions.length === 0) {
      toast.info('No auto-fixable suggestions available');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await autoFixEngine.applyMultipleFixes(autoFixableSuggestions, {
        content,
        title,
        keywords,
        targetAudience,
        preserveFormatting: true,
        preserveStyle: true
      });

      if (result.success) {
        onContentUpdate(result.fixedText);
        toast.success(`Applied ${result.appliedFixes.length} optimizations`);
      } else {
        toast.error('Multiple fixes failed');
      }
    } catch (error) {
      console.error('Multiple fixes failed:', error);
      toast.error('Optimization processing failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'seo': return <Search className="h-4 w-4" />;
      case 'readability': return <Eye className="h-4 w-4" />;
      case 'engagement': return <Users className="h-4 w-4" />;
      case 'structure': return <BarChart3 className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (!analysis && !isAnalyzing && content.length > 50) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Live Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={analyzeContent} className="w-full">
            Start Live Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Live Optimization
            {isAnalyzing && <Clock className="h-4 w-4 animate-spin" />}
          </CardTitle>
          {analysis && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Score: {analysis.overallScore}/100
              </span>
              <Button
                size="sm"
                onClick={handleApplyMultipleFixes}
                disabled={isAnalyzing || !analysis.suggestions.some(s => s.autoFixable)}
              >
                Auto-Fix All
              </Button>
            </div>
          )}
        </div>
        {analysis && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">SEO</span>
                <span className="text-sm font-medium">{analysis.seoScore}/100</span>
              </div>
              <Progress value={analysis.seoScore} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Readability</span>
                <span className="text-sm font-medium">{analysis.readabilityScore}/100</span>
              </div>
              <Progress value={analysis.readabilityScore} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Engagement</span>
                <span className="text-sm font-medium">{analysis.engagementScore}/100</span>
              </div>
              <Progress value={analysis.engagementScore} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Performance</span>
                <span className="text-sm font-medium">{analysis.performanceScore}/100</span>
              </div>
              <Progress value={analysis.performanceScore} className="h-2" />
            </div>
          </div>
        )}
      </CardHeader>

      {analysis && (
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="suggestions">
                Suggestions ({analysis.suggestions.length})
              </TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Overall Score</h4>
                    <p className="text-sm text-muted-foreground">
                      {analysis.overallScore >= 80 ? 'Excellent optimization' :
                       analysis.overallScore >= 60 ? 'Good, with room for improvement' :
                       'Needs significant optimization'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">High Priority:</span> {analysis.suggestions.filter(s => s.priority === 'high').length}
                  </div>
                  <div>
                    <span className="font-medium">Auto-fixable:</span> {analysis.suggestions.filter(s => s.autoFixable).length}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {analysis.suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSuggestionIcon(suggestion.type)}
                            <h5 className="font-medium">{suggestion.title}</h5>
                            <Badge variant={getPriorityColor(suggestion.priority)}>
                              {suggestion.priority}
                            </Badge>
                            {suggestion.autoFixable && (
                              <Badge variant="outline">Auto-fix</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {suggestion.description}
                          </p>
                          <p className="text-sm">{suggestion.suggestion}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Impact: {suggestion.impact}/10</span>
                            <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {suggestion.autoFixable && (
                            <Button
                              size="sm"
                              onClick={() => handleApplyFix(suggestion)}
                              disabled={processingFixes.has(suggestion.id)}
                              className="whitespace-nowrap"
                            >
                              {processingFixes.has(suggestion.id) ? (
                                <Clock className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Apply Fix
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="seo" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">SEO Insights</h4>
                    <div className="space-y-2 text-sm">
                      {analysis.suggestions
                        .filter(s => s.type === 'seo')
                        .slice(0, 3)
                        .map((suggestion, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span>{suggestion.title}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Performance Insights</h4>
                    <div className="space-y-2 text-sm">
                      {analysis.suggestions
                        .filter(s => s.type === 'performance')
                        .slice(0, 3)
                        .map((suggestion, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>{suggestion.title}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};
