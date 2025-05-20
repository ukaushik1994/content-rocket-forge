
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { searchSerpKeywords } from '@/services/serpApiService';
import { toast } from 'sonner';

export const KeywordSearch = ({ 
  onSearch, 
  defaultKeyword = '', 
  placeholder = 'Enter your main keyword', 
  buttonText = 'Search' 
}) => {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { ref, inView } = useInView();

  // Auto-focus the input when it's in view
  useEffect(() => {
    if (inView) {
      const inputElement = document.getElementById('keyword-search-input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [inView]);

  // Handle submitting the search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to search');
      return;
    }

    setIsSearching(true);
    try {
      // Get keyword suggestions - pass the query directly instead of as an object
      const results = await searchSerpKeywords(keyword.trim());
      
      // Extract just the keyword strings
      const suggestions = Array.isArray(results) 
        ? results.map(item => typeof item === 'string' ? item : item.query || '') 
        : [];

      // Call the onSearch callback with the keyword and suggestions
      onSearch(keyword.trim(), suggestions);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching keywords:', error);
      toast.error(error.message || 'Failed to search keywords');
      // Still call onSearch with empty suggestions
      onSearch(keyword.trim(), []);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative" ref={ref}>
        <div className="flex space-x-2">
          <div className="relative flex-grow">
            <Input
              id="keyword-search-input"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={placeholder}
              className="pr-10 w-full shadow-sm focus-visible:border-purple-500"
              autoFocus={inView && !hasSearched}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            type="submit"
            disabled={isSearching || !keyword.trim()}
            className="shrink-0"
          >
            {isSearching ? 'Searching...' : buttonText}
          </Button>
        </div>
      </div>
    </form>
  );
};
