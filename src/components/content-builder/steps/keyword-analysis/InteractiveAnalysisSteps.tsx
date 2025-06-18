
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Search, Target, BarChart3, Users, Eye } from 'lucide-react';

interface AnalysisMetrics {
  search_volume: number;
  competition_pct: number;
  result_count: number;
  seo_difficulty: number;
  opportunity: number;
}

interface InteractiveAnalysisStepsProps {
  keyword: string;
  metrics: AnalysisMetrics;
  serpBlocks: any;
  relatedKeywords: string[];
  isLoading?: boolean;
}

export const InteractiveAnalysisSteps: React.FC<InteractiveAnalysisStepsProps> = ({
  keyword,
  metrics,
  serpBlocks,
  relatedKeywords,
  isLoading = false
}) => {
  // Helper function to get difficulty level and color
  const getDifficultyInfo = (difficulty: number) => {
    if (difficulty < 30) return { level: 'Easy', color: 'bg-green-500', variant: 'secondary' as const };
    if (difficulty < 60) return { level: 'Medium', color: 'bg-yellow-500', variant: 'secondary' as const };
    return { level: 'Hard', color: 'bg-red-500', variant: 'secondary' as const };
  };

  // Helper function to get opportunity level
  const getOpportunityInfo = (opportunity: number) => {
    if (opportunity > 70) return { level: 'Excellent', color: 'text-green-600' };
    if (opportunity > 40) return { level: 'Good', color: 'text-yellow-600' };
    return { level: 'Limited', color: 'text-red-600' };
  };

  const difficultyInfo = getDifficultyInfo(metrics.seo_difficulty);
  const opportunityInfo = getOpportunityInfo(metrics.opportunity);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-panel">
            <CardHeader>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-white/10 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
          Analysis Results for "{keyword}"
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive SERP metrics and content opportunities
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Volume */}
        <Card className="glass-panel border-neon-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Search className="h-4 w-4 mr-2 text-neon-purple" />
              Search Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-purple">
              {metrics.search_volume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly searches
            </p>
          </CardContent>
        </Card>

        {/* Competition */}
        <Card className="glass-panel border-neon-blue/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Users className="h-4 w-4 mr-2 text-neon-blue" />
              Competition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-blue">
              {Math.round(metrics.competition_pct * 100)}%
            </div>
            <Progress value={metrics.competition_pct * 100} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Ad density
            </p>
          </CardContent>
        </Card>

        {/* SEO Difficulty */}
        <Card className="glass-panel border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <BarChart3 className="h-4 w-4 mr-2" />
              SEO Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {metrics.seo_difficulty}
              </div>
              <Badge variant={difficultyInfo.variant}>
                {difficultyInfo.level}
              </Badge>
            </div>
            <Progress value={metrics.seo_difficulty} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Opportunity Score */}
        <Card className="glass-panel border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Target className="h-4 w-4 mr-2 text-green-500" />
              Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-500">
                {metrics.opportunity}
              </div>
              <span className={`text-sm font-medium ${opportunityInfo.color}`}>
                {opportunityInfo.level}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Content opportunity score
            </p>
          </CardContent>
        </Card>

        {/* Total Results */}
        <Card className="glass-panel border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Eye className="h-4 w-4 mr-2" />
              Total Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.result_count.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Pages indexed
            </p>
          </CardContent>
        </Card>

        {/* Related Keywords */}
        <Card className="glass-panel border-neon-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <TrendingUp className="h-4 w-4 mr-2 text-neon-purple" />
              Related Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-purple">
              {relatedKeywords.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Keyword variations found
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SERP Features Overview */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-neon-blue" />
            SERP Features Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Organic Results', count: serpBlocks.organic?.length || 0, color: 'text-green-500' },
              { label: 'Ads', count: serpBlocks.ads?.length || 0, color: 'text-yellow-500' },
              { label: 'Questions', count: serpBlocks.people_also_ask?.length || 0, color: 'text-blue-500' },
              { label: 'News', count: serpBlocks.top_stories?.length || 0, color: 'text-purple-500' },
              { label: 'Images', count: serpBlocks.images?.length || 0, color: 'text-pink-500' },
              { label: 'Videos', count: serpBlocks.videos?.length || 0, color: 'text-red-500' },
              { label: 'Knowledge Graph', count: serpBlocks.knowledge_graph ? 1 : 0, color: 'text-indigo-500' },
            ].map(feature => (
              <div key={feature.label} className="text-center p-2 rounded bg-white/5">
                <div className={`text-lg font-bold ${feature.color}`}>
                  {feature.count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {feature.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
