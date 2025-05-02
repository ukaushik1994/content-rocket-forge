
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordResearchTool } from '@/components/keywords/KeywordResearchTool';

interface ResearchTabContentProps {
  onUseKeyword: (keyword: string) => void;
}

const ResearchTabContent = ({ onUseKeyword }: ResearchTabContentProps) => {
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2">
        <CardTitle>Keyword Research Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <KeywordResearchTool onUseKeyword={onUseKeyword} />
      </CardContent>
    </Card>
  );
};

export default ResearchTabContent;
