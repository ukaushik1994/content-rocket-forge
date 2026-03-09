
import React from 'react';
import DOMPurify from 'dompurify';

interface ContentCardPreviewProps {
  title: string;
  content?: string;
}

// Strip all HTML tags and return plain text
const sanitizeTitle = (title: string): string => {
  if (!title) return '';
  // Use DOMPurify to strip all tags, returning plain text only
  return DOMPurify.sanitize(title, { ALLOWED_TAGS: [] }).trim();
};

export const ContentCardPreview: React.FC<ContentCardPreviewProps> = ({ title, content }) => {
  // Calculate content preview (first few words of content)
  const getContentPreview = () => {
    if (!content) return '';
    // Also sanitize content preview
    const cleanContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
    const words = cleanContent.split(/\s+/).slice(0, 20).join(' ');
    return words + (cleanContent.split(/\s+/).length > 20 ? '...' : '');
  };

  return (
    <>
      <h3 className="font-medium text-base mb-1 line-clamp-2 group-hover:text-primary/90 transition-colors">
        {sanitizeTitle(title)}
      </h3>
      
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 group-hover:line-clamp-3 transition-all">
        {getContentPreview() || 'No content preview available'}
      </p>
    </>
  );
};
