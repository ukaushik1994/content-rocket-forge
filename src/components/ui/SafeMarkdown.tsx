import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';

interface SafeMarkdownProps {
  children: string;
  className?: string;
}

export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ children, className = '' }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    if (!children) return '';
    const rawHtml = marked.parse(children, { async: false }) as string;
    
    // Post-process: Style navigation links (👉 [Open X →](/path)) as buttons
    const styled = rawHtml.replace(
      /👉\s*<a\s+href="(\/[^"]+)"[^>]*>([^<]+)<\/a>/g,
      '<a href="$1" class="nav-link-btn inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 mb-1 text-xs font-medium rounded-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors no-underline cursor-pointer">$2</a>'
    );
    
    return DOMPurify.sanitize(styled, {
      ADD_ATTR: ['class'],
    });
  }, [children]);

  // Intercept internal link clicks for React Router navigation
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href?.startsWith('/')) {
        e.preventDefault();
        navigate(href);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('click', handleClick);
      return () => el.removeEventListener('click', handleClick);
    }
  }, [handleClick]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
