
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Lightbulb, 
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { analyzeKeywordEnhanced, EnhancedSerpResult } from '@/services/enhancedSerpService';
import { toast } from 'sonner';

interface EnhancedSerpDashboardProps {
  keyword: string;
  geo?: string;
  onDataUpdate?: (data: EnhancedSerpResult) => void;
}

export const EnhancedSerpDashboard: React.FC<EnhancedSerpDashboardProps> = ({
  keyword,
  geo = 'US',
  onDataUpdate
}) => {
  const [data, setData] = useState<EnhancedSerpResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    if (!keyword) return;
    
    setIsLoading(true);
    try {
      const result = await analyzeKeywordEnhanced(keyword, geo, forceRefresh);
      if (result) {
        setData(result);
        onDataUpdate?.(result);
        
        if (result.data_sources.is_cached) {
          toast.success('Loaded cached SERP data');
        } else {
          toast.success('Retrieved fresh SERP data');
        }
      }
    } catch (error) {
      console.error('Error fetching enhanced SERP data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword, geo]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Analyzing keyword with enhanced SERP data...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
          <span>No SERP data available</span>
        </CardContent>
      </Card>
    );
  }

  const { metrics, serp_blocks, insights, data_sources } = data;

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enhanced SERP Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Keyword: <span className="font-medium">{keyword}</span> • Region: {geo}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={data_sources.is_cached ? 'secondary' : 'default'}>
            {data_sources.is_cached ? (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Cached
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Fresh
              </>
            )}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchData(true)}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Search Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.search_volume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly searches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2" />
              SEO Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.seo_difficulty}</div>
            <Progress value={metrics.seo_difficulty} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.seo_difficulty < 30 ? 'Easy' : metrics.seo_difficulty < 60 ? 'Medium' : 'Hard'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Opportunity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.opportunity_score}</div>
            <Progress value={metrics.opportunity_score} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.opportunity_score > 50 ? 'High' : metrics.opportunity_score > 25 ? 'Medium' : 'Low'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.competition_pct * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Ad competition</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.result_count.toLocaleString()} total results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Strategic Insights
          </CardTitle>
          <CardDescription>
            AI-generated recommendations based on SERP analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-neon-purple rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SERP Blocks */}
      <Tabs defaultValue="organic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="organic">Organic ({serp_blocks.organic.length})</TabsTrigger>
          <TabsTrigger value="ads">Ads ({serp_blocks.ads.length})</TabsTrigger>
          <TabsTrigger value="paa">PAA ({serp_blocks.people_also_ask.length})</TabsTrigger>
          <TabsTrigger value="images">Images ({serp_blocks.images.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({serp_blocks.videos.length})</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value="organic" className="space-y-4">
          {serp_blocks.organic.map((result, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">{result.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{result.snippet}</p>
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  {result.link}
                </a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          {serp_blocks.ads.map((ad, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <Badge variant="outline" className="mb-2">Ad</Badge>
                <h4 className="font-medium mb-2">{ad.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{ad.description}</p>
                <a 
                  href={ad.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  {ad.link}
                </a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="paa" className="space-y-4">
          {serp_blocks.people_also_ask.map((question, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">{question.question}</h4>
                {question.answer && (
                  <p className="text-sm text-muted-foreground">{question.answer}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {serp_blocks.images.slice(0, 8).map((image, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  {image.thumbnail && (
                    <img 
                      src={image.thumbnail} 
                      alt={image.title} 
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">{image.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          {serp_blocks.videos.map((video, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">{video.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                {video.duration && (
                  <Badge variant="secondary" className="mb-2">{video.duration}</Badge>
                )}
                <a 
                  href={video.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-600 block"
                >
                  {video.link}
                </a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="knowledge">
          {serp_blocks.knowledge_graph ? (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-4">{serp_blocks.knowledge_graph.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {serp_blocks.knowledge_graph.description}
                </p>
                {serp_blocks.knowledge_graph.attributes && (
                  <div className="space-y-2">
                    {Object.entries(serp_blocks.knowledge_graph.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No knowledge graph data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <Badge variant={data_sources.volume_api ? 'default' : 'secondary'}>
              SerpApi Volume: {data_sources.volume_api ? 'Connected' : 'Not Available'}
            </Badge>
            <Badge variant={data_sources.serp_api ? 'default' : 'secondary'}>
              Serpstack SERP: {data_sources.serp_api ? 'Connected' : 'Not Available'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
