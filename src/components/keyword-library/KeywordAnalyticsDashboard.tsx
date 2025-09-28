import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { UnifiedKeyword } from '@/services/keywordLibraryService';

interface KeywordAnalyticsDashboardProps {
  keywords: UnifiedKeyword[];
  className?: string;
}

export const KeywordAnalyticsDashboard: React.FC<KeywordAnalyticsDashboardProps> = ({
  keywords,
  className = ""
}) => {
  // Analytics calculations
  const analytics = React.useMemo(() => {
    const total = keywords.length;
    const withVolume = keywords.filter(k => k.search_volume && k.search_volume > 0).length;
    const withDifficulty = keywords.filter(k => k.difficulty && k.difficulty > 0).length;
    const highOpportunity = keywords.filter(k => {
      if (!k.search_volume || !k.difficulty) return false;
      return k.search_volume > 1000 && k.difficulty < 40;
    }).length;

    // Data freshness
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fresh = keywords.filter(k => 
      k.serp_last_updated && new Date(k.serp_last_updated) > oneDayAgo
    ).length;
    const stale = keywords.filter(k => 
      !k.serp_last_updated || new Date(k.serp_last_updated) <= oneDayAgo
    ).length;

    // Performance distribution
    const highPerformance = keywords.filter(k => {
      if (!k.search_volume || !k.difficulty) return false;
      const volumeScore = Math.min(100, Math.log10(k.search_volume + 1) * 20);
      const difficultyScore = Math.max(0, 100 - k.difficulty);
      const score = (difficultyScore * 0.6) + (volumeScore * 0.4);
      return score >= 70;
    }).length;

    // Source distribution
    const sourceStats = keywords.reduce((acc, k) => {
      acc[k.source_type] = (acc[k.source_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Usage statistics
    const totalUsage = keywords.reduce((sum, k) => sum + k.usage_count, 0);
    const avgUsage = total > 0 ? totalUsage / total : 0;

    return {
      total,
      withVolume,
      withDifficulty,
      highOpportunity,
      fresh,
      stale,
      highPerformance,
      sourceStats,
      totalUsage,
      avgUsage,
      dataCompleteness: total > 0 ? ((withVolume + withDifficulty) / (total * 2)) * 100 : 0
    };
  }, [keywords]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {/* Performance Overview */}
      <motion.div variants={item}>
        <Card className="border-success/20 bg-gradient-to-br from-success/10 to-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-success" />
              High Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-success">
                {analytics.highPerformance}
              </span>
              <Badge variant="outline" className="border-success/30 text-success">
                {analytics.total > 0 ? Math.round((analytics.highPerformance / analytics.total) * 100) : 0}%
              </Badge>
            </div>
            <Progress 
              value={analytics.total > 0 ? (analytics.highPerformance / analytics.total) * 100 : 0}
              className="h-1"
            />
            <p className="text-xs text-muted-foreground">
              Keywords with strong opportunity scores
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Quality */}
      <motion.div variants={item}>
        <Card className="border-info/20 bg-gradient-to-br from-info/10 to-info/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-info" />
              Data Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-info">
                {Math.round(analytics.dataCompleteness)}%
              </span>
              <Badge variant="outline" className="border-info/30 text-info">
                Complete
              </Badge>
            </div>
            <Progress 
              value={analytics.dataCompleteness}
              className="h-1"
            />
            <p className="text-xs text-muted-foreground">
              Keywords with volume & difficulty data
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* High Opportunity */}
      <motion.div variants={item}>
        <Card className="border-warning/20 bg-gradient-to-br from-warning/10 to-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-warning">
                {analytics.highOpportunity}
              </span>
              <Badge variant="outline" className="border-warning/30 text-warning">
                Quick Wins
              </Badge>
            </div>
            <Progress 
              value={analytics.total > 0 ? (analytics.highOpportunity / analytics.total) * 100 : 0}
              className="h-1"
            />
            <p className="text-xs text-muted-foreground">
              High volume, low difficulty keywords
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Freshness */}
      <motion.div variants={item}>
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              Data Freshness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">{analytics.fresh}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">{analytics.stale}</span>
              </div>
            </div>
            <Progress 
              value={analytics.total > 0 ? (analytics.fresh / analytics.total) * 100 : 0}
              className="h-1"
            />
            <p className="text-xs text-muted-foreground">
              Fresh (24h) vs stale SERP data
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Source Distribution */}
      <motion.div variants={item} className="md:col-span-2">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Source Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(analytics.sourceStats).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      source === 'manual' ? 'bg-blue-400' :
                      source === 'serp' ? 'bg-purple-400' :
                      source === 'glossary' ? 'bg-green-400' :
                      source === 'strategy' ? 'bg-orange-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm capitalize">{source}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage Statistics */}
      <motion.div variants={item} className="md:col-span-2">
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {analytics.totalUsage}
                </div>
                <div className="text-xs text-muted-foreground">Total Uses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {analytics.avgUsage.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Avg per Keyword</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {keywords.filter(k => k.usage_count > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">Active Keywords</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};