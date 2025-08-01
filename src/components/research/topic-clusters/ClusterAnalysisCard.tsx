
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Lightbulb, 
  Clock,
  Zap,
  Eye,
  PenTool,
  Loader2
} from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';

interface TopicCluster {
  id: string;
  name: string;
  mainKeyword: string;
  keywords: string[];
  searchVolume: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  competition: number;
  pillarContent?: string;
  subTopics: Array<{
    title: string;
    searchVolume: number;
    difficulty: string;
    contentGap: boolean;
  }>;
  serpData?: SerpAnalysisResult;
  createdAt: Date;
  status: 'draft' | 'analyzing' | 'ready' | 'published';
}

interface ClusterAnalysisCardProps {
  cluster: TopicCluster;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onViewDetails: () => void;
  onCreateContent: () => void;
}

export const ClusterAnalysisCard: React.FC<ClusterAnalysisCardProps> = ({
  cluster,
  isAnalyzing,
  onAnalyze,
  onViewDetails,
  onCreateContent
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'ready': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'analyzing': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'draft': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCompletionPercentage = () => {
    switch (cluster.status) {
      case 'published': return 100;
      case 'ready': return 75;
      case 'analyzing': return 50;
      case 'draft': return 25;
      default: return 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 hover:border-purple-400/40 transition-all duration-300 overflow-hidden group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
                  {cluster.name}
                </CardTitle>
                <Badge className={`${getStatusColor(cluster.status)} border text-xs`}>
                  {cluster.status}
                </Badge>
              </div>
              <p className="text-purple-300 font-mono">{cluster.mainKeyword}</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {cluster.createdAt.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {cluster.subTopics.length} subtopics
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onViewDetails}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Progress</span>
              <span className="text-white">{getCompletionPercentage()}%</span>
            </div>
            <Progress 
              value={getCompletionPercentage()} 
              className="h-2 bg-white/10"
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div 
              className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-white/60">Volume</span>
              </div>
              <div className="text-lg font-bold text-blue-400">
                {cluster.searchVolume.toLocaleString()}
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-white/60">Difficulty</span>
              </div>
              <Badge className={`${getDifficultyColor(cluster.difficulty)} text-xs px-2 py-0`}>
                {cluster.difficulty}
              </Badge>
            </motion.div>

            <motion.div 
              className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-3 w-3 text-green-400" />
                <span className="text-xs text-white/60">Competition</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {Math.round(cluster.competition * 100)}%
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-3 w-3 text-red-400" />
                <span className="text-xs text-white/60">Gaps</span>
              </div>
              <div className="text-lg font-bold text-red-400">
                {cluster.subTopics.filter(t => t.contentGap).length}
              </div>
            </motion.div>
          </div>

          {/* Keywords Preview */}
          <div className="space-y-2">
            <div className="text-sm text-white/60">Keywords</div>
            <div className="flex flex-wrap gap-2">
              {cluster.keywords.slice(0, 4).map((keyword, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs"
                >
                  {keyword}
                </Badge>
              ))}
              {cluster.keywords.length > 4 && (
                <Badge variant="outline" className="bg-white/10 border-white/20 text-white/60 text-xs">
                  +{cluster.keywords.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {cluster.status === 'draft' && (
              <Button 
                size="sm"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            )}

            {cluster.status === 'analyzing' && (
              <div className="flex-1 flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-400 mr-2" />
                <span className="text-sm text-yellow-400">Analyzing...</span>
              </div>
            )}

            {cluster.status === 'ready' && (
              <>
                <Button 
                  size="sm"
                  onClick={onCreateContent}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Create Content
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onViewDetails}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </>
            )}

            {cluster.status === 'published' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onViewDetails}
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
