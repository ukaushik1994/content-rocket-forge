import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useABTest } from '@/contexts/ABTestContext';
import { TestTube, TrendingUp, Users, Target, BarChart3, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPercentage } from '@/lib/utils';

interface ABTestAnalyticsCardProps {
  timeRange?: string;
}

export const ABTestAnalyticsCard: React.FC<ABTestAnalyticsCardProps> = ({
  timeRange = '7days'
}) => {
  const { activeTests, getTestAnalysis } = useABTest();
  const [testAnalytics, setTestAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTestAnalytics = async () => {
      if (activeTests.length === 0) return;
      
      setLoading(true);
      try {
        const analytics = await Promise.all(
          activeTests.slice(0, 3).map(async (test) => {
            const analysis = await getTestAnalysis(test.id);
            return {
              test,
              analysis
            };
          })
        );
        setTestAnalytics(analytics.filter(a => a.analysis));
      } catch (error) {
        console.error('Failed to load test analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTestAnalytics();
  }, [activeTests, getTestAnalysis, timeRange]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (activeTests.length === 0) {
    return (
      <motion.div variants={cardVariants}>
        <Card className="bg-card/50 backdrop-blur-xl border-border/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-lg">A/B Testing Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Tests</h3>
              <p className="text-muted-foreground mb-4">
                Start experimenting with A/B tests to optimize your content performance
              </p>
              <Button variant="outline" size="sm">
                Create First Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants}>
      <Card className="bg-card/50 backdrop-blur-xl border-border/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-lg">A/B Testing Performance</CardTitle>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
              {activeTests.length} Active
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {activeTests.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {testAnalytics.filter(t => t.analysis?.isSignificant).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Significant</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {testAnalytics.reduce((sum, t) => sum + (t.analysis?.totalParticipants || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Users</div>
                </div>
              </div>

              {/* Test Results */}
              <div className="space-y-4">
                {testAnalytics.map(({ test, analysis }, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-card/30 border border-border/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-sm">{test.name}</h4>
                        <p className="text-xs text-muted-foreground">{test.target_metric}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {analysis.isSignificant && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            Significant
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {formatPercentage(analysis.confidence || 0)}% Confidence
                        </Badge>
                      </div>
                    </div>

                    {/* Variant Performance */}
                    <div className="space-y-2">
                      {analysis.variants?.slice(0, 2).map((variant: any, vIndex: number) => (
                        <div key={variant.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-medium">
                                {variant.name} {variant.isControl && '(Control)'}
                              </span>
                              <span className="text-muted-foreground">
                                {formatPercentage(variant.conversionRate)}% CVR
                              </span>
                            </div>
                            <Progress 
                              value={variant.conversionRate * 100} 
                              className="h-2"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground w-16 text-right">
                            {variant.participants} users
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Key Metrics */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{analysis.totalParticipants} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{analysis.totalConversions} conversions</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {activeTests.length > 3 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    View All Tests ({activeTests.length})
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};