
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SerpNoDataFoundProps {
  onAddApiKey: () => void;
  onRetry?: () => void;
}

export function SerpNoDataFound({ onAddApiKey, onRetry }: SerpNoDataFoundProps) {
  return (
    <Card className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-950/20 to-black/20 border border-amber-500/30">
      <div className="text-center space-y-4 max-w-md">
        <div className="bg-amber-900/20 p-3 rounded-full inline-flex mx-auto mb-2">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-medium">No SERP data found</h3>
        <p className="text-sm text-muted-foreground">
          We couldn't retrieve any search results data. This might be because:
        </p>
        <ul className="text-sm text-muted-foreground list-disc text-left space-y-2 pl-5">
          <li>Your SERP API key is missing or invalid</li>
          <li>The SERP API service is temporarily unavailable</li>
          <li>There are no results for this search query</li>
        </ul>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            className="border-amber-500/30 hover:border-amber-500/50"
            onClick={onAddApiKey}
          >
            <Settings className="mr-2 h-4 w-4" />
            Add API Key
          </Button>
          
          {onRetry && (
            <Button 
              variant="default"
              onClick={onRetry}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
