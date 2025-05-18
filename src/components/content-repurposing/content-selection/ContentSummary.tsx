
import React from 'react';

interface ContentSummaryProps {
  title: string;
  content?: string;
}

const ContentSummary: React.FC<ContentSummaryProps> = ({ title, content }) => {
  return (
    <div>
      <h3 className="font-medium text-white">{title}</h3>
      {content && (
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {content.substring(0, 120)}...
        </p>
      )}
    </div>
  );
};

export default ContentSummary;
