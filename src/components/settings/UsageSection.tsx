import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Zap, Search, Clock, DollarSign, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { UsageTrackingService, UsageStats, USAGE_PERIODS } from '@/services/usageTrackingService';
import { formatDistanceToNow } from 'date-fns';
const StatCard = ({
  icon: Icon,
  label,
  value,
  unit = '',
  trend,
  color = 'default'
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'warning' | 'error';
}) => {
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive'
  };
  return <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={`p-2 rounded-md bg-background ${colorClasses[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">
          {value}{unit}
        </p>
      </div>
    </div>;
};
const ProviderUsageCard = ({
  stats,
  type
}: {
  stats: UsageStats;
  type: 'ai' | 'serp';
}) => {
  const getSuccessColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'error';
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <Card className="hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base capitalize flex items-center gap-2">
              {type === 'ai' ? <Zap className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              {stats.provider}
            </CardTitle>
            <Badge variant={stats.requestCount > 0 ? 'default' : 'secondary'}>
              {stats.requestCount > 0 ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={Activity} label="Requests" value={stats.requestCount} />
            <StatCard icon={CheckCircle} label="Success Rate" value={`${stats.successRate.toFixed(1)}`} unit="%" color={getSuccessColor(stats.successRate)} />
            {type === 'ai' && stats.totalTokens !== undefined && <StatCard icon={Zap} label="Total Tokens" value={stats.totalTokens.toLocaleString()} />}
            {type === 'ai' && stats.totalCost !== undefined && stats.totalCost > 0 && <StatCard icon={DollarSign} label="Est. Cost" value={`$${stats.totalCost.toFixed(4)}`} />}
          </div>
          {stats.lastUsed && <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Last used {formatDistanceToNow(new Date(stats.lastUsed), {
              addSuffix: true
            })}
              </div>
            </div>}
        </CardContent>
      </Card>
    </motion.div>;
};
export function UsageSection() {
  const [aiStats, setAiStats] = useState<UsageStats[]>([]);
  const [serpStats, setSerpStats] = useState<UsageStats[]>([]);
  const [period, setPeriod] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadUsageData = async () => {
    try {
      setLoading(true);
      const [aiData, serpData] = await Promise.all([UsageTrackingService.getAIUsageStats(period), UsageTrackingService.getSerpUsageStats(period)]);
      setAiStats(aiData);
      setSerpStats(serpData);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsageData();
    setRefreshing(false);
  };
  useEffect(() => {
    loadUsageData();
  }, [period]);
  const totalAIRequests = aiStats.reduce((sum, stat) => sum + stat.requestCount, 0);
  const totalSerpRequests = serpStats.reduce((sum, stat) => sum + stat.requestCount, 0);
  const averageAISuccess = aiStats.length > 0 ? aiStats.reduce((sum, stat) => sum + stat.successRate, 0) / aiStats.length : 0;
  const averageSerpSuccess = serpStats.length > 0 ? serpStats.reduce((sum, stat) => sum + stat.successRate, 0) / serpStats.length : 0;
  return;
}