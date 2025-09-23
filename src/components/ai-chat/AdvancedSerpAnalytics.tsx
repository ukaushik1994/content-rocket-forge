import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Zap, 
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Users,
  Search,
  Lightbulb
} from 'lucide-react';
import { EnhancedSerpResult } from '@/services/enhancedSerpService';
import { 
  serpPredictiveIntelligence, 
  TrendForecast, 
  ContentPerformancePrediction,
  OpportunityScore,
  MultiKeywordAnalysis 
} from '@/services/serpPredictiveIntelligence';
import { 
  serpWorkflowOrchestrator, 
  WorkflowState, 
  SmartFollowUpQuestion 
} from '@/services/serpWorkflowOrchestrator';

interface AdvancedSerpAnalyticsProps {
  serpData: EnhancedSerpResult[];
  onActionTaken?: (action: string, data: any) => void;
  conversationHistory?: string[];
}

export const AdvancedSerpAnalytics: React.FC<AdvancedSerpAnalyticsProps> = ({
  serpData,
  onActionTaken,
  conversationHistory = []
}) => {
  const [activeTab, setActiveTab] = useState('trends');
  const [trendForecasts, setTrendForecasts] = useState<TrendForecast[]>([]);
  const [contentPredictions, setContentPredictions] = useState<ContentPerformancePrediction[]>([]);
  const [opportunityScores, setOpportunityScores] = useState<OpportunityScore[]>([]);
  const [multiKeywordAnalysis, setMultiKeywordAnalysis] = useState<MultiKeywordAnalysis | null>(null);
  const [smartFollowUps, setSmartFollowUps] = useState<SmartFollowUpQuestion[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowState[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (serpData.length > 0) {
      loadAdvancedAnalytics();
    }
  }, [serpData]);

  const loadAdvancedAnalytics = async () => {
    setIsLoading(true);
    try {
      const keywords = serpData.map(data => data.keyword);
      
      // Load predictive analytics
      const [forecasts, opportunities] = await Promise.all([
        serpPredictiveIntelligence.forecastTrends(keywords),
        Promise.resolve(serpPredictiveIntelligence.calculateOpportunityScores(serpData))
      ]);

      setTrendForecasts(forecasts);
      setOpportunityScores(opportunities);

      // Generate content predictions
      const predictions = serpData.map(data =>
        serpPredictiveIntelligence.predictContentPerformance(data.keyword, data)
      );
      setContentPredictions(predictions);

      // Multi-keyword analysis
      if (serpData.length > 1) {
        const multiAnalysis = serpPredictiveIntelligence.analyzeMultipleKeywords(serpData);
        setMultiKeywordAnalysis(multiAnalysis);
      }

      // Generate smart follow-ups
      const followUps = serpWorkflowOrchestrator.generateSmartFollowUps(serpData, conversationHistory);
      setSmartFollowUps(followUps);

    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async (type: WorkflowState['type']) => {
    const keywords = serpData.map(data => data.keyword);
    const workflowId = await serpWorkflowOrchestrator.createWorkflow(type, keywords, {
      priority: 'high',
      automated: true
    });
    
    onActionTaken?.('workflow_created', { workflowId, type });
  };

  const handleFollowUpClick = (followUp: SmartFollowUpQuestion) => {
    onActionTaken?.('follow_up_selected', followUp);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading advanced SERP analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Advanced SERP Intelligence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid gap-4">
                {trendForecasts.map((forecast, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{forecast.keyword}</h4>
                        <Badge variant={
                          forecast.trendDirection === 'rising' ? 'default' :
                          forecast.trendDirection === 'declining' ? 'destructive' : 'secondary'
                        }>
                          {forecast.trendDirection === 'rising' && <TrendingUp className="h-3 w-3 mr-1" />}
                          {forecast.trendDirection === 'declining' && <TrendingDown className="h-3 w-3 mr-1" />}
                          {forecast.trendDirection}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current Volume:</span>
                          <div className="font-medium">{forecast.currentVolume.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Predicted Volume:</span>
                          <div className="font-medium">{forecast.predictedVolume.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <div className="font-medium">{Math.round(forecast.confidence)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Seasonality:</span>
                          <div className="font-medium">{Math.round(forecast.seasonalityScore)}%</div>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Opportunity Window</div>
                        <div className="text-sm">{forecast.opportunityWindow.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <div className="grid gap-4">
                {opportunityScores.map((opportunity, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{opportunity.keyword}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            opportunity.actionPriority === 'immediate' ? 'destructive' :
                            opportunity.actionPriority === 'high' ? 'default' :
                            opportunity.actionPriority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {opportunity.actionPriority}
                          </Badge>
                          <div className="text-2xl font-bold text-primary">{opportunity.score}</div>
                        </div>
                      </div>

                      <Progress value={opportunity.score} className="mb-3" />

                      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-muted-foreground">Volume</span>
                          <div className="font-medium">{Math.round(opportunity.factors.searchVolume)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Competition</span>
                          <div className="font-medium">{Math.round(opportunity.factors.competition)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Content Gap</span>
                          <div className="font-medium">{Math.round(opportunity.factors.contentGap)}</div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">{opportunity.recommendation}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4">
              <div className="grid gap-4">
                {contentPredictions.map((prediction, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{prediction.keyword}</h4>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span className="text-sm">Rank #{prediction.estimatedRankingPosition}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Success Rate</span>
                          <div className="font-medium text-green-600">{Math.round(prediction.successProbability)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time to Rank</span>
                          <div className="font-medium">{prediction.timeToRank} days</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Min Words</span>
                          <div className="font-medium">{prediction.contentRequirements.minWordCount.toLocaleString()}</div>
                        </div>
                      </div>

                      {prediction.contentRequirements.requiredTopics.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm text-muted-foreground mb-2">Required Topics:</div>
                          <div className="flex flex-wrap gap-1">
                            {prediction.contentRequirements.requiredTopics.slice(0, 3).map((topic, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                            ))}
                            {prediction.contentRequirements.requiredTopics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{prediction.contentRequirements.requiredTopics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {prediction.riskFactors.length > 0 && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-orange-700 text-sm mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Risk Factors</span>
                          </div>
                          <ul className="text-xs text-orange-600 space-y-1">
                            {prediction.riskFactors.map((risk, i) => (
                              <li key={i}>• {risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workflows" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleCreateWorkflow('keyword_analysis')}
                  className="flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Deep Keyword Analysis</span>
                </Button>
                <Button 
                  onClick={() => handleCreateWorkflow('content_planning')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>Content Strategy</span>
                </Button>
                <Button 
                  onClick={() => handleCreateWorkflow('competitor_tracking')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Competitor Tracking</span>
                </Button>
                <Button 
                  onClick={() => handleCreateWorkflow('trend_monitoring')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Trend Monitoring</span>
                </Button>
              </div>

              {multiKeywordAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Multi-Keyword Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Intent Distribution</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Informational: {multiKeywordAnalysis.clusterAnalysis.intentClusters.informational.length}</div>
                          <div>Commercial: {multiKeywordAnalysis.clusterAnalysis.intentClusters.commercial.length}</div>
                          <div>Transactional: {multiKeywordAnalysis.clusterAnalysis.intentClusters.transactional.length}</div>
                          <div>Navigational: {multiKeywordAnalysis.clusterAnalysis.intentClusters.navigational.length}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Cross-Keyword Opportunities</h5>
                        {multiKeywordAnalysis.crossKeywordOpportunities.slice(0, 2).map((opp, i) => (
                          <div key={i} className="p-3 bg-muted/50 rounded-lg mb-2">
                            <div className="font-medium text-sm">{opp.primaryKeyword}</div>
                            <div className="text-xs text-muted-foreground">{opp.contentStrategy}</div>
                            <div className="text-xs text-green-600">Impact: {opp.estimatedImpact}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {smartFollowUps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Smart Follow-Up Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smartFollowUps.map((followUp, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleFollowUpClick(followUp)}
                >
                  <div className="font-medium text-sm mb-1">{followUp.question}</div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {followUp.intent}
                    </Badge>
                    {followUp.suggestedKeywords && (
                      <div className="text-xs text-muted-foreground">
                        Keywords: {followUp.suggestedKeywords.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};