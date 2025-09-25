import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  Lightbulb, 
  BarChart3,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ContentIntelligenceResult,
  ContentIntelligenceScore,
  ContentOptimizationSuggestion,
  contentIntelligenceService 
} from '@/services/ai-intelligence/ContentIntelligenceService';
import { ContentItemType } from '@/contexts/content/types';

interface ContentIntelligencePanelProps {
  content: ContentItemType;
  onOptimizationApply: (suggestion: ContentOptimizationSuggestion) => void;
  className?: string;
}

export const ContentIntelligencePanel: React.FC<ContentIntelligencePanelProps> = ({
  content,
  onOptimizationApply,
  className = ""
}) => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<ContentIntelligenceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realtimeScore, setRealtimeScore] = useState<ContentIntelligenceScore | null>(null);

  useEffect(() => {
    if (content) {
      analyzeContent();
    }
  }, [content.id, content.updated_at]);

  // Real-time scoring for content changes
  useEffect(() => {
    if (content.content) {
      const timer = setTimeout(() => {
        updateRealtimeScore();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [content.content, content.title]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      const result = await contentIntelligenceService.analyzeContent(content, true);
      setAnalysis(result);
    } catch (error) {
      console.error('Content analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateRealtimeScore = async () => {
    if (content.content && content.content.length > 50) {
      try {
        const score = await contentIntelligenceService.getRealtimeScore(
          content.content, 
          content.title
        );
        setRealtimeScore(score);
      } catch (error) {
        console.error('Realtime scoring failed:', error);
      }
    }
  };

  const applySuggestion = async (suggestion: ContentOptimizationSuggestion) => {
    try {
      onOptimizationApply(suggestion);
      toast({
        title: "Suggestion Applied",
        description: `Applied: ${suggestion.title}`,
      });
      // Re-analyze after applying suggestion
      setTimeout(analyzeContent, 1000);
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      toast({
        title: "Application Failed", 
        description: "Failed to apply optimization suggestion.",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'medium': return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'low': return <ArrowDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getEffortBadgeVariant = (effort: string) => {
    switch (effort) {
      case 'low': return 'default';
      case 'medium': return 'secondary'; 
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={`border-border bg-card ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Brain className="h-6 w-6 animate-pulse text-primary" />
            <div>
              <h3 className="font-semibold">Analyzing Content</h3>
              <p className="text-sm text-muted-foreground">
                Running AI analysis for content intelligence...
              </p>
            </div>
          </div>
          <Progress value={65} className="mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Scores
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="competitive" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Competitive
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall Score */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Content Intelligence Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(analysis || realtimeScore) && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysis?.scores.overall || realtimeScore?.overall || 0)}`}>
                        {analysis?.scores.overall || realtimeScore?.overall || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {analysis ? 'Complete Analysis' : 'Real-time Score'}
                      </p>
                    </div>
                    
                    {realtimeScore && !analysis && (
                      <Button 
                        onClick={analyzeContent}
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Run Full Analysis
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {(analysis?.scores || realtimeScore) && (
                  <div className="space-y-3">
                    {Object.entries(analysis?.scores || realtimeScore || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={getScoreColor(value)}>{value}</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {analysis?.optimizationSuggestions.length ? (
                  <div className="space-y-4">
                    {analysis.optimizationSuggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              {getPriorityIcon(suggestion.priority)}
                              <div>
                                <h4 className="font-semibold">{suggestion.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {suggestion.description}
                                </p>
                              </div>
                            </div>
                            <Badge variant={getEffortBadgeVariant(suggestion.implementationEffort)}>
                              {suggestion.implementationEffort} effort
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Impact: {suggestion.expectedImpact}%</span>
                              <Badge variant="outline">
                                {suggestion.type}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => applySuggestion(suggestion)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Apply
                            </Button>
                          </div>

                          {suggestion.specificChanges.length > 0 && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-2">Specific Changes:</p>
                              <ul className="text-sm space-y-1">
                                {suggestion.specificChanges.map((change, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            <strong>AI Reasoning:</strong> {suggestion.aiReasoning}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {analysis ? 'No optimization suggestions available' : 'Run analysis to get suggestions'}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="mt-4">
          <div className="grid gap-4">
            {analysis?.competitiveAnalysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Market Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="mb-4 capitalize">
                      {analysis.competitiveAnalysis.marketPosition}
                    </Badge>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">Strength Areas</h4>
                        <ul className="space-y-1 text-sm">
                          {analysis.competitiveAnalysis.strengthAreas.map((area, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-yellow-600">Improvement Areas</h4>
                        <ul className="space-y-1 text-sm">
                          {analysis.competitiveAnalysis.improvementAreas.map((area, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Competitors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.competitiveAnalysis.topCompetitors.map((competitor, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold">{competitor.domain}</h4>
                            <Badge variant="outline">Score: {competitor.score}</Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-red-600 mb-1">Their Gaps:</p>
                              <ul className="space-y-1">
                                {competitor.gaps.map((gap, gapIdx) => (
                                  <li key={gapIdx}>• {gap}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="font-medium text-green-600 mb-1">Our Opportunities:</p>
                              <ul className="space-y-1">
                                {competitor.opportunities.map((opp, oppIdx) => (
                                  <li key={oppIdx}>• {opp}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-4">
          <div className="grid gap-4">
            {analysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Performance Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          +{analysis.predictedMetrics.trafficIncrease}%
                        </div>
                        <p className="text-sm text-muted-foreground">Traffic Increase</p>
                      </div>
                      
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          +{analysis.predictedMetrics.engagementIncrease}%
                        </div>
                        <p className="text-sm text-muted-foreground">Engagement Increase</p>
                      </div>
                      
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          +{analysis.predictedMetrics.conversionIncrease}%
                        </div>
                        <p className="text-sm text-muted-foreground">Conversion Increase</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Content Gaps</h4>
                        <ul className="space-y-1 text-sm">
                          {analysis.aiInsights.contentGaps.map((gap, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Trend Alignment</h4>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.aiInsights.trendAlignment} className="flex-1" />
                            <span className="text-sm font-medium">
                              {analysis.aiInsights.trendAlignment}%
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Audience Match</h4>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.aiInsights.audienceMatch} className="flex-1" />
                            <span className="text-sm font-medium">
                              {analysis.aiInsights.audienceMatch}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {analysis.aiInsights.seasonalFactors.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Seasonal Factors
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.aiInsights.seasonalFactors.map((factor, idx) => (
                              <Badge key={idx} variant="secondary">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};