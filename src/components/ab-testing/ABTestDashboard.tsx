import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useABTest } from '@/contexts/ABTestContext';
import { ABTest } from '@/services/abTestService';
import { TestAnalysis } from '@/services/abTestAnalyticsService';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Square, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Trophy,
  AlertCircle,
  Plus
} from 'lucide-react';

interface ABTestDashboardProps {
  onCreateTest?: () => void;
}

export const ABTestDashboard: React.FC<ABTestDashboardProps> = ({
  onCreateTest
}) => {
  const { 
    tests, 
    activeTests, 
    loading,
    startTest,
    pauseTest,
    completeTest,
    getTestAnalysis
  } = useABTest();

  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testAnalysis, setTestAnalysis] = useState<TestAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (selectedTest) {
      loadTestAnalysis(selectedTest.id);
    }
  }, [selectedTest]);

  const loadTestAnalysis = async (testId: string) => {
    setAnalysisLoading(true);
    try {
      const analysis = await getTestAnalysis(testId);
      setTestAnalysis(analysis);
    } catch (error) {
      console.error('Error loading test analysis:', error);
    }
    setAnalysisLoading(false);
  };

  const handleTestAction = async (testId: string, action: 'start' | 'pause' | 'complete') => {
    try {
      switch (action) {
        case 'start':
          await startTest(testId);
          break;
        case 'pause':
          await pauseTest(testId);
          break;
        case 'complete':
          await completeTest(testId);
          break;
      }
    } catch (error) {
      console.error(`Error ${action}ing test:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return <BarChart3 className="h-4 w-4" />;
      case 'ui': return <Users className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">A/B Testing Dashboard</h2>
          <p className="text-muted-foreground">
            Manage and analyze your experiments
          </p>
        </div>
        <Button onClick={onCreateTest} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Test
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Tests</span>
            </div>
            <p className="text-2xl font-bold mt-2">{tests.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Active Tests</span>
            </div>
            <p className="text-2xl font-bold mt-2">{activeTests.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {tests.filter(t => t.status === 'completed').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Winners</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {tests.filter(t => t.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">All Tests</TabsTrigger>
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {tests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tests created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first A/B test to start optimizing your content.
                </p>
                <Button onClick={onCreateTest}>Create Test</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tests.map((test) => (
                <Card key={test.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTest(test)}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTestTypeIcon(test.test_type)}
                        <div>
                          <CardTitle className="text-lg">{test.name}</CardTitle>
                          <CardDescription>{test.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                        {test.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestAction(test.id, 'start');
                            }}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {test.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestAction(test.id, 'pause');
                            }}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Target: {test.target_metric}</span>
                      <span>Type: {test.test_type}</span>
                      <span>
                        Created: {new Date(test.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeTests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active tests</h3>
                <p className="text-muted-foreground">
                  Start a test to begin collecting data.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeTests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{test.name}</CardTitle>
                        <CardDescription>{test.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTestAction(test.id, 'pause')}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleTestAction(test.id, 'complete')}
                        >
                          <Square className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>Running since {new Date(test.started_at || '').toLocaleDateString()}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {selectedTest ? (
            <Card>
              <CardHeader>
                <CardTitle>Test Analysis: {selectedTest.name}</CardTitle>
                <CardDescription>
                  Statistical analysis and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                  </div>
                ) : testAnalysis ? (
                  <div className="space-y-6">
                    {/* Test Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {formatPercentage(testAnalysis.confidence)}
                        </p>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {testAnalysis.variants.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Variants</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {testAnalysis.statistical_significance ? '✓' : '✗'}
                        </p>
                        <p className="text-sm text-muted-foreground">Significant</p>
                      </div>
                    </div>

                    {/* Winner */}
                    {testAnalysis.winner && (
                      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-green-800">Winner</h3>
                        </div>
                        <p className="text-green-700">{testAnalysis.recommendation}</p>
                      </div>
                    )}

                    {/* Variants Performance */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Variant Performance</h3>
                      {testAnalysis.variants.map((variant) => (
                        <Card key={variant.variant.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{variant.variant.name}</h4>
                              {variant.variant.is_control && (
                                <Badge variant="outline">Control</Badge>
                              )}
                              {testAnalysis.winner === variant.variant.id && (
                                <Badge className="bg-green-500">Winner</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Sample Size</p>
                                <p className="font-medium">
                                  {formatNumber(variant.performance.sample_size)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Conversion Rate</p>
                                <p className="font-medium">
                                  {formatPercentage(variant.performance.conversion_rate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lift</p>
                                <p className={`font-medium ${
                                  (variant.performance.lift || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {variant.performance.lift ? 
                                    formatPercentage(variant.performance.lift) : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No analysis available. Make sure the test has sufficient data.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a test to analyze</h3>
                <p className="text-muted-foreground">
                  Choose a test from the list to view detailed analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};