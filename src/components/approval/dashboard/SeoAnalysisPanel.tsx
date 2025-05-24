
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { SeoRecommendations } from '../seo/SeoRecommendations';
import { KeywordsList } from '../seo/KeywordsList';
import { SeoTips } from '../seo/SeoTips';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface SeoAnalysisPanelProps {
  content: ContentItemType | null;
}

export const SeoAnalysisPanel: React.FC<SeoAnalysisPanelProps> = ({ content }) => {
  if (!content) {
    return (
      <Card className="h-full border border-white/10 bg-gray-800/20 backdrop-blur-sm">
        <CardContent className="h-full flex flex-col items-center justify-center text-white/50">
          <Search className="h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">SEO Analysis</h3>
          <p>Select content to view SEO recommendations and keyword analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SeoRecommendations content={content} />
          <SeoTips content={content} />
        </div>
        <div>
          <KeywordsList content={content} />
        </div>
      </div>
    </div>
  );
};
