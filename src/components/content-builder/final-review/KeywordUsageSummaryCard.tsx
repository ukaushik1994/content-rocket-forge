
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface KeywordUsageSummaryCardProps {
  keywordUsage: { keyword: string; count: number; density: string }[];
  mainKeyword: string;
}

export const KeywordUsageSummaryCard = ({ keywordUsage, mainKeyword }: KeywordUsageSummaryCardProps) => {
  if (!keywordUsage || keywordUsage.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
            Keyword Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm text-center">No keyword usage data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
          Keyword Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 overflow-hidden">
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          <div>
            <h4 className="text-xs font-medium mb-2">Primary Keyword</h4>
            {keywordUsage.filter(k => k.keyword === mainKeyword).map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-primary/10 p-2 rounded-md">
                <span className="text-sm font-medium">{item.keyword}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.count} occurrences</Badge>
                  <Badge 
                    variant={getDensityVariant(parseFloat(item.density))}
                    className="min-w-16 text-center"
                  >
                    {item.density}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-2">Secondary Keywords</h4>
            <div className="space-y-1">
              {keywordUsage.filter(k => k.keyword !== mainKeyword).map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-md bg-secondary/10">
                  <span className="text-sm truncate max-w-[150px]" title={item.keyword}>{item.keyword}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.count}</Badge>
                    <Badge 
                      variant={getDensityVariant(parseFloat(item.density))}
                      className="min-w-16 text-center"
                    >
                      {item.density}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {keywordUsage.filter(k => k.keyword !== mainKeyword).length === 0 && (
                <p className="text-muted-foreground text-sm italic">No secondary keywords found.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to determine badge variant based on keyword density
const getDensityVariant = (density: number): "default" | "secondary" | "destructive" => {
  if (density < 0.5) return "secondary"; // Too low
  if (density > 3) return "destructive"; // Too high (keyword stuffing)
  return "default"; // Good range
};
