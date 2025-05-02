
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordTrends } from '@/components/keywords/KeywordTrends';

interface TrendsTabContentProps {
  onUseKeyword: (keyword: string) => void;
}

const TrendsTabContent = ({ onUseKeyword }: TrendsTabContentProps) => {
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2">
        <CardTitle>Keyword Trends Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <KeywordTrends onUseKeyword={onUseKeyword} />
      </CardContent>
    </Card>
  );
};

export default TrendsTabContent;
