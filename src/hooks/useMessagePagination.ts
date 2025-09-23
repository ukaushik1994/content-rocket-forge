import { useState, useCallback, useMemo } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';

interface MessagePaginationConfig {
  pageSize: number;
  enableVirtualization: boolean;
  preloadPages: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
}

export const useMessagePagination = (
  messages: EnhancedChatMessage[],
  config: MessagePaginationConfig = {
    pageSize: 50,
    enableVirtualization: true,
    preloadPages: 2
  }
) => {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    isLoading: false
  });

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: config.pageSize });

  // Calculate pagination data
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(messages.length / config.pageSize);
    const hasMore = pagination.currentPage < totalPages;
    
    return {
      totalPages,
      hasMore,
      totalMessages: messages.length,
      currentPageSize: Math.min(config.pageSize, messages.length - (pagination.currentPage - 1) * config.pageSize)
    };
  }, [messages.length, config.pageSize, pagination.currentPage]);

  // Get messages for current page
  const getCurrentPageMessages = useCallback(() => {
    if (config.enableVirtualization) {
      return messages.slice(visibleRange.start, visibleRange.end);
    }
    
    const startIndex = (pagination.currentPage - 1) * config.pageSize;
    const endIndex = startIndex + config.pageSize;
    return messages.slice(startIndex, endIndex);
  }, [messages, pagination.currentPage, config.pageSize, config.enableVirtualization, visibleRange]);

  // Load more messages (infinite scroll)
  const loadMore = useCallback(async () => {
    if (pagination.isLoading || !paginationData.hasMore) return;

    setPagination(prev => ({ ...prev, isLoading: true }));

    // Simulate loading delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300));

    setPagination(prev => ({
      ...prev,
      currentPage: prev.currentPage + 1,
      isLoading: false,
      hasMore: prev.currentPage + 1 < paginationData.totalPages
    }));
  }, [pagination.isLoading, paginationData.hasMore, paginationData.totalPages]);

  // Navigate to specific page
  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > paginationData.totalPages) return;
    
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      hasMore: page < paginationData.totalPages
    }));
  }, [paginationData.totalPages]);

  // Virtual scrolling helpers
  const updateVisibleRange = useCallback((start: number, end: number) => {
    if (!config.enableVirtualization) return;
    
    // Add buffer for smooth scrolling
    const buffer = Math.floor(config.pageSize * 0.2);
    const bufferedStart = Math.max(0, start - buffer);
    const bufferedEnd = Math.min(messages.length, end + buffer);
    
    setVisibleRange({ start: bufferedStart, end: bufferedEnd });
  }, [config.enableVirtualization, config.pageSize, messages.length]);

  // Preload adjacent pages for smoother experience
  const preloadPages = useCallback(() => {
    const preloadStart = Math.max(1, pagination.currentPage - config.preloadPages);
    const preloadEnd = Math.min(paginationData.totalPages, pagination.currentPage + config.preloadPages);
    
    // This could be used to prefetch data if messages were loaded from API
    console.log(`Preloading pages ${preloadStart} to ${preloadEnd}`);
  }, [pagination.currentPage, config.preloadPages, paginationData.totalPages]);

  // Get message statistics
  const getMessageStats = useCallback(() => {
    const stats = {
      total: messages.length,
      user: messages.filter(m => m.role === 'user').length,
      assistant: messages.filter(m => m.role === 'assistant').length,
      withActions: messages.filter(m => m.actions && m.actions.length > 0).length,
      withVisualData: messages.filter(m => m.visualData).length,
      memoryUsage: JSON.stringify(messages).length / 1024 // KB
    };
    
    return stats;
  }, [messages]);

  // Memory management
  const optimizeMemory = useCallback(() => {
    const stats = getMessageStats();
    
    // If memory usage is high, suggest optimization
    if (stats.memoryUsage > 1024) { // > 1MB
      console.warn('High memory usage detected:', stats.memoryUsage, 'KB');
      
      // Could implement message cleanup logic here
      return {
        shouldOptimize: true,
        recommendation: 'Consider archiving older messages',
        memoryUsage: stats.memoryUsage
      };
    }
    
    return { shouldOptimize: false, memoryUsage: stats.memoryUsage };
  }, [getMessageStats]);

  return {
    // Data
    messages: getCurrentPageMessages(),
    pagination: {
      ...pagination,
      ...paginationData
    },
    stats: getMessageStats(),
    
    // Actions
    loadMore,
    goToPage,
    updateVisibleRange,
    preloadPages,
    optimizeMemory,
    
    // Utils
    isLastPage: pagination.currentPage === paginationData.totalPages,
    isFirstPage: pagination.currentPage === 1,
    canLoadMore: paginationData.hasMore && !pagination.isLoading
  };
};

// Hook for virtual scrolling
export const useVirtualScrolling = (
  containerRef: React.RefObject<HTMLElement>,
  itemHeight: number,
  totalItems: number,
  visibleBuffer: number = 5
) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const visibleRange = useMemo(() => {
    if (!containerRef.current) return { start: 0, end: visibleBuffer };
    
    const containerHeight = containerRef.current.clientHeight;
    const startIndex = Math.floor(scrollPosition / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    return {
      start: Math.max(0, startIndex - visibleBuffer),
      end: Math.min(totalItems, startIndex + visibleCount + visibleBuffer)
    };
  }, [scrollPosition, itemHeight, totalItems, visibleBuffer]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollPosition(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleRange,
    handleScroll,
    scrollPosition,
    totalHeight: totalItems * itemHeight
  };
};