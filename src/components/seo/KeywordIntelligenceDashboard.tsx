
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Target, 
  Brain, 
  TrendingUp, 
  Search, 
  AlertTriangle, 
  CheckCircle2,
  Zap,
  Eye,
  MapPin
} from 'lucide-react';
import { KeywordIntelligenceResult } from '@/services/seo/keywordIntelligenceEngine';
import { motion, AnimatePresence } from 'framer-motion';

interface KeywordIntelligenceDashboardProps {
  result: KeywordIntelligenceResult;
  isAnalyzing?: boolean;
}

export const KeywordIntelligenceDashboard: React.FC<KeywordIntelligenceDashboardProps> = ({
  result,
  isAnalyzing = false
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/10';
    if (score >= 60) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-500';
      case 'commercial': return 'bg-purple-500';
      case 'transactional': return 'bg-green-500';
      case 'navigational': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Intelligence Score */}
      <Card className={`transition-all duration-300 ${getScoreBackground(result.overallIntelligenceScore)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Keyword Intelligence Score
            </span>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Analyzing...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className={`text-4xl font-bold ${getScoreColor(result.overallIntelligenceScore)}`}>
              {result.overallIntelligenceScore}
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {result.overallIntelligenceScore >= 80 ? 'Excellent' : 
                 result.overallIntelligenceScore >= 60 ? 'Good' : 
                 result.overallIntelligenceScore >= 40 ? 'Needs Work' : 'Poor'}
              </div>
              <div className="text-xs text-muted-foreground">
                Advanced Analysis
              </div>
            </div>
          </div>
          
          <Progress value={result.overallIntelligenceScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="primary">Primary</TabsTrigger>
          <TabsTrigger value="secondary">Secondary</TabsTrigger>
          <TabsTrigger value="semantic">Semantic</TabsTrigger>
          <TabsTrigger value="intent">Intent</TabsTrigger>
          <TabsTrigger value="gaps">Gaps</TabsTrigger>
        </TabsList>
        
        {/* Primary Keyword Analysis */}
        <TabsContent value="primary" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Primary Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.primaryKeyword.density.toFixed(2)}%</div>
                  <div className="text-sm text-muted-foreground">Density</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(result.primaryKeyword.placement.score)}`}>
                    {result.primaryKeyword.placement.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Placement Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.primaryKeyword.variations.length}</div>
                  <div className="text-sm text-muted-foreground">Variations</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(result.primaryKeyword.score)}`}>
                    {result.primaryKeyword.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
              </div>
              
              {/* Placement Details */}
              <div className="space-y-2">
                <h4 className="font-medium">Placement Analysis</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Title Position:</span>
                    <Badge variant={result.primaryKeyword.placement.positions.title >= 0 ? "default" : "secondary"}>
                      {result.primaryKeyword.placement.positions.title >= 0 ? 'Found' : 'Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Headings:</span>
                    <Badge variant={result.primaryKeyword.placement.positions.headings.length > 0 ? "default" : "secondary"}>
                      {result.primaryKeyword.placement.positions.headings.length} found
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>First Paragraph:</span>
                    <Badge variant={result.primaryKeyword.placement.positions.firstParagraph ? "default" : "secondary"}>
                      {result.primaryKeyword.placement.positions.firstParagraph ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Meta Description:</span>
                    <Badge variant={result.primaryKeyword.placement.positions.metaDescription ? "default" : "secondary"}>
                      {result.primaryKeyword.placement.positions.metaDescription ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Variations */}
              {result.primaryKeyword.variations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Found Variations</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.primaryKeyword.variations.map((variation, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {variation}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Secondary Keywords Analysis */}
        <TabsContent value="secondary" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Secondary Keywords Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.secondaryKeywords.length > 0 ? (
                <div className="space-y-3">
                  {result.secondaryKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{keyword.keyword}</div>
                        <div className="text-sm text-muted-foreground">
                          Density: {keyword.density.toFixed(2)}% | 
                          Placement: {keyword.placement.score}/100
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${getScoreColor(keyword.score)}`}>
                        {keyword.score}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No secondary keywords to analyze
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Semantic Keywords */}
        <TabsContent value="semantic" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Semantic Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.semanticKeywords.length > 0 ? (
                <div className="space-y-2">
                  {result.semanticKeywords.slice(0, 10).map((semantic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{semantic.keyword}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            semantic.category === 'synonym' ? 'bg-blue-50 text-blue-700' :
                            semantic.category === 'related' ? 'bg-green-50 text-green-700' :
                            semantic.category === 'lsi' ? 'bg-purple-50 text-purple-700' :
                            'bg-orange-50 text-orange-700'
                          }
                        >
                          {semantic.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Freq: {semantic.frequency}</span>
                        <span>Rel: {(semantic.relevanceScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No semantic keywords detected
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Intent Analysis */}
        <TabsContent value="intent" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Search Intent Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.keywordIntents.map((intent, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{intent.keyword}</div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {(intent.confidence * 100).toFixed(0)}%
                        {intent.signals.length > 0 && (
                          <span> | {intent.signals.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getIntentColor(intent.intent)} text-white`}>
                      {intent.intent}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Keyword Gaps */}
        <TabsContent value="gaps" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Keyword Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.keywordGaps.length > 0 ? (
                <div className="space-y-3">
                  {result.keywordGaps.map((gap, index) => (
                    <div key={index} className={`p-3 border rounded-lg ${getOpportunityColor(gap.opportunity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{gap.keyword}</div>
                        <Badge variant="outline" className={getOpportunityColor(gap.opportunity)}>
                          {gap.opportunity} opportunity
                        </Badge>
                      </div>
                      <div className="text-sm mb-2">{gap.reason}</div>
                      <div className="text-xs">
                        Suggested placement: {gap.suggestedPlacement.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No keyword gaps identified - great job!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                  Intelligence Recommendations ({result.recommendations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3">
                    {rec.priority === 'high' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{rec.title}</div>
                      <div className="text-xs text-muted-foreground mb-1">{rec.description}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">{rec.action}</div>
                    </div>
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {rec.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
