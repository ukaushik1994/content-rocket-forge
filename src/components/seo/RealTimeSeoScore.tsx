
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, BookOpen, Brain, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SeoScore, SeoSuggestion } from '@/services/seo/realTimeSeoEngine';
import { motion, AnimatePresence } from 'framer-motion';

interface RealTimeSeoScoreProps {
  score: SeoScore;
  suggestions: SeoSuggestion[];
  isAnalyzing?: boolean;
}

export const RealTimeSeoScore: React.FC<RealTimeSeoScoreProps> = ({
  score,
  suggestions,
  isAnalyzing = false
}) => {
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return 'text-green-500';
    if (scoreValue >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (scoreValue: number) => {
    if (scoreValue >= 80) return 'bg-green-500/10';
    if (scoreValue >= 60) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const prioritySuggestions = suggestions.filter(s => s.priority === 'high');
  const mediumSuggestions = suggestions.filter(s => s.priority === 'medium');

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className={`transition-all duration-300 ${getScoreBackground(score.overall)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SEO Score
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
            <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {score.overall >= 80 ? 'Excellent' : 
                 score.overall >= 60 ? 'Good' : 
                 score.overall >= 40 ? 'Needs Work' : 'Poor'}
              </div>
              <div className="text-xs text-muted-foreground">
                Updated {new Date(score.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          {/* Individual Score Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Keywords
                </span>
                <span className={getScoreColor(score.keyword)}>{score.keyword}</span>
              </div>
              <Progress value={score.keyword} className="h-1" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Structure
                </span>
                <span className={getScoreColor(score.structure)}>{score.structure}</span>
              </div>
              <Progress value={score.structure} className="h-1" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Readability
                </span>
                <span className={getScoreColor(score.readability)}>{score.readability}</span>
              </div>
              <Progress value={score.readability} className="h-1" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Semantic
                </span>
                <span className={getScoreColor(score.semantic)}>{score.semantic}</span>
              </div>
              <Progress value={score.semantic} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Suggestions */}
      <AnimatePresence>
        {prioritySuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  Priority Issues ({prioritySuggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prioritySuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medium Priority Suggestions */}
      <AnimatePresence>
        {mediumSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Suggestions ({mediumSuggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mediumSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
