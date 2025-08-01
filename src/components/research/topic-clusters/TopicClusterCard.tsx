
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  Target, 
  MoreVertical,
  Search,
  Edit3,
  Trash2,
  BarChart3,
  ArrowRight,
  Clock,
  Eye
} from 'lucide-react';
import { TopicCluster } from '@/types/topicCluster';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface TopicClusterCardProps {
  cluster: TopicCluster;
  onAnalyze: (keyword: string) => void;
  onEdit: (clusterId: string) => void;
  onDelete?: (clusterId: string) => void;
  onViewDetails?: (clusterId: string) => void;
  onCreateContent?: (clusterId: string) => void;
}

export function TopicClusterCard({ 
  cluster, 
  onAnalyze, 
  onEdit, 
  onDelete,
  onViewDetails,
  onCreateContent
}: TopicClusterCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-green-400';
    if (completion >= 50) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const formatTraffic = (traffic: number) => {
    if (traffic >= 1000000) return `${(traffic / 1000000).toFixed(1)}M`;
    if (traffic >= 1000) return `${(traffic / 1000).toFixed(0)}K`;
    return traffic.toString();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(cluster.id);
    } else {
      toast.info('Delete functionality will be implemented');
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(cluster.id);
    } else {
      toast.info('Detailed view coming soon');
    }
  };

  const handleCreateContent = () => {
    if (onCreateContent) {
      onCreateContent(cluster.id);
    } else {
      // Navigate to content builder with cluster data
      const clusterData = {
        mainKeyword: cluster.mainKeyword,
        keywords: cluster.keywords,
        clusterName: cluster.name
      };
      localStorage.setItem('cluster_content_data', JSON.stringify(clusterData));
      window.location.href = '/content-builder';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${cluster.color}`}></div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors">
                  {cluster.name}
                </h3>
                <Badge className={getStatusColor(cluster.status)}>
                  {cluster.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Target className="h-4 w-4" />
                <span className="font-medium text-blue-300">{cluster.mainKeyword}</span>
                <span>•</span>
                <Clock className="h-4 w-4" />
                <span>{cluster.lastUpdated}</span>
              </div>

              {cluster.description && (
                <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                  {cluster.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(cluster.id)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Cluster
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAnalyze(cluster.mainKeyword)}>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze SERP
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCreateContent}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Content
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-400 focus:text-red-300">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Cluster
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Progress</span>
              <span className={`font-medium ${getCompletionColor(cluster.completion)}`}>
                {cluster.completion}%
              </span>
            </div>
            <Progress value={cluster.completion} className="h-2" />
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Target className="h-4 w-4" />
              <span>Related Keywords ({cluster.keywords.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {cluster.keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                  {keyword}
                </Badge>
              ))}
              {cluster.keywords.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{cluster.keywords.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <FileText className="h-4 w-4" />
              </div>
              <div className="text-lg font-semibold text-white">{cluster.articles}</div>
              <div className="text-xs text-gray-400">Articles</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-lg font-semibold text-white">{formatTraffic(cluster.totalTraffic)}</div>
              <div className="text-xs text-gray-400">Traffic</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="text-lg font-semibold text-white">{cluster.avgPosition.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Avg Position</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAnalyze(cluster.mainKeyword)}
              className="flex-1 border-white/20 hover:border-blue-400 hover:text-blue-400"
            >
              <Search className="h-4 w-4 mr-2" />
              Analyze
            </Button>
            
            <Button
              size="sm"
              onClick={handleCreateContent}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
