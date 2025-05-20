
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { searchSerpKeywords } from '@/services/serpApiService';
import { toast } from 'sonner';

interface KeywordSearchProps {
  onSearch: (keyword: string, suggestions: string[]) => void;
  defaultKeyword?: string;
  placeholder?: string;
  buttonText?: string;
}

export const KeywordSearch: React.FC<KeywordSearchProps> = ({
  onSearch,
  defaultKeyword = '',
  placeholder = 'Enter your main keyword',
  buttonText = 'Search'
}) => {
  const [keyword, setKeyword] = useState<string>(defaultKeyword);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  // Auto-focus the input when component mounts
  useEffect(() => {
    const inputElement = document.getElementById('keyword-search-input');
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  // Handle submitting the search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to search');
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Get keyword suggestions
      const results = await searchSerpKeywords(keyword.trim());
      
      // Extract just the keyword strings
      const suggestions = Array.isArray(results) 
        ? results.map((item: any) => typeof item === 'string' ? item : item.query || '')
        : [];
      
      // Call the onSearch callback with the keyword and suggestions
      onSearch(keyword.trim(), suggestions);
      setHasSearched(true);
    } catch (error: any) {
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
      <div className="relative">
        <div className="flex space-x-2">
          <div className="relative flex-grow">
            <Input
              id="keyword-search-input"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={placeholder}
              className="pr-10 w-full shadow-sm focus-visible:border-purple-500"
              autoFocus={!hasSearched}
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
