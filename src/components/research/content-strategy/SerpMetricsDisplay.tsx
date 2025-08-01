
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SerpMetricsDisplayProps {
  metrics: {
    searchVolume: number;
    keywordDifficulty: number;
    competitionScore: number;
    cpc?: number;
    topResults?: any[];
    isMockData?: boolean;
  };
}

export const SerpMetricsDisplay = ({ metrics }: SerpMetricsDisplayProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'from-green-500 to-emerald-500';
    if (difficulty < 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 30) return 'Easy';
    if (difficulty < 60) return 'Medium';
    return 'Hard';
  };

  const metricsData = [
    {
      icon: TrendingUp,
      label: 'Search Volume',
      value: formatNumber(metrics.searchVolume),
      subtitle: 'Monthly searches',
      color: 'from-blue-500 to-cyan-500',
      progress: Math.min((metrics.searchVolume / 100000) * 100, 100)
    },
    {
      icon: Target,
      label: 'Difficulty',
      value: metrics.keywordDifficulty,
      subtitle: getDifficultyLabel(metrics.keywordDifficulty),
      color: getDifficultyColor(metrics.keywordDifficulty),
      progress: metrics.keywordDifficulty
    },
    {
      icon: Users,
      label: 'Competition',
      value: `${Math.round(metrics.competitionScore * 100)}%`,
      subtitle: 'Market Competition',
      color: 'from-purple-500 to-pink-500',
      progress: metrics.competitionScore * 100
    },
    ...(metrics.cpc ? [{
      icon: DollarSign,
      label: 'CPC',
      value: `$${metrics.cpc.toFixed(2)}`,
      subtitle: 'Cost per click',
      color: 'from-green-500 to-emerald-500',
      progress: Math.min((metrics.cpc / 5) * 100, 100)
    }] : [])
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color} bg-opacity-20 backdrop-blur-sm border border-white/10`}>
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {metric.value}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">{metric.label}</span>
                  </div>
                  <Progress value={metric.progress} className="h-2 bg-gray-800" />
                  <div className="text-xs text-gray-400">{metric.subtitle}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Results Preview */}
      {metrics.topResults && metrics.topResults.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Top Competitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topResults.slice(0, 3).map((result, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <Badge variant="outline" className="text-xs">
                    #{result.position}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {result.snippet}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Quality Badge */}
      <div className="flex justify-center">
        <Badge className={`px-4 py-2 text-sm ${
          metrics.isMockData 
            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
            : 'bg-green-500/20 text-green-300 border-green-500/30'
        }`}>
          {metrics.isMockData && <AlertTriangle className="h-3 w-3 mr-1" />}
          {metrics.isMockData ? 'Demo Data' : 'Live SERP Data'}
        </Badge>
      </div>
    </motion.div>
  );
};
