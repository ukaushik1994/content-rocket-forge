
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface KeywordsListProps {
  content: ContentItemType;
}

export const KeywordsList: React.FC<KeywordsListProps> = ({ content }) => {
  const keywords = content.keywords || [];
  const keywordsWithDensity = calculateKeywordDensity(content);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Keyword Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {keywordsWithDensity.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {keywordsWithDensity.map((keyword) => (
                <div 
                  key={keyword.text} 
                  className="border rounded-md p-3 flex flex-col space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{keyword.text}</span>
                    <Badge 
                      variant={getKeywordDensityVariant(keyword.density)}
                      className="text-xs"
                    >
                      {keyword.density.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Appears {keyword.count} {keyword.count === 1 ? 'time' : 'times'}
                  </div>
                  {keyword.hasDensityIssue && (
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <AlertCircle className="h-3 w-3" />
                      {keyword.density < 0.5 ? 
                        'Too low - increase usage' : 
                        'Too high - may appear as keyword stuffing'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Optimal keyword density is between 0.5% and 2.5% for primary keywords.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No keywords found. Add keywords to analyze content optimization.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to calculate keyword density
function calculateKeywordDensity(content: ContentItemType) {
  const keywords = content.keywords || [];
  const text = content.content || '';
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  if (wordCount === 0) return [];
  
  return keywords.map(keyword => {
    // Count occurrences (case insensitive)
    const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    
    // Calculate density as percentage
    const density = (count / wordCount) * 100;
    
    // Flag if density is outside optimal range
    const hasDensityIssue = density < 0.5 || density > 2.5;
    
    return {
      text: keyword,
      count,
      density,
      hasDensityIssue
    };
  });
}

// Helper function to get badge variant based on keyword density
function getKeywordDensityVariant(density: number) {
  if (density < 0.5) return 'outline';
  if (density > 2.5) return 'destructive';
  return 'secondary';
}
