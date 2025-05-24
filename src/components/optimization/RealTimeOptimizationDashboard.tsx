
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Zap, 
  Target, 
  BookOpen, 
  Brain, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  BarChart3,
  Eye,
  Lightbulb
} from 'lucide-react';
import { OptimizationResult, OptimizationSuggestion } from '@/services/optimization/realTimeOptimizationEngine';
import { motion, AnimatePresence } from 'framer-motion';

interface RealTimeOptimizationDashboardProps {
  result: OptimizationResult;
  isOptimizing?: boolean;
  onApplyAutoFix?: (suggestionId: string) => void;
}

export const RealTimeOptimizationDashboard: React.FC<RealTimeOptimizationDashboardProps> = ({
  result,
  isOptimizing = false,
  onApplyAutoFix
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-200';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-200';
    return 'bg-red-500/10 border-red-200';
  };

  const getPriorityIcon = (priority: OptimizationSuggestion['priority']) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <CheckCircle2 className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: OptimizationSuggestion['priority']) => {
    switch (priority) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
    }
  };

  const criticalSuggestions = result.suggestions.filter(s => s.priority === 'critical');
  const highSuggestions = result.suggestions.filter(s => s.priority === 'high');
  const otherSuggestions = result.suggestions.filter(s => s.priority === 'medium' || s.priority === 'low');

  return (
    <div className="space-y-6">
      {/* Overall Optimization Score */}
      <Card className={`transition-all duration-300 ${getScoreBackground(result.score.overall)}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Live Optimization Score
            </span>
            {isOptimizing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Optimizing...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className={`text-5xl font-bold ${getScoreColor(result.score.overall)}`}>
              {result.score.overall}
            </div>
            <div className="text-right">
              <div className="text-lg font-medium">
                {result.score.overall >= 80 ? 'Excellent' : 
                 result.score.overall >= 60 ? 'Good' : 
                 result.score.overall >= 40 ? 'Needs Work' : 'Poor'}
              </div>
              <div className="text-sm text-muted-foreground">
                Updated {new Date(result.score.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <Progress value={result.score.overall} className="h-3 mb-6" />
          
          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-4 w-4 mr-1" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(result.score.keyword)}`}>
                {result.score.keyword}
              </div>
              <div className="text-xs text-muted-foreground">Keywords</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-4 w-4 mr-1" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(result.score.structure)}`}>
                {result.score.structure}
              </div>
              <div className="text-xs text-muted-foreground">Structure</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-4 w-4 mr-1" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(result.score.readability)}`}>
                {result.score.readability}
              </div>
              <div className="text-xs text-muted-foreground">Readability</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-4 w-4 mr-1" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(result.score.semantic)}`}>
                {result.score.semantic}
              </div>
              <div className="text-xs text-muted-foreground">Semantic</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-4 w-4 mr-1" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(result.score.engagement)}`}>
                {result.score.engagement}
              </div>
              <div className="text-xs text-muted-foreground">Engagement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Tabs defaultValue="critical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical" className="relative">
            Critical
            {criticalSuggestions.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                {criticalSuggestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="high" className="relative">
            High Priority
            {highSuggestions.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                {highSuggestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({result.suggestions.length})
          </TabsTrigger>
          <TabsTrigger value="gaps">
            Content Gaps
          </TabsTrigger>
        </TabsList>
        
        {/* Critical Issues */}
        <TabsContent value="critical" className="space-y-4 mt-4">
          {criticalSuggestions.length > 0 ? (
            <AnimatePresence>
              {criticalSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${getPriorityColor(suggestion.priority)} border-2`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getPriorityIcon(suggestion.priority)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{suggestion.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Impact: {suggestion.impact}/10
                              </Badge>
                              {suggestion.autoFixAvailable && onApplyAutoFix && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onApplyAutoFix(suggestion.id)}
                                  className="gap-1"
                                >
                                  <Wand2 className="h-3 w-3" />
                                  Auto-fix
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                          <p className="text-sm font-medium">{suggestion.action}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-green-700">No Critical Issues!</h3>
                <p className="text-sm text-green-600">Your content is well-optimized for critical factors.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* High Priority */}
        <TabsContent value="high" className="space-y-4 mt-4">
          {highSuggestions.map((suggestion, index) => (
            <Card key={suggestion.id} className={getPriorityColor(suggestion.priority)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getPriorityIcon(suggestion.priority)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Impact: {suggestion.impact}/10
                        </Badge>
                        {suggestion.autoFixAvailable && onApplyAutoFix && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onApplyAutoFix(suggestion.id)}
                            className="gap-1"
                          >
                            <Wand2 className="h-3 w-3" />
                            Auto-fix
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                    <p className="text-sm font-medium">{suggestion.action}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        {/* All Suggestions */}
        <TabsContent value="all" className="space-y-4 mt-4">
          {result.suggestions.map((suggestion) => (
            <Card key={suggestion.id} className={getPriorityColor(suggestion.priority)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getPriorityIcon(suggestion.priority)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={suggestion.priority === 'critical' ? 'destructive' : 
                                  suggestion.priority === 'high' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {suggestion.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.impact}/10
                        </Badge>
                        {suggestion.autoFixAvailable && onApplyAutoFix && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onApplyAutoFix(suggestion.id)}
                            className="gap-1"
                          >
                            <Wand2 className="h-3 w-3" />
                            Auto-fix
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                    <p className="text-sm font-medium">{suggestion.action}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        {/* Content Gaps */}
        <TabsContent value="gaps" className="space-y-4 mt-4">
          {result.contentGaps.length > 0 ? (
            result.contentGaps.map((gap, index) => (
              <Card key={index} className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 text-purple-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{gap.description}</h4>
                        <Badge 
                          variant={gap.severity === 'critical' ? 'destructive' : 
                                  gap.severity === 'high' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{gap.suggestion}</p>
                      {gap.competitorExample && (
                        <p className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                          💡 {gap.competitorExample}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-green-700">No Content Gaps Detected!</h3>
                <p className="text-sm text-green-600">Your content covers the essential topics well.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Readability Metrics */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <BarChart3 className="h-4 w-4" />
            Readability Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result.readabilityMetrics.fleschScore.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Flesch Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result.readabilityMetrics.averageWordsPerSentence.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Words/Sentence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result.readabilityMetrics.complexWords}
              </div>
              <div className="text-sm text-muted-foreground">Complex Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result.readabilityMetrics.sentenceVariety}
              </div>
              <div className="text-sm text-muted-foreground">Sentence Variety</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
