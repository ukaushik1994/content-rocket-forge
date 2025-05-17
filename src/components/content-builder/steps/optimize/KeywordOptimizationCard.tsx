
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Search, AlertCircle } from 'lucide-react';

interface KeywordOptimizationCardProps {
  keywordUsage: {
    mainKeyword: {
      count: number,
      density: number
    },
    relatedKeywords: {
      keyword: string,
      count: number
    }[]
  }
}

export function KeywordOptimizationCard({ keywordUsage }: KeywordOptimizationCardProps) {
  const { mainKeyword, relatedKeywords } = keywordUsage;
  
  // Determine keyword density status
  const getDensityStatus = () => {
    if (mainKeyword.density < 0.5) return { status: 'low', color: 'text-yellow-400' };
    if (mainKeyword.density > 2.5) return { status: 'high', color: 'text-yellow-400' };
    return { status: 'optimal', color: 'text-green-400' };
  };
  
  const densityStatus = getDensityStatus();
  
  return (
    <Card className="border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Keyword Optimization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Keyword */}
          <div>
            <p className="text-sm font-medium mb-1">Main Keyword Usage</p>
            <div className="p-3 bg-white/5 rounded-md border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs">
                  <span className="font-semibold">{mainKeyword.count}x</span> mentions
                </p>
                <Badge variant="outline" className={`${densityStatus.color} border-${densityStatus.color}/30 text-xs`}>
                  {densityStatus.status === 'optimal' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {densityStatus.status.charAt(0).toUpperCase() + densityStatus.status.slice(1)} density
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keyword density: {mainKeyword.density.toFixed(1)}%
              </p>
            </div>
          </div>
          
          {/* Related Keywords */}
          <div>
            <p className="text-sm font-medium mb-1">Related Keywords Usage</p>
            <div className="space-y-2">
              {relatedKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                  <span className="text-xs truncate max-w-[180px]">{keyword.keyword}</span>
                  <Badge variant={keyword.count > 0 ? "outline" : "secondary"} className="text-[10px]">
                    {keyword.count > 0 ? `${keyword.count}x` : "missing"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
