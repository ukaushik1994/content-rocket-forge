
import React from 'react';

interface ContentCardStatsProps {
  content?: string;
}

export const ContentCardStats: React.FC<ContentCardStatsProps> = ({ content }) => {
  // Estimate reading time based on content length (average reading speed: 200 words per minute)
  const estimateReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes > 0 ? `${minutes} min read` : '< 1 min read';
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-primary/30"></span>
        {content ? `~${content.split(/\s+/).length} words` : 'No content'}
      </div>
      <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
        <span className="inline-block w-2 h-2 rounded-full bg-secondary/40"></span>
        {content ? estimateReadingTime(content) : 'N/A'}
      </div>
    </div>
  );
};
