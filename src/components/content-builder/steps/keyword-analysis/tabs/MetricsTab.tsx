
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SerpAnalysisResult } from '@/types/serp';
import { TrendingUp, Target, Users, Calendar, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricsTabProps {
  serpData: SerpAnalysisResult;
}

export function MetricsTab({ serpData }: MetricsTabProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const metrics = [
    {
      icon: TrendingUp,
      label: 'Search Volume',
      value: formatNumber(serpData.searchVolume || 0),
      subtitle: 'Monthly searches',
      color: 'from-blue-500 to-cyan-500',
      progress: Math.min((serpData.searchVolume || 0) / 100000 * 100, 100)
    },
    {
      icon: Target,
      label: 'Difficulty',
      value: serpData.keywordDifficulty || 0,
      subtitle: 'SEO Difficulty',
      color: 'from-orange-500 to-red-500',
      progress: serpData.keywordDifficulty || 0
    },
    {
      icon: Users,
      label: 'Competition',
      value: `${Math.round((serpData.competitionScore || 0) * 100)}%`,
      subtitle: 'Market Competition',
      color: 'from-green-500 to-emerald-500',
      progress: (serpData.competitionScore || 0) * 100
    },
    {
      icon: Globe,
      label: 'Opportunity',
      value: serpData.contentGaps?.length || 0,
      subtitle: 'Content Gaps',
      color: 'from-purple-500 to-pink-500',
      progress: Math.min((serpData.contentGaps?.length || 0) * 20, 100)
    }
  ];

  return (
    <div className="space-y-8">
      {/* Futuristic Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Floating particles effect */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} bg-opacity-20 backdrop-blur-sm border border-white/10`}>
                    <metric.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-mono">
                      {metric.value}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">{metric.label}</span>
                    <span className="text-xs text-gray-500 font-mono">{metric.progress.toFixed(0)}%</span>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={metric.progress} 
                      className="h-2 bg-gray-800 border border-white/10"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} opacity-20 rounded-full blur-sm`} />
                  </div>
                  
                  <div className="text-xs text-gray-400">{metric.subtitle}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Volume Metadata */}
      {serpData.volumeMetadata && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg backdrop-blur-sm border border-white/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Data Intelligence
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {Object.entries({
                  source: serpData.volumeMetadata.source,
                  confidence: serpData.volumeMetadata.confidence,
                  location: serpData.volumeMetadata.location,
                  language: serpData.volumeMetadata.language,
                  engine: serpData.volumeMetadata.engine,
                  updated: serpData.volumeMetadata.lastUpdated ? 
                    new Date(serpData.volumeMetadata.lastUpdated).toLocaleDateString() : 
                    'Unknown'
                }).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="text-sm font-medium text-gray-300 capitalize mb-1">{key}</div>
                    <div className="text-xs text-gray-400 font-mono">{value}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Top Results with Holographic Effect */}
      {serpData.topResults && serpData.topResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg backdrop-blur-sm border border-white/10">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Top Competitors Analysis
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Analyzing top {serpData.topResults.length} search results for competitive insights
              </div>
              
              <div className="space-y-4">
                {serpData.topResults.slice(0, 3).map((result, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0">
                      <Badge className="bg-gradient-to-r from-primary/20 to-blue-500/20 text-white border-white/20 font-mono">
                        #{result.position || index + 1}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="font-medium text-white truncate group-hover:text-primary transition-colors duration-300">
                        {result.title}
                      </div>
                      <div className="text-sm text-gray-400 line-clamp-2">
                        {result.snippet}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Data Quality Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <Badge className={`px-4 py-2 text-sm font-medium ${
          serpData.isMockData 
            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30' 
            : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30'
        } backdrop-blur-sm`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${serpData.isMockData ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
          {serpData.isMockData ? 'Demo Data' : 'Live Data'} • {serpData.dataQuality || 'Standard Quality'}
        </Badge>
      </motion.div>
    </div>
  );
}
