
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { searchKeywords } from '@/services/serpApiService';

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
      const results = await searchKeywords({ query: keyword });
      // Extract keywords from search results
      const extractedKeywords = results.map(result => 
        result.title
          .replace(/Best|Top|Guide to|How to|Why|What is|[0-9]+/gi, '')
          .trim()
          .split(' ')
          .slice(0, 3)
          .join(' ')
      );
      
      // Filter out duplicates and very short keywords
      const filteredKeywords = [...new Set(extractedKeywords)]
        .filter(k => k.length > 3)
        .slice(0, 10);
      
      onKeywordSearch(keyword, filteredKeywords);
      toast.success('Keyword search complete');
    } catch (error) {
      console.error('Error searching keywords:', error);
      toast.error('Failed to search keywords');
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
      </div>
    </div>
  );
};
