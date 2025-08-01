
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Network,
  TrendingUp,
  Target,
  Calendar,
  Edit,
  BarChart3,
  Globe,
  Eye,
  Zap
} from 'lucide-react';

interface TopicCluster {
  id: number;
  name: string;
  mainKeyword: string;
  status: string;
  completion: number;
  keywords: string[];
  articles: number;
  totalTraffic: number;
  avgPosition: number;
  lastUpdated: string;
  color: string;
}

interface TopicClusterCardProps {
  cluster: TopicCluster;
  onAnalyze: (keyword: string) => void;
  onEdit: () => void;
}

export function TopicClusterCard({ cluster, onAnalyze, onEdit }: TopicClusterCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'draft':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className={`h-2 bg-gradient-to-r ${cluster.color}`}></div>
          
          <div className="p-6">
            {/* Title and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-200 transition-colors">
                    {cluster.name}
                  </h3>
                  <Badge className={getStatusColor(cluster.status)}>
                    {cluster.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Target className="h-4 w-4" />
                  <span className="font-medium text-blue-300">{cluster.mainKeyword}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEdit}
                  className="border-white/20 hover:bg-white/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAnalyze(cluster.mainKeyword)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Analyze
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Completion</span>
                <span className="text-sm font-medium text-white">{cluster.completion}%</span>
              </div>
              <Progress value={cluster.completion} className="h-2">
                <div 
                  className={`h-full bg-gradient-to-r ${cluster.color} rounded-full transition-all`}
                  style={{ width: `${cluster.completion}%` }}
                />
              </Progress>
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Network className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Keywords</span>
                <Badge variant="secondary" className="text-xs">
                  {cluster.keywords.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {cluster.keywords.slice(0, 3).map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-white/5 border-white/20 text-gray-300"
                  >
                    {keyword}
                  </Badge>
                ))}
                {cluster.keywords.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-gray-400">
                    +{cluster.keywords.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Globe className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-sm font-semibold text-white">{cluster.articles}</div>
                <div className="text-xs text-gray-400">Articles</div>
              </div>
              
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-sm font-semibold text-white">{formatNumber(cluster.totalTraffic)}</div>
                <div className="text-xs text-gray-400">Traffic</div>
              </div>
              
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-sm font-semibold text-white">{cluster.avgPosition}</div>
                <div className="text-xs text-gray-400">Avg. Pos</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Updated {cluster.lastUpdated}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-white/10"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
