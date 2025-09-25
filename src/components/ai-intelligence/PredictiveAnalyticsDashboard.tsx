import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  AlertTriangle,
  Eye,
  Heart,
  Share2,
  Target,
  Calendar,
  BarChart3,
  LineChart,
  Activity,
  Zap,
  Star,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ContentPerformancePrediction,
  TrendAnalysis,
  OpportunityDetection,
  AnomalyAlert,
  MarketIntelligence,
  predictiveAnalyticsService
} from '@/services/ai-intelligence/PredictiveAnalyticsService';

interface PredictiveAnalyticsDashboardProps {
  contentData?: any;
  className?: string;
}

export const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({
  contentData,
  className = ""
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1_week' | '1_month' | '3_months' | '6_months'>('1_month');
  const [prediction, setPrediction] = useState<ContentPerformancePrediction | null>(null);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityDetection[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Sample content data for prediction
      const sampleContentData = contentData || {
        title: 'Advanced AI Features for Content Optimization',
        content: 'This comprehensive guide covers advanced AI techniques for optimizing content performance, including predictive analytics, trend analysis, and automated optimization strategies.',
        keywords: ['AI optimization', 'content analytics', 'predictive analysis', 'machine learning'],
        category: 'Technology'
      };

      // Get performance prediction
      const performancePrediction = await predictiveAnalyticsService.predictContentPerformance(
        sampleContentData,
        selectedTimeframe
      );
      setPrediction(performancePrediction);

      // Detect trends
      const trendAnalysis = await predictiveAnalyticsService.detectTrends(
        sampleContentData.keywords,
        selectedTimeframe === '1_week' ? '7d' : 
        selectedTimeframe === '1_month' ? '30d' : 
        selectedTimeframe === '3_months' ? '90d' : '1y'
      );
      setTrends(trendAnalysis);

      // Sample historical data for anomaly detection
      const currentMetrics = { views: 1250, engagement: 6.5, conversions: 3.2, socialShares: 45 };
      const historicalMetrics = [
        { views: 1000, engagement: 5.2, conversions: 2.8, socialShares: 35 },
        { views: 950, engagement: 5.5, conversions: 3.0, socialShares: 40 },
        { views: 1100, engagement: 5.0, conversions: 2.9, socialShares: 38 },
        { views: 980, engagement: 5.3, conversions: 3.1, socialShares: 42 }
      ];

      const detectedAnomalies = await predictiveAnalyticsService.detectAnomalies(
        currentMetrics,
        historicalMetrics
      );
      setAnomalies(detectedAnomalies);

      // Detect opportunities  
      const sampleUserContent = [
        { title: 'Content Strategy Guide', category: 'Marketing', performance: 85 },
        { title: 'SEO Optimization Tips', category: 'SEO', performance: 78 }
      ];

      const detectedOpportunities = await predictiveAnalyticsService.detectOpportunities(sampleUserContent);
      setOpportunities(detectedOpportunities);

      // Generate market intelligence
      const intelligence = await predictiveAnalyticsService.generateMarketIntelligence(
        'Content Marketing',
        ['SEO', 'Content Strategy', 'AI Tools'],
        ['competitor1.com', 'competitor2.com']
      );
      setMarketIntelligence(intelligence);

    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load predictive analytics data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      case 'seasonal': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'text-red-600';
    if (priority >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className={`border-border bg-card ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-6 w-6 animate-pulse text-primary" />
            <div>
              <h3 className="font-semibold">Loading Predictive Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing trends and generating predictions...
              </p>
            </div>
          </div>
          <Progress value={75} className="mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Predictive Analytics
        </h2>
        
        <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1_week">1 Week</SelectItem>
            <SelectItem value="1_month">1 Month</SelectItem>
            <SelectItem value="3_months">3 Months</SelectItem>
            <SelectItem value="6_months">6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Market Intel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="mt-4">
          {prediction && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-primary" />
                      Performance Predictions ({selectedTimeframe.replace('_', ' ')})
                    </span>
                    <Badge variant="outline">
                      {prediction.confidenceLevel}% confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Views</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">
                          {prediction.predictedMetrics.views.expected.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {prediction.predictedMetrics.views.min.toLocaleString()} - {prediction.predictedMetrics.views.max.toLocaleString()}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Engagement</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">
                          {prediction.predictedMetrics.engagement.expected.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {prediction.predictedMetrics.engagement.min.toFixed(1)}% - {prediction.predictedMetrics.engagement.max.toFixed(1)}%
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Conversions</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">
                          {prediction.predictedMetrics.conversions.expected.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {prediction.predictedMetrics.conversions.min.toFixed(1)}% - {prediction.predictedMetrics.conversions.max.toFixed(1)}%
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Share2 className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Social Shares</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">
                          {prediction.predictedMetrics.socialShares.expected}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {prediction.predictedMetrics.socialShares.min} - {prediction.predictedMetrics.socialShares.max}
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Factors</h4>
                    {prediction.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{factor.factor}</div>
                          <div className="text-sm text-muted-foreground">{factor.reasoning}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {factor.impact > 0 ? (
                            <ChevronUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={factor.impact > 0 ? 'default' : 'destructive'}>
                            {factor.impact > 0 ? '+' : ''}{factor.impact}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {trends.length > 0 ? (
                  <div className="space-y-4">
                    {trends.map((trend, idx) => (
                      <Card key={idx} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(trend.trend)}
                              <span className="font-semibold capitalize">{trend.trend} Trend</span>
                            </div>
                            <Badge variant="outline">
                              {trend.strength}% strength
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Timeframe:</strong> {trend.timeframe}
                            </p>
                            <p className="text-sm">{trend.description}</p>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-2">Related Keywords:</p>
                            <div className="flex flex-wrap gap-2">
                              {trend.relatedKeywords.map((keyword, kIdx) => (
                                <Badge key={kIdx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {trend.seasonalPatterns && (
                            <div>
                              <p className="text-sm font-medium mb-2">Seasonal Patterns:</p>
                              <div className="space-y-1">
                                {trend.seasonalPatterns.map((pattern, pIdx) => (
                                  <div key={pIdx} className="flex justify-between items-center text-sm">
                                    <span>{pattern.period}</span>
                                    <Badge variant={pattern.impact > 0 ? 'default' : 'destructive'}>
                                      {pattern.impact > 0 ? '+' : ''}{pattern.impact}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Progress value={trend.strength} className="h-2" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No trend data available for the selected timeframe.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Detected Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {opportunities.length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.map((opp) => (
                      <Card key={opp.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{opp.title}</h4>
                              <p className="text-sm text-muted-foreground">{opp.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getPriorityColor(opp.priority)}>
                                Priority: {opp.priority}
                              </Badge>
                              <Badge variant={getDifficultyBadgeVariant(opp.difficulty)}>
                                {opp.difficulty} difficulty
                              </Badge>
                            </div>
                          </div>

                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm">
                              <strong>Opportunity:</strong> {opp.opportunity}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>ROI: {opp.estimatedROI}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>{opp.timeToImplement} days</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {opp.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-2">Action Items:</h5>
                            <ul className="space-y-1 text-sm">
                              {opp.actionItems.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {opp.evidence.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Evidence:</h5>
                              <ul className="space-y-1 text-sm">
                                {opp.evidence.map((evidence, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <BarChart3 className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                                    <span className="text-muted-foreground">{evidence}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Detected: {new Date(opp.detectedAt).toLocaleString()}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No opportunities detected yet. Check back after more data is collected.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.length > 0 ? (
                <div className="space-y-4">
                  {anomalies.map((anomaly) => (
                    <Card key={anomaly.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {anomaly.title}
                          </h4>
                          <Badge variant={getSeverityBadgeVariant(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Detected Value:</span>
                            <div className="font-medium">{anomaly.detectedValue}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expected Value:</span>
                            <div className="font-medium">{anomaly.expectedValue}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deviation:</span>
                            <div className="font-medium text-red-600">{anomaly.deviation.toFixed(1)}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Auto-resolvable:</span>
                            <div className="font-medium">
                              {anomaly.autoResolvable ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Possible Causes:</h5>
                          <ul className="space-y-1 text-sm">
                            {anomaly.possibleCauses.map((cause, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                <span>{cause}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Recommended Actions:</h5>
                          <ul className="space-y-1 text-sm">
                            {anomaly.recommendedActions.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Zap className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-xs text-muted-foreground">
                            Detected: {new Date(anomaly.detectedAt).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {anomaly.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {anomaly.affectedMetrics.join(', ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No anomalies detected. All metrics are within expected ranges.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="mt-4">
          {marketIntelligence && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Market Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Market Trends</h4>
                      <div className="space-y-2">
                        {marketIntelligence.marketTrends.map((trend, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(trend.trend)}
                              <span className="text-sm">{trend.description}</span>
                            </div>
                            <Badge variant="outline">
                              {trend.strength}% strength
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Competitor Movements</h4>
                      <div className="space-y-3">
                        {marketIntelligence.competitorMovements.map((movement, idx) => (
                          <div key={idx} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <strong className="text-sm">{movement.competitor}</strong>
                              <Badge variant={movement.impact > 50 ? 'destructive' : 'secondary'}>
                                {movement.impact}% impact
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{movement.action}</p>
                            <p className="text-sm">
                              <strong>Our Response:</strong> {movement.ourResponse}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Risk Factors</h4>
                      <div className="space-y-2">
                        {marketIntelligence.riskFactors.map((risk, idx) => (
                          <div key={idx} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{risk.risk}</span>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  {risk.probability}% likely
                                </Badge>
                                <Badge variant={risk.impact > 60 ? 'destructive' : 'secondary'}>
                                  {risk.impact}% impact
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Mitigation:</strong> {risk.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Industry Insights</h4>
                      <ul className="space-y-2">
                        {marketIntelligence.industryInsights.map((insight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};