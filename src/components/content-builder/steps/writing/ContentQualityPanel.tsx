
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, Zap, Eye, Structure, MessageSquare, RefreshCw } from 'lucide-react';
import { ContentQualityMetrics, QualityRecommendation, WRITING_STYLES, EXPERTISE_LEVELS, analyzeContentQuality } from '@/services/contentQualityService';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';

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
  const [metrics, setMetrics] = useState<ContentQualityMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState('');

  const runQualityAnalysis = async () => {
    if (!content || content.length < 100) {
      toast.error('Content too short for meaningful analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeContentQuality(content, title, writingStyle, expertiseLevel, aiProvider);
      if (result) {
        setMetrics(result);
        setLastAnalyzedContent(content);
        toast.success('Quality analysis completed');
      } else {
        toast.error('Failed to analyze content quality');
      }
    } catch (error) {
      console.error('Quality analysis error:', error);
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Content Quality Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Writing Style</label>
            <Select value={writingStyle} onValueChange={onWritingStyleChange}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Expertise</label>
            <Select value={expertiseLevel} onValueChange={onExpertiseLevelChange}>
              <SelectTrigger>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{wordCount}</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{readingTime}m</div>
            <div className="text-xs text-muted-foreground">Read Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{content.split('\n\n').length}</div>
            <div className="text-xs text-muted-foreground">Paragraphs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{(content.match(/#{1,6}\s/g) || []).length}</div>
            <div className="text-xs text-muted-foreground">Headings</div>
          </div>
        </div>

        {/* Analysis Button */}
        <Button 
          onClick={runQualityAnalysis} 
          disabled={isAnalyzing || !content}
          className="w-full"
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
        {metrics && (
          <Tabs defaultValue="scores" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scores">Quality Scores</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scores" className="space-y-4">
              {/* Overall Score */}
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className={`text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                  {metrics.overallScore}
                </div>
                <div className="text-sm text-muted-foreground">Overall Quality Score</div>
                <Badge variant={getScoreBadgeVariant(metrics.overallScore)} className="mt-2">
                  {metrics.overallScore >= 80 ? 'Excellent' : 
                   metrics.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>

              {/* Individual Scores */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Readability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.readabilityScore} className="w-24" />
                    <span className={`text-sm font-medium ${getScoreColor(metrics.readabilityScore)}`}>
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
                    <Progress value={metrics.engagementScore} className="w-24" />
                    <span className={`text-sm font-medium ${getScoreColor(metrics.engagementScore)}`}>
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
                    <Progress value={metrics.seoScore} className="w-24" />
                    <span className={`text-sm font-medium ${getScoreColor(metrics.seoScore)}`}>
                      {metrics.seoScore}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Structure className="h-4 w-4" />
                    <span className="text-sm">Structure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.structureScore} className="w-24" />
                    <span className={`text-sm font-medium ${getScoreColor(metrics.structureScore)}`}>
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
                    <Progress value={metrics.brandVoiceScore} className="w-24" />
                    <span className={`text-sm font-medium ${getScoreColor(metrics.brandVoiceScore)}`}>
                      {metrics.brandVoiceScore}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {metrics.recommendations.length > 0 ? (
                <div className="space-y-4">
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
                            <div key={rec.id} className="p-3 border rounded-lg space-y-1">
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
                <div className="text-center p-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No specific recommendations available.</p>
                  <p className="text-sm">Your content quality looks good!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
