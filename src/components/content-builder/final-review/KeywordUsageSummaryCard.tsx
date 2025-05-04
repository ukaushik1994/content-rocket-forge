
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KeywordUsageSummaryCardProps {
  keywordUsage: { keyword: string; count: number; density: string }[];
  mainKeyword: string;
  selectedKeywords: string[];
}

export const KeywordUsageSummaryCard = ({ 
  keywordUsage, 
  mainKeyword,
  selectedKeywords
}: KeywordUsageSummaryCardProps) => {
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
  
  // Sort keywords: main keyword first, then secondary keywords that are in the analysis
  const mainKeywordData = keywordUsage.find(k => k.keyword === mainKeyword);
  const secondaryKeywordsData = keywordUsage.filter(k => 
    k.keyword !== mainKeyword && selectedKeywords.includes(k.keyword)
  );
  const unusedKeywords = selectedKeywords.filter(k => 
    k !== mainKeyword && !keywordUsage.some(usage => usage.keyword === k)
  );
  
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
          {/* Primary Keyword Section */}
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              Primary Keyword 
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Optimal density: 1-3%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>
            {mainKeywordData ? (
              <div className="flex justify-between items-center bg-primary/10 p-2 rounded-md">
                <span className="text-sm font-medium">{mainKeywordData.keyword}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{mainKeywordData.count} occurrences</Badge>
                  <Badge 
                    variant={getDensityVariant(parseFloat(mainKeywordData.density))}
                    className="min-w-16 text-center flex items-center gap-1"
                  >
                    {mainKeywordData.density}
                    {getDensityIcon(parseFloat(mainKeywordData.density))}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="bg-destructive/20 p-2 rounded-md flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Main keyword "{mainKeyword}" not found in content!
              </div>
            )}
          </div>
          
          {/* Secondary Keywords Section */}
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center justify-between">
              <span>Secondary Keywords ({secondaryKeywordsData.length + unusedKeywords.length})</span>
              <Badge variant="outline" className="font-normal">
                <Tag className="h-3 w-3 mr-1" /> 
                {secondaryKeywordsData.length} of {selectedKeywords.length - 1} used
              </Badge>
            </h4>
            <div className="space-y-1">
              {secondaryKeywordsData.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-md bg-secondary/10">
                  <span className="text-sm truncate max-w-[150px]" title={item.keyword}>{item.keyword}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.count}</Badge>
                    <Badge 
                      variant={getDensityVariant(parseFloat(item.density))}
                      className="min-w-16 text-center flex items-center gap-1"
                    >
                      {item.density}
                      {getDensityIcon(parseFloat(item.density))}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {unusedKeywords.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-xs text-muted-foreground mb-1">Unused Keywords</h5>
                  {unusedKeywords.map((keyword, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-md bg-muted/30 text-muted-foreground">
                      <span className="text-sm truncate max-w-[150px]" title={keyword}>{keyword}</span>
                      <Badge variant="outline" className="bg-muted/50">0 occurrences</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {secondaryKeywordsData.length === 0 && unusedKeywords.length === 0 && (
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
const getDensityVariant = (density: number): "default" | "secondary" | "destructive" | "success" => {
  if (density < 0.5) return "secondary"; // Too low
  if (density > 3) return "destructive"; // Too high (keyword stuffing)
  return "success"; // Good range
};

// Helper function to get the appropriate icon for the density
const getDensityIcon = (density: number) => {
  if (density < 0.5) return <HelpCircle className="h-3 w-3" />;
  if (density > 3) return <AlertTriangle className="h-3 w-3" />;
  return <CheckCircle className="h-3 w-3" />;
};
