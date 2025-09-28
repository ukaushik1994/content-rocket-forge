import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { keywordStrategyBridge } from '@/services/keywordStrategyBridge';
import { UnifiedKeyword } from '@/services/keywordLibraryService';
import { toast } from 'sonner';

interface StrategyIntegrationPanelProps {
  selectedKeywords: string[];
  onClose: () => void;
}

interface KeywordOpportunity {
  keyword: UnifiedKeyword;
  opportunityScore: number;
  competitionGap: number;
  volumeToEffortRatio: number;
  reasoning: string;
  recommendedContentType: string;
}

interface ContentGapAnalysis {
  totalKeywords: number;
  coveredKeywords: number;
  gapKeywords: UnifiedKeyword[];
  opportunityScore: number;
  recommendations: string[];
}

export const StrategyIntegrationPanel: React.FC<StrategyIntegrationPanelProps> = ({
  selectedKeywords,
  onClose
}) => {
  const { currentStrategy, strategies } = useContentStrategy();
  const [activeTab, setActiveTab] = useState('add-to-strategy');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [recommendations, setRecommendations] = useState<KeywordOpportunity[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<ContentGapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentStrategy) {
      setSelectedStrategyId(currentStrategy.id);
    }
  }, [currentStrategy]);

  useEffect(() => {
    if (selectedStrategyId && activeTab === 'recommendations') {
      loadRecommendations();
    }
    if (selectedStrategyId && activeTab === 'gap-analysis') {
      loadGapAnalysis();
    }
  }, [selectedStrategyId, activeTab]);

  const loadRecommendations = async () => {
    if (!selectedStrategyId) return;
    
    setLoading(true);
    try {
      const recs = await keywordStrategyBridge.getKeywordRecommendations(selectedStrategyId, 10);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGapAnalysis = async () => {
    if (!selectedStrategyId) return;
    
    setLoading(true);
    try {
      const analysis = await keywordStrategyBridge.analyzeContentGaps(selectedStrategyId);
      setGapAnalysis(analysis);
    } catch (error) {
      console.error('Error loading gap analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToStrategy = async () => {
    if (!selectedStrategyId || selectedKeywords.length === 0) {
      toast.error('Please select a strategy and keywords');
      return;
    }

    setLoading(true);
    try {
      const success = await keywordStrategyBridge.addKeywordsToStrategy(
        selectedKeywords,
        selectedStrategyId,
        priority
      );
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error adding keywords to strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContentProposals = async () => {
    if (selectedKeywords.length === 0) {
      toast.error('Please select keywords');
      return;
    }

    setLoading(true);
    try {
      const proposals = await keywordStrategyBridge.createContentProposalsFromKeywords(selectedKeywords);
      toast.success(`Created ${proposals.length} content proposals`);
      onClose();
    } catch (error) {
      console.error('Error creating content proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOpportunityBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Strategy Integration
          <Badge variant="outline">{selectedKeywords.length} keywords selected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="add-to-strategy">Add to Strategy</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
            <TabsTrigger value="content-proposals">Proposals</TabsTrigger>
          </TabsList>

          <TabsContent value="add-to-strategy" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Strategy</label>
                <Select value={selectedStrategyId} onValueChange={setSelectedStrategyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        <div className="flex items-center gap-2">
                          {strategy.is_active && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          <span>{strategy.name || 'Unnamed Strategy'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority Level</label>
                <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddToStrategy} 
                  disabled={loading || !selectedStrategyId}
                  className="flex-1"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Add to Strategy
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Keyword Recommendations</h3>
              <Button variant="outline" size="sm" onClick={loadRecommendations}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <Card key={rec.keyword.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{rec.keyword.keyword}</h4>
                            <Badge className={getOpportunityBadgeColor(rec.opportunityScore)}>
                              {rec.opportunityScore}% opportunity
                            </Badge>
                            <Badge variant="outline">{rec.recommendedContentType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rec.reasoning}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Volume: {rec.keyword.search_volume || 'N/A'}</span>
                            <span>Difficulty: {rec.keyword.difficulty || 'N/A'}</span>
                            <span>Competition Gap: {rec.competitionGap}%</span>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${getOpportunityColor(rec.opportunityScore)}`}>
                          {rec.opportunityScore}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="gap-analysis" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Content Gap Analysis</h3>
              <Button variant="outline" size="sm" onClick={loadGapAnalysis}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </div>

            {gapAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{gapAnalysis.totalKeywords}</div>
                      <div className="text-sm text-muted-foreground">Total Keywords</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{gapAnalysis.coveredKeywords}</div>
                      <div className="text-sm text-muted-foreground">Covered</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{gapAnalysis.gapKeywords.length}</div>
                      <div className="text-sm text-muted-foreground">Content Gaps</div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Coverage Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((gapAnalysis.coveredKeywords / gapAnalysis.totalKeywords) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(gapAnalysis.coveredKeywords / gapAnalysis.totalKeywords) * 100} 
                    className="h-2"
                  />
                </div>

                {gapAnalysis.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {gapAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Analyzing content gaps...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="content-proposals" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Create Content Proposals</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate AI-powered content proposals based on your selected keywords
                </p>
                <Button onClick={handleCreateContentProposals} disabled={loading || selectedKeywords.length === 0}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Proposals
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};