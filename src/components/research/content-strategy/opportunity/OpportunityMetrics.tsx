import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Eye, Clock, Target } from 'lucide-react';
import { type Opportunity } from '@/services/opportunityHunterService';

interface OpportunityMetricsProps {
  opportunities: Opportunity[];
}

export const OpportunityMetrics: React.FC<OpportunityMetricsProps> = ({ opportunities }) => {
  const getMetrics = () => {
    const total = opportunities.length;
    const highPriority = opportunities.filter(o => o.priority === 'high').length;
    const newThisWeek = opportunities.filter(o => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(o.detected_at) >= weekAgo;
    }).length;
    
    const aioFriendly = opportunities.filter(o => o.is_aio_friendly).length;
    const avgOpportunityScore = opportunities.length > 0 
      ? Math.round(opportunities.reduce((sum, o) => sum + (o.opportunity_score || 0), 0) / opportunities.length)
      : 0;
    
    const trendingUp = opportunities.filter(o => o.trend_direction === 'growing').length;
    const avgSearchVolume = opportunities.length > 0
      ? Math.round(opportunities.reduce((sum, o) => sum + (o.search_volume || 0), 0) / opportunities.length)
      : 0;

    return {
      total,
      highPriority,
      newThisWeek,
      aioFriendly,
      avgOpportunityScore,
      trendingUp,
      avgSearchVolume
    };
  };

  const metrics = getMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-white/10 bg-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-2 text-neon-purple" />
            Total Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.highPriority} high priority
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-400" />
            New This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.newThisWeek}</div>
          <p className="text-xs text-muted-foreground">
            Recently discovered
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
            Growing Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.trendingUp}</div>
          <p className="text-xs text-muted-foreground">
            Upward trending keywords
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Eye className="h-4 w-4 mr-2 text-orange-400" />
            Avg. Search Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avgSearchVolume.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Monthly searches
          </p>
        </CardContent>
      </Card>

      {/* Additional metrics row */}
      <Card className="border-white/10 bg-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            AIO Friendly
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{metrics.aioFriendly}</div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {metrics.total > 0 ? Math.round((metrics.aioFriendly / metrics.total) * 100) : 0}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-optimized opportunities
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Opportunity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{metrics.avgOpportunityScore}</div>
            <Badge variant={metrics.avgOpportunityScore >= 70 ? "default" : "outline"}>
              {metrics.avgOpportunityScore >= 70 ? 'High' : metrics.avgOpportunityScore >= 40 ? 'Medium' : 'Low'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Content potential score
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-glass md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                High: {opportunities.filter(o => o.priority === 'high').length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                Medium: {opportunities.filter(o => o.priority === 'medium').length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Low: {opportunities.filter(o => o.priority === 'low').length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};