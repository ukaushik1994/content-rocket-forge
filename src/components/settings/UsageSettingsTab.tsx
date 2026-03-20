import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Coins, Zap, Clock } from 'lucide-react';

interface UsageRow {
  provider: string;
  model: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  requestCount: number;
  lastUsed: string;
}

const PERIODS = [
  { label: '24 Hours', value: '24h', hours: 24 },
  { label: '7 Days', value: '7d', hours: 168 },
  { label: '30 Days', value: '30d', hours: 720 },
];

export function UsageSettingsTab() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [totals, setTotals] = useState({ tokens: 0, cost: 0, requests: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchUsage = async () => {
      setLoading(true);
      const hours = PERIODS.find(p => p.value === period)?.hours || 720;
      const since = new Date(Date.now() - hours * 3600_000).toISOString();

      const { data, error } = await supabase
        .from('llm_usage_logs')
        .select('provider, model, prompt_tokens, completion_tokens, total_tokens, cost_estimate, created_at')
        .eq('user_id', user.id)
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Usage fetch error:', error);
        setLoading(false);
        return;
      }

      const grouped = (data || []).reduce<Record<string, UsageRow>>((acc, log) => {
        const key = `${log.provider}|${log.model}`;
        if (!acc[key]) {
          acc[key] = {
            provider: log.provider,
            model: log.model,
            totalTokens: 0,
            promptTokens: 0,
            completionTokens: 0,
            totalCost: 0,
            requestCount: 0,
            lastUsed: log.created_at,
          };
        }
        acc[key].totalTokens += log.total_tokens || 0;
        acc[key].promptTokens += log.prompt_tokens || 0;
        acc[key].completionTokens += log.completion_tokens || 0;
        acc[key].totalCost += Number(log.cost_estimate) || 0;
        acc[key].requestCount += 1;
        return acc;
      }, {});

      const rowList = Object.values(grouped).sort((a, b) => b.totalCost - a.totalCost);
      setRows(rowList);
      setTotals({
        tokens: rowList.reduce((s, r) => s + r.totalTokens, 0),
        cost: rowList.reduce((s, r) => s + r.totalCost, 0),
        requests: rowList.reduce((s, r) => s + r.requestCount, 0),
      });
      setLoading(false);
    };
    fetchUsage();
  }, [user, period]);

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Usage</h3>
          <p className="text-sm text-muted-foreground">Token usage and estimated costs</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-medium">Total Tokens</span>
                </div>
                <p className="text-xl font-bold tabular-nums">{fmt(totals.tokens)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Coins className="h-4 w-4" />
                  <span className="text-xs font-medium">Est. Cost</span>
                </div>
                <p className="text-xl font-bold tabular-nums">${totals.cost.toFixed(4)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Requests</span>
                </div>
                <p className="text-xl font-bold tabular-nums">{totals.requests}</p>
              </CardContent>
            </Card>
          </div>

          {/* Per-model breakdown */}
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No usage data for this period.</p>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Breakdown by Model</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Model</th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">Requests</th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">Tokens</th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-b border-border/20 last:border-0">
                          <td className="px-4 py-2.5">
                            <span className="font-medium">{r.model}</span>
                            <span className="text-xs text-muted-foreground ml-1.5">({r.provider})</span>
                          </td>
                          <td className="text-right px-4 py-2.5 tabular-nums">{r.requestCount}</td>
                          <td className="text-right px-4 py-2.5 tabular-nums">{fmt(r.totalTokens)}</td>
                          <td className="text-right px-4 py-2.5 tabular-nums">${r.totalCost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
