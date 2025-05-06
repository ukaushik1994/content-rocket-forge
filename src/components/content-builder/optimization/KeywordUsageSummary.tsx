
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeyRound } from 'lucide-react';
import { KeywordUsage } from '@/hooks/seo-analysis/types';

interface KeywordUsageSummaryProps {
  keywordUsage: KeywordUsage[];
}

export const KeywordUsageSummary = ({ keywordUsage }: KeywordUsageSummaryProps) => {
  if (!keywordUsage || keywordUsage.length === 0) {
    return null;
  }
  
  // Function to determine density color
  const getDensityColor = (densityStr: string) => {
    const density = parseFloat(densityStr);
    if (density < 0.5) return 'text-red-500';
    if (density >= 0.5 && density < 1) return 'text-yellow-500';
    if (density >= 1 && density <= 3) return 'text-green-500';
    return 'text-red-500'; // Over 3% is keyword stuffing
  };
  
  return (
    <Card className="shadow-md border border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Keyword Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {keywordUsage.map((item, index) => (
            <li key={index} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-sm font-medium">{item.keyword}</span>
                {index === 0 && (
                  <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-700">
                    Main
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {item.count} {item.count === 1 ? 'mention' : 'mentions'} 
                </span>
                <Badge variant="outline" className={`text-xs ${getDensityColor(item.density)} border-current/30`}>
                  {item.density}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
