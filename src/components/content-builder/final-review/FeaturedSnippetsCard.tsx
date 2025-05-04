
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface FeaturedSnippet {
  content: string;
  source: string;
  type?: string;
}

interface FeaturedSnippetsCardProps {
  snippets?: FeaturedSnippet[] | null;
}

export const FeaturedSnippetsCard = ({ snippets }: FeaturedSnippetsCardProps) => {
  if (!snippets || snippets.length === 0) {
    return (
      <Card className="h-full shadow-md">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
            Featured Snippets
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] flex-col gap-2 text-center">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No featured snippets data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
          Featured Snippets
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {snippets.map((snippet, index) => (
            <div key={index} className="border border-indigo-500/20 rounded-md p-3 bg-indigo-500/5">
              <div className="text-xs text-indigo-400 mb-1 font-medium uppercase">
                {snippet.type || 'Paragraph'} Snippet
              </div>
              <p className="text-sm mb-2">{snippet.content}</p>
              <div className="text-xs text-muted-foreground">
                Source: <a href={snippet.source} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{new URL(snippet.source).hostname}</a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <p>Optimize your content to target these featured snippet opportunities and increase visibility.</p>
        </div>
      </CardContent>
    </Card>
  );
};
