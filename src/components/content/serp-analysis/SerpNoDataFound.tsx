
import React from 'react';
import { FileX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SerpNoDataFoundProps {
  mainKeyword: string;
  onRetry: () => void;
}

export function SerpNoDataFound({ mainKeyword, onRetry }: SerpNoDataFoundProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="rounded-full bg-white/5 p-4">
          <FileX className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="mt-6 text-lg font-medium">No Data Found</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
          We couldn't find SERP data for "{mainKeyword}". This could be due to an API issue or missing API key.
        </p>
        <div className="mt-6">
          <Button 
            onClick={onRetry}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
