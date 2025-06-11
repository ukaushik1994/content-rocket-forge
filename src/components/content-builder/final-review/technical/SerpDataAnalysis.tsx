
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { List, FileText, HelpCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SerpDataAnalysisProps {
  serpData: SerpAnalysisResult | null;
  isLoading?: boolean;
}

export const SerpDataAnalysis = ({ serpData, isLoading = false }: SerpDataAnalysisProps) => {
  if (isLoading) {
    return <SerpDataAnalysisSkeleton />;
  }
  
  if (!serpData || Object.keys(serpData).length === 0) {
    return (
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
            SERP Analysis Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert variant="default" className="bg-slate-100 border-slate-200">
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <AlertDescription className="text-sm text-slate-600">
              No SERP analysis data available. Try analyzing your keyword first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
          SERP Analysis Data
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-6">
            {/* Top Ranking Pages Section */}
            {serpData.topResults && serpData.topResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <List className="h-4 w-4 text-blue-500" /> 
                  Top Ranking Pages
                </h4>
                <div className="space-y-2">
                  {serpData.topResults.slice(0, 3).map((result, idx) => (
                    <div key={`result-${idx}`} className="bg-card border rounded-md p-3">
                      <div className="text-xs font-medium text-blue-600">
                        Position {result.position}: {result.title || 'No title'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {result.link || 'No URL'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Featured Snippets Section */}
            {serpData.featuredSnippets && serpData.featuredSnippets.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" /> 
                  Featured Snippets
                </h4>
                <div className="space-y-2">
                  {serpData.featuredSnippets.slice(0, 2).map((snippet, idx) => (
                    <div key={`snippet-${idx}`} className="bg-purple-50 border border-purple-100 rounded-md p-3">
                      <div className="text-xs font-medium text-purple-600 mb-1">
                        {snippet.title || 'Featured Snippet'}
                      </div>
                      <div className="text-xs text-slate-700">
                        {snippet.content || 'No content available'}
                      </div>
                      {snippet.source && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Source: {getDisplayUrl(snippet.source)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related Searches Section */}
            {serpData.relatedSearches && serpData.relatedSearches.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Related Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {serpData.relatedSearches.slice(0, 5).map((search, idx) => (
                    <div key={`search-${idx}`} className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-700">
                      {search.query || 'No query'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* People Also Ask Section */}
            {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">People Also Ask</h4>
                <div className="space-y-2">
                  {serpData.peopleAlsoAsk.slice(0, 3).map((question, idx) => (
                    <div key={`question-${idx}`} className="bg-green-50 border border-green-100 rounded-md p-3">
                      <div className="text-xs font-medium text-green-700">
                        {question.question}
                      </div>
                      {question.answer && (
                        <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {question.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Helper function to safely extract display URL
const getDisplayUrl = (urlString: string): string => {
  try {
    // Check if the URL starts with http:// or https://
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      // Add https:// if missing
      urlString = 'https://' + urlString;
    }
    
    const url = new URL(urlString);
    return url.hostname;
  } catch (error) {
    // If URL parsing fails, return the original string or a fallback
    return urlString.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] || 'unknown source';
  }
};

// Loading skeleton
const SerpDataAnalysisSkeleton = () => (
  <Card className="overflow-hidden shadow-lg">
    <CardHeader className="pb-3 border-b">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
        SERP Analysis Data
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
