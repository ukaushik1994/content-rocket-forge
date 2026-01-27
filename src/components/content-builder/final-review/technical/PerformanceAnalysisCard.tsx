import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Clock, Eye, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  score: number;
  threshold: { good: number; needs_improvement: number };
}

interface PerformanceAnalysisCardProps {
  score: number;
  metrics?: PerformanceMetric[];
  recommendations?: string[];
}

export const PerformanceAnalysisCard: React.FC<PerformanceAnalysisCardProps> = ({
  score,
  metrics = [],
  recommendations = []
}) => {
  // Calculate estimated performance metrics from content analysis
  // These are estimates since we can't measure real Core Web Vitals without a live page
  const calculateEstimatedMetrics = (): PerformanceMetric[] => {
    // Base estimates - adjust based on score
    const scoreMultiplier = score / 100;
    
    // LCP estimate: lower is better, good is under 2.5s
    const lcpValue = 1.5 + (1 - scoreMultiplier) * 2;
    const lcpScore = lcpValue < 2.5 ? 90 : lcpValue < 4.0 ? 60 : 30;
    
    // FID estimate: lower is better, good is under 100ms
    const fidValue = 30 + (1 - scoreMultiplier) * 150;
    const fidScore = fidValue < 100 ? 90 : fidValue < 300 ? 60 : 30;
    
    // CLS estimate: lower is better, good is under 0.1
    const clsValue = 0.03 + (1 - scoreMultiplier) * 0.15;
    const clsScore = clsValue < 0.1 ? 90 : clsValue < 0.25 ? 60 : 30;
    
    return [
      {
        name: 'Largest Contentful Paint (Est.)',
        value: Math.round(lcpValue * 10) / 10,
        unit: 's',
        score: Math.round(lcpScore),
        threshold: { good: 2.5, needs_improvement: 4.0 }
      },
      {
        name: 'First Input Delay (Est.)',
        value: Math.round(fidValue),
        unit: 'ms',
        score: Math.round(fidScore),
        threshold: { good: 100, needs_improvement: 300 }
      },
      {
        name: 'Cumulative Layout Shift (Est.)',
        value: Math.round(clsValue * 100) / 100,
        unit: '',
        score: Math.round(clsScore),
        threshold: { good: 0.1, needs_improvement: 0.25 }
      }
    ];
  };

  const defaultRecommendations = [
    'Optimize images by using modern formats (WebP, AVIF)',
    'Minimize JavaScript execution time',
    'Use efficient cache policies for static assets',
    'Eliminate render-blocking resources',
    'Reduce server response times'
  ];

  const allMetrics = metrics.length > 0 ? metrics : calculateEstimatedMetrics();
  const allRecommendations = recommendations.length > 0 ? recommendations : defaultRecommendations;

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.value <= metric.threshold.good) return 'good';
    if (metric.value <= metric.threshold.needs_improvement) return 'needs_improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'needs_improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return 'default';
      case 'needs_improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Analysis
            <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"} className="ml-auto">
              {score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Core Web Vitals */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Core Web Vitals
            </h4>
            <div className="space-y-3">
              {allMetrics.map((metric, index) => {
                const status = getMetricStatus(metric);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                          {metric.value}{metric.unit}
                        </span>
                        <Badge variant={getStatusBadge(status)} className="text-xs">
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Performance Insights
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-500">1.8s</div>
                <div className="text-xs text-muted-foreground">Time to Interactive</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-500">92</div>
                <div className="text-xs text-muted-foreground">Speed Index</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="space-y-1">
              {allRecommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {recommendation}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                Run Speed Test
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};