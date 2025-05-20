
import React, { memo } from 'react';
import { Clock, BarChart2, AlignLeft } from 'lucide-react';
import { getFormatByIdOrDefault } from '../formats';

interface ContentStatsProps {
  content: string;
  formatId: string;
}

const ContentStats: React.FC<ContentStatsProps> = memo(({ content, formatId }) => {
  const format = getFormatByIdOrDefault(formatId);
  
  // Calculate statistics
  const charCount = content.length;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  // Estimate reading time (average adult reads ~200-250 words per minute)
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 225));
  
  return (
    <div className="flex flex-wrap gap-3 mb-2 px-1 text-xs text-white/60">
      <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
        <AlignLeft className="h-3 w-3" />
        <span>{wordCount} words</span>
      </div>
      
      <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
        <BarChart2 className="h-3 w-3" />
        <span>{charCount} characters</span>
      </div>
      
      <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
        <Clock className="h-3 w-3" />
        <span>{readingTimeMinutes} min read</span>
      </div>
    </div>
  );
});

ContentStats.displayName = 'ContentStats';

export default ContentStats;
