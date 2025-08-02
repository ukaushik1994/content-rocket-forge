import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Target, Hash } from 'lucide-react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

interface ContentSummaryCardProps {
  handleDownload: () => void;
  socialShare: boolean;
}

export const ContentSummaryCard: React.FC<ContentSummaryCardProps> = ({
  handleDownload,
  socialShare
}) => {
  const { state } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords } = state;

  // Word count calculation
  const wordCount = content.trim().split(/\s+/).length;

  // Keyword density calculation
  const keywordDensity = mainKeyword
    ? (content.split(new RegExp(mainKeyword, 'gi')).length - 1) / wordCount * 100
    : 0;

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-lime-900/10 border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Content Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-xs flex items-center gap-1">
            <FileText className="h-3 w-3 mr-1" />
            Word Count
          </div>
          <Badge variant="secondary">{wordCount}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-xs flex items-center gap-1">
            <Target className="h-3 w-3 mr-1" />
            Keyword Density
          </div>
          <Badge variant="secondary">{keywordDensity.toFixed(2)}%</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-xs flex items-center gap-1">
            <Hash className="h-3 w-3 mr-1" />
            Keywords
          </div>
          <div className="flex gap-1">
            {mainKeyword && (
              <Badge variant="outline" className="text-xs">
                {mainKeyword} (main)
              </Badge>
            )}
            {selectedKeywords.map((keyword, index) => (
              <Badge variant="outline" key={index} className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
        <Button variant="secondary" className="w-full justify-center" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download Content
        </Button>
      </CardContent>
    </Card>
  );
};
