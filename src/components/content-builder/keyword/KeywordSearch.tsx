
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { searchSerpKeywords } from '@/services/serp/SerpApiService';
import { RefreshButton } from '@/components/ui/refresh-button';

interface KeywordSearchProps {
  initialKeyword: string;
  onKeywordSearch: (keyword: string, suggestions: string[]) => void;
}

export const KeywordSearch: React.FC<KeywordSearchProps> = ({ 
  initialKeyword, 
  onKeywordSearch 
}) => {
  const [keyword, setKeyword] = useState(initialKeyword || '');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to search');
      return;
    }

    setIsSearching(true);
    try {
      // Here we're using searchSerpKeywords which accepts a string parameter
      const results = await searchSerpKeywords(keyword, false);
      
      // Make sure results is an array before accessing .map
      if (Array.isArray(results)) {
        // Extract keywords from search results with explicit type casting
        const extractedKeywords = results.map(result => {
          const title = result.title ? String(result.title) : '';
          return title
            .replace(/Best|Top|Guide to|How to|Why|What is|[0-9]+/gi, '')
            .trim()
            .split(' ')
            .slice(0, 3)
            .join(' ');
        });
        
        // Filter out duplicates and very short keywords
        const filteredKeywords = [...new Set(extractedKeywords)]
          .filter(k => k.length > 3)
          .slice(0, 10);
        
        onKeywordSearch(keyword, filteredKeywords);
        toast.success('Keyword search complete');
      } else {
        // Handle case where results is not an array
        onKeywordSearch(keyword, []);
        toast.warning('No keyword suggestions found');
      }
    } catch (error) {
      console.error('Error searching keywords:', error);
      toast.error('Failed to search keywords');
      
      // Still provide the main keyword if search fails
      onKeywordSearch(keyword, []);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleRefresh = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to refresh suggestions');
      return;
    }
    
    setIsSearching(true);
    try {
      // Use searchSerpKeywords with refresh flag set to true
      const results = await searchSerpKeywords(keyword, true);
      
      if (Array.isArray(results)) {
        // Extract different keywords for variety
        const extractedKeywords = results.map(result => {
          const title = result.title ? String(result.title) : '';
          // Use a slightly different extraction strategy for refreshed results
          return title
            .replace(/Best|Top|Guide to|How to|Why|What is|[0-9]+/gi, '')
            .trim()
            .split(' ')
            .slice(0, 4) // Get more words for variety
            .join(' ');
        });
        
        // Filter and shuffle the results for variety
        const filteredKeywords = [...new Set(extractedKeywords)]
          .filter(k => k.length > 3)
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, 10);
        
        onKeywordSearch(keyword, filteredKeywords);
        toast.success('Refreshed keyword suggestions');
      } else {
        toast.warning('No new keyword suggestions found');
      }
    } catch (error) {
      console.error('Error refreshing keywords:', error);
      toast.error('Failed to refresh keyword suggestions');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="main-keyword"
            placeholder="Enter your main keyword..."
            className="pl-9"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isSearching || !keyword.trim()}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
        
        <RefreshButton 
          onClick={handleRefresh}
          isRefreshing={isSearching}
          disabled={isSearching || !keyword.trim()}
          title="Refresh keyword suggestions"
        />
      </div>
    </div>
  );
};
