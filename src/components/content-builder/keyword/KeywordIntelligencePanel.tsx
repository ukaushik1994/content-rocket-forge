import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Clock, 
  RefreshCw,
  Zap,
  Database,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { keywordLibraryService, UnifiedKeyword } from '@/services/keywordLibraryService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface KeywordIntelligencePanelProps {
  keyword: string;
  onKeywordUpdate?: (keyword: UnifiedKeyword) => void;
  className?: string;
}

export const KeywordIntelligencePanel: React.FC<KeywordIntelligencePanelProps> = ({
  keyword,
  onKeywordUpdate,
  className
}) => {
  const [keywordData, setKeywordData] = useState<UnifiedKeyword | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (keyword) {
      loadKeywordData();
    }
  }, [keyword]);

  const loadKeywordData = async () => {
    if (!keyword) return;
    
    setLoading(true);
    try {
      const result = await keywordLibraryService.getKeywords({ search: keyword }, 1, 1);
      if (result.keywords.length > 0) {
        const foundKeyword = result.keywords.find(k => k.keyword.toLowerCase() === keyword.toLowerCase());
        if (foundKeyword) {
          setKeywordData(foundKeyword);
          if (onKeywordUpdate) {
            onKeywordUpdate(foundKeyword);
          }
        }
      }
    } catch (error) {
      console.error('Error loading keyword data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMetrics = async () => {
    if (!keywordData) return;
    
    setRefreshing(true);
    try {
      const updatedKeyword = await keywordLibraryService.refreshKeywordMetrics(keywordData.id);
      setKeywordData(updatedKeyword);
      if (onKeywordUpdate) {
        onKeywordUpdate(updatedKeyword);
      }
    } catch (error) {
      // Error handled in service
    } finally {
      setRefreshing(false);
    }
  };

  const getDataFreshness = () => {
    if (!keywordData) return 'unknown';
    return keywordLibraryService.getDataFreshness(keywordData);
  };

  const getIntentColor = (intent: string | null) => {
    switch (intent) {
      case 'informational': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'commercial': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'transactional': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'navigational': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getDifficultyLevel = (difficulty: number | null) => {
    if (!difficulty) return { level: 'Unknown', color: 'text-gray-400' };
    if (difficulty <= 30) return { level: 'Easy', color: 'text-green-400' };
    if (difficulty <= 60) return { level: 'Medium', color: 'text-yellow-400' };
    return { level: 'Hard', color: 'text-red-400' };
  };

  if (loading) {
    return (
      <Card className={cn("glass-panel border-white/10", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-3 text-muted-foreground">Loading keyword intelligence...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!keywordData) {
    return (
      <Card className={cn("glass-panel border-white/10", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Keyword Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-sm mb-4">
              This keyword hasn't been researched yet. Research it to get comprehensive SERP metrics.
            </p>
            <Button
              onClick={() => window.open(`/research/keyword-research?q=${encodeURIComponent(keyword)}`, '_blank')}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Research This Keyword
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const freshness = getDataFreshness();
  const difficultyInfo = getDifficultyLevel(keywordData.difficulty);

  return (
    <Card className={cn("glass-panel border-white/10", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Keyword Intelligence
          </CardTitle>
          <div className="flex items-center gap-2">
            {freshness === 'stale' && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Stale Data
              </Badge>
            )}
            {freshness === 'fresh' && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Fresh Data
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshMetrics}
              disabled={refreshing}
              className="h-8 px-3"
            >
              <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-glass border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Search Volume</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {keywordData.search_volume ? keywordData.search_volume.toLocaleString() : 'N/A'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-glass border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-muted-foreground">Difficulty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("text-2xl font-bold", difficultyInfo.color)}>
                {keywordData.difficulty || 'N/A'}
              </div>
              {keywordData.difficulty && (
                <Badge className={cn("text-xs", difficultyInfo.color)}>
                  {difficultyInfo.level}
                </Badge>
              )}
            </div>
            {keywordData.difficulty && (
              <Progress 
                value={keywordData.difficulty} 
                className="mt-2 h-2"
              />
            )}
          </motion.div>
        </div>

        {/* Competition & Intent */}
        <div className="grid grid-cols-2 gap-4">
          {keywordData.competition_score && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-glass border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-muted-foreground">Competition</span>
              </div>
              <div className="text-xl font-bold text-purple-400">
                {keywordData.competition_score.toFixed(1)}
              </div>
            </motion.div>
          )}

          {keywordData.intent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-glass border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-400" />
                <span className="text-sm text-muted-foreground">Intent</span>
              </div>
              <Badge className={getIntentColor(keywordData.intent)}>
                {keywordData.intent}
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Additional Metrics */}
        {(keywordData.cpc || keywordData.trend_direction || keywordData.seasonality) && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Additional Insights</h4>
            <div className="grid grid-cols-1 gap-3">
              {keywordData.cpc && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost Per Click:</span>
                  <span className="font-medium">${keywordData.cpc.toFixed(2)}</span>
                </div>
              )}
              {keywordData.trend_direction && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Trend:</span>
                  <Badge className={
                    keywordData.trend_direction === 'rising' 
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : keywordData.trend_direction === 'declining'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }>
                    {keywordData.trend_direction}
                  </Badge>
                </div>
              )}
              {keywordData.seasonality !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seasonality:</span>
                  <span className="font-medium">{keywordData.seasonality ? 'Yes' : 'No'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Quality & Freshness */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Last Updated: {keywordData.serp_last_updated 
                ? new Date(keywordData.serp_last_updated).toLocaleDateString()
                : 'Never'
              }
            </div>
            {keywordData.serp_data_quality && (
              <Badge className="text-xs">
                {keywordData.serp_data_quality} quality
              </Badge>
            )}
          </div>
        </div>

        {/* Usage Information */}
        {keywordData.usage_count > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-medium">
                Used in {keywordData.usage_count} content piece{keywordData.usage_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};