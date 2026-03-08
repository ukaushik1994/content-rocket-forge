import React, { useState, useMemo, useEffect } from 'react';
import { PanelShell } from './PanelShell';
import { KeywordsHero } from '@/components/keywords/KeywordsHero';
import { KeywordsFilters } from '@/components/keywords/KeywordsFilters';
import { KeywordCard } from '@/components/keywords/KeywordCard';
import { KeywordListItem } from '@/components/keywords/KeywordListItem';
import { keywordLibraryService } from '@/services/keywordLibraryService';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Database } from 'lucide-react';
import { toast } from 'sonner';

export const KeywordsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
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
    return result.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }, [keywords, searchQuery, statusFilter, sortBy]);

  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Keywords" icon={<Search className="h-4 w-4" />}>
      <KeywordsHero keywordStats={keywordStats} onQuickFilter={setStatusFilter} activeFilter={statusFilter} />
      
      <div className="mt-4">
        <KeywordsFilters
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
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
            {filteredKeywords.map(k => <KeywordCard key={k.id} keyword={k} onRefresh={loadKeywords} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredKeywords.map(k => <KeywordListItem key={k.id} keyword={k} onRefresh={loadKeywords} />)}
          </div>
        )}
      </div>
    </PanelShell>
  );
};
