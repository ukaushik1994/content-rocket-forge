
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, BookOpen, Target, Layout, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSeoOptimization } from '@/contexts/SeoOptimizationContext';
import { motion } from 'framer-motion';

export const SeoScoreBoard = () => {
  const { state } = useSeoOptimization();
  
  if (!state.analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Run analysis to see your SEO score</p>
        </CardContent>
      </Card>
    );
  }

  const { analysis } = state;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overall SEO Score
            </span>
            <Badge variant={analysis.score >= 80 ? 'default' : analysis.score >= 60 ? 'secondary' : 'destructive'}>
              {getScoreLabel(analysis.score)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <motion.div 
              className={`text-4xl font-bold ${getScoreColor(analysis.score)} mb-2`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {analysis.score}/100
            </motion.div>
            <Progress value={analysis.score} className="w-full mb-4" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Readability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.readability)}`}>
              {analysis.readability}
            </div>
            <Progress value={analysis.readability} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.readability >= 60 ? 'Easy to read' : 'Could be simpler'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Keyword Density
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(Math.min(analysis.keywordDensity * 50, 100))}`}>
              {analysis.keywordDensity}%
            </div>
            <Progress value={Math.min(analysis.keywordDensity * 50, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.keywordDensity >= 1 && analysis.keywordDensity <= 3 ? 'Optimal range' : 'Adjust density'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Content Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.structure)}`}>
              {analysis.structure}
            </div>
            <Progress value={analysis.structure} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.structure >= 75 ? 'Well structured' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issues */}
      {analysis.issues && analysis.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Issues & Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {issue.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                  {issue.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                  {issue.type === 'suggestion' && <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{issue.message}</p>
                    {issue.fix && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Fix:</strong> {issue.fix}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
