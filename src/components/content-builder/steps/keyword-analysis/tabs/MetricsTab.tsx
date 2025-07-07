
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SerpAnalysisResult } from '@/types/serp';
import { TrendingUp, Target, Users, Calendar } from 'lucide-react';

interface MetricsTabProps {
  serpData: SerpAnalysisResult;
}

export function MetricsTab({ serpData }: MetricsTabProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium">Search Volume</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {formatNumber(serpData.searchVolume || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Monthly searches
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-orange-500" />
              <div className="text-sm font-medium">Difficulty</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {serpData.keywordDifficulty || 0}
            </div>
            <Progress value={serpData.keywordDifficulty || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium">Competition</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {Math.round((serpData.competitionScore || 0) * 100)}%
            </div>
            <Progress value={(serpData.competitionScore || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div className="text-sm font-medium">Data Quality</div>
            </div>
            <div className="mt-2">
              <Badge variant={serpData.isMockData ? "secondary" : "default"}>
                {serpData.isMockData ? "Mock Data" : "Real Data"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {serpData.dataQuality || 'Unknown'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume Metadata */}
      {serpData.volumeMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volume Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium">Source</div>
                <div className="text-sm text-muted-foreground">
                  {serpData.volumeMetadata.source}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Confidence</div>
                <div className="text-sm text-muted-foreground">
                  {serpData.volumeMetadata.confidence}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Location</div>
                <div className="text-sm text-muted-foreground">
                  {serpData.volumeMetadata.location}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Language</div>
                <div className="text-sm text-muted-foreground">
                  {serpData.volumeMetadata.language}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Engine</div>
                <div className="text-sm text-muted-foreground">
                  {serpData.volumeMetadata.engine}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Last Updated</div>
                <div className="text-sm text-muted-foreground">
                  {serpData.volumeMetadata.lastUpdated ? 
                    new Date(serpData.volumeMetadata.lastUpdated).toLocaleDateString() : 
                    'Unknown'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Results Summary */}
      {serpData.topResults && serpData.topResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Analyzing top {serpData.topResults.length} search results for competitive insights
            </div>
            <div className="space-y-2">
              {serpData.topResults.slice(0, 3).map((result, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Badge variant="outline" className="text-xs">
                    #{result.position || index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {result.snippet}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
