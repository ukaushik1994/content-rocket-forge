
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Search, Loader2 } from 'lucide-react';
import { testApiConnection, analyzeKeywordWithProvider, SerpProvider } from '@/services/apiProxyService';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpProviderSelectorProps {
  keyword: string;
  onResultsUpdate: (provider: SerpProvider, results: SerpAnalysisResult) => void;
}

export function SerpProviderSelector({ keyword, onResultsUpdate }: SerpProviderSelectorProps) {
  const [loadingProvider, setLoadingProvider] = useState<SerpProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<SerpProvider | null>(null);

  const handleTestProvider = async (provider: SerpProvider) => {
    setTestingProvider(provider);
    try {
      await testApiConnection(provider);
    } finally {
      setTestingProvider(null);
    }
  };

  const handleAnalyzeWithProvider = async (provider: SerpProvider) => {
    if (!keyword) {
      return;
    }

    setLoadingProvider(provider);
    try {
      const results = await analyzeKeywordWithProvider(provider, keyword);
      if (results) {
        onResultsUpdate(provider, results);
      }
    } catch (error) {
      console.error(`Analysis with ${provider} failed:`, error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Search className="h-4 w-4" />
          SERP Provider Selection
        </h3>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
          Choose Provider
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SerpAPI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-300">SerpAPI</span>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              Premium
            </Badge>
          </div>
          <p className="text-xs text-white/60 mb-3">
            Accurate Google Keyword Planner data with high-quality volume metrics
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestProvider('serp')}
              disabled={testingProvider === 'serp'}
              className="flex-1 text-xs bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
            >
              {testingProvider === 'serp' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => handleAnalyzeWithProvider('serp')}
              disabled={!keyword || loadingProvider === 'serp'}
              className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
            >
              {loadingProvider === 'serp' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Serpstack */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-orange-300">Serpstack</span>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
              Alternative
            </Badge>
          </div>
          <p className="text-xs text-white/60 mb-3">
            Cost-effective option with good organic results and competitor data
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestProvider('serpstack')}
              disabled={testingProvider === 'serpstack'}
              className="flex-1 text-xs bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
            >
              {testingProvider === 'serpstack' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => handleAnalyzeWithProvider('serpstack')}
              disabled={!keyword || loadingProvider === 'serpstack'}
              className="flex-1 text-xs bg-orange-600 hover:bg-orange-700"
            >
              {loadingProvider === 'serpstack' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {!keyword && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-300">
            Enter a keyword to analyze with different SERP providers
          </p>
        </div>
      )}
    </Card>
  );
}
