import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Battery,
  Bell,
  RotateCw,
  Settings,
  Activity,
  Globe,
  Database,
  RefreshCw
} from 'lucide-react';
import { useEnterpriseRBAC } from '@/contexts/EnterpriseRBACContext';
import { toast } from 'sonner';

interface OfflineData {
  id: string;
  type: 'conversation' | 'content' | 'analytics' | 'draft';
  title: string;
  size: string;
  lastModified: string;
  syncStatus: 'pending' | 'synced' | 'error';
}

interface PushNotificationConfig {
  enabled: boolean;
  types: {
    newMessages: boolean;
    systemAlerts: boolean;
    contentUpdates: boolean;
    teamInvites: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface MobilePerformance {
  batteryOptimization: boolean;
  dataCompression: boolean;
  offlineMode: boolean;
  syncFrequency: 'realtime' | 'every5min' | 'every30min' | 'manual';
  cacheSize: number;
  maxCacheSize: number;
}

export const AdvancedMobileExperience: React.FC = () => {
  const { hasPermission, auditLog } = useEnterpriseRBAC();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [pushConfig, setPushConfig] = useState<PushNotificationConfig>({
    enabled: false,
    types: {
      newMessages: true,
      systemAlerts: true,
      contentUpdates: false,
      teamInvites: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [performance, setPerformance] = useState<MobilePerformance>({
    batteryOptimization: true,
    dataCompression: true,
    offlineMode: true,
    syncFrequency: 'every5min',
    cacheSize: 45.2,
    maxCacheSize: 100
  });

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    loadMobileData();

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const loadMobileData = async () => {
    // Mock offline data
    const mockOfflineData: OfflineData[] = [
      {
        id: 'data-1',
        type: 'conversation',
        title: 'AI Chat Session #42',
        size: '2.3 MB',
        lastModified: new Date(Date.now() - 300000).toISOString(),
        syncStatus: 'pending'
      },
      {
        id: 'data-2',
        type: 'content',
        title: 'Blog Post Draft',
        size: '856 KB',
        lastModified: new Date(Date.now() - 600000).toISOString(),
        syncStatus: 'synced'
      },
      {
        id: 'data-3',
        type: 'draft',
        title: 'Marketing Campaign Ideas',
        size: '1.2 MB',
        lastModified: new Date(Date.now() - 900000).toISOString(),
        syncStatus: 'error'
      }
    ];

    setOfflineData(mockOfflineData);
    await auditLog('mobile_data_loaded', 'mobile', { itemCount: mockOfflineData.length });
  };

  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushConfig(prev => ({ ...prev, enabled: true }));
          await auditLog('notifications_enabled', 'mobile', { permission });
          toast.success('Notifications enabled successfully');
        } else {
          toast.error('Notification permission denied');
        }
      } else {
        toast.error('Notifications not supported on this device');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const syncOfflineData = async () => {
    if (!hasPermission('sync', 'write')) {
      toast.error('You do not have permission to sync data');
      return;
    }

    const pendingItems = offlineData.filter(item => item.syncStatus === 'pending');
    
    for (const item of pendingItems) {
      try {
        // Simulate sync process
        setOfflineData(prev => prev.map(data => 
          data.id === item.id 
            ? { ...data, syncStatus: 'synced' as const }
            : data
        ));

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await auditLog('offline_item_synced', 'mobile', { itemId: item.id, type: item.type });
      } catch (error) {
        console.error(`Error syncing ${item.id}:`, error);
        setOfflineData(prev => prev.map(data => 
          data.id === item.id 
            ? { ...data, syncStatus: 'error' as const }
            : data
        ));
      }
    }

    toast.success(`Synced ${pendingItems.length} items`);
  };

  const clearCache = async () => {
    if (!hasPermission('cache', 'write')) {
      toast.error('You do not have permission to clear cache');
      return;
    }

    setPerformance(prev => ({ ...prev, cacheSize: 0 }));
    await auditLog('cache_cleared', 'mobile', { previousSize: performance.cacheSize });
    toast.success('Cache cleared successfully');
  };

  const updatePushConfig = async (key: keyof PushNotificationConfig | string, value: any) => {
    if (!hasPermission('notifications', 'write')) {
      toast.error('You do not have permission to update notification settings');
      return;
    }

    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setPushConfig(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof PushNotificationConfig] as any), [child]: value }
      }));
    } else {
      setPushConfig(prev => ({ ...prev, [key]: value }));
    }

    await auditLog('push_config_updated', 'mobile', { setting: key, value });
  };

  const updatePerformance = async (key: keyof MobilePerformance, value: any) => {
    if (!hasPermission('performance', 'write')) {
      toast.error('You do not have permission to update performance settings');
      return;
    }

    setPerformance(prev => ({ ...prev, [key]: value }));
    await auditLog('performance_setting_updated', 'mobile', { setting: key, value });
    toast.success('Performance setting updated');
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Mobile Experience</h2>
          <p className="text-muted-foreground">
            Optimize mobile performance, offline sync, and notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Badge variant="secondary" className="text-green-600">
              <Wifi className="mr-1 h-3 w-3" />
              Online
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="mr-1 h-3 w-3" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{offlineData.length}</p>
                <p className="text-xs text-muted-foreground">Offline Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{pushConfig.enabled ? 'ON' : 'OFF'}</p>
                <p className="text-xs text-muted-foreground">Push Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Battery className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{performance.batteryOptimization ? 'ON' : 'OFF'}</p>
                <p className="text-xs text-muted-foreground">Battery Optimization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{performance.cacheSize.toFixed(1)} MB</p>
                <p className="text-xs text-muted-foreground">Cache Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="offline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="offline">Offline Data</TabsTrigger>
          <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Offline Data Management</CardTitle>
                  <CardDescription>Manage cached content and sync status</CardDescription>
                </div>
                <Button onClick={syncOfflineData} disabled={!isOnline}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Sync All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offlineData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        {item.type === 'conversation' && <Smartphone className="h-4 w-4" />}
                        {item.type === 'content' && <Globe className="h-4 w-4" />}
                        {item.type === 'analytics' && <Activity className="h-4 w-4" />}
                        {item.type === 'draft' && <RefreshCw className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.size} • Modified {new Date(item.lastModified).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSyncStatusColor(item.syncStatus)}>
                        {item.syncStatus}
                      </Badge>
                      {item.syncStatus === 'pending' && isOnline && (
                        <Button size="sm" variant="outline">
                          <Upload className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Push Notification Settings</CardTitle>
              <CardDescription>Configure mobile notifications and quiet hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Enable Push Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Receive notifications on your mobile device
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={pushConfig.enabled}
                    onCheckedChange={(checked) => {
                      if (checked && !pushConfig.enabled) {
                        requestNotificationPermission();
                      } else {
                        updatePushConfig('enabled', checked);
                      }
                    }}
                  />
                  {!pushConfig.enabled && (
                    <Button size="sm" onClick={requestNotificationPermission}>
                      Enable
                    </Button>
                  )}
                </div>
              </div>

              {pushConfig.enabled && (
                <>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    {Object.entries(pushConfig.types).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => updatePushConfig(`types.${key}`, checked)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Quiet Hours</div>
                      <Switch
                        checked={pushConfig.quietHours.enabled}
                        onCheckedChange={(checked) => updatePushConfig('quietHours.enabled', checked)}
                      />
                    </div>
                    {pushConfig.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Start Time</label>
                          <input
                            type="time"
                            value={pushConfig.quietHours.start}
                            onChange={(e) => updatePushConfig('quietHours.start', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">End Time</label>
                          <input
                            type="time"
                            value={pushConfig.quietHours.end}
                            onChange={(e) => updatePushConfig('quietHours.end', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
              <CardDescription>Optimize battery life and data usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Battery Optimization</div>
                    <div className="text-xs text-muted-foreground">Reduce CPU usage and background activity</div>
                  </div>
                  <Switch
                    checked={performance.batteryOptimization}
                    onCheckedChange={(checked) => updatePerformance('batteryOptimization', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Data Compression</div>
                    <div className="text-xs text-muted-foreground">Compress data to reduce bandwidth usage</div>
                  </div>
                  <Switch
                    checked={performance.dataCompression}
                    onCheckedChange={(checked) => updatePerformance('dataCompression', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Offline Mode</div>
                    <div className="text-xs text-muted-foreground">Enable offline functionality</div>
                  </div>
                  <Switch
                    checked={performance.offlineMode}
                    onCheckedChange={(checked) => updatePerformance('offlineMode', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cache Usage</span>
                  <Button size="sm" variant="outline" onClick={clearCache}>
                    Clear Cache
                  </Button>
                </div>
                <Progress value={(performance.cacheSize / performance.maxCacheSize) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{performance.cacheSize.toFixed(1)} MB used</span>
                  <span>{performance.maxCacheSize} MB limit</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};