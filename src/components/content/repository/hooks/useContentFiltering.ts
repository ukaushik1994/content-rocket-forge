
import { useState, useEffect, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content';
import { format } from 'date-fns';

export type FilterParams = {
  searchQuery: string;
  filterStatus: string;
  sortBy: string;
  dateRange: { from: Date | undefined; to: Date | undefined };
  keywordFilter: string;
  funnelFilter: string;
}

export type FilterState = FilterParams & {
  currentPage: number;
}

export function useContentFiltering(contentItems: ContentItemType[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [funnelFilter, setFunnelFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState<ContentItemType[]>(contentItems);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, dateRange, keywordFilter, sortBy, funnelFilter]);
  
  useEffect(() => {
    let filtered = [...contentItems];
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (filterStatus === 'ready_to_publish') {
      filtered = filtered.filter(item => item.status === 'draft' && (item.seo_score || 0) >= 60);
    } else if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    // 8B: Funnel stage filter
    if (funnelFilter !== 'all') {
      filtered = filtered.filter(item => (item as any).funnel_stage === funnelFilter);
    }
    
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.updated_at);
        if (dateRange.from && dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return itemDate >= dateRange.from && itemDate <= endDate;
        } else if (dateRange.from) {
          return itemDate >= dateRange.from;
        } else if (dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return itemDate <= endDate;
        }
        return true;
      });
    }
    
    if (keywordFilter) {
      const normalizedKeyword = keywordFilter.toLowerCase();
      filtered = filtered.filter(item =>
        item.keywords.some(keyword => keyword.toLowerCase().includes(normalizedKeyword))
      );
    }
    
    const effectiveSortBy = filterStatus === 'ready_to_publish' ? 'score' : sortBy;
    filtered.sort((a, b) => {
      if (effectiveSortBy === 'date') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (effectiveSortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (effectiveSortBy === 'score') {
        return (b.seo_score || 0) - (a.seo_score || 0);
      } else if (effectiveSortBy === 'wordCount') {
        const aWordCount = a.content ? a.content.split(/\s+/).length : 0;
        const bWordCount = b.content ? b.content.split(/\s+/).length : 0;
        return bWordCount - aWordCount;
      } else if (effectiveSortBy === 'value') {
        return ((b as any).content_value_score || 0) - ((a as any).content_value_score || 0);
      }
      return 0;
    });
    
    setFilteredItems(filtered);
  }, [contentItems, searchQuery, sortBy, filterStatus, dateRange, keywordFilter, funnelFilter]);

  const getAppliedFilters = () => {
    const filters: string[] = [];
    
    if (filterStatus !== 'all') {
      filters.push(`Status: ${filterStatus}`);
    }
    
    if (funnelFilter !== 'all') {
      const labels: Record<string, string> = { tofu: 'Awareness', mofu: 'Consideration', bofu: 'Decision' };
      filters.push(`Funnel: ${labels[funnelFilter] || funnelFilter}`);
    }
    
    if (dateRange.from && dateRange.to) {
      filters.push(`Date: ${format(dateRange.from, 'MM/dd/yyyy')} to ${format(dateRange.to, 'MM/dd/yyyy')}`);
    } else if (dateRange.from) {
      filters.push(`Date: From ${format(dateRange.from, 'MM/dd/yyyy')}`);
    } else if (dateRange.to) {
      filters.push(`Date: Until ${format(dateRange.to, 'MM/dd/yyyy')}`);
    }
    
    if (keywordFilter) {
      filters.push(`Keyword: ${keywordFilter}`);
    }
    
    return filters;
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFunnelFilter('all');
    setDateRange({ from: undefined, to: undefined });
    setKeywordFilter('');
  };

  const clearFilter = (filter: string) => {
    if (filter.startsWith('Status:')) {
      setFilterStatus('all');
    } else if (filter.startsWith('Date:')) {
      setDateRange({ from: undefined, to: undefined });
    } else if (filter.startsWith('Keyword:')) {
      setKeywordFilter('');
    } else if (filter.startsWith('Funnel:')) {
      setFunnelFilter('all');
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetFilters = useCallback(() => {
    clearAllFilters();
    setCurrentPage(1);
  }, []);

  return {
    filterState: {
      searchQuery,
      setSearchQuery,
      filterStatus,
      setFilterStatus,
      sortBy,
      setSortBy,
      dateRange,
      setDateRange,
      keywordFilter,
      setKeywordFilter,
      funnelFilter,
      setFunnelFilter,
      currentPage,
      setCurrentPage
    },
    filteredItems,
    appliedFilters: getAppliedFilters(),
    clearAllFilters,
    clearFilter,
    handlePageChange,
    resetFilters
  };
}
