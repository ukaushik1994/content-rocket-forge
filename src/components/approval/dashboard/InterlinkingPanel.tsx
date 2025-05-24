
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { InterLinkingSuggestions } from '../interlinking/InterLinkingSuggestions';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'lucide-react';

interface InterlinkingPanelProps {
  content: ContentItemType | null;
}

export const InterlinkingPanel: React.FC<InterlinkingPanelProps> = ({ content }) => {
  if (!content) {
    return (
      <Card className="h-full border border-white/10 bg-gray-800/20 backdrop-blur-sm">
        <CardContent className="h-full flex flex-col items-center justify-center text-white/50">
          <Link className="h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">Interlinking Opportunities</h3>
          <p>Select content to find relevant interlinking suggestions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <InterLinkingSuggestions content={content} />
    </div>
  );
};
