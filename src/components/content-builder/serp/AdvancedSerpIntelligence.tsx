
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Search, 
  Lightbulb, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';
import { FAQIntelligenceService, FAQCluster } from '@/services/serpAnalysis/FAQIntelligenceService';
import { ContentGapAnalyzer, GapAnalysisResult } from '@/services/serpAnalysis/ContentGapAnalyzer';
import { SerpFeatureAnalyzer, SerpFeatureOpportunity } from '@/services/serpAnalysis/SerpFeatureAnalyzer';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AdvancedSerpIntelligenceProps {
  keyword: string;
  serpData: any;
  onInsightSelect?: (insight: any) => void;
  className?: string;
}

export const AdvancedSerpIntelligence: React.FC<AdvancedSerpIntelligenceProps> = ({
  keyword,
  serpData,
  onInsightSelect = () => {},
  className = ''
}) => {
  const [faqClusters, setFaqClusters] = useState<FAQCluster[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResult | null>(null);
  const [serpFeatures, setSerpFeatures] = useState<SerpFeatureOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (keyword && serpData) {
      analyzeAdvancedIntelligence();
    }
  }, [keyword, serpData]);

  const analyzeAdvancedIntelligence = async () => {
    setLoading(true);
    
    try {
      console.log('🧠 Starting advanced SERP intelligence analysis...');
      
      // Run all analyses in parallel
      const [faqResults, gapResults, featureResults] = await Promise.all([
        analyzeFAQIntelligence(),
        analyzeContentGaps(),
        analyzeSerpFeatures()
      ]);

      setFaqClusters(faqResults);
      setGapAnalysis(gapResults);
      setSerpFeatures(featureResults);
      
      toast.success('Advanced SERP intelligence analysis complete!', {
        description: `Identified ${faqResults.length} FAQ clusters, ${gapResults?.gaps.length || 0} content gaps, and ${featureResults.length} SERP opportunities`
      });
      
    } catch (error) {
      console.error('Error in advanced intelligence analysis:', error);
      toast.error('Error analyzing SERP intelligence');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFAQIntelligence = async (): Promise<FAQCluster[]> => {
    if (!serpData.peopleAlsoAsk || serpData.peopleAlsoAsk.length === 0) {
      return [];
    }

    const questions = serpData.peopleAlsoAsk.map((q: any) => q.question);
    return await FAQIntelligenceService.clusterQuestions(questions, keyword);
  };

  const analyzeContentGaps = async (): Promise<GapAnalysisResult> => {
    const competitorData = serpData.topResults || [];
    const yourContent: string[] = []; // Would come from user's existing content
    
    return await ContentGapAnalyzer.analyzeContentGaps(
      keyword,
      competitorData,
      yourContent
    );
  };

  const analyzeSerpFeatures = async (): Promise<SerpFeatureOpportunity[]> => {
    return await SerpFeatureAnalyzer.analyzeFeatures(keyword, serpData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Advanced SERP Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Advanced SERP Intelligence
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {faqClusters.length} FAQ Clusters
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {gapAnalysis?.gaps.length || 0} Content Gaps
          </div>
          <div className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            {serpFeatures.length} SERP Opportunities
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="faq">FAQ Clusters</TabsTrigger>
            <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
            <TabsTrigger value="serp">SERP Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Opportunity Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Overall Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {gapAnalysis?.overallOpportunity.score || 0}
                    </div>
                    <Progress 
                      value={gapAnalysis?.overallOpportunity.score || 0} 
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {gapAnalysis?.overallOpportunity.summary || 'Analyzing opportunities...'}
                  </p>
                </CardContent>
              </Card>

              {/* Quick Wins */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Quick Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {gapAnalysis?.overallOpportunity.quickWins.slice(0, 3).map((win, index) => (
                      <div key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        {win}
                      </div>
                    )) || (
                      <div className="text-xs text-muted-foreground">
                        No quick wins identified
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Snippet Opportunities */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Featured Snippets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {faqClusters.slice(0, 2).map((cluster, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs">{cluster.mainTopic}</span>
                        <Badge variant="outline" className="text-xs">
                          {cluster.featuredSnippetOpportunity}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Recommendations */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Immediate (0-30 days)
                    </h4>
                    <ul className="space-y-1">
                      {gapAnalysis?.recommendations.immediate.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Short-term (1-3 months)
                    </h4>
                    <ul className="space-y-1">
                      {gapAnalysis?.recommendations.shortTerm.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      Long-term (3-12 months)
                    </h4>
                    <ul className="space-y-1">
                      {gapAnalysis?.recommendations.longTerm.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                          <TrendingUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {faqClusters.map((cluster, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{cluster.mainTopic}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getPriorityColor(cluster.priority)}>
                            {cluster.priority}
                          </Badge>
                          <Badge variant="outline">
                            {cluster.featuredSnippetOpportunity}% snippet chance
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Intent: {cluster.intent}</span>
                          <span>Stage: {cluster.funnelStage}</span>
                          <span>Volume: {cluster.searchVolume}</span>
                        </div>
                        <div className="space-y-1">
                          {cluster.questions.slice(0, 3).map((question, qIndex) => (
                            <div key={qIndex} className="text-xs bg-muted p-2 rounded">
                              {question.question}
                            </div>
                          ))}
                          {cluster.questions.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{cluster.questions.length - 3} more questions
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onInsightSelect({ type: 'faq_cluster', data: cluster })}
                        >
                          Use This Cluster
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="gaps" className="mt-6">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {gapAnalysis?.gaps.map((gap, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{gap.topic}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(gap.priority)}>
                            {gap.priority}
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(gap.difficulty)}>
                            {gap.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">{gap.description}</p>
                        <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded">
                          <strong>Opportunity:</strong> {gap.opportunity}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Volume: {gap.searchVolume}</span>
                          <span>Traffic: {gap.potentialTraffic}</span>
                          <span>Time: {gap.timeToRank}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Action Items:</div>
                          {gap.actionItems.slice(0, 2).map((action, aIndex) => (
                            <div key={aIndex} className="text-xs text-muted-foreground flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {action}
                            </div>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onInsightSelect({ type: 'content_gap', data: gap })}
                        >
                          Target This Gap
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="serp" className="mt-6">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {serpFeatures.map((feature, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm capitalize">
                          {feature.featureType.replace('_', ' ')} Optimization
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={
                            feature.impact === 'high' ? 'bg-green-100 text-green-700' :
                            feature.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {feature.impact} impact
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(feature.difficulty)}>
                            {feature.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">{feature.opportunity}</p>
                        <div className="text-xs bg-purple-50 text-purple-700 p-2 rounded">
                          <strong>Format:</strong> {feature.contentFormat}
                        </div>
                        {feature.currentHolder && (
                          <div className="text-xs text-muted-foreground">
                            Currently held by: {feature.currentHolder}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Optimization Steps:</div>
                          {feature.optimizationSteps.slice(0, 3).map((step, sIndex) => (
                            <div key={sIndex} className="text-xs text-muted-foreground flex items-start gap-1">
                              <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {step}
                            </div>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onInsightSelect({ type: 'serp_feature', data: feature })}
                        >
                          Apply Optimization
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
