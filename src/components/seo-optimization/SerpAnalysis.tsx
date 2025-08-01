
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpAnalysisResult } from '@/services/serpAnalysisService';
import { Search, ExternalLink, TrendingUp, Globe } from 'lucide-react';

interface SerpAnalysisProps {
  serpData: SerpAnalysisResult | null;
  keyword: string;
  isAnalyzing: boolean;
}

export function SerpAnalysis({ serpData, keyword, isAnalyzing }: SerpAnalysisProps) {
  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Analyzing SERP Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serpData && !keyword) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SERP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No SERP data available</p>
            <p className="text-sm mt-2">Add a target keyword and run analysis to see SERP insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serpData && keyword) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SERP Analysis for "{keyword}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>SERP data will be available after analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SERP Analysis for "{keyword}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {serpData?.competitorAnalysis?.averageWordCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Word Count</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {serpData?.competitorAnalysis?.averageHeadings || 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Headings</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {serpData?.difficulty || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
            </div>
          </div>

          {serpData?.topResults && serpData.topResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Top Ranking Content</h4>
              <div className="space-y-3">
                {serpData.topResults.slice(0, 5).map((result, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="text-sm font-medium">{result.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>{result.url}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {serpData?.suggestions && serpData.suggestions.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Content Suggestions</h4>
              <div className="space-y-2">
                {serpData.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
