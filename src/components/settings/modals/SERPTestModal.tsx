import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Globe } from 'lucide-react';
import { searchKeywords } from '@/services/serpApiService';
import { toast } from 'sonner';

interface SERPTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'serp' | 'serpstack' | null;
}

interface SearchResult {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
}

export function SERPTestModal({ isOpen, onClose, provider }: SERPTestModalProps) {
  const [keyword, setKeyword] = useState('test keyword');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchStats, setSearchStats] = useState<{
    totalResults?: number;
    searchTime?: number;
    success: boolean;
  } | null>(null);

  // Early return if provider is null
  if (!provider) {
    return null;
  }

  const handleSearch = async () => {
    if (!keyword.trim() || isLoading) return;

    setIsLoading(true);
    setResults([]);
    setSearchStats(null);

    try {
      const startTime = Date.now();
      const response = await searchKeywords({
        query: keyword.trim(),
        limit: 5,
        provider
      });

      const searchTime = Date.now() - startTime;

      if (response && Array.isArray(response)) {
        setResults(response.slice(0, 5));
        setSearchStats({
          totalResults: response.length,
          searchTime,
          success: true
        });
        toast.success(`${provider ? provider.toUpperCase() : 'SERP'} search completed successfully!`);
      } else {
        throw new Error('No search results returned');
      }
    } catch (error: any) {
      console.error(`SERP test failed for ${provider || 'unknown'}:`, error);
      toast.error(`${provider ? provider.toUpperCase() : 'SERP'} test failed: ${error.message}`);
      setSearchStats({
        success: false,
        searchTime: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClose = () => {
    setResults([]);
    setSearchStats(null);
    setKeyword('test keyword');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Test {provider ? provider.toUpperCase() : 'SERP'} Search
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword to search..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={!keyword.trim() || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {searchStats && (
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Search Results</div>
              <div className="text-xs text-muted-foreground mt-1">
                {searchStats.success ? (
                  <>
                    Found {searchStats.totalResults} results in {searchStats.searchTime}ms
                  </>
                ) : (
                  'Search failed - check your API key configuration'
                )}
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 border rounded-lg p-4">
            {!searchStats ? (
              <div className="text-center text-muted-foreground py-8">
                Enter a keyword and click Search to test your {provider ? provider.toUpperCase() : 'SERP'} integration
              </div>
            ) : !searchStats.success ? (
              <div className="text-center text-destructive py-8">
                Search test failed. Please check your API key configuration.
              </div>
            ) : results.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No search results found for "{keyword}"
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="text-sm font-medium text-primary mb-1">
                      {result.position && `${result.position}. `}
                      {result.title || 'Untitled Result'}
                    </div>
                    {result.link && (
                      <div className="text-xs text-muted-foreground mb-1 truncate">
                        {result.link}
                      </div>
                    )}
                    {result.snippet && (
                      <div className="text-sm text-muted-foreground">
                        {result.snippet}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}