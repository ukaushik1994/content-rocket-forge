import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Search, Target, Users, BarChart3, Eye, MessageCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SerpDataProps {
  serpData: {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    cpc: string;
    competition: string;
    trends: number[];
    relatedKeywords: string[];
    competitors: Array<{
      url: string;
      title: string;
      snippet?: string;
      position: number;
    }>;
    peopleAlsoAsk: string[];
    contentGaps: string[];
    opportunities: {
      lowCompetition: string[];
      highVolume: string[];
      trending: string[];
    };
  };
}

export const SerpVisualData: React.FC<SerpDataProps> = ({ serpData }) => {
  const { keyword, searchVolume, difficulty, cpc, competition, trends, relatedKeywords, competitors, peopleAlsoAsk, opportunities } = serpData;

  // Format trends data for chart
  const trendData = trends.map((value, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index] || `M${index + 1}`,
    volume: value
  }));

  // Competition data for bar chart
  const competitorData = competitors.slice(0, 5).map((comp, index) => ({
    position: comp.position,
    title: comp.title.length > 30 ? comp.title.substring(0, 30) + '...' : comp.title,
    domain: new URL(comp.url).hostname
  }));

  const getDifficultyColor = (diff: number) => {
    if (diff < 30) return 'text-green-600';
    if (diff < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompetitionColor = (comp: string) => {
    switch (comp.toLowerCase()) {
      case 'low': return 'bg-green-500/20 text-green-700';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700';
      case 'high': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">SERP Analysis for "{keyword}"</h3>
        <p className="text-muted-foreground">Complete keyword research and competitor analysis</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Search Volume</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{searchVolume.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Difficulty</p>
                <p className={`text-2xl font-bold ${getDifficultyColor(difficulty)}`}>{difficulty}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Avg CPC</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">${cpc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Competition</p>
                <Badge className={getCompetitionColor(competition)}>{competition}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Search Volume Trends (12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Competitors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Top Ranking Competitors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {competitors.slice(0, 5).map((competitor, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {competitor.position}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">{competitor.title}</h4>
                  <p className="text-xs text-primary">{new URL(competitor.url).hostname}</p>
                  {competitor.snippet && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{competitor.snippet}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opportunities & Related Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Content Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunities.lowCompetition.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-green-600 mb-2">Low Competition Keywords</h5>
                <div className="space-y-1">
                  {opportunities.lowCompetition.map((kw, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-1 text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {opportunities.highVolume.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-blue-600 mb-2">High Volume Keywords</h5>
                <div className="space-y-1">
                  {opportunities.highVolume.map((kw, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-1 text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {opportunities.trending.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-purple-600 mb-2">Trending Keywords</h5>
                <div className="space-y-1">
                  {opportunities.trending.map((kw, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-1 text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* People Also Ask */}
        {peopleAlsoAsk.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                People Also Ask
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {peopleAlsoAsk.map((question, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <p className="text-sm text-foreground">{question}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4">
        <Button variant="default" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Create Content Strategy
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analyze Competitors
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Explore Related Keywords
        </Button>
      </div>
    </div>
  );
};