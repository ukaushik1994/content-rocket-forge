import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { searchKeywords } from '@/services/serpApiService';
import { toast } from 'sonner';

interface SERPTestModalProps {
  provider: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export function SERPTestModal({ provider, isOpen, onClose }: SERPTestModalProps) {
  const [testKeyword, setTestKeyword] = useState('digital marketing');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!provider) return null;

  const handleTestSearch = async () => {
    if (!testKeyword.trim()) {
      toast.error('Please enter a test keyword');
      return;
    }

    setIsLoading(true);
    setTestComplete(false);
    setResults([]);
    setTotalResults(0);

    try {
      const startTime = Date.now();
      
      const searchResults = await searchKeywords({
        query: testKeyword,
        limit: 5,
        provider: provider as 'serp' | 'serpstack'
      });

      const responseTime = Date.now() - startTime;

      if (searchResults && searchResults.length > 0) {
        setResults(searchResults.slice(0, 5));
        setTotalResults(searchResults.length);
        setTestSuccess(true);
        setTestComplete(true);
        toast.success(`✅ ${provider?.charAt(0).toUpperCase() + provider?.slice(1)} test successful! (${responseTime}ms)`);
      } else {
        throw new Error('No search results returned');
      }
    } catch (error: any) {
      console.error('SERP test failed:', error);
      setTestSuccess(false);
      setTestComplete(true);
      toast.error(`❌ ${provider?.charAt(0).toUpperCase() + provider?.slice(1)} test failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTestKeyword('digital marketing');
    setResults([]);
    setTotalResults(0);
    setTestComplete(false);
    setTestSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Test {provider?.charAt(0).toUpperCase() + provider?.slice(1)} Search
          </DialogTitle>
          <DialogDescription>
            Test a keyword search to verify your SERP provider is working correctly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Test Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Keyword</label>
            <div className="flex gap-2">
              <Input
                value={testKeyword}
                onChange={(e) => setTestKeyword(e.target.value)}
                placeholder="Enter keyword to test..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleTestSearch} 
                disabled={isLoading || !testKeyword.trim()}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Results Display */}
          {(results.length > 0 || isLoading) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : testSuccess ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {isLoading ? 'Searching...' : testSuccess ? `Found ${totalResults} results` : 'Search Failed'}
                  </span>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">Fetching results from {provider}...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((result, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-3">
                        <h4 className="font-medium text-sm text-blue-600 hover:text-blue-800">
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            {result.title}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </h4>
                        {result.snippet && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {result.snippet}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {result.url}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Connection Status */}
          {testComplete && (
            <div className={`p-3 rounded-lg text-sm ${
              testSuccess 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testSuccess ? (
                <>
                  <strong>✅ Connection Verified</strong>
                  <br />
                  Your {provider} API key is working correctly and returning search results as expected.
                </>
              ) : (
                <>
                  <strong>❌ Connection Failed</strong>
                  <br />
                  Please check your API key configuration and try again. Make sure your API key has search permissions.
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}