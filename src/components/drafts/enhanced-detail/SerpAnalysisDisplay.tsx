
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Globe, 
  AlertCircle, 
  RefreshCw, 
  Loader2,
  ExternalLink
} from 'lucide-react';

interface SerpAnalysisDisplayProps {
  serpData: any;
  draft: any;
  isAnalyzing: boolean;
}

// Helper function to safely get string value from data
const getStringValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    // Handle objects with question/query properties
    if (value.question) return value.question;
    if (value.query) return value.query;
    if (value.text) return value.text;
    // Fallback to JSON string for debugging
    return JSON.stringify(value);
  }
  return String(value || '');
};

// Helper function to safely get array of strings
const getStringArray = (arr: any[]): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => getStringValue(item));
};

export const SerpAnalysisDisplay = ({
  serpData,
  draft,
  isAnalyzing
}: SerpAnalysisDisplayProps) => {

  if (isAnalyzing) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SERP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing SERP data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serpData) {
    return (
      <Card className="h-full border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SERP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Globe className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
            No SERP Data Available
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 text-center mb-4">
            SERP analysis requires keyword data and API access.
          </p>
          {draft?.keywords && draft.keywords.length > 0 && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Target keyword: <span className="font-medium">{getStringValue(draft.keywords[0])}</span>
              </p>
              <Badge variant="outline" className="text-xs">
                Configure SERP API for analysis
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Safely extract data arrays
  const topResults = Array.isArray(serpData.topResults) ? serpData.topResults : [];
  const relatedSearches = getStringArray(serpData.relatedSearches || []);
  const peopleAlsoAsk = getStringArray(serpData.peopleAlsoAsk || []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5" />
          SERP Analysis
        </CardTitle>
        {serpData.isMockData && (
          <Badge variant="outline" className="text-xs w-fit">
            Mock Data - Configure API for real results
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Competition Overview */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Competition Overview
          </h4>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Competition Level</span>
              <Badge variant="outline" className="text-xs">
                {topResults.length > 8 ? 'High' : topResults.length > 5 ? 'Medium' : 'Low'}
              </Badge>
            </div>
            <Progress 
              value={Math.min(100, (topResults.length / 10) * 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {topResults.length} competing pages found
            </p>
          </div>
        </div>

        {/* Top Results */}
        {topResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Top Results ({topResults.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {topResults.slice(0, 3).map((result: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    #{index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{getStringValue(result.title)}</p>
                    <p className="truncate text-muted-foreground">{getStringValue(result.domain || result.link)}</p>
                  </div>
                  {result.url && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                      <a href={getStringValue(result.url)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
              {topResults.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{topResults.length - 3} more results
                </p>
              )}
            </div>
          </div>
        )}

        {/* Related Searches */}
        {relatedSearches.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              Related Searches
            </h4>
            <div className="flex flex-wrap gap-1">
              {relatedSearches.slice(0, 6).map((search: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {search}
                </Badge>
              ))}
              {relatedSearches.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{relatedSearches.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* People Also Ask */}
        {peopleAlsoAsk.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              People Also Ask
            </h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {peopleAlsoAsk.slice(0, 3).map((question: string, index: number) => (
                <p key={index} className="text-xs text-muted-foreground p-1 bg-muted/20 rounded">
                  {question}
                </p>
              ))}
              {peopleAlsoAsk.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{peopleAlsoAsk.length - 3} more questions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Analysis Summary */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            <p>Analysis based on keyword: <span className="font-medium">{getStringValue(draft?.keywords?.[0] || 'Unknown')}</span></p>
            {serpData.analysisTimestamp && (
              <p>Updated: {new Date(serpData.analysisTimestamp).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
