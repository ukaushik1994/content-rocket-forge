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
import { KeywordTable } from './KeywordTable';
import { StrategyIntegrationPanel } from './StrategyIntegrationPanel';
import { KeywordOpportunityAlerts } from './KeywordOpportunityAlerts';
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
  const [showStrategyIntegration, setShowStrategyIntegration] = useState(false);
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
          setShowStrategyIntegration(true);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Hash className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Keyword Library
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {total} keywords • {keywords.filter(k => k.usage_count > 0).length} in use
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDuplicateManager(true)}
                className="text-xs"
              >
                <Users className="h-3 w-3 mr-2" />
                Find Duplicates
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              
              <Button
                onClick={() => setShowResearchModal(true)}
                size="sm"
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-2" />
                Research
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Clean Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="border border-border/50 rounded-lg bg-card/60 backdrop-blur-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  size="sm"
                  className="text-xs"
                >
                  <Filter className="h-3 w-3 mr-2" />
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

            {/* Selection Summary */}
            {selectedKeywords.size > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                <Badge variant="secondary" className="text-xs">
                  {selectedKeywords.size} of {keywords.length} selected
                </Badge>
              </div>
            )}
          </div>
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

        {/* Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <KeywordAnalyticsDashboard 
            keywords={keywords}
            className="mb-6"
          />
        </motion.div>

        {/* Opportunity Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <KeywordOpportunityAlerts 
            className="border border-border/50 rounded-lg bg-card/60 backdrop-blur-xl"
            onKeywordSelect={(keywordId) => {
              setSelectedKeywords(new Set([keywordId]));
            }}
            onCreateContent={(keyword) => {
              toast.success(`Content creation suggested for "${keyword}"`);
            }}
          />
        </motion.div>

        {/* Professional Keywords Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-border/50 rounded-lg bg-card/60 backdrop-blur-xl overflow-hidden"
        >
          <KeywordTable
            keywords={keywords}
            selectedKeywords={selectedKeywords}
            loading={loading}
            onSelect={handleSelectKeyword}
            onSelectAll={handleSelectAll}
            onUpdate={loadKeywords}
            onAction={async (action, keywordId) => {
              const keyword = keywords.find(k => k.id === keywordId);
              if (!keyword) return;

              try {
                switch (action) {
                  case 'refresh':
                    toast.loading('Refreshing keyword data...');
                    await keywordLibraryService.refreshKeywordMetrics(keywordId);
                    await loadKeywords();
                    toast.success('Keyword data refreshed');
                    break;
                  case 'delete':
                    toast.loading('Deleting keyword...');
                    await keywordLibraryService.deleteKeywords([keywordId]);
                    await loadKeywords();
                    toast.success('Keyword deleted');
                    break;
                  case 'google':
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword.keyword)}`, '_blank');
                    break;
                  case 'export':
                    toast.loading('Exporting keyword...');
                    await keywordLibraryService.exportKeywords([keywordId], 'csv');
                    toast.success('Keyword exported');
                    break;
                  default:
                    console.log(`Action ${action} not implemented for keyword ${keywordId}`);
                }
              } catch (error) {
                toast.error('Action failed');
                console.error('Keyword action error:', error);
              }
            }}
          />
        </motion.div>

        {/* Professional Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center gap-3 mt-8"
          >
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="border-border/50 hover:bg-accent/50 transition-all duration-200"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (page > totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-accent/50 transition-all duration-200"
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
              className="border-border/50 hover:bg-accent/50 transition-all duration-200"
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

      {/* Strategy Integration Modal */}
      {showStrategyIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <StrategyIntegrationPanel
            selectedKeywords={Array.from(selectedKeywords)}
            onClose={() => {
              setShowStrategyIntegration(false);
              setSelectedKeywords(new Set());
            }}
          />
        </div>
      )}
    </div>
  );
};