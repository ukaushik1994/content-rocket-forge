import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchFilters {
  startDate?: string;
  endDate?: string;
  messageType?: 'user' | 'assistant' | 'system';
  conversationId?: string;
  limit?: number;
}

interface SearchResult {
  id: string;
  content: string;
  type: string;
  created_at: string;
  conversation_id: string;
  ai_conversations: {
    title: string;
    user_id: string;
  };
}

interface ExportOptions {
  format: 'json' | 'markdown' | 'csv';
  includeMetadata?: boolean;
  conversationIds?: string[];
}

export const useAdvancedSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  // Perform full-text search
  const searchMessages = useCallback(async (query: string, filters: SearchFilters = {}) => {
    if (!user || !query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search-export', {
        body: {
          action: 'search_messages',
          userId: user.id,
          data: { query, filters }
        }
      });

      if (error) throw error;

      setSearchResults(data.messages || []);
      toast.success(`Found ${data.totalCount} results`);

    } catch (error) {
      console.error('Error searching messages:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // Perform semantic search using AI embeddings
  const semanticSearch = useCallback(async (query: string, conversationId?: string, threshold = 0.7) => {
    if (!user || !query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search-export', {
        body: {
          action: 'semantic_search',
          userId: user.id,
          data: { query, conversationId, threshold }
        }
      });

      if (error) throw error;

      setSearchResults(data.messages || []);
      toast.success(`Semantic search found ${data.messages?.length || 0} results`);

    } catch (error) {
      console.error('Error performing semantic search:', error);
      toast.error('Semantic search failed');
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // Export conversation(s)
  const exportConversation = useCallback(async (conversationId: string, options: ExportOptions) => {
    if (!user) return null;

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search-export', {
        body: {
          action: 'export_conversation',
          userId: user.id,
          data: {
            conversationId,
            format: options.format,
            includeMetadata: options.includeMetadata
          }
        }
      });

      if (error) throw error;

      // Create and download file
      const blob = new Blob([
        typeof data.exportData === 'string' 
          ? data.exportData 
          : JSON.stringify(data.exportData, null, 2)
      ], {
        type: getContentType(options.format)
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Conversation exported successfully');
      return data;

    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [user]);

  // Export multiple conversations
  const exportMultipleConversations = useCallback(async (conversationIds: string[], options: ExportOptions) => {
    if (!user || conversationIds.length === 0) return null;

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search-export', {
        body: {
          action: 'export_multiple',
          userId: user.id,
          data: {
            conversationIds,
            format: options.format,
            includeMetadata: options.includeMetadata
          }
        }
      });

      if (error) throw error;

      // Create combined export file
      const exportData = {
        exports: data.exports,
        totalCount: data.totalCount,
        successCount: data.successCount,
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.successCount}/${data.totalCount} conversations`);
      return data;

    } catch (error) {
      console.error('Error exporting multiple conversations:', error);
      toast.error('Batch export failed');
    } finally {
      setIsExporting(false);
    }
  }, [user]);

  // Import conversation
  const importConversation = useCallback(async (file: File, mergeStrategy = 'new_conversation', targetConversationId?: string) => {
    if (!user) return;

    try {
      const content = await file.text();
      const importData = JSON.parse(content);

      const { data, error } = await supabase.functions.invoke('ai-search-export', {
        body: {
          action: 'import_conversation',
          userId: user.id,
          data: {
            importData,
            mergeStrategy,
            targetConversationId
          }
        }
      });

      if (error) throw error;

      toast.success(`Imported ${data.importedMessagesCount} messages`);
      return data;

    } catch (error) {
      console.error('Error importing conversation:', error);
      toast.error('Import failed');
    }
  }, [user]);

  // Load search history
  const loadSearchHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('ai-search-export', {
        body: {
          action: 'get_search_history',
          userId: user.id
        }
      });

      if (error) throw error;

      setSearchHistory(data.searchHistory || []);

    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, [user]);

  // Clear search results
  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  // Filter results
  const filterResults = useCallback((filterFn: (result: SearchResult) => boolean) => {
    setSearchResults(prev => prev.filter(filterFn));
  }, []);

  // Get content type for export
  const getContentType = (format: string) => {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'markdown':
        return 'text/markdown';
      case 'csv':
        return 'text/csv';
      default:
        return 'text/plain';
    }
  };

  return {
    // State
    searchResults,
    searchHistory,
    isSearching,
    isExporting,

    // Actions
    searchMessages,
    semanticSearch,
    exportConversation,
    exportMultipleConversations,
    importConversation,
    loadSearchHistory,
    clearResults,
    filterResults,

    // Utils
    hasResults: searchResults.length > 0,
    resultCount: searchResults.length,
    canExport: searchResults.length > 0 || false,
    supportedFormats: ['json', 'markdown', 'csv'] as const
  };
};