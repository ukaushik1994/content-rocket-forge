
import { useState, useEffect, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content';
import { format } from 'date-fns';

export type FilterParams = {
  searchQuery: string;
  filterStatus: string;
  sortBy: string;
  dateRange: { from: Date | undefined; to: Date | undefined };
  keywordFilter: string;
}

export type FilterState = FilterParams & {
  currentPage: number;
}

export function useContentFiltering(contentItems: ContentItemType[]) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState<ContentItemType[]>(contentItems);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, dateRange, keywordFilter, sortBy]);
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...contentItems];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    // Apply date filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.updated_at);
        if (dateRange.from && dateRange.to) {
          // Set time to end of day for the to date for inclusive range
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return itemDate >= dateRange.from && itemDate <= endDate;
        } else if (dateRange.from) {
          return itemDate >= dateRange.from;
        } else if (dateRange.to) {
          // Set time to end of day for inclusive to date
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return itemDate <= endDate;
        }
        return true;
      });
    }
    
    // Apply keyword filter
    if (keywordFilter) {
      const normalizedKeyword = keywordFilter.toLowerCase();
      filtered = filtered.filter(item =>
        item.keywords.some(keyword => keyword.toLowerCase().includes(normalizedKeyword))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'score') {
        return (b.seo_score || 0) - (a.seo_score || 0);
      } else if (sortBy === 'wordCount') {
        const aWordCount = a.content ? a.content.split(/\s+/).length : 0;
        const bWordCount = b.content ? b.content.split(/\s+/).length : 0;
        return bWordCount - aWordCount;
      }
      return 0;
    });
    
    setFilteredItems(filtered);
  }, [contentItems, searchQuery, sortBy, filterStatus, dateRange, keywordFilter]);

  // Generate applied filters list for display
  const getAppliedFilters = () => {
    const filters: string[] = [];
    
    if (filterStatus !== 'all') {
      filters.push(`Status: ${filterStatus}`);
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
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Add reset filters function
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
