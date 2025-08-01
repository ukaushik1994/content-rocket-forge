
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Search, DollarSign, Zap, Target, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeywordMetricsProps {
  serpData: any;
  keyword: string;
  onSaveKeyword: (keyword: any) => void;
}

export const KeywordMetrics: React.FC<KeywordMetricsProps> = ({
  serpData,
  keyword,
  onSaveKeyword
}) => {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-400 border-green-400';
    if (difficulty < 60) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 30) return 'Easy';
    if (difficulty < 60) return 'Medium';
    return 'Hard';
  };

  const metrics = [
    {
      icon: Search,
      label: 'Search Volume',
      value: serpData?.searchVolume?.toLocaleString() || 'N/A',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Target,
      label: 'Keyword Difficulty',
      value: serpData?.keywordDifficulty || 'N/A',
      color: getDifficultyColor(serpData?.keywordDifficulty || 0).split(' ')[0],
      bgColor: 'bg-yellow-500/10',
      badge: getDifficultyLabel(serpData?.keywordDifficulty || 0)
    },
    {
      icon: TrendingUp,
      label: 'Competition',
      value: serpData?.competitionScore || 'N/A',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Zap,
      label: 'Opportunities',
      value: (serpData?.contentGaps?.length || 0) + (serpData?.peopleAlsoAsk?.length || 0),
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-panel border-white/10 hover:border-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.bgColor} rounded-full flex items-center justify-center`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  {metric.badge && (
                    <Badge variant="outline" className={getDifficultyColor(serpData?.keywordDifficulty || 0)}>
                      {metric.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Keyword Overview */}
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Keyword Overview: "{keyword}"
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSaveKeyword({ keyword, ...serpData })}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Save Keyword
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SERP Features */}
            <div>
              <h3 className="font-semibold mb-3">SERP Features Present</h3>
              <div className="flex flex-wrap gap-2">
                {serpData?.featuredSnippets?.length > 0 && (
                  <Badge variant="secondary">Featured Snippet</Badge>
                )}
                {serpData?.peopleAlsoAsk?.length > 0 && (
                  <Badge variant="secondary">People Also Ask</Badge>
                )}
                {serpData?.knowledgeGraph && (
                  <Badge variant="secondary">Knowledge Graph</Badge>
                )}
                {serpData?.topResults?.length > 0 && (
                  <Badge variant="secondary">Organic Results</Badge>
                )}
                {serpData?.relatedSearches?.length > 0 && (
                  <Badge variant="secondary">Related Searches</Badge>
                )}
              </div>
            </div>

            {/* Content Opportunities */}
            <div>
              <h3 className="font-semibold mb-3">Content Opportunities</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Questions to Answer</span>
                  <span className="font-medium">{serpData?.peopleAlsoAsk?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Content Gaps</span>
                  <span className="font-medium">{serpData?.contentGaps?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Related Keywords</span>
                  <span className="font-medium">{serpData?.keywords?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Top Competitors</span>
                  <span className="font-medium">{serpData?.topResults?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
