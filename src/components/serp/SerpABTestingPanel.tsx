import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useABTest } from '@/contexts/ABTestContext';
import { TestCreationWizard } from '@/components/ab-testing/TestCreationWizard';
import { 
  Target, 
  TrendingUp, 
  Eye, 
  Plus,
  Play,
  Pause,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SerpABTestingPanelProps {
  serpData?: {
    keyword: string;
    metaTitle?: string;
    metaDescription?: string;
    currentRanking?: number;
  };
}

export const SerpABTestingPanel: React.FC<SerpABTestingPanelProps> = ({ serpData }) => {
  const { tests, activeTests, loading, createTest, startTest, pauseTest, getTestAnalysis } = useABTest();
  const [showWizard, setShowWizard] = useState(false);
  const [serpTests, setSerpTests] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, any>>({});

  // Filter tests related to SERP/SEO
  useEffect(() => {
    const seoTests = tests.filter(test => 
      test.test_type === 'content' || // Changed from 'seo' to 'content'
      test.metadata?.type === 'serp' ||
      test.target_metric === 'organic_ctr'
    );
    setSerpTests(seoTests);
  }, [tests]);

  // Load test analyses
  useEffect(() => {
    const loadAnalyses = async () => {
      const newAnalyses: Record<string, any> = {};
      for (const test of serpTests) {
        if (test.status === 'active' || test.status === 'completed') {
          const analysis = await getTestAnalysis(test.id);
          if (analysis) {
            newAnalyses[test.id] = analysis;
          }
        }
      }
      setAnalyses(newAnalyses);
    };

    if (serpTests.length > 0) {
      loadAnalyses();
    }
  }, [serpTests, getTestAnalysis]);

  const handleCreateSerpTest = () => {
    setShowWizard(true);
  };

  const handleToggleTest = async (testId: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      await pauseTest(testId);
    } else if (currentStatus === 'paused' || currentStatus === 'draft') {
      await startTest(testId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getInitialTestData = () => {
    if (!serpData) return undefined;
    
    return {
      name: `Meta Description Test - ${serpData.keyword}`,
      description: `Test different meta descriptions for "${serpData.keyword}" to improve organic CTR`,
      type: 'content' as const, // Changed from 'seo' to 'content'
      targetMetric: 'organic_ctr'
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SERP A/B Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              SERP A/B Testing
            </CardTitle>
            <Button 
              size="sm" 
              onClick={handleCreateSerpTest}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Test
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {serpData && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Current SERP Data</h4>
              <div className="text-sm space-y-1">
                <div><strong>Keyword:</strong> {serpData.keyword}</div>
                {serpData.currentRanking && (
                  <div><strong>Current Ranking:</strong> #{serpData.currentRanking}</div>
                )}
                {serpData.metaTitle && (
                  <div><strong>Meta Title:</strong> {serpData.metaTitle}</div>
                )}
                {serpData.metaDescription && (
                  <div><strong>Meta Description:</strong> {serpData.metaDescription}</div>
                )}
              </div>
            </div>
          )}

          {serpTests.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No SERP Tests Running</h3>
              <p className="text-muted-foreground mb-4">
                Start testing different meta titles and descriptions to improve your organic CTR
              </p>
              <Button onClick={handleCreateSerpTest}>
                <Plus className="h-4 w-4 mr-2" />
                Create SERP Test
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {serpTests.map((test) => {
                const analysis = analyses[test.id];
                
                return (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(test.status)}`} />
                        <div>
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{test.target_metric}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleTest(test.id, test.status)}
                        >
                          {test.status === 'active' ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {analysis && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {analysis.participants?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Participants</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {analysis.confidence ? `${Math.round(analysis.confidence * 100)}%` : '—'}
                            </div>
                            <div className="text-sm text-muted-foreground">Confidence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {analysis.improvement ? `${analysis.improvement > 0 ? '+' : ''}${Math.round(analysis.improvement * 100)}%` : '—'}
                            </div>
                            <div className="text-sm text-muted-foreground">Improvement</div>
                          </div>
                        </div>

                        {analysis.variants && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Variant Performance</h5>
                            {analysis.variants.map((variant: any) => (
                              <div key={variant.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge variant={variant.is_control ? "default" : "secondary"} className="text-xs">
                                    {variant.is_control ? 'Control' : 'Variant'}
                                  </Badge>
                                  <span>{variant.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span>{(variant.conversion_rate * 100).toFixed(2)}% CTR</span>
                                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary transition-all duration-300"
                                      style={{ width: `${variant.conversion_rate * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {analysis.is_significant && (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            Test has reached statistical significance
                          </div>
                        )}
                      </div>
                    )}

                    {test.status === 'active' && !analysis && (
                      <div className="text-sm text-muted-foreground">
                        Collecting data... Results will appear once sufficient traffic is gathered.
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TestCreationWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        initialData={getInitialTestData()}
      />
    </>
  );
};