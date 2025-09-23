import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Settings, 
  Play, 
  Pause,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  serpMonitoringService, 
  SerpMonitoringConfig, 
  SerpAlert, 
  SerpMonitoringHistory 
} from '@/services/serpMonitoringService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SerpMonitoringDashboard = () => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<SerpMonitoringConfig[]>([]);
  const [alerts, setAlerts] = useState<SerpAlert[]>([]);
  const [history, setHistory] = useState<Record<string, SerpMonitoringHistory[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [configsData, alertsData] = await Promise.all([
        serpMonitoringService.getMonitoringConfigs(user.id),
        serpMonitoringService.getUserAlerts(user.id)
      ]);
      
      setConfigs(configsData);
      setAlerts(alertsData);

      // Load history for each config
      const historyData: Record<string, SerpMonitoringHistory[]> = {};
      await Promise.all(
        configsData.map(async (config) => {
          const configHistory = await serpMonitoringService.getMonitoringHistory(config.id, 10);
          historyData[config.id] = configHistory;
        })
      );
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfig = async (configId: string, isActive: boolean) => {
    try {
      await serpMonitoringService.updateMonitoringConfig(configId, { is_active: !isActive });
      await loadData();
      toast.success(isActive ? 'Monitoring paused' : 'Monitoring resumed');
    } catch (error) {
      toast.error('Failed to update monitoring config');
    }
  };

  const handleRunCheck = async (config: SerpMonitoringConfig) => {
    try {
      const success = await serpMonitoringService.runMonitoringCheck(config);
      if (success) {
        toast.success('Monitoring check completed');
        await loadData();
      } else {
        toast.error('Monitoring check failed');
      }
    } catch (error) {
      toast.error('Failed to run monitoring check');
    }
  };

  const handleMarkAlertsRead = async (alertIds: string[]) => {
    try {
      await serpMonitoringService.markAlertsAsRead(alertIds);
      await loadData();
      toast.success('Alerts marked as read');
    } catch (error) {
      toast.error('Failed to mark alerts as read');
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'position_change':
        return <TrendingUp className="w-4 h-4" />;
      case 'new_competitor':
        return <Eye className="w-4 h-4" />;
      case 'featured_snippet_loss':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const prepareChartData = (configHistory: SerpMonitoringHistory[]) => {
    return configHistory
      .slice(-7) // Last 7 checks
      .reverse()
      .map((item, index) => ({
        check: index + 1,
        positions: item.position_changes.length,
        competitors: item.new_competitors.length + item.lost_competitors.length,
        timestamp: new Date(item.check_timestamp).toLocaleDateString()
      }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unreadAlerts = alerts.filter(alert => !alert.is_read);
  const activeConfigs = configs.filter(config => config.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">SERP Monitoring</h2>
          <p className="text-muted-foreground">Real-time tracking of keyword rankings and competitor movements</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Keyword
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Monitors</p>
                <p className="text-2xl font-semibold text-foreground">{activeConfigs.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread Alerts</p>
                <p className="text-2xl font-semibold text-foreground">{unreadAlerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Keywords Tracked</p>
                <p className="text-2xl font-semibold text-foreground">{configs.length}</p>
              </div>
              <Eye className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="text-sm text-foreground">
                  {history && Object.values(history).flat().length > 0 
                    ? new Date(Math.max(...Object.values(history).flat().map(h => new Date(h.check_timestamp).getTime()))).toLocaleString()
                    : 'No checks yet'
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({unreadAlerts.length})</TabsTrigger>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest SERP changes and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        {getAlertIcon(alert.alert_type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-foreground truncate">{alert.title}</p>
                            <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent alerts</p>
                )}
              </CardContent>
            </Card>

            {/* Active Monitors */}
            <Card>
              <CardHeader>
                <CardTitle>Active Monitors</CardTitle>
                <CardDescription>Currently tracked keywords</CardDescription>
              </CardHeader>
              <CardContent>
                {activeConfigs.length > 0 ? (
                  <div className="space-y-3">
                    {activeConfigs.slice(0, 5).map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm text-foreground">{config.keyword}</p>
                          <p className="text-xs text-muted-foreground">
                            {config.location} • Every {Math.floor(config.check_frequency / 60)}m
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRunCheck(config)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active monitors</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">All Alerts</h3>
            {unreadAlerts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAlertsRead(unreadAlerts.map(a => a.id))}
              >
                Mark All Read
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={alert.is_read ? 'opacity-60' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{alert.title}</h4>
                        <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        {!alert.is_read && <Badge variant="default">New</Badge>}
                      </div>
                      <p className="text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!alert.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAlertsRead([alert.id])}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {alerts.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No alerts yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="configs" className="space-y-4">
          <div className="space-y-4">
            {configs.map((config) => (
              <Card key={config.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{config.keyword}</h4>
                      <p className="text-sm text-muted-foreground">
                        Location: {config.location} • Language: {config.language}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check every {Math.floor(config.check_frequency / 60)} minutes
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.is_active ? 'default' : 'secondary'}>
                        {config.is_active ? 'Active' : 'Paused'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleConfig(config.id, config.is_active)}
                      >
                        {config.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRunCheck(config)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {configs.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No monitoring configurations yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="space-y-6">
            {configs.map((config) => {
              const chartData = prepareChartData(history[config.id] || []);
              return chartData.length > 0 ? (
                <Card key={config.id}>
                  <CardHeader>
                    <CardTitle>{config.keyword}</CardTitle>
                    <CardDescription>Position changes and competitor activity over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="positions" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Position Changes"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="competitors" 
                          stroke="hsl(var(--secondary))" 
                          strokeWidth={2}
                          name="Competitor Changes"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : null;
            })}
            {configs.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No trend data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};