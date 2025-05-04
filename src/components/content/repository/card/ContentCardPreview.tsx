
import React from 'react';

interface ContentCardPreviewProps {
  title: string;
  content?: string;
}

export const ContentCardPreview: React.FC<ContentCardPreviewProps> = ({ title, content }) => {
  // Calculate content preview (first few words of content)
  const getContentPreview = () => {
    if (!content) return '';
    const words = content.split(/\s+/).slice(0, 20).join(' ');
    return words + (content.split(/\s+/).length > 20 ? '...' : '');
  };

  return (
    <>
      <h3 className="font-medium text-base mb-1 line-clamp-2 group-hover:text-primary/90 transition-colors">
        {title}
      </h3>
      
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 group-hover:line-clamp-3 transition-all">
        {getContentPreview() || 'No content preview available'}
      </p>
    </>
  );
};
