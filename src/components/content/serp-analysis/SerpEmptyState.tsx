
import React from 'react';
import { Search } from 'lucide-react';

export function SerpEmptyState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="rounded-full bg-white/5 p-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-6 text-lg font-medium">No SERP Analysis</h3>
        <p className="text-sm text-muted-foreground mt-2">Enter a keyword to analyze search results</p>
      </div>
    </div>
  );
}
