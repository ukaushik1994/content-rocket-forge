
import React from 'react';
import { KeywordSearch } from '@/components/content-builder/keyword/KeywordSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InitialStateViewProps {
  onKeywordSearch?: (keyword: string, suggestions: string[]) => void;
}

export const InitialStateView: React.FC<InitialStateViewProps> = ({ 
  onKeywordSearch 
}) => {
  // If no onKeywordSearch is provided, create a dummy function
  const handleKeywordSearch = onKeywordSearch || (() => {});
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Start Your Content Journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Enter a main keyword to begin your content creation process. We'll analyze it and 
            suggest related keywords to help you build comprehensive content.
          </p>
          
          <KeywordSearch 
            initialKeyword="" 
            onKeywordSearch={handleKeywordSearch} 
          />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expert Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose keywords with search volume that matches your site's authority. 
              New sites should target less competitive keywords first.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Focus on topics where you can provide unique value or insights that 
              aren't available elsewhere online.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
