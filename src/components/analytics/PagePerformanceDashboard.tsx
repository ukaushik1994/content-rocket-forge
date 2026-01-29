import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gauge, 
  Smartphone, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CoreWebVital {
  value: number;
  score: 'good' | 'needs-improvement' | 'poor';
}

interface PageSpeedData {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  coreWebVitals: {
    LCP: CoreWebVital;
    FID: CoreWebVital;
    CLS: CoreWebVital;
    TTFB: CoreWebVital;
    FCP?: CoreWebVital;
    INP?: CoreWebVital;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
    savingsUnit: string;
  }>;
  diagnostics?: any[];
  fetchedAt: string;
}

interface PagePerformanceDashboardProps {
  contentId: string;
  publishedUrl: string;
  className?: string;
}

export const PagePerformanceDashboard: React.FC<PagePerformanceDashboardProps> = ({
  contentId,
  publishedUrl,
  className = ''
}) => {
  const [data, setData] = useState<PageSpeedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const { toast } = useToast();

  const fetchData = async () => {
    if (!publishedUrl) return;
    
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('pagespeed-insights', {
        body: { url: publishedUrl, contentId, strategy }
      });

      if (error) throw error;
      
      if (result?.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching PageSpeed data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch performance data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publishedUrl) {
      fetchData();
    }
  }, [publishedUrl, strategy]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/20';
    if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getVitalBadge = (score: 'good' | 'needs-improvement' | 'poor') => {
    switch (score) {
      case 'good':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Good</Badge>;
      case 'needs-improvement':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Needs Work</Badge>;
      case 'poor':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Poor</Badge>;
    }
  };

  const formatVitalValue = (vital: string, value: number) => {
    switch (vital) {
      case 'LCP':
      case 'FID':
      case 'TTFB':
      case 'FCP':
      case 'INP':
        return `${(value / 1000).toFixed(2)}s`;
      case 'CLS':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  const getVitalDescription = (vital: string) => {
    switch (vital) {
      case 'LCP':
        return 'Largest Contentful Paint - Loading performance';
      case 'FID':
        return 'First Input Delay - Interactivity';
      case 'CLS':
        return 'Cumulative Layout Shift - Visual stability';
      case 'TTFB':
        return 'Time to First Byte - Server response';
      case 'FCP':
        return 'First Contentful Paint - Initial render';
      case 'INP':
        return 'Interaction to Next Paint - Responsiveness';
      default:
        return '';
    }
  };

  if (!publishedUrl) {
    return (
      <Card className={`bg-muted/30 ${className}`}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Publish content to see performance metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card/50 backdrop-blur ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Core Web Vitals
            </CardTitle>
            <CardDescription className="mt-1">
              Real-time performance metrics from PageSpeed Insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={strategy} onValueChange={(v) => setStrategy(v as 'mobile' | 'desktop')}>
              <TabsList className="h-8">
                <TabsTrigger value="mobile" className="h-6 px-2">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Mobile
                </TabsTrigger>
                <TabsTrigger value="desktop" className="h-6 px-2">
                  <Monitor className="h-3 w-3 mr-1" />
                  Desktop
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading && !data ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing page performance...</p>
          </div>
        ) : data ? (
          <>
            {/* Score Overview */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Performance', value: data.performance, icon: Zap },
                { label: 'Accessibility', value: data.accessibility, icon: Eye },
                { label: 'Best Practices', value: data.bestPractices, icon: CheckCircle },
                { label: 'SEO', value: data.seo, icon: TrendingUp }
              ].map((metric) => (
                <div 
                  key={metric.label}
                  className={`p-4 rounded-lg border ${getScoreBgColor(metric.value)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className={`h-4 w-4 ${getScoreColor(metric.value)}`} />
                    <span className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                      {metric.value}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <Progress 
                    value={metric.value} 
                    className="h-1 mt-2"
                  />
                </div>
              ))}
            </div>

            {/* Core Web Vitals */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Core Web Vitals
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(data.coreWebVitals).map(([vital, metrics]) => (
                  <div 
                    key={vital}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-medium">{vital}</span>
                      {getVitalBadge(metrics.score)}
                    </div>
                    <p className="text-xl font-bold">
                      {formatVitalValue(vital, metrics.value)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getVitalDescription(vital)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            {data.opportunities && data.opportunities.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Optimization Opportunities
                </h4>
                <div className="space-y-2">
                  {data.opportunities.slice(0, 5).map((opportunity) => (
                    <div 
                      key={opportunity.id}
                      className="p-3 rounded-lg bg-muted/20 border border-border/30 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{opportunity.title}</p>
                        {opportunity.savings > 0 && (
                          <p className="text-xs text-green-400 mt-0.5">
                            Potential savings: {opportunity.savings}{opportunity.savingsUnit}
                          </p>
                        )}
                      </div>
                      <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <p className="text-xs text-muted-foreground text-right">
              Last updated: {new Date(data.fetchedAt).toLocaleString()}
            </p>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No performance data available</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData}
              className="mt-4"
            >
              Analyze Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
