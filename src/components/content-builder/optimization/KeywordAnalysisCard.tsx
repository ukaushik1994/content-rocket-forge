
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KeywordAnalysisCardProps {
  keywordUsage: { keyword: string; count: number; density: string }[];
  mainKeyword: string;
}

export const KeywordAnalysisCard = ({ keywordUsage, mainKeyword }: KeywordAnalysisCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Keyword Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {keywordUsage.map((item, index) => (
            <div key={index} className="border rounded-md p-3 flex justify-between items-center">
              <Badge className={item.keyword === mainKeyword ? 'bg-primary/10 text-primary border-primary/30' : 'bg-secondary'}>
                {item.keyword}
              </Badge>
              <div className="text-sm">
                <span className="text-muted-foreground">Count: </span>
                <span className="font-medium">{item.count}</span>
                <span className="text-muted-foreground ml-2">Density: </span>
                <span className="font-medium">{item.density}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
