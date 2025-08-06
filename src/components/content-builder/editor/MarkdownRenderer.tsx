import React from 'react';
import { HighlightedContent } from './HighlightedContent';

interface HighlightMatch {
  text: string;
  type: string;
  start: number;
  end: number;
  serpItem: any;
}

interface MarkdownRendererProps {
  content: string;
  matches: HighlightMatch[];
  highlightMode: string | null;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  matches,
  highlightMode
}) => {
  // Convert markdown to React elements
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join('\n');
        elements.push(
          <p key={elements.length} className="mb-4 text-foreground leading-relaxed">
            <HighlightedContent 
              content={paragraphText} 
              matches={matches.filter(m => {
                const start = text.indexOf(paragraphText);
                const end = start + paragraphText.length;
                return m.start >= start && m.end <= end;
              })} 
              highlightMode={highlightMode} 
            />
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        flushParagraph();
        const headerText = line.substring(2);
        elements.push(
          <h1 key={elements.length} className="text-2xl font-bold mb-4 text-foreground">
            <HighlightedContent 
              content={headerText} 
              matches={matches.filter(m => {
                const start = text.indexOf(line);
                const end = start + line.length;
                return m.start >= start && m.end <= end;
              })} 
              highlightMode={highlightMode} 
            />
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushParagraph();
        const headerText = line.substring(3);
        elements.push(
          <h2 key={elements.length} className="text-xl font-semibold mb-3 text-foreground">
            <HighlightedContent 
              content={headerText} 
              matches={matches.filter(m => {
                const start = text.indexOf(line);
                const end = start + line.length;
                return m.start >= start && m.end <= end;
              })} 
              highlightMode={highlightMode} 
            />
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushParagraph();
        const headerText = line.substring(4);
        elements.push(
          <h3 key={elements.length} className="text-lg font-medium mb-2 text-foreground">
            <HighlightedContent 
              content={headerText} 
              matches={matches.filter(m => {
                const start = text.indexOf(line);
                const end = start + line.length;
                return m.start >= start && m.end <= end;
              })} 
              highlightMode={highlightMode} 
            />
          </h3>
        );
      } else if (line.trim() === '') {
        // Empty line - flush current paragraph
        flushParagraph();
      } else {
        // Regular text - add to current paragraph
        currentParagraph.push(line);
      }
    });

    // Flush any remaining paragraph
    flushParagraph();

    return elements;
  };

  return <div className="max-w-none">{renderMarkdown(content)}</div>;
};