import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Calendar,
  Hash,
  ExternalLink,
  RefreshCw,
  Star,
  AlertCircle
} from 'lucide-react';
import { UnifiedKeyword } from '@/services/keywordLibraryService';
import { KeywordPerformanceIndicator } from './KeywordPerformanceIndicator';
import { formatNumber } from '@/utils/numberFormatting';
import { toast } from 'sonner';

interface EnhancedKeywordCardProps {
  keyword: UnifiedKeyword;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onUpdate: () => void;
  onAction?: (action: string, keywordId: string) => void;
  showPerformanceDetails?: boolean;
}

export const EnhancedKeywordCard: React.FC<EnhancedKeywordCardProps> = ({
  keyword,
  selected,
  onSelect,
  onUpdate,
  onAction,
  showPerformanceDetails = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'serp': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'glossary': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'strategy': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  const getDifficultyColor = (difficulty?: number | null) => {
    if (!difficulty) return 'text-muted-foreground';
    if (difficulty <= 30) return 'text-success';
    if (difficulty <= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getIntentBadge = (intent?: string | null) => {
    if (!intent) return null;
    
    const colors = {
      informational: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      transactional: 'bg-green-500/20 text-green-400 border-green-500/30',
      navigational: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      commercial: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };

    return (
      <Badge variant="outline" className={`text-xs ${colors[intent as keyof typeof colors] || colors.informational}`}>
        {intent}
      </Badge>
    );
  };

  const handleAction = async (action: string) => {
    if (!onAction) return;
    
    setIsProcessing(true);
    try {
      await onAction(action, keyword.id);
      if (action === 'refresh') {
        toast.success('Keyword metrics refreshed');
        onUpdate();
      }
    } catch (error) {
      toast.error(`Failed to ${action} keyword`);
    } finally {
      setIsProcessing(false);
    }
  };

  const isStale = () => {
    if (!keyword.serp_last_updated) return true;
    const lastUpdated = new Date(keyword.serp_last_updated);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastUpdated <= oneDayAgo;
  };

  const calculateOpportunityScore = () => {
    if (!keyword.search_volume || !keyword.difficulty || keyword.difficulty === 0) return 0;
    const ratio = keyword.search_volume / keyword.difficulty;
    return Math.min(100, Math.log10(ratio + 1) * 25);
  };

  const opportunityScore = calculateOpportunityScore();
  const showOpportunityBadge = opportunityScore >= 70;

  return (
    <motion.div variants={item} layout>
      <Card className={`
        border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md 
        transition-all duration-300 hover:shadow-xl hover:border-white/20 group
        ${selected ? 'ring-2 ring-primary/50 bg-primary/5 border-primary/20' : ''}
        ${showOpportunityBadge ? 'border-l-4 border-l-success/60' : ''}
      `}>
        <CardContent className="p-6">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelect(keyword.id, !!checked)}
                className="mt-1"
              />
              <div className="flex items-center gap-2">
                {getSourceIcon(keyword.source_type)}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getSourceBadgeColor(keyword.source_type)}`}
                >
                  {keyword.source_type}
                </Badge>
                {isStale() && (
                  <Badge variant="outline" className="text-xs border-warning/30 text-warning">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Stale
                  </Badge>
                )}
                {showOpportunityBadge && (
                  <Badge variant="outline" className="text-xs border-success/30 text-success">
                    <Star className="h-3 w-3 mr-1" />
                    High Opportunity
                  </Badge>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleAction('refresh')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh SERP Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('research')}>
                  <Search className="h-4 w-4 mr-2" />
                  Deep Research
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('edit')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('usage')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Usage
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('google')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Search Google
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('delete')}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Keyword Title */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowDetails(!showDetails)}>
              {keyword.keyword}
            </h3>
            
            {/* Metrics Row */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              {keyword.search_volume !== null && keyword.search_volume !== undefined && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-muted-foreground">
                    {formatNumber(keyword.search_volume)}
                  </span>
                </div>
              )}
              
              {keyword.difficulty !== null && keyword.difficulty !== undefined && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(keyword.difficulty)?.replace('text-', 'bg-')}`} />
                  <span className={getDifficultyColor(keyword.difficulty)}>
                    {keyword.difficulty}%
                  </span>
                </div>
              )}

              {keyword.cpc && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">CPC:</span>
                  <span className="text-xs font-medium">${keyword.cpc.toFixed(2)}</span>
                </div>
              )}

              {getIntentBadge(keyword.intent)}
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="mb-4">
            <KeywordPerformanceIndicator 
              keyword={keyword} 
              showDetails={showDetails || showPerformanceDetails}
            />
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Usage:</span>
              <Badge variant="secondary" className="text-xs">
                {keyword.usage_count}
              </Badge>
              {keyword.seasonality && (
                <Badge variant="outline" className="text-xs border-info/30 text-info">
                  Seasonal
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(keyword.first_discovered_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Notes Section */}
          {keyword.notes && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-muted-foreground line-clamp-2">
                <strong>Notes:</strong> {keyword.notes}
              </p>
            </div>
          )}

          {/* Enhanced Details (when expanded) */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-white/10 space-y-3"
            >
              {keyword.competition_score && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Competition:</span>
                  <Badge variant="outline" className="text-xs">
                    {keyword.competition_score}/100
                  </Badge>
                </div>
              )}
              
              {keyword.serp_data_quality && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data Quality:</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {keyword.serp_data_quality}
                  </Badge>
                </div>
              )}

              {opportunityScore > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Opportunity Score:</span>
                  <Badge variant="outline" className={`text-xs ${
                    opportunityScore >= 70 ? 'border-success/30 text-success' :
                    opportunityScore >= 40 ? 'border-warning/30 text-warning' :
                    'border-muted/30 text-muted-foreground'
                  }`}>
                    {Math.round(opportunityScore)}/100
                  </Badge>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};