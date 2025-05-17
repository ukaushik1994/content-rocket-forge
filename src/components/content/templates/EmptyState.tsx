
import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-center space-y-6">
      <div className="p-4 bg-neon-purple/10 rounded-full">
        <Search className="h-8 w-8 text-neon-purple" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white/90">No SERP Data Available</h3>
        <p className="text-white/70 max-w-md">
          Search data is required to generate optimized content templates based on keywords.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
        
        <Button
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple shadow-md shadow-neon-purple/20"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Add Keyword
        </Button>
      </div>
    </div>
  );
}
