
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeoAnalysisResults } from '@/services/seoOptimizationService';
import { BarChart3, Target, Book, Layers, Bot, TrendingUp } from 'lucide-react';

interface AnalysisResultsProps {
  results: SeoAnalysisResults | null;
  isAnalyzing: boolean;
}

export function AnalysisResults({ results, isAnalyzing }: AnalysisResultsProps) {
  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analyzing Content...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-muted rounded w-full mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            SEO Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No analysis results yet</p>
            <p className="text-sm mt-2">Add content and configure settings to see results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'needs-improvement';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
              {results.overallScore}/100
            </div>
            <Badge variant={getScoreStatus(results.overallScore) === 'excellent' ? 'default' : 'secondary'} className="mt-2">
              {getScoreStatus(results.overallScore).replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
          <Progress value={results.overallScore} className="mb-4" />
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scores" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scores">Scores</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
            </TabsList>

            <TabsContent value="scores" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Keyword Optimization</span>
                    <span className={`text-sm font-bold ${getScoreColor(results.keywordScore)}`}>
                      {results.keywordScore}/100
                    </span>
                  </div>
                  <Progress value={results.keywordScore} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Readability</span>
                    <span className={`text-sm font-bold ${getScoreColor(results.readabilityScore)}`}>
                      {results.readabilityScore}/100
                    </span>
                  </div>
                  <Progress value={results.readabilityScore} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Content Structure</span>
                    <span className={`text-sm font-bold ${getScoreColor(results.structureScore)}`}>
                      {results.structureScore}/100
                    </span>
                  </div>
                  <Progress value={results.structureScore} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">AI Detection</span>
                    <span className={`text-sm font-bold ${getScoreColor(results.aiDetectionScore)}`}>
                      {results.aiDetectionScore}/100
                    </span>
                  </div>
                  <Progress value={results.aiDetectionScore} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Main Keyword Density</h4>
                  <div className="flex justify-between items-center">
                    <span>{results.keywordDensity.main.toFixed(2)}%</span>
                    <Badge variant={results.keywordDensity.status === 'optimal' ? 'default' : 'secondary'}>
                      {results.keywordDensity.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Content Length</h4>
                  <div className="flex justify-between items-center">
                    <span>{results.contentLength.current} words (target: {results.contentLength.recommended})</span>
                    <Badge variant={results.contentLength.status === 'optimal' ? 'default' : 'secondary'}>
                      {results.contentLength.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="structure" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Heading Structure</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">H1</div>
                      <div>{results.headingStructure.h1Count}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">H2</div>
                      <div>{results.headingStructure.h2Count}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">H3</div>
                      <div>{results.headingStructure.h3Count}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant={results.headingStructure.hasProperStructure ? 'default' : 'secondary'}>
                      {results.headingStructure.hasProperStructure ? 'Good Structure' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
