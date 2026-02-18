import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSmartActionsAnalytics } from '@/hooks/analytics/useSmartActionsAnalytics';
import { BarChart2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const toPercent = (n: number) => `${Math.round(n * 100)}%`;

const SmartActionsAnalyticsPage: React.FC = () => {
  const { analytics, isLoading, error, refetch } = useSmartActionsAnalytics();

  const chartData = React.useMemo(() => {
    const map = analytics?.actionsByType ?? {};
    return Object.keys(map).map(k => ({ action: k, count: map[k] }));
  }, [analytics]);

  return (
    <main className="pt-24 p-6 space-y-6">
      <Helmet>
        <title>Smart Actions Analytics | Approval insights</title>
        <meta name="description" content="Smart Actions analytics: actions, acceptance rate, and latency insights." />
        <link rel="canonical" href="/smart-actions/analytics" />
      </Helmet>

      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Smart Actions Analytics</h1>
        <Button variant="ghost" onClick={refetch} disabled={isLoading} className="inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background/90 backdrop-blur-md border-border/10">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Actions</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{analytics?.totalActions ?? 0}</CardContent>
        </Card>
        <Card className="bg-background/90 backdrop-blur-md border-border/10">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Acceptance Rate</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{analytics ? toPercent(analytics.acceptanceRate) : '—'}</CardContent>
        </Card>
        <Card className="bg-background/90 backdrop-blur-md border-border/10">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Avg Latency</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{analytics?.avgLatencyMs != null ? `${analytics.avgLatencyMs} ms` : '—'}</CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-background/90 backdrop-blur-md border-border/10">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <BarChart2 className="h-4 w-4" /> Actions by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <XAxis dataKey="action" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.4)' }} />
                  <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {error && (
        <p className="text-sm text-destructive">Failed to load analytics.</p>
      )}
    </main>
  );
};

export default SmartActionsAnalyticsPage;
