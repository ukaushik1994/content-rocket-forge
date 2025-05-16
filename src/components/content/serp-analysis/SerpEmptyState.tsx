
import React from 'react';
import { Card } from '@/components/ui/card';
import { Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SerpEmptyStateProps {
  keyword?: string;
  onAddApiKey: () => void;
}

export function SerpEmptyState({ keyword, onAddApiKey }: SerpEmptyStateProps) {
  return (
    <Card className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-950/20 to-black/20 border border-blue-500/20">
      <div className="text-center space-y-4 max-w-md">
        <div className="bg-blue-900/20 p-3 rounded-full inline-flex mx-auto mb-2">
          <Search className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-medium">No Search Results Data</h3>
        <p className="text-sm text-muted-foreground">
          {keyword 
            ? `We couldn't find any SERP data for "${keyword}".`
            : "Enter a keyword to analyze search engine results data."
          }
        </p>
        <p className="text-sm text-muted-foreground">
          To enable SERP analysis, you'll need to add your SERP API key in Settings.
        </p>
        <div className="pt-4 flex justify-center">
          <Button 
            variant="outline" 
            className="border-blue-500/30 hover:border-blue-500/50"
            onClick={onAddApiKey}
          >
            <Settings className="mr-2 h-4 w-4" />
            Add API Key
          </Button>
        </div>
      </div>
    </Card>
  );
}
