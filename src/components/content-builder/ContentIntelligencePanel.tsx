import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Target, 
  Sparkles,
  Link,
  FileText,
  BarChart
} from 'lucide-react';
import { ContentAnalysisResult, ReadabilityMetrics } from '@/services/contentIntelligenceService';
import { PerformancePrediction } from '@/services/contentPerformancePredictionService';
import { WorkflowSuggestion } from '@/services/workflowOptimizationService';

interface ContentIntelligencePanelProps {
  analysis: ContentAnalysisResult | null;
  readability: ReadabilityMetrics | null;
  prediction: PerformancePrediction | null;
  workflow: WorkflowSuggestion | null;
  onRefresh?: () => void;
  onApplyRecommendation?: (recommendationId: string) => void;
}

export const ContentIntelligencePanel: React.FC<ContentIntelligencePanelProps> = ({
  analysis,
  readability,
  prediction,
  workflow,
  onRefresh,
  onApplyRecommendation,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Content Intelligence
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
            </CardDescription>
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              Refresh Analysis
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="readability">Readability</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            {analysis ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">SEO Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ${getScoreColor(analysis.seoScore)}">
                        {analysis.seoScore}/100
                      </div>
                      <Progress value={analysis.seoScore} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Readability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ${getScoreColor(analysis.readabilityScore)}">
                        {analysis.readabilityScore}/100
                      </div>
                      <Progress value={analysis.readabilityScore} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {analysis.recommendations.map((rec) => (
                          <Card key={rec.id} className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={getPriorityColor(rec.priority)}>
                                    {rec.priority}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {rec.type}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Impact: {rec.impact}
                                </p>
                              </div>
                              {rec.actionable && onApplyRecommendation && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => onApplyRecommendation(rec.id)}
                                >
                                  Apply
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {analysis.internalLinkingOpportunities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        Internal Linking Opportunities ({analysis.internalLinkingOpportunities.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {analysis.internalLinkingOpportunities.map((link, idx) => (
                            <Card key={idx} className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm">{link.anchorText}</span>
                                  <Badge variant="secondary">{link.relevanceScore}% relevant</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{link.contextSnippet}</p>
                                <p className="text-xs text-primary">{link.targetUrl}</p>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Run analysis to see insights</p>
              </div>
            )}
          </TabsContent>

          {/* Readability Tab */}
          <TabsContent value="readability" className="space-y-4">
            {readability ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Reading Ease</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {readability.fleschReadingEase.toFixed(1)}
                      </div>
                      <Progress value={readability.fleschReadingEase} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Grade Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        Grade {readability.fleschKincaidGrade.toFixed(1)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Sentence Length</span>
                      <span className="text-sm font-semibold">{readability.averageSentenceLength} words</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Word Length</span>
                      <span className="text-sm font-semibold">{readability.averageWordLength} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Complex Words</span>
                      <span className="text-sm font-semibold">{readability.complexWordPercentage}%</span>
                    </div>
                  </CardContent>
                </Card>

                {readability.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {readability.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Run analysis to see readability metrics</p>
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            {prediction ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Est. Traffic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">{prediction.estimatedTraffic.average}</div>
                      <p className="text-xs text-muted-foreground">
                        {prediction.estimatedTraffic.min} - {prediction.estimatedTraffic.max} monthly
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold ${getScoreColor(prediction.successProbability)}">
                        {prediction.successProbability}%
                      </div>
                      <Progress value={prediction.successProbability} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Time to Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">{prediction.timeToRank.days} days</div>
                      <p className="text-xs text-muted-foreground">
                        {prediction.timeToRank.confidence}% confidence
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      Keyword Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {prediction.estimatedRanking.map((rank, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{rank.keyword}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Position {rank.predictedPosition}</Badge>
                            <span className="text-xs text-muted-foreground">{rank.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {prediction.topicGaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Topic Gaps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {prediction.topicGaps.map((gap, idx) => (
                            <Card key={idx} className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">{gap.topic}</span>
                                <Badge variant="secondary">{gap.relevanceScore}%</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{gap.suggestedContent}</p>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Run prediction to see performance insights</p>
              </div>
            )}
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-4">
            {workflow ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{workflow.estimatedDuration.total}h</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Priority Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold ${getScoreColor(workflow.priorityScore)}">
                        {workflow.priorityScore}/100
                      </div>
                      <Progress value={workflow.priorityScore} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Workflow Stages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {workflow.suggestedStages.map((stage, idx) => (
                          <Card key={idx} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{stage.order}</Badge>
                                  <span className="font-semibold text-sm">{stage.name}</span>
                                  {stage.optional && <Badge variant="secondary">Optional</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{stage.description}</p>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-muted-foreground">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {stage.estimatedHours}h
                                  </span>
                                  <span className="text-muted-foreground">
                                    Skills: {stage.requiredSkills.join(', ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {workflow.deadlineSuggestion && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Suggested Deadline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {new Date(workflow.deadlineSuggestion.date).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary">{workflow.deadlineSuggestion.confidence}% confident</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{workflow.deadlineSuggestion.reasoning}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Run optimization to see workflow suggestions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
