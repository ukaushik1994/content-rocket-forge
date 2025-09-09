import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface TechnicalScores {
  seo: number;
  performance: number;
  accessibility: number;
  schema: number;
  mobile: number;
}

interface TechnicalOverviewCardProps {
  scores: TechnicalScores;
  totalIssues: number;
  criticalIssues: number;
}

export const TechnicalOverviewCard: React.FC<TechnicalOverviewCardProps> = ({
  scores,
  totalIssues,
  criticalIssues
}) => {
  const overallScore = Math.round(
    (scores.seo + scores.performance + scores.accessibility + scores.schema + scores.mobile) / 5
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Technical Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center space-y-2">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-sm text-muted-foreground">Overall Technical Score</div>
            <Progress value={overallScore} className="w-full" />
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                {getScoreIcon(scores.seo)}
                <span className={`font-semibold ${getScoreColor(scores.seo)}`}>
                  {scores.seo}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">SEO</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                {getScoreIcon(scores.performance)}
                <span className={`font-semibold ${getScoreColor(scores.performance)}`}>
                  {scores.performance}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                {getScoreIcon(scores.accessibility)}
                <span className={`font-semibold ${getScoreColor(scores.accessibility)}`}>
                  {scores.accessibility}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Accessibility</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                {getScoreIcon(scores.schema)}
                <span className={`font-semibold ${getScoreColor(scores.schema)}`}>
                  {scores.schema}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Schema</div>
            </div>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                {getScoreIcon(scores.mobile)}
                <span className={`font-semibold ${getScoreColor(scores.mobile)}`}>
                  {scores.mobile}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Mobile</div>
            </div>
          </div>

          {/* Issues Summary */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="space-y-1">
              <div className="text-sm font-medium">Issues Found</div>
              <div className="flex gap-4">
                {criticalIssues > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {criticalIssues} Critical
                  </Badge>
                )}
                {totalIssues > criticalIssues && (
                  <Badge variant="secondary" className="text-xs">
                    {totalIssues - criticalIssues} Other
                  </Badge>
                )}
                {totalIssues === 0 && (
                  <Badge variant="default" className="text-xs bg-green-500/20 text-green-400">
                    No Issues
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};