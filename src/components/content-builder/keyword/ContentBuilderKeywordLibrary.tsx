import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  Trash2, 
  RefreshCw,
  Volume2,
  Target,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { keywordLibraryService, UnifiedKeyword, KeywordFilters } from '@/services/keywordLibraryService';
import { KeywordUsageDetail } from '@/components/keyword-library/KeywordUsageDetail';
import { DuplicateManager } from '@/components/keyword-library/DuplicateManager';
import { KeywordFilters as KeywordFiltersComponent } from '@/components/research/keyword/KeywordFilters';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ContentBuilderKeywordLibraryProps {
  onKeywordSelect?: (keyword: UnifiedKeyword) => void;
  refreshTrigger?: number;
  className?: string;
  compact?: boolean;
}

export const ContentBuilderKeywordLibrary: React.FC<ContentBuilderKeywordLibraryProps> = ({
  onKeywordSelect,
  refreshTrigger,
  className,
  compact = false
}) => {
  const [keywords, setKeywords] = useState<UnifiedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { state, setMainKeyword, addKeyword } = useContentBuilder();

  const [filters, setFilters] = useState<KeywordFilters>({
    search: '',
    has_usage: undefined,
    data_freshness: 'fresh' // Prioritize fresh data for content building
  });

  const loadKeywords = async () => {
    setLoading(true);
    try {
      const currentFilters = { ...filters, search: searchTerm };
      const result = await keywordLibraryService.getKeywords(currentFilters, 1, compact ? 10 : 20);
      setKeywords(result.keywords);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast.error('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeywords();
  }, [searchTerm, refreshTrigger, filters]);

  const handleKeywordSelect = (keyword: UnifiedKeyword) => {
    // Integrate with Content Builder context
    setMainKeyword(keyword.keyword);
    addKeyword(keyword.keyword);
    
    // Call parent handler
    if (onKeywordSelect) {
      onKeywordSelect(keyword);
    }
    
    toast.success(`Selected "${keyword.keyword}" for content creation`);
  };

  const handleDeleteKeywords = async (keywordIds: string[]) => {
    try {
      await keywordLibraryService.deleteKeywords(keywordIds);
      await loadKeywords();
      setSelectedKeywords([]);
      toast.success('Keywords deleted successfully');
    } catch (error) {
      toast.error('Failed to delete keywords');
    }
  };

  const handleRefreshKeyword = async (keywordId: string) => {
    setRefreshingIds(prev => new Set(prev).add(keywordId));
    try {
      await keywordLibraryService.refreshKeywordMetrics(keywordId);
      await loadKeywords();
    } catch (error) {
      // Error is handled in service
    } finally {
      setRefreshingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(keywordId);
        return newSet;
      });
    }
  };

  const handleRefreshStale = async () => {
    setLoading(true);
    try {
      await keywordLibraryService.refreshStaleKeywords();
      await loadKeywords();
    } catch (error) {
      // Error is handled in service
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'manual': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'research': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'serp': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'content_builder': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'glossary': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getDataFreshnessBadge = (keyword: UnifiedKeyword) => {
    const freshness = keywordLibraryService.getDataFreshness(keyword);
    switch (freshness) {
      case 'fresh':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">Fresh</Badge>;
      case 'stale':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">Stale</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'declining':
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const toggleRowExpansion = (keywordId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keywordId)) {
        newSet.delete(keywordId);
      } else {
        newSet.add(keywordId);
      }
      return newSet;
    });
  };

  const staleKeywordsCount = keywords.filter(k => keywordLibraryService.getDataFreshness(k) === 'stale').length;

  if (keywords.length === 0 && !loading) {
    return (
      <Card className={cn("glass-panel border-white/10", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5 text-primary" />
            {compact ? 'Keywords' : 'Content Builder Library'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No keywords available</h3>
            <p className="text-muted-foreground mb-4">Research keywords to populate your library</p>
            <Button 
              onClick={() => window.location.href = '/research/keyword-research'}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Start Researching
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("glass-panel border-white/10", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5 text-primary" />
            {compact ? `Keywords (${keywords.length})` : `Content Builder Library (${keywords.length})`}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!compact && staleKeywordsCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStale}
                disabled={loading}
                className="text-xs"
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
                Refresh Stale ({staleKeywordsCount})
              </Button>
            )}
            {!compact && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDuplicateManager(true)}
                className="text-xs"
              >
                Find Duplicates
              </Button>
            )}
            {selectedKeywords.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteKeywords(selectedKeywords)}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete ({selectedKeywords.length})
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
          {!compact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 px-3"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!compact && (
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent>
              <div className="mt-4">
                <KeywordFiltersComponent
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-0">
          <AnimatePresence>
            {keywords.map((keyword) => (
              <motion.div
                key={keyword.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border-b border-white/5"
              >
                <div 
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handleKeywordSelect(keyword)}
                >
                  {!compact && (
                    <input
                      type="checkbox"
                      checked={selectedKeywords.includes(keyword.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedKeywords([...selectedKeywords, keyword.id]);
                        } else {
                          setSelectedKeywords(selectedKeywords.filter(id => id !== keyword.id));
                        }
                      }}
                      className="rounded border-white/20"
                    />
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getSourceBadgeColor(keyword.source_type)}>
                      {keyword.source_type === 'content_builder' ? 'CB' : keyword.source_type}
                    </Badge>
                    {getDataFreshnessBadge(keyword)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{keyword.keyword}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {keyword.search_volume && (
                        <span className="flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          {keyword.search_volume.toLocaleString()}
                        </span>
                      )}
                      {keyword.difficulty && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          KD {keyword.difficulty}
                        </span>
                      )}
                      {keyword.competition_score && (
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {keyword.competition_score.toFixed(0)}
                        </span>
                      )}
                      {keyword.trend_direction && (
                        <span className="flex items-center gap-1">
                          {getTrendIcon(keyword.trend_direction)}
                        </span>
                      )}
                      {keyword.usage_count > 0 && (
                        <KeywordUsageDetail 
                          keywordId={keyword.id} 
                          usageCount={keyword.usage_count}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {keyword.serp_last_updated && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(keyword.serp_last_updated).toLocaleDateString()}
                      </div>
                    )}
                    
                    {!compact && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(keyword.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {expandedRows.has(keyword.id) ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshKeyword(keyword.id);
                          }}
                          disabled={refreshingIds.has(keyword.id)}
                          className="h-6 w-6 p-0"
                        >
                          <RefreshCw className={cn("h-3 w-3", refreshingIds.has(keyword.id) && "animate-spin")} />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(keyword.keyword);
                              toast.success('Keyword copied to clipboard');
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleKeywordSelect(keyword);
                            }}>
                              <Zap className="h-4 w-4 mr-2" />
                              Use in Content
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteKeywords([keyword.id]);
                              }}
                              className="text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {!compact && (
                  <AnimatePresence>
                    {expandedRows.has(keyword.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 pb-3 border-t border-white/5 bg-white/2"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {keyword.intent && (
                            <div>
                              <span className="text-muted-foreground">Intent:</span>
                              <div className="capitalize">{keyword.intent}</div>
                            </div>
                          )}
                          {keyword.cpc && (
                            <div>
                              <span className="text-muted-foreground">CPC:</span>
                              <div>${keyword.cpc.toFixed(2)}</div>
                            </div>
                          )}
                          {keyword.serp_data_quality && (
                            <div>
                              <span className="text-muted-foreground">Data Quality:</span>
                              <div className="capitalize">{keyword.serp_data_quality}</div>
                            </div>
                          )}
                          {keyword.seasonality && (
                            <div>
                              <span className="text-muted-foreground">Seasonal:</span>
                              <div>{keyword.seasonality ? 'Yes' : 'No'}</div>
                            </div>
                          )}
                        </div>
                        {keyword.notes && (
                          <div className="mt-2 p-2 bg-white/5 rounded text-xs">
                            <span className="text-muted-foreground">Notes:</span>
                            <div>{keyword.notes}</div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </CardContent>
      
      {!compact && (
        <DuplicateManager 
          open={showDuplicateManager}
          onClose={() => setShowDuplicateManager(false)}
          onSuccess={loadKeywords}
        />
      )}
    </Card>
  );
};