
import React from 'react';
import { Sparkles } from 'lucide-react';

export function ContentTemplatesHeader() {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-5 rounded-xl border border-white/10 backdrop-blur-xl shadow-xl">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-neon-purple/20 rounded-full">
          <Sparkles className="h-5 w-5 text-neon-purple" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white/90">AI Content Templates</h2>
          <p className="text-sm text-white/70 mt-1">
            Choose a template to quickly generate optimized content based on SERP data for your keyword. 
            Each template is tailored for different content types. 
            Use the refresh buttons to get new variations of data.
          </p>
        </div>
      </div>
    </div>
  );
}
