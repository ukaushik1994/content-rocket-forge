import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { analyzeSerpstackKeyword, testSerpstackConnection, searchSerpstack } from '@/services/serpstackService';
import { toast } from 'sonner';
import { RefreshCw, Search, Database, CheckCircle, XCircle, HelpCircle, TrendingUp, Star, Tag } from 'lucide-react';

export function SerpstackDemo() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const success = await testSerpstackConnection();
      setConnectionStatus(success ? 'connected' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    setIsLoading(true);
    try {
      const data = await analyzeSerpstackKeyword(keyword);
      if (data) {
        setResults(data);
        toast.success('Serpstack analysis completed!');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchSerpstack(keyword);
      if (data) {
        console.log('Serpstack Search Results:', data);
        toast.success('Serpstack search completed! Check console for full data.');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const capabilities = [
    { icon: HelpCircle, label: 'People Also Ask Questions', description: 'FAQ data for content planning' },
    { icon: TrendingUp, label: 'Organic Search Results', description: 'Top competitor analysis' },
    { icon: Star, label: 'Featured Snippets', description: 'Answer boxes and rich results' },
    { icon: Database, label: 'Knowledge Graph', description: 'Entity and related topic data' },
    { icon: Tag, label: 'Related Searches', description: 'Keyword expansion opportunities' },
    { icon: Search, label: 'Local & Shopping Results', description: 'Complete SERP feature coverage' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-500" />
            Serpstack API Demo
          </CardTitle>
          <CardDescription>
            Test and explore what the Serpstack API can provide for SERP analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Test */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleTest}
              disabled={isLoading}
              variant={connectionStatus === 'connected' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : connectionStatus === 'connected' ? (
                <CheckCircle className="h-4 w-4" />
              ) : connectionStatus === 'error' ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Test Connection
            </Button>
            
            {connectionStatus !== 'unknown' && (
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                {connectionStatus === 'connected' ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Failed
                  </>
                )}
              </Badge>
            )}
          </div>

          {/* Keyword Analysis */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter keyword to analyze (e.g., digital marketing)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <Button 
                onClick={handleAnalyze}
                disabled={isLoading || !keyword.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Analyze
              </Button>
              <Button 
                onClick={handleSearch}
                disabled={isLoading || !keyword.trim()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((capability, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <capability.icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{capability.label}</h4>
                      <p className="text-xs text-slate-400 mt-1">{capability.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results Display */}
          {results && (
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Analysis Results for "{results.keyword}"
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{results.peopleAlsoAsk?.length || 0}</div>
                    <div className="text-xs text-slate-400">FAQ Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{results.entities?.length || 0}</div>
                    <div className="text-xs text-slate-400">Entities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{results.topResults?.length || 0}</div>
                    <div className="text-xs text-slate-400">Top Results</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{results.searchVolume || 0}</div>
                    <div className="text-xs text-slate-400">Est. Volume</div>
                  </div>
                </div>

                {/* Sample FAQ Questions */}
                {results.peopleAlsoAsk && results.peopleAlsoAsk.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-blue-400">Sample FAQ Questions:</h4>
                    <div className="space-y-1">
                      {results.peopleAlsoAsk.slice(0, 3).map((faq: any, index: number) => (
                        <div key={index} className="text-sm bg-slate-700/50 p-2 rounded border border-slate-600">
                          <div className="font-medium">{faq.question}</div>
                          {faq.answer && (
                            <div className="text-slate-400 text-xs mt-1 line-clamp-2">{faq.answer}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Entities */}
                {results.entities && results.entities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-400">Key Entities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.entities.slice(0, 8).map((entity: any, index: number) => (
                        <Badge key={index} variant="outline" className="bg-green-500/10 border-green-500/30 text-green-300">
                          {entity.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Quality */}
                <div className="pt-4 border-t border-slate-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Data Quality:</span>
                    <Badge 
                      variant={results.dataQuality === 'high' ? 'default' : results.dataQuality === 'medium' ? 'secondary' : 'outline'}
                    >
                      {results.dataQuality || 'unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-400">Provider:</span>
                    <span className="text-blue-400 font-mono">Serpstack API</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}