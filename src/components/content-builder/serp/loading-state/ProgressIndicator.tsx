
import React from 'react';

interface ProgressIndicatorProps {
  keywords?: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ keywords = [] }) => {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center max-w-lg mx-auto">
      {keywords.map((keyword, index) => (
        <div
          key={index}
          className="px-2.5 py-1 bg-white/10 rounded-full text-xs text-white/90 border border-white/10 animate-pulse"
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '2s'
          }}
        >
          {keyword}
        </div>
      ))}
    </div>
  );
};
