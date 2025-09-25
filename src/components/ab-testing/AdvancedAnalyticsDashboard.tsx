import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Target, Users } from 'lucide-react';
import { AdvancedAnalytics, MLOptimization, AnomalyAlert, CohortAnalysis } from '@/types/ab-testing-advanced';
import { abTestMLService } from '@/services/abTestMLService';

interface AdvancedAnalyticsDashboardProps {
  testId: string;
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  testId
}) => {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [mlOptimization, setMlOptimization] = useState<MLOptimization | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdvancedAnalytics();
  }, [testId]);

  const loadAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsData, mlData, anomaliesData] = await Promise.all([
        abTestMLService.generateAdvancedAnalytics(testId),
        abTestMLService.generatePredictiveAnalysis(testId),
        abTestMLService.detectAnomalies(testId)
      ]);

      setAnalytics(analyticsData);
      setMlOptimization(mlData);
      setAnomalies(anomaliesData);
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeTrafficAllocation = async () => {
    const newAllocation = await abTestMLService.optimizeTrafficAllocation(testId);
    console.log('Optimized traffic allocation:', newAllocation);
    // Trigger re-load of ML optimization data
    const mlData = await abTestMLService.generatePredictiveAnalysis(testId);
    setMlOptimization(mlData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Anomalies Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                  <div>
                    <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {anomaly.severity}
                    </Badge>
                    <span className="ml-2 text-sm">{anomaly.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(anomaly.detected_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="statistical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="statistical">Statistical Analysis</TabsTrigger>
          <TabsTrigger value="ml-insights">ML Insights</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="statistical" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{(analytics.statistical_power * 100).toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Statistical Power</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{(analytics.effect_size * 100).toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Effect Size</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {Math.max(...Object.values(analytics.bayesian_probability)) * 100 > 95 ? '95+' : 'TBD'}%
                    </div>
                    <p className="text-sm text-muted-foreground">Confidence Level</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {Object.keys(analytics.bayesian_probability).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Variants</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Confidence Intervals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.confidence_intervals).map(([variant, interval]) => (
                      <div key={variant} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize">{variant}</span>
                          <span className="text-sm text-muted-foreground">
                            {(interval[0] * 100).toFixed(1)}% - {(interval[1] * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={interval[1] * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bayesian Probability</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.bayesian_probability).map(([variant, probability]) => ({
                          name: variant,
                          value: probability * 100
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analytics.bayesian_probability).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="ml-insights" className="space-y-4">
          {mlOptimization && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Machine Learning Insights
                </h3>
                <Button onClick={optimizeTrafficAllocation}>
                  Optimize Traffic Allocation
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Prediction Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Progress value={mlOptimization.prediction_accuracy * 100} className="flex-1" />
                    <span className="text-sm font-medium">
                      {(mlOptimization.prediction_accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Traffic Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={Object.entries(mlOptimization.recommended_allocation).map(([variant, allocation]) => ({
                        variant,
                        allocation: allocation * 100
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="variant" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                        <Bar dataKey="allocation" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Predicted Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={Object.entries(mlOptimization.predicted_outcomes).map(([variant, outcome]) => ({
                        variant,
                        outcome: outcome * 100
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="variant" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                        <Bar dataKey="outcome" fill="hsl(var(--secondary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          {analytics?.funnel_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Conversion Funnel Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.funnel_analysis.map(step => ({
                    ...step,
                    ...Object.fromEntries(
                      Object.entries(step.variant_performance).map(([variant, perf]) => [
                        `${variant}_conversion`,
                        perf.conversion_rate * 100
                      ])
                    )
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(analytics.funnel_analysis[0]?.variant_performance || {}).map((variant, index) => (
                      <Line
                        key={variant}
                        type="monotone"
                        dataKey={`${variant}_conversion`}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        name={`${variant} Conversion Rate`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cohort" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cohort Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Cohort analysis data will be available after sufficient user data collection.</p>
                <p className="text-sm mt-2">Typically requires 7+ days of test runtime.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};