import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface SafeMarkdownProps {
  children: string;
  className?: string;
}

export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ children, className = '' }) => {
  const html = useMemo(() => {
    if (!children) return '';
    const rawHtml = marked.parse(children, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [children]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
