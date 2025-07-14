import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, Zap, Eye, LayoutGrid, MessageSquare, RefreshCw, Bot, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { ContentQualityMetrics, QualityRecommendation, WRITING_STYLES, EXPERTISE_LEVELS, analyzeContentQuality } from '@/services/contentQualityService';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { detectAIContent, AIDetectionResult } from '@/services/aiContentDetectionService';
import { analyzeSerpUsage, SerpUsageAnalysis } from '@/services/serpIntegrationAnalyzer';

interface ContentQualityPanelProps {
  content: string;
  title: string;
  writingStyle: string;
  expertiseLevel: string;
  onWritingStyleChange: (style: string) => void;
  onExpertiseLevelChange: (level: string) => void;
  aiProvider?: AiProvider;
}

export const ContentQualityPanel: React.FC<ContentQualityPanelProps> = ({
  content,
  title,
  writingStyle,
  expertiseLevel,
  onWritingStyleChange,
  onExpertiseLevelChange,
  aiProvider = 'openai'
}) => {
  const { state } = useContentBuilder();
  const { serpSelections } = state;
  
  const [metrics, setMetrics] = useState<ContentQualityMetrics | null>(null);
  const [aiDetection, setAiDetection] = useState<AIDetectionResult | null>(null);
  const [serpUsage, setSerpUsage] = useState<SerpUsageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState('');

  const runQualityAnalysis = async () => {
    if (!content || content.length < 100) {
      toast.error('Content too short for meaningful analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Run quality analysis - fix the parameter order
      const qualityResult = await analyzeContentQuality(content, title, writingStyle, expertiseLevel, true, aiProvider);
      if (qualityResult) {
        setMetrics(qualityResult);
        toast.success('Quality analysis completed');
      }

      // Run AI detection
      const aiResult = await detectAIContent(content, aiProvider);
      if (aiResult) {
        setAiDetection(aiResult);
      }

      // Run SERP usage analysis
      const selectedSerpItems = serpSelections.filter(item => item.selected);
      if (selectedSerpItems.length > 0) {
        const serpResult = await analyzeSerpUsage(content, selectedSerpItems, aiProvider);
        if (serpResult) {
          setSerpUsage(serpResult);
        }
      }

      setLastAnalyzedContent(content);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when content changes significantly
  useEffect(() => {
    if (content && content !== lastAnalyzedContent && content.length > 300) {
      const timeoutId = setTimeout(() => {
        runQualityAnalysis();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [content, writingStyle, expertiseLevel]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const categorizeRecommendations = (recommendations: QualityRecommendation[]) => {
    return {
      critical: recommendations.filter(r => r.type === 'critical'),
      major: recommendations.filter(r => r.type === 'major'),
      minor: recommendations.filter(r => r.type === 'minor')
    };
  };

  const wordCount = content ? content.split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" />
          Content Quality Analysis
        </CardTitle>
        
        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Writing Style</label>
            <Select value={writingStyle} onValueChange={onWritingStyleChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select writing style" />
              </SelectTrigger>
              <SelectContent>
                {WRITING_STYLES.map((style) => (
                  <SelectItem key={style.name} value={style.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{style.name}</span>
                      <span className="text-xs text-muted-foreground">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Target Expertise</label>
            <Select value={expertiseLevel} onValueChange={onExpertiseLevelChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select expertise level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERTISE_LEVELS.map((level) => (
                  <SelectItem key={level.level} value={level.level}>
                    <div className="flex flex-col">
                      <span className="font-medium">{level.level}</span>
                      <span className="text-xs text-muted-foreground">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold">{wordCount}</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{readingTime}m</div>
            <div className="text-xs text-muted-foreground">Read Time</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{content.split('\n\n').length}</div>
            <div className="text-xs text-muted-foreground">Paragraphs</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{(content.match(/#{1,6}\s/g) || []).length}</div>
            <div className="text-xs text-muted-foreground">Headings</div>
          </div>
        </div>

        {/* Analysis Button */}
        <Button 
          onClick={runQualityAnalysis} 
          disabled={isAnalyzing || !content}
          className="w-full"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Quality...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              {metrics ? 'Re-analyze Content' : 'Analyze Content Quality'}
            </>
          )}
        </Button>

        {/* Quality Metrics */}
        {(metrics || aiDetection || serpUsage) && (
          <Tabs defaultValue="scores" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scores">Quality Scores</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="humanizer">Content Humanizer</TabsTrigger>
              <TabsTrigger value="serp">SERP Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scores" className="space-y-3 mt-3">
              {metrics && (
                <>
                  {/* Overall Score */}
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className={`text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                      {metrics.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Quality Score</div>
                    <Badge variant={getScoreBadgeVariant(metrics.overallScore)} className="mt-1">
                      {metrics.overallScore >= 80 ? 'Excellent' : 
                       metrics.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>

                  {/* Individual Scores */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Readability</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={metrics.readabilityScore} className="w-20" />
                        <span className={`text-sm font-medium w-8 ${getScoreColor(metrics.readabilityScore)}`}>
                          {metrics.readabilityScore}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm">Engagement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={metrics.engagementScore} className="w-20" />
                        <span className={`text-sm font-medium w-8 ${getScoreColor(metrics.engagementScore)}`}>
                          {metrics.engagementScore}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="text-sm">SEO</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={metrics.seoScore} className="w-20" />
                        <span className={`text-sm font-medium w-8 ${getScoreColor(metrics.seoScore)}`}>
                          {metrics.seoScore}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="text-sm">Structure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={metrics.structureScore} className="w-20" />
                        <span className={`text-sm font-medium w-8 ${getScoreColor(metrics.structureScore)}`}>
                          {metrics.structureScore}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">Brand Voice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={metrics.brandVoiceScore} className="w-20" />
                        <span className={`text-sm font-medium w-8 ${getScoreColor(metrics.brandVoiceScore)}`}>
                          {metrics.brandVoiceScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-3 mt-3">
              {metrics && metrics.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {['critical', 'major', 'minor'].map((type) => {
                    const categoryRecs = categorizeRecommendations(metrics.recommendations)[type as keyof ReturnType<typeof categorizeRecommendations>];
                    if (categoryRecs.length === 0) return null;

                    return (
                      <div key={type} className="space-y-2">
                        <h4 className="font-medium capitalize flex items-center gap-2">
                          <Badge variant={type === 'critical' ? 'destructive' : type === 'major' ? 'secondary' : 'outline'}>
                            {categoryRecs.length}
                          </Badge>
                          {type} Issues
                        </h4>
                        <div className="space-y-2">
                          {categoryRecs.map((rec) => (
                            <div key={rec.id} className="p-2 border rounded-lg space-y-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium">{rec.title}</h5>
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {rec.impact} impact
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {rec.effort} effort
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{rec.description}</p>
                              {rec.autoFixable && (
                                <Badge variant="outline" className="text-xs">
                                  Auto-fixable
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No specific recommendations available.</p>
                  <p className="text-sm">Your content quality looks good!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="humanizer" className="space-y-3 mt-3">
              {aiDetection ? (
                <div className="space-y-4">
                  {/* AI Detection Status */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="font-medium">AI Content Detection</span>
                      </div>
                      <Badge variant={aiDetection.isAIWritten ? 'destructive' : 'default'}>
                        {aiDetection.isAIWritten ? 'AI Detected' : 'Human-like'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={aiDetection.confidence} className="flex-1" />
                      <span className="text-sm font-medium">{aiDetection.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Confidence level for AI detection analysis
                    </p>
                  </div>

                  {/* AI Indicators */}
                  {aiDetection.aiIndicators.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        AI Writing Patterns Found
                      </h4>
                      <div className="space-y-1">
                        {aiDetection.aiIndicators.map((indicator, i) => (
                          <div key={i} className="text-xs p-2 bg-amber-50 border border-amber-200 rounded">
                            {indicator}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Humanization Suggestions */}
                  {aiDetection.humanizationSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Humanization Suggestions
                      </h4>
                      <div className="space-y-2">
                        {aiDetection.humanizationSuggestions.map((suggestion, i) => (
                          <div key={i} className="text-xs p-2 bg-blue-50 border border-blue-200 rounded">
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Run analysis to check for AI content patterns</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="serp" className="space-y-3 mt-3">
              {serpUsage ? (
                <div className="space-y-4">
                  {/* SERP Usage Overview */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">SERP Items Usage</span>
                      </div>
                      <Badge variant={serpUsage.usagePercentage >= 80 ? 'default' : 'secondary'}>
                        {serpUsage.totalUsed}/{serpUsage.totalSelected} Used
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={serpUsage.usagePercentage} className="flex-1" />
                      <span className="text-sm font-medium">{serpUsage.usagePercentage}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Percentage of selected SERP items integrated into content
                    </p>
                  </div>

                  {/* Usage by Type */}
                  {Object.keys(serpUsage.usageByType).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Usage by Type</h4>
                      {Object.entries(serpUsage.usageByType).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={data.percentage} className="w-16" />
                            <span className="w-12 text-right">{data.used}/{data.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Unused Items */}
                  {serpUsage.unusedItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Unused SERP Items
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {serpUsage.unusedItems.map((item, i) => (
                          <div key={i} className="text-xs p-2 bg-amber-50 border border-amber-200 rounded">
                            <span className="font-medium capitalize">{item.type}:</span> {item.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Integration Suggestions */}
                  {serpUsage.integrationSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Integration Suggestions
                      </h4>
                      <div className="space-y-2">
                        {serpUsage.integrationSuggestions.map((suggestion, i) => (
                          <div key={i} className="text-xs p-2 bg-green-50 border border-green-200 rounded">
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <Target className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Run analysis to check SERP items usage</p>
                  <p className="text-sm">
                    {serpSelections.filter(item => item.selected).length > 0 
                      ? 'Analysis will show how well selected SERP items are integrated'
                      : 'No SERP items selected for analysis'
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
