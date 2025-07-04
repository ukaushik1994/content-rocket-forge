
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedSerpDashboard } from '@/components/content-builder/serp/EnhancedSerpDashboard';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { EnhancedSerpResult } from '@/services/enhancedSerpService';
import { NoDataAvailable } from '../NoDataAvailable';
import { Zap, Database, TrendingUp } from 'lucide-react';

export const EnhancedSerpIntegration: React.FC = () => {
  const { state, dispatch } = useContentBuilder();
  const { mainKeyword, serpData } = state;
  const [enhancedData, setEnhancedData] = useState<EnhancedSerpResult | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  const handleEnhancedDataUpdate = (data: EnhancedSerpResult) => {
    setEnhancedData(data);
    
    // Convert enhanced data to existing SERP format for backward compatibility
    const convertedSerpData = {
      keyword: data.keyword,
      searchVolume: data.metrics.search_volume,
      keywordDifficulty: data.metrics.seo_difficulty,
      competitionScore: data.metrics.competition_pct,
      
      // Convert SERP blocks to existing format
      entities: extractEntitiesFromSerpBlocks(data.serp_blocks),
      peopleAlsoAsk: data.serp_blocks.people_also_ask.map(q => ({
        question: q.question,
        source: 'Enhanced SERP'
      })),
      headings: extractHeadingsFromOrganic(data.serp_blocks.organic),
      contentGaps: generateContentGapsFromInsights(data.insights),
      topResults: data.serp_blocks.organic.slice(0, 10).map((result, index) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet || '',
        position: index + 1
      })),
      relatedSearches: data.related_keywords.map(kw => ({
        query: kw.title,
        volume: kw.volume
      })),
      keywords: data.related_keywords.map(kw => kw.title),
      recommendations: data.insights,
      isMockData: false
    };
    
    // Update the existing SERP data in context
    dispatch({ type: 'SET_SERP_DATA', payload: convertedSerpData });
  };

  const handleContinueToOutline = () => {
    if (enhancedData || showManualInput) {
      // Mark step as completed and move to outline
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    }
  };

  const handleManualInput = () => {
    setShowManualInput(true);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced SERP Header */}
      <Card className="border-neon-purple/20 bg-gradient-to-r from-neon-purple/5 to-neon-blue/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-neon-purple" />
            Enhanced SERP Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive keyword analysis combining SerpApi Google Trends and Serpstack SERP data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              24h Caching
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Real-time Metrics
            </Badge>
            {(enhancedData || showManualInput) && (
              <Button onClick={handleContinueToOutline} className="ml-auto">
                Continue to Outline →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Dashboard or No Data */}
      {mainKeyword && !serpData && !showManualInput && (
        <NoDataAvailable 
          keyword={mainKeyword}
          onManualInput={handleManualInput}
        />
      )}
      
      {mainKeyword && serpData && (
        <EnhancedSerpDashboard
          keyword={mainKeyword}
          geo="US"
          onDataUpdate={handleEnhancedDataUpdate}
        />
      )}
      
      {showManualInput && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Manual Content Planning</CardTitle>
            <CardDescription>
              Proceeding without SERP data. You can manually create your content outline and strategy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              While SERP data provides valuable insights, you can still create high-quality content by manually planning your outline, 
              selecting target keywords, and structuring your content based on your expertise and research.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Integration Status */}
      {enhancedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>SERP Selections Updated:</span>
                <Badge variant="default">
                  {state.serpSelections.length} items
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Strategic Insights:</span>
                <Badge variant="default">
                  {enhancedData.insights.length} recommendations
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Data Freshness:</span>
                <Badge variant={enhancedData.data_sources.is_cached ? 'secondary' : 'default'}>
                  {enhancedData.data_sources.is_cached ? 'Cached' : 'Fresh'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper functions to convert enhanced data to existing format
const extractEntitiesFromSerpBlocks = (serpBlocks: any) => {
  const entities = [];
  
  // Extract from knowledge graph
  if (serpBlocks.knowledge_graph) {
    entities.push({
      name: serpBlocks.knowledge_graph.title,
      type: 'knowledge_entity',
      description: serpBlocks.knowledge_graph.description,
      source: 'knowledge_graph'
    });
  }
  
  // Extract from organic results
  serpBlocks.organic.slice(0, 5).forEach((result: any) => {
    if (result.title) {
      const words = result.title.toLowerCase().split(' ');
      const meaningfulWords = words.filter(word => word.length > 4);
      meaningfulWords.slice(0, 2).forEach(word => {
        entities.push({
          name: word,
          type: 'organic_entity',
          description: `Entity from: ${result.title}`,
          source: 'organic_results'
        });
      });
    }
  });
  
  return entities.slice(0, 10);
};

const extractHeadingsFromOrganic = (organicResults: any[]) => {
  return organicResults.slice(0, 5).map((result, index) => ({
    text: result.title,
    level: index === 0 ? 'h1' as const : 'h2' as const,
    subtext: result.snippet || '',
    type: 'organic_heading'
  }));
};

const generateContentGapsFromInsights = (insights: string[]) => {
  return insights.map((insight, index) => ({
    topic: `Insight ${index + 1}`,
    description: insight,
    recommendation: `Address this insight in your content strategy`,
    content: insight,
    source: 'Enhanced SERP Analysis'
  }));
};
