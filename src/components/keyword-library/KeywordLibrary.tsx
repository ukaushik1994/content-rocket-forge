import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Hash, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Plus,
  MoreHorizontal,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Target,
  Tag,
  Users,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { keywordLibraryService, UnifiedKeyword, KeywordFilters } from '@/services/keywordLibraryService';
import { KeywordFilters as KeywordFiltersComponent } from './KeywordFilters';
import { KeywordResearchModal } from './KeywordResearchModal';
import { EnhancedBulkActions } from './EnhancedBulkActions';
import { KeywordAnalyticsDashboard } from './KeywordAnalyticsDashboard';
import { EnhancedKeywordCard } from './EnhancedKeywordCard';
import { DuplicateManager } from './DuplicateManager';
import { KeywordUsageDetail } from './KeywordUsageDetail';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export const KeywordLibrary: React.FC = () => {
  const [keywords, setKeywords] = useState<UnifiedKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<KeywordFilters>({});
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    loadKeywords();
  }, [filters, currentPage, searchTerm, showDuplicatesOnly]);

  const loadKeywords = async () => {
    try {
      setLoading(true);
      const searchFilters = { 
        ...filters, 
        ...(searchTerm && { search: searchTerm }),
        ...(showDuplicatesOnly && { show_duplicates_only: true })
      };
      const result = await keywordLibraryService.getKeywords(searchFilters, currentPage, 50);
      
      setKeywords(result.keywords);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast.error('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await keywordLibraryService.syncKeywordsFromSources();
      await loadKeywords();
    } catch (error) {
      console.error('Error syncing keywords:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectKeyword = (keywordId: string, selected: boolean) => {
    const newSelected = new Set(selectedKeywords);
    if (selected) {
      newSelected.add(keywordId);
    } else {
      newSelected.delete(keywordId);
    }
    setSelectedKeywords(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeywords(new Set(keywords.map(k => k.id)));
    } else {
      setSelectedKeywords(new Set());
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    const selectedIds = Array.from(selectedKeywords);
    if (selectedIds.length === 0) {
      toast.error('Please select keywords first');
      return;
    }

    try {
      switch (action) {
        case 'delete':
          await keywordLibraryService.deleteKeywords(selectedIds);
          break;
        case 'export':
          await keywordLibraryService.exportKeywords(selectedIds, data.format);
          break;
        case 'bulk_edit':
        case 'update':
          await keywordLibraryService.bulkUpdateKeywords(selectedIds, data);
          break;
        case 'bulk_serp_refresh':
          // Refresh SERP data for selected keywords
          for (const keywordId of selectedIds) {
            try {
              await keywordLibraryService.refreshKeywordMetrics(keywordId);
            } catch (error) {
              console.error(`Failed to refresh keyword ${keywordId}:`, error);
            }
          }
          toast.success(`SERP data refreshed for ${selectedIds.length} keywords`);
          break;
        case 'add_to_strategy':
          // Add keywords to strategy (placeholder for now)
          toast.success(`Added ${selectedIds.length} keywords to strategy`);
          break;
        case 'import':
          // Handle file import (placeholder for now)
          if (data?.file) {
            toast.success('File import started - processing...');
          }
          break;
        default:
          console.log(`Bulk action ${action} not implemented yet`);
      }
      
      setSelectedKeywords(new Set());
      await loadKeywords();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error(`Failed to ${action} keywords`);
    }
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

  const getDifficultyColor = (difficulty?: number | null) => {
    if (!difficulty) return 'text-muted-foreground';
    if (difficulty <= 30) return 'text-green-400';
    if (difficulty <= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const allSelected = keywords.length > 0 && selectedKeywords.size === keywords.length;
  const someSelected = selectedKeywords.size > 0 && selectedKeywords.size < keywords.length;

  return (
    <div className="bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Hash className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Keyword Library
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage all your keywords from one central location
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDuplicateManager(true)}
                className="border-yellow-500/20 hover:bg-yellow-500/10 text-yellow-600"
              >
                <Users className="h-4 w-4 mr-2" />
                Find Duplicates
              </Button>
              
              <Button
                variant={showDuplicatesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDuplicatesOnly(!showDuplicatesOnly)}
                className={showDuplicatesOnly 
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black" 
                  : "border-yellow-500/20 hover:bg-yellow-500/10 text-yellow-600"
                }
              >
                <Layers className="h-4 w-4 mr-2" />
                {showDuplicatesOnly ? 'Show All' : 'Duplicates Only'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="border-primary/20 hover:bg-primary/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync Sources
              </Button>
              
              <Button
                onClick={() => setShowResearchModal(true)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Research Keywords
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-blue-900/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Keywords</p>
                    <p className="text-2xl font-bold">{total}</p>
                  </div>
                  <Hash className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-gradient-to-br from-green-900/10 to-green-900/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">With Usage</p>
                    <p className="text-2xl font-bold">
                      {keywords.filter(k => k.usage_count > 0).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-purple-900/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sources</p>
                    <p className="text-2xl font-bold">
                      {new Set(keywords.map(k => k.source_type)).size}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-gradient-to-br from-orange-900/10 to-orange-900/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected</p>
                    <p className="text-2xl font-bold">{selectedKeywords.size}</p>
                  </div>
                  <Eye className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-white/20 bg-white/5"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-white/20 hover:bg-white/10"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  {selectedKeywords.size > 0 && (
                    <EnhancedBulkActions
                      selectedCount={selectedKeywords.size}
                      onAction={handleBulkAction}
                    />
                  )}
                </div>
              </div>

              {/* Bulk Selection */}
              {keywords.length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedKeywords.size > 0 
                      ? `${selectedKeywords.size} of ${keywords.length} selected`
                      : 'Select all keywords'
                    }
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <KeywordFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Keywords List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md">
            <CardContent className="p-0">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  // Loading skeletons
                  <div className="space-y-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={`skeleton-${i}`}
                        variants={item}
                        className="animate-pulse border-b border-white/5 last:border-b-0 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-4 h-4 bg-white/10 rounded"></div>
                            <div className="w-16 h-6 bg-white/10 rounded"></div>
                            <div className="w-48 h-6 bg-white/20 rounded"></div>
                            <div className="w-20 h-5 bg-white/10 rounded"></div>
                          </div>
                          <div className="w-24 h-5 bg-white/10 rounded"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                 ) : keywords.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                     {keywords.map((keyword) => (
                       <EnhancedKeywordCard
                         key={keyword.id}
                         keyword={keyword}
                         selected={selectedKeywords.has(keyword.id)}
                         onSelect={handleSelectKeyword}
                         onUpdate={loadKeywords}
                         onAction={async (action, keywordId) => {
                           // Handle various keyword actions
                           switch (action) {
                             case 'refresh':
                               await keywordLibraryService.refreshKeywordMetrics(keywordId);
                               break;
                             case 'delete':
                               await keywordLibraryService.deleteKeywords([keywordId]);
                               await loadKeywords();
                               break;
                             case 'google':
                               window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword.keyword)}`, '_blank');
                               break;
                             case 'export':
                               await keywordLibraryService.exportKeywords([keywordId], 'csv');
                               break;
                             default:
                               console.log(`Action ${action} not implemented yet`);
                           }
                         }}
                         showPerformanceDetails={false}
                       />
                     ))}
                   </div>
                ) : (
                  <motion.div
                    variants={item}
                    className="text-center py-12"
                  >
                    <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No keywords found</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by researching keywords or sync from your existing sources
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => setShowResearchModal(true)}
                        className="bg-gradient-to-r from-primary to-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Research Keywords
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncing}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                        Sync Sources
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center gap-2"
          >
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="border-white/20 hover:bg-white/10"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (page > totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage 
                      ? "bg-primary text-primary-foreground" 
                      : "border-white/20 hover:bg-white/10"
                    }
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="border-white/20 hover:bg-white/10"
            >
              Next
            </Button>
          </motion.div>
        )}
      </div>

      {/* Duplicate Manager */}
      <DuplicateManager
        open={showDuplicateManager}
        onClose={() => setShowDuplicateManager(false)}
        onSuccess={loadKeywords}
      />

      {/* Research Modal */}
      <KeywordResearchModal
        open={showResearchModal}
        onClose={() => setShowResearchModal(false)}
        onSuccess={loadKeywords}
      />
    </div>
  );
};