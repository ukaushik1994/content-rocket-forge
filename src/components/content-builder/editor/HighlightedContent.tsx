import React from 'react';

interface HighlightMatch {
  text: string;
  type: string;
  start: number;
  end: number;
  serpItem: any;
}

interface HighlightedContentProps {
  content: string;
  matches: HighlightMatch[];
  highlightMode: string | null;
}

const getHighlightColor = (type: string) => {
  const colors = {
    'people_also_ask': 'bg-blue-500/20 text-blue-900 dark:text-blue-100 border border-blue-400/40',
    'related_searches': 'bg-green-500/20 text-green-900 dark:text-green-100 border border-green-400/40',
    'headings': 'bg-purple-500/20 text-purple-900 dark:text-purple-100 border border-purple-400/40',
    'entities': 'bg-orange-500/20 text-orange-900 dark:text-orange-100 border border-orange-400/40',
    'content_gaps': 'bg-red-500/20 text-red-900 dark:text-red-100 border border-red-400/40',
    'top_results': 'bg-cyan-500/20 text-cyan-900 dark:text-cyan-100 border border-cyan-400/40'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-900 dark:text-gray-100 border border-gray-400/40';
};

export const HighlightedContent: React.FC<HighlightedContentProps> = ({ 
  content, 
  matches, 
  highlightMode 
}) => {
  // Create segments of content with highlights
  const createHighlightedSegments = () => {
    if (!matches.length) {
      return [{ text: content, isHighlight: false }];
    }

    const filteredMatches = matches.filter(match => 
      !highlightMode || highlightMode === match.type
    );

    if (!filteredMatches.length) {
      return [{ text: content, isHighlight: false }];
    }

    const segments = [];
    let lastIndex = 0;

    // Sort matches by start position
    const sortedMatches = [...filteredMatches].sort((a, b) => a.start - b.start);

    sortedMatches.forEach((match) => {
      // Add text before the match
      if (match.start > lastIndex) {
        segments.push({
          text: content.slice(lastIndex, match.start),
          isHighlight: false
        });
      }

      // Add the highlighted match
      segments.push({
        text: match.text,
        isHighlight: true,
        type: match.type,
        serpItem: match.serpItem
      });

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      segments.push({
        text: content.slice(lastIndex),
        isHighlight: false
      });
    }

    return segments;
  };

  const renderSegment = (segment: any, index: number) => {
    if (segment.isHighlight) {
      return (
        <span
          key={index}
          className={`inline-block px-1.5 py-0.5 mx-0.5 rounded-md font-medium transition-all duration-200 hover:scale-105 cursor-help ${getHighlightColor(segment.type)}`}
          title={`SERP Match: ${segment.type.replace(/_/g, ' ')} - ${segment.serpItem?.content?.slice(0, 100)}...`}
        >
          {segment.text}
        </span>
      );
    }
    return segment.text;
  };

  const segments = createHighlightedSegments();

  return (
    <div className="whitespace-pre-wrap">
      {segments.map((segment, index) => renderSegment(segment, index))}
    </div>
  );
};