
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  Brain,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { keywordClusteringService, KeywordCluster } from '@/services/keywordClustering/KeywordClusteringService';
import { searchIntentAnalyzer, IntentAnalysisResult } from '@/services/keywordClustering/SearchIntentAnalyzer';
import { toast } from 'sonner';

interface EnhancedKeywordSelectionProps {
  onComplete: () => void;
}

export const EnhancedKeywordSelection: React.FC<EnhancedKeywordSelectionProps> = ({ onComplete }) => {
  const { state, setMainKeyword, addKeyword, removeKeyword } = useContentBuilder();
  const { mainKeyword, selectedKeywords, contentStrategy } = state;

  const [clusters, setClusters] = useState<KeywordCluster[]>([]);
  const [intentAnalysis, setIntentAnalysis] = useState<IntentAnalysisResult[]>([]);
  const [longTailSuggestions, setLongTailSuggestions] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('clusters');

  // Enhanced keyword analysis
  useEffect(() => {
    if (mainKeyword && selectedKeywords.length > 0) {
      performEnhancedAnalysis();
    }
  }, [mainKeyword, selectedKeywords]);

  const performEnhancedAnalysis = async () => {
    if (!mainKeyword) return;
    
    setIsAnalyzing(true);
    try {
      const allKeywords = [mainKeyword, ...selectedKeywords];
      
      // Parallel analysis for better performance
      const [clusterResults, intentResults, longTailResults] = await Promise.all([
        keywordClusteringService.clusterKeywords(
          allKeywords,
          contentStrategy?.primaryGoal || mainKeyword,
          { maxClusters: 4, minClusterSize: 2 }
        ),
        searchIntentAnalyzer.batchAnalyzeIntent(
          allKeywords,
          contentStrategy?.targetAudience || undefined
        ),
        keywordClusteringService.findLongTailOpportunities(
          allKeywords.slice(0, 3), // Use top 3 for long-tail discovery
          contentStrategy?.primaryGoal || mainKeyword
        )
      ]);

      setClusters(clusterResults);
      setIntentAnalysis(intentResults);
      setLongTailSuggestions(longTailResults);
      
      toast.success(`Enhanced analysis complete! Found ${clusterResults.length} keyword clusters and ${longTailResults.length} long-tail opportunities.`);
      
    } catch (error) {
      console.error('Enhanced analysis error:', error);
      toast.error('Enhanced analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClusterSelect = (clusterId: string) => {
    setSelectedCluster(clusterId === selectedCluster ? null : clusterId);
  };

  const handleAddClusterKeywords = (cluster: KeywordCluster) => {
    cluster.keywords.forEach(kw => {
      if (!selectedKeywords.includes(kw.keyword) && kw.keyword !== mainKeyword) {
        addKeyword(kw.keyword);
      }
    });
    toast.success(`Added ${cluster.keywords.length} keywords from ${cluster.name} cluster`);
  };

  const handleAddLongTailKeyword = (keyword: string) => {
    if (!selectedKeywords.includes(keyword) && keyword !== mainKeyword) {
      addKeyword(keyword);
      toast.success(`Added long-tail keyword: ${keyword}`);
    }
  };

  const getIntentColor = (intent: string) => {
    const colors = {
      informational: 'bg-blue-100 text-blue-800 border-blue-200',
      commercial: 'bg-orange-100 text-orange-800 border-orange-200',
      transactional: 'bg-green-100 text-green-800 border-green-200',
      navigational: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[intent as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600';
    if (difficulty < 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with analysis status */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              Enhanced Keyword Intelligence
            </h2>
            <p className="text-muted-foreground mt-1">
              AI-powered keyword clustering, intent analysis, and opportunity discovery
            </p>
          </div>
          <Button 
            onClick={performEnhancedAnalysis}
            disabled={isAnalyzing || !mainKeyword}
            className="bg-gradient-to-r from-neon-purple to-neon-blue"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Enhance Analysis
              </>
            )}
          </Button>
        </div>

        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Running AI-powered analysis...</span>
              <span>This may take 30-60 seconds</span>
            </div>
            <Progress value={66} className="h-2" />
          </div>
        )}
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clusters" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Keyword Clusters ({clusters.length})
          </TabsTrigger>
          <TabsTrigger value="intent" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Intent Analysis ({intentAnalysis.length})
          </TabsTrigger>
          <TabsTrigger value="longtail" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Long-tail Opportunities ({longTailSuggestions.length})
          </TabsTrigger>
        </TabsList>

        {/* Keyword Clusters Tab */}
        <TabsContent value="clusters" className="space-y-4">
          {clusters.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isAnalyzing ? 'Generating keyword clusters...' : 'Click "Enhance Analysis" to discover keyword clusters'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {clusters.map((cluster) => (
                <Card 
                  key={cluster.id} 
                  className={`glass-panel cursor-pointer transition-all ${
                    selectedCluster === cluster.id 
                      ? 'ring-2 ring-neon-purple border-neon-purple/50' 
                      : 'hover:border-white/20'
                  }`}
                  onClick={() => handleClusterSelect(cluster.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cluster.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getIntentColor(cluster.intent)}>
                          {cluster.intent}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddClusterKeywords(cluster);
                          }}
                          className="bg-gradient-to-r from-neon-purple to-neon-blue"
                        >
                          Add All
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Volume: {cluster.searchVolume.toLocaleString()}</span>
                      <span className={getDifficultyColor(cluster.avgDifficulty)}>
                        Difficulty: {cluster.avgDifficulty}
                      </span>
                      <span>Relevance: {(cluster.topicRelevance * 100).toFixed(0)}%</span>
                    </div>
                  </CardHeader>
                  
                  {selectedCluster === cluster.id && (
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Keywords in this cluster:</h4>
                          <div className="flex flex-wrap gap-2">
                            {cluster.keywords.map((kw, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-glass hover:bg-white/10 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddLongTailKeyword(kw.keyword);
                                }}
                              >
                                {kw.keyword}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({kw.searchVolume})
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Intent Analysis Tab */}
        <TabsContent value="intent" className="space-y-4">
          {intentAnalysis.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isAnalyzing ? 'Analyzing search intent...' : 'Click "Enhance Analysis" to analyze search intent'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {intentAnalysis.map((analysis, idx) => (
                <Card key={idx} className="glass-panel">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{analysis.keyword}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getIntentColor(analysis.primaryIntent)}>
                          {analysis.primaryIntent}
                        </Badge>
                        <Badge variant="outline" className="bg-glass">
                          {(analysis.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Journey Stage: <strong>{analysis.userJourneyStage}</strong></span>
                        <span>Content Type: <strong>{analysis.contentType.primaryType}</strong></span>
                        <span>Format: <strong>{analysis.contentType.format}</strong></span>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Optimization Tips:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {analysis.optimizationTips.slice(0, 3).map((tip, tipIdx) => (
                            <li key={tipIdx} className="flex items-start gap-2">
                              <span className="text-neon-purple">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Long-tail Opportunities Tab */}
        <TabsContent value="longtail" className="space-y-4">
          {longTailSuggestions.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isAnalyzing ? 'Discovering long-tail opportunities...' : 'Click "Enhance Analysis" to find long-tail keywords'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {longTailSuggestions.map((suggestion, idx) => (
                <Card key={idx} className="glass-panel hover:border-white/20 transition-all">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{suggestion.keyword}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Volume: {suggestion.searchVolume}</span>
                          <span className={getDifficultyColor(suggestion.difficulty)}>
                            Difficulty: {suggestion.difficulty}
                          </span>
                          <Badge className={getIntentColor(suggestion.intent)} size="sm">
                            {suggestion.intent}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddLongTailKeyword(suggestion.keyword)}
                        className="bg-glass hover:bg-white/10"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Continue button */}
      <div className="flex justify-end">
        <Button
          onClick={onComplete}
          disabled={selectedKeywords.length === 0}
          className="bg-gradient-to-r from-neon-purple to-neon-blue"
        >
          Continue to Content Structure
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
