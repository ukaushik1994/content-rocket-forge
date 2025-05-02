
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordCompetitors } from '@/components/keywords/KeywordCompetitors';

interface CompetitorsTabContentProps {
  onUseKeyword: (keyword: string) => void;
}

const CompetitorsTabContent = ({ onUseKeyword }: CompetitorsTabContentProps) => {
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2">
        <CardTitle>Competitor Keyword Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <KeywordCompetitors onUseKeyword={onUseKeyword} />
      </CardContent>
    </Card>
  );
};

export default CompetitorsTabContent;
