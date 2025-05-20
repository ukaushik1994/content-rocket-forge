
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface InitialStateViewProps {
  onSearch: (keyword: string, suggestions: string[]) => void;
}

export const InitialStateView: React.FC<InitialStateViewProps> = ({ onSearch }) => {
  // List of example keywords
  const exampleKeywords = [
    'content marketing',
    'seo optimization',
    'digital strategy',
    'social media',
    'brand awareness',
    'conversion rate'
  ];

  const handleExampleClick = (keyword: string) => {
    onSearch(keyword, []);
  };

  return (
    <div className="text-center space-y-6 py-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Search className="h-8 w-8 text-primary" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Start with a keyword</h3>
        <p className="text-sm text-muted-foreground">
          Enter your main keyword to begin analyzing search results
        </p>
      </div>
      
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Try one of these examples:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {exampleKeywords.map((keyword) => (
            <Button
              key={keyword}
              variant="outline"
              size="sm"
              onClick={() => handleExampleClick(keyword)}
              className="text-xs"
            >
              {keyword}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
