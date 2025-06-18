
import React, { useState } from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { InteractiveSelectionItem } from './InteractiveSelectionItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedSerpKeywordsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
  onToggleSelection: (content: string, type: string) => void;
  selectedItems?: Set<string>;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function EnhancedSerpKeywordsSection({ 
  serpData, 
  expanded, 
  onAddToContent,
  onToggleSelection,
  selectedItems = new Set(),
  onLoadMore,
  isLoading = false
}: EnhancedSerpKeywordsSectionProps) {
  const [displayCount, setDisplayCount] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'alphabetical'>('relevance');

  if (!expanded) return null;

  const keywords = serpData.keywords || [];
  const relatedSearches = serpData.relatedSearches || [];
  const allKeywords = [...keywords, ...relatedSearches.map(r => r.query)];

  // Filter and sort keywords
  const filteredKeywords = allKeywords
    .filter(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.localeCompare(b);
      }
      return 0; // Keep original order for relevance
    });

  const displayedKeywords = filteredKeywords.slice(0, displayCount);
  const hasMore = displayCount < filteredKeywords.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, filteredKeywords.length));
    if (onLoadMore) {
      onLoadMore();
    }
  };

  const handleBulkAdd = () => {
    displayedKeywords.forEach(keyword => {
      onAddToContent(keyword, 'keyword');
    });
  };

  if (allKeywords.length === 0) {
    return (
      <div className="p-6 text-center text-white/50">
        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No keywords found for this search</p>
        <p className="text-xs mt-1">Try a different search term or check your API configuration</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Keyword Opportunities</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3 w-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Filter keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 w-40 bg-white/5 border-white/20 text-xs"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(sortBy === 'relevance' ? 'alphabetical' : 'relevance')}
            className="h-8 px-2 text-xs hover:bg-white/10 gap-1"
          >
            <SortDesc className="h-3 w-3" />
            {sortBy === 'relevance' ? 'Relevance' : 'A-Z'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkAdd}
            className="h-8 px-2 text-xs hover:bg-blue-500/20 text-blue-300 gap-1"
          >
            Add All ({displayedKeywords.length})
          </Button>
        </div>
      </div>

      {/* Keywords Grid */}
      <div className="space-y-3">
        <AnimatePresence>
          {displayedKeywords.map((keyword, idx) => (
            <InteractiveSelectionItem
              key={`keyword-${idx}-${keyword}`}
              content={keyword}
              type="keyword"
              selected={selectedItems.has(`keyword:${keyword}`)}
              onToggle={onToggleSelection}
              onAddToContent={onAddToContent}
              apiSource="SerpAPI"
              priority={idx < 3 ? 'high' : idx < 6 ? 'medium' : 'low'}
              freshness="fresh"
              metadata={{ position: idx + 1 }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Section */}
      {(hasMore || isLoading) && (
        <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/10">
          {hasMore && (
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 border border-blue-300 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More Keywords
                  <span className="text-xs opacity-75">({filteredKeywords.length - displayCount} remaining)</span>
                </>
              )}
            </Button>
          )}
          
          <div className="text-xs text-white/50 text-center">
            Showing {displayedKeywords.length} of {filteredKeywords.length} keywords
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </div>
        </div>
      )}

      {/* Insights Panel */}
      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <h5 className="text-sm font-medium text-blue-300 mb-2">💡 Keyword Strategy Tips</h5>
        <ul className="text-xs text-white/70 space-y-1">
          <li>• Focus on high-priority keywords (red indicator) for primary content</li>
          <li>• Use medium-priority keywords for subheadings and supporting content</li>
          <li>• Consider search volume and competition when selecting keywords</li>
          <li>• Mix branded and non-branded terms for balanced coverage</li>
        </ul>
      </div>
    </div>
  );
}
