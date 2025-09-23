import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Search, Target, Users, BarChart3, Eye, MessageCircle, Trophy, Zap, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

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
      estimatedTraffic?: number;
      authority?: number;
    }>;
    peopleAlsoAsk: string[];
    contentGaps: string[];
    opportunities: {
      lowCompetition: string[];
      highVolume: string[];
      trending: string[];
      score?: number;
    };
    keywordVariations?: Array<{
      keyword: string;
      volume: number;
      difficulty: number;
      opportunity: number;
    }>;
    contentAnalysis?: {
      averageWordCount: number;
      topFormats: string[];
      missingTopics: string[];
    };
  };
  onActionClick?: (action: string, data?: any) => void;
  compareKeywords?: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    cpc: string;
  }>;
}

export const SerpVisualData: React.FC<SerpDataProps> = ({ serpData, onActionClick, compareKeywords }) => {
  const { keyword, searchVolume, difficulty, cpc, competition, trends, relatedKeywords, competitors, peopleAlsoAsk, opportunities, keywordVariations, contentAnalysis } = serpData;
  const [activeChart, setActiveChart] = useState<'trends' | 'competitors' | 'opportunities'>('trends');

  // Format trends data for chart
  const trendData = trends.map((value, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index] || `M${index + 1}`,
    volume: value
  }));

  // Enhanced competitor data for bar chart
  const competitorData = useMemo(() => competitors.slice(0, 8).map((comp, index) => ({
    position: comp.position,
    title: comp.title.length > 25 ? comp.title.substring(0, 25) + '...' : comp.title,
    domain: new URL(comp.url).hostname,
    estimatedTraffic: comp.estimatedTraffic || Math.floor(searchVolume * (10 - comp.position) / 50),
    authority: comp.authority || Math.floor(Math.random() * 30) + 40,
    opportunity: Math.max(0, 100 - difficulty - (comp.position * 10))
  })), [competitors, searchVolume, difficulty]);

  // Opportunity distribution data for pie chart
  const opportunityData = useMemo(() => [
    { name: 'Low Competition', value: opportunities.lowCompetition?.length || 0, color: '#10b981' },
    { name: 'High Volume', value: opportunities.highVolume?.length || 0, color: '#3b82f6' },
    { name: 'Trending', value: opportunities.trending?.length || 0, color: '#8b5cf6' }
  ].filter(item => item.value > 0), [opportunities]);

  // Keyword comparison data
  const comparisonData = useMemo(() => {
    if (!compareKeywords) return null;
    return [
      { keyword: keyword, volume: searchVolume, difficulty, cpc: parseFloat(cpc) },
      ...compareKeywords.map(kw => ({ ...kw, cpc: parseFloat(kw.cpc) }))
    ];
  }, [compareKeywords, keyword, searchVolume, difficulty, cpc]);

  // Keyword variations data for opportunity chart
  const variationsData = useMemo(() => {
    return keywordVariations?.slice(0, 10).map(kw => ({
      keyword: kw.keyword.length > 20 ? kw.keyword.substring(0, 20) + '...' : kw.keyword,
      volume: kw.volume,
      difficulty: kw.difficulty,
      opportunity: kw.opportunity
    })) || [];
  }, [keywordVariations]);

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

      {/* Enhanced Charts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Analysis
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeChart === 'trends' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('trends')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Trends
              </Button>
              <Button
                variant={activeChart === 'competitors' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('competitors')}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Competitors
              </Button>
              <Button
                variant={activeChart === 'opportunities' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChart('opportunities')}
              >
                <Zap className="h-4 w-4 mr-1" />
                Opportunities
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <AnimatePresence mode="wait">
              {activeChart === 'trends' && (
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
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
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#colorVolume)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {activeChart === 'competitors' && (
                <motion.div
                  key="competitors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={competitorData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="domain" type="category" className="text-xs" width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                        formatter={(value, name) => [
                          name === 'estimatedTraffic' ? `${value.toLocaleString()} visits` :
                          name === 'authority' ? `${value} DA` :
                          name === 'opportunity' ? `${value}% opportunity` : value,
                          name === 'estimatedTraffic' ? 'Est. Traffic' :
                          name === 'authority' ? 'Domain Authority' :
                          name === 'opportunity' ? 'Opportunity Score' : name
                        ]}
                      />
                      <Bar dataKey="estimatedTraffic" fill="hsl(var(--primary))" />
                      <Bar dataKey="authority" fill="hsl(var(--secondary))" />
                      <Bar dataKey="opportunity" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {activeChart === 'opportunities' && opportunityData.length > 0 && (
                <motion.div
                  key="opportunities"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex items-center justify-center"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={opportunityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {opportunityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                        formatter={(value, name) => [`${value} keywords`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Comparison Chart */}
      {comparisonData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Keyword Comparison Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="keyword" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value, name) => [
                      name === 'volume' ? value.toLocaleString() :
                      name === 'difficulty' ? `${value}%` :
                      name === 'cpc' ? `$${typeof value === 'number' ? value.toFixed(2) : value}` : value,
                      name === 'volume' ? 'Search Volume' :
                      name === 'difficulty' ? 'Difficulty' :
                      name === 'cpc' ? 'Cost Per Click' : name
                    ]}
                  />
                  <Bar dataKey="volume" fill="hsl(var(--primary))" />
                  <Bar dataKey="difficulty" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyword Variations Opportunity Chart */}
      {variationsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Keyword Opportunities Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={variationsData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="keyword" className="text-xs" angle={-45} textAnchor="end" height={80} />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value, name) => [
                      name === 'opportunity' ? `${value}% opportunity` :
                      name === 'volume' ? value.toLocaleString() :
                      name === 'difficulty' ? `${value}%` : value,
                      name === 'opportunity' ? 'Opportunity Score' :
                      name === 'volume' ? 'Search Volume' :
                      name === 'difficulty' ? 'Difficulty' : name
                    ]}
                  />
                  <Bar dataKey="opportunity" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="volume" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Top Competitors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Top Ranking Competitors Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {competitorData.slice(0, 6).map((competitor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all duration-300 border border-border/50"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {competitor.position}
                  </div>
                  <div className="text-xs text-muted-foreground">#{competitor.position}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate mb-1">{competitor.title}</h4>
                  <p className="text-xs text-primary mb-2">{competitor.domain}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{competitor.estimatedTraffic.toLocaleString()} visits</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <span>{competitor.authority} DA</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span className={competitor.opportunity > 60 ? 'text-green-600' : competitor.opportunity > 30 ? 'text-yellow-600' : 'text-red-600'}>
                        {competitor.opportunity}% opportunity
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Analysis Insights */}
      {contentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Strategy Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {contentAnalysis.averageWordCount.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">Average Word Count</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Target: {Math.floor(contentAnalysis.averageWordCount * 1.2).toLocaleString()}+ words
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {contentAnalysis.topFormats.length}
                </div>
                <div className="text-sm text-green-600">Top Content Formats</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {contentAnalysis.topFormats.slice(0, 2).join(', ')}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {contentAnalysis.missingTopics.length}
                </div>
                <div className="text-sm text-purple-600">Content Gaps</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Opportunities identified
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Enhanced Action Buttons */}
      {onActionClick && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 pt-6"
        >
          <Button 
            variant="default" 
            size="lg"
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            onClick={() => onActionClick('create-content-strategy', { 
              keyword, 
              searchVolume, 
              difficulty, 
              contentGaps: serpData.contentGaps, 
              competitors: competitorData.slice(0, 5),
              opportunities,
              contentAnalysis,
              keywordVariations: variationsData
            })}
          >
            <Target className="h-4 w-4" />
            Create Content Strategy
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="flex items-center gap-2 hover:bg-muted/50"
            onClick={() => onActionClick('analyze-competitors', { 
              keyword, 
              competitors: competitorData,
              searchVolume,
              difficulty,
              contentAnalysis
            })}
          >
            <Trophy className="h-4 w-4" />
            Deep Competitor Analysis
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="flex items-center gap-2 hover:bg-muted/50"
            onClick={() => onActionClick('explore-related-keywords', { 
              keyword, 
              relatedKeywords, 
              opportunities,
              searchVolume,
              keywordVariations,
              peopleAlsoAsk
            })}
          >
            <Search className="h-4 w-4" />
            Expand Keyword Research
          </Button>
          {variationsData.length > 0 && (
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center gap-2 hover:bg-muted/50"
              onClick={() => onActionClick('optimize-content-gaps', { 
                keyword, 
                contentGaps: serpData.contentGaps,
                missingTopics: contentAnalysis?.missingTopics || [],
                opportunities,
                averageWordCount: contentAnalysis?.averageWordCount
              })}
            >
              <Zap className="h-4 w-4" />
              Optimize Content Gaps
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};