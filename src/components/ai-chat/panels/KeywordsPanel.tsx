import React, { useState, useMemo, useEffect } from 'react';
import { PanelShell } from './PanelShell';
import { CompactPageHeader } from '@/components/ui/CompactPageHeader';
import { Database, TrendingUp, FileText, AlertTriangle } from 'lucide-react';
import { KeywordsFilters } from '@/components/keywords/KeywordsFilters';
import { KeywordCard } from '@/components/keywords/KeywordCard';
import { KeywordListItem } from '@/components/keywords/KeywordListItem';
import { AddKeywordDialog } from '@/components/keywords/AddKeywordDialog';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';

export const KeywordsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('usage_count');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const keywordStats = useMemo(() => {
    const total = keywords.length;
    const inPublished = keywords.filter(k => k.content_pieces?.some((p: any) => p.status === 'published')).length;
    const inDraft = keywords.filter(k => k.content_pieces?.some((p: any) => p.status === 'draft')).length;
    const cannibalization = keywords.filter(k => k.content_pieces?.filter((p: any) => p.status === 'published').length > 1).length;
    return { total, inPublished, inDraft, cannibalization };
  }, [keywords]);

  useEffect(() => {
    if (isOpen) loadKeywords();
  }, [isOpen]);

  const loadKeywords = async () => {
    try {
      setLoading(true);
      const result = await keywordLibraryService.getKeywords({}, 1, 100);
      setKeywords(result.keywords);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast.error('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  const filteredKeywords = useMemo(() => {
    let result = [...keywords];
    if (searchQuery) {
      result = result.filter(k => k.keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      result = result.filter(k => {
        const pieces = k.content_pieces || [];
        if (statusFilter === 'published') return pieces.some((p: any) => p.status === 'published');
        if (statusFilter === 'draft') return pieces.some((p: any) => p.status === 'draft');
        if (statusFilter === 'unused') return pieces.length === 0;
        return true;
      });
    }
    return result.sort((a: any, b: any) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }, [keywords, searchQuery, statusFilter, sortBy]);

  const hasNoVolumeData = keywords.length > 0 && keywords.every(k => !k.search_volume);

  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Keywords" icon={<Search className="h-4 w-4" />}>
      <div className="flex items-center justify-between mb-2">
        <CompactPageHeader
          icon={Database}
          title="Keywords"
          stats={[
            { icon: TrendingUp, label: 'Total', value: keywordStats.total },
            { icon: FileText, label: 'Published', value: keywordStats.inPublished },
            { icon: AlertTriangle, label: 'Warnings', value: keywordStats.cannibalization },
          ]}
          quickFilters={[
            { key: 'all', label: 'All', count: keywordStats.total },
            { key: 'published', label: 'Published', count: keywordStats.inPublished },
            { key: 'draft', label: 'Draft', count: keywordStats.inDraft },
            { key: 'cannibalization', label: 'Warnings', count: keywordStats.cannibalization },
          ]}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
        <Button size="sm" onClick={() => setShowAddDialog(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {hasNoVolumeData && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/30 text-xs text-muted-foreground mt-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>Connect a SERP API in Settings for live search volume &amp; difficulty data.</span>
        </div>
      )}
      
      <div className="mt-4">
        <KeywordsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={loadKeywords}
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Database className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No keywords found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredKeywords.map(k => <KeywordCard key={k.id} keyword={k} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredKeywords.map(k => <KeywordListItem key={k.id} keyword={k} />)}
          </div>
        )}
      </div>
      <AddKeywordDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onAdded={loadKeywords} />
    </PanelShell>
  );
};
