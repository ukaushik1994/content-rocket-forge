import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, TrendingUp, Target, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { useNavigate } from 'react-router-dom';

interface KeywordStats {
  total: number;
  autoSaved: number;
  recentlyAdded: number;
  topKeywords: Array<{
    keyword: string;
    search_volume?: number;
    usage_count: number;
  }>;
}

interface KeywordLibraryStatsProps {
  className?: string;
  compact?: boolean;
}

export const KeywordLibraryStats = ({ className, compact = false }: KeywordLibraryStatsProps) => {
  const [stats, setStats] = useState<KeywordStats>({
    total: 0,
    autoSaved: 0,
    recentlyAdded: 0,
    topKeywords: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadKeywordStats();
  }, []);

  const loadKeywordStats = async () => {
    try {
      setLoading(true);
      
      // Get all keywords from library
      const response = await keywordLibraryService.getKeywords({}, 1, 1000);
      const keywords = response.keywords;
      
      // Calculate stats
      const autoSavedCount = keywords.filter(k => 
        k.source_type === 'ai_strategy' || k.notes?.includes('Auto-saved')
      ).length;
      
      // Recent keywords (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentCount = keywords.filter(k => 
        new Date(k.first_discovered_at) > sevenDaysAgo
      ).length;
      
      // Top keywords by usage or search volume
      const topKeywords = keywords
        .filter(k => k.search_volume || k.usage_count > 0)
        .sort((a, b) => {
          const scoreA = (a.search_volume || 0) + (a.usage_count * 1000);
          const scoreB = (b.search_volume || 0) + (b.usage_count * 1000);
          return scoreB - scoreA;
        })
        .slice(0, 5)
        .map(k => ({
          keyword: k.keyword,
          search_volume: k.search_volume,
          usage_count: k.usage_count
        }));

      setStats({
        total: keywords.length,
        autoSaved: autoSavedCount,
        recentlyAdded: recentCount,
        topKeywords
      });
    } catch (error) {
      console.error('Error loading keyword stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoSavedPercentage = stats.total > 0 ? (stats.autoSaved / stats.total) * 100 : 0;

  if (compact) {
    return (
      <Card className={`bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/30 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Keyword Library</div>
                <div className="text-xs text-white/60">
                  {stats.total} total • {stats.autoSaved} auto-saved
                </div>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/research/keyword-research')}
              className="text-xs bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <BookOpen className="h-5 w-5 text-blue-400" />
          Keyword Library Integration
          <Badge variant="outline" className="text-blue-300 border-blue-400/30 bg-blue-500/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Auto-Sync
          </Badge>
        </CardTitle>
        <p className="text-sm text-white/60">
          Keywords from AI proposals are automatically saved to your library
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-16 bg-white/10 rounded animate-pulse"></div>
            <div className="h-20 bg-white/10 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-white/60">Total Keywords</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="text-2xl font-bold text-green-400">{stats.autoSaved}</div>
                <div className="text-xs text-white/60">Auto-Saved</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="text-2xl font-bold text-blue-400">{stats.recentlyAdded}</div>
                <div className="text-xs text-white/60">This Week</div>
              </motion.div>
            </div>

            {/* Auto-Save Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Auto-Saved Keywords</span>
                <span className="text-white font-medium">{Math.round(autoSavedPercentage)}%</span>
              </div>
              <Progress 
                value={autoSavedPercentage} 
                className="h-2 bg-white/10"
              />
              <p className="text-xs text-white/60">
                {stats.autoSaved} of {stats.total} keywords were automatically saved from AI proposals
              </p>
            </motion.div>

            {/* Top Keywords */}
            {stats.topKeywords.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  Top Keywords
                </div>
                <div className="space-y-1">
                  {stats.topKeywords.map((keyword, idx) => (
                    <motion.div 
                      key={keyword.keyword}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                    >
                      <span className="text-sm text-white truncate">{keyword.keyword}</span>
                      <div className="flex items-center gap-2">
                        {keyword.search_volume && (
                          <Badge variant="outline" className="text-xs text-green-300 border-green-400/30 bg-green-500/10">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {keyword.search_volume.toLocaleString()}
                          </Badge>
                        )}
                        {keyword.usage_count > 0 && (
                          <Badge variant="outline" className="text-xs text-blue-300 border-blue-400/30 bg-blue-500/10">
                            {keyword.usage_count} uses
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                onClick={() => navigate('/research/keyword-research')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Keyword Library
              </Button>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  );
};