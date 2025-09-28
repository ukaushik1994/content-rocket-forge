import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Hash,
  Calendar,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import { UnifiedKeyword } from '@/services/keywordLibraryService';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';

interface KeywordTableRowProps {
  keyword: UnifiedKeyword;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onUpdate: () => void;
  onAction: (action: string, keywordId: string) => void;
}

export const KeywordTableRow: React.FC<KeywordTableRowProps> = ({
  keyword,
  selected,
  onSelect,
  onUpdate,
  onAction
}) => {
  const [researching, setResearching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'serp': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'glossary': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'strategy': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return <Hash className="h-3 w-3" />;
      case 'serp': return <Search className="h-3 w-3" />;
      case 'glossary': return <TrendingUp className="h-3 w-3" />;
      case 'strategy': return <Calendar className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const calculatePerformanceScore = (): number => {
    if (!keyword.search_volume || !keyword.difficulty) return 0;
    const volumeScore = Math.min(100, Math.log10(keyword.search_volume + 1) * 20);
    const difficultyScore = Math.max(0, 100 - keyword.difficulty);
    return Math.round((difficultyScore * 0.6) + (volumeScore * 0.4));
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--info))';
    if (score >= 40) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getTrendIcon = () => {
    const trend = keyword.trend_direction;
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const handleResearch = async () => {
    try {
      setResearching(true);
      await onAction('refresh', keyword.id);
      toast.success('Keyword research completed');
    } catch (error) {
      console.error('Research error:', error);
      toast.error('Failed to research keyword');
    } finally {
      setResearching(false);
    }
  };

  const performanceScore = calculatePerformanceScore();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        group border-b border-border/30 hover:bg-muted/30 transition-colors
        ${selected ? 'bg-primary/5' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection */}
      <td className="w-12 px-4 py-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(keyword.id, !!checked)}
        />
      </td>

      {/* Source */}
      <td className="px-4 py-3">
        <Badge 
          variant="outline" 
          className={`text-xs font-medium ${getSourceBadgeColor(keyword.source_type)}`}
        >
          {getSourceIcon(keyword.source_type)}
          <span className="ml-1 capitalize">{keyword.source_type}</span>
        </Badge>
      </td>

      {/* Keyword */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm line-clamp-1">
            {keyword.keyword}
          </span>
          {keyword.notes && (
            <span className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {keyword.notes}
            </span>
          )}
        </div>
      </td>

      {/* Metrics */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {keyword.search_volume !== null && keyword.search_volume !== undefined && (
            <div className="text-xs">
              <div className="text-muted-foreground">Volume</div>
              <div className="font-medium text-foreground">
                {keyword.search_volume.toLocaleString()}
              </div>
            </div>
          )}
          
          {keyword.difficulty !== null && keyword.difficulty !== undefined && (
            <div className="text-xs">
              <div className="text-muted-foreground">Difficulty</div>
              <div className="font-medium text-foreground">
                {keyword.difficulty}%
              </div>
            </div>
          )}
        </div>
      </td>

      {/* Performance */}
      <td className="px-4 py-3">
        {performanceScore > 0 ? (
          <div className="w-20">
            <div className="flex items-center justify-between mb-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span 
                className="text-xs font-medium"
                style={{ color: getScoreColor(performanceScore) }}
              >
                {performanceScore}
              </span>
            </div>
            <Progress 
              value={performanceScore} 
              className="h-1"
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>

      {/* Usage */}
      <td className="px-4 py-3">
        <div className="text-xs">
          <div className="text-muted-foreground">Usage</div>
          <div className="font-medium text-foreground">
            {keyword.usage_count}
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-xs text-muted-foreground">
            {new Date(keyword.first_discovered_at).toLocaleDateString()}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Quick Actions - Always Visible */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResearch}
            disabled={researching}
            className={`
              h-7 px-2 transition-opacity
              ${isHovered || selected ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <RefreshCw className={`h-3 w-3 ${researching ? 'animate-spin' : ''}`} />
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={`
                  h-7 w-7 p-0 transition-opacity
                  ${isHovered || selected ? 'opacity-100' : 'opacity-0'}
                `}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onAction('google', keyword.id)}>
                <Search className="h-3 w-3 mr-2" />
                Search Google
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('edit', keyword.id)}>
                <Edit className="h-3 w-3 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('usage', keyword.id)}>
                <Eye className="h-3 w-3 mr-2" />
                View Usage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('export', keyword.id)}>
                <Download className="h-3 w-3 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onAction('delete', keyword.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </motion.tr>
  );
};