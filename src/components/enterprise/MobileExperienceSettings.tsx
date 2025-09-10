import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Smartphone,
  Download,
  Bell,
  Wifi,
  WifiOff,
  Battery,
  Zap,
  Globe,
  Eye,
  Volume2,
  Vibrate,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface PWASettings {
  enabled: boolean;
  installPrompt: boolean;
  offlineMode: boolean;
  backgroundSync: boolean;
  cacheSize: number;
  updateFrequency: 'immediate' | 'daily' | 'weekly';
}

interface NotificationSettings {
  enabled: boolean;
  chatUpdates: boolean;
  contentReady: boolean;
  teamMentions: boolean;
  systemAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  sound: boolean;
  vibration: boolean;
}

interface MobileUISettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  gestureNavigation: boolean;
  hapticFeedback: boolean;
  compactMode: boolean;
  autoKeyboard: boolean;
}

interface PerformanceSettings {
  imageQuality: 'high' | 'medium' | 'low';
  animationSpeed: number;
  backgroundProcessing: boolean;
  dataCompression: boolean;
  preloadContent: boolean;
  batterySaver: boolean;
}

const MOCK_PWA_SETTINGS: PWASettings = {
  enabled: true,
  installPrompt: true,
  offlineMode: true,
  backgroundSync: false,
  cacheSize: 150,
  updateFrequency: 'daily'
};

const MOCK_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  chatUpdates: true,
  contentReady: true,
  teamMentions: true,
  systemAlerts: false,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  },
  sound: true,
  vibration: true
};

const MOCK_UI_SETTINGS: MobileUISettings = {
  theme: 'auto',
  fontSize: 14,
  gestureNavigation: true,
  hapticFeedback: true,
  compactMode: false,
  autoKeyboard: true
};

const MOCK_PERFORMANCE_SETTINGS: PerformanceSettings = {
  imageQuality: 'medium',
  animationSpeed: 1,
  backgroundProcessing: true,
  dataCompression: false,
  preloadContent: true,
  batterySaver: false
};

export const MobileExperienceSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pwaSettings, setPwaSettings] = useState<PWASettings>(MOCK_PWA_SETTINGS);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(MOCK_NOTIFICATION_SETTINGS);
  const [uiSettings, setUiSettings] = useState<MobileUISettings>(MOCK_UI_SETTINGS);
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>(MOCK_PERFORMANCE_SETTINGS);
  const [installPromptAvailable, setInstallPromptAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Check PWA install availability
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptAvailable(true);
    };

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallPWA = async () => {
    try {
      // In a real implementation, you'd store the beforeinstallprompt event
      // and trigger it here
      toast.success('Installation prompted');
    } catch (error) {
      toast.error('Installation not available');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationSettings(prev => ({ ...prev, enabled: true }));
        toast.success('Notifications enabled');
      } else {
        toast.error('Notification permission denied');
      }
    }
  };

  const testNotification = () => {
    if (notificationSettings.enabled && 'Notification' in window) {
      new Notification('Test Notification', {
        body: 'This is a test notification from your AI Assistant',
        icon: '/favicon.ico'
      });
    }
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        toast.success('Cache cleared successfully');
      }
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Experience & PWA Settings
          </CardTitle>
          <CardDescription>
            Configure mobile-first features, progressive web app functionality, and mobile optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pwa" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pwa">PWA Setup</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="interface">Interface</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="pwa" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Progressive Web App
                    <Badge variant={pwaSettings.enabled ? "default" : "secondary"}>
                      {pwaSettings.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">Enable PWA Features</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow users to install the app on their devices
                      </p>
                    </div>
                    <Switch
                      checked={pwaSettings.enabled}
                      onCheckedChange={(checked) => setPwaSettings(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  {installPromptAvailable && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-blue-900">Install Available</h4>
                            <p className="text-sm text-blue-700">Add this app to your home screen</p>
                          </div>
                          <Button onClick={handleInstallPWA} size="sm">
                            Install App
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center gap-2">
                          {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
                          Offline Mode
                        </h4>
                        <p className="text-sm text-muted-foreground">Work without internet connection</p>
                      </div>
                      <Switch
                        checked={pwaSettings.offlineMode}
                        onCheckedChange={(checked) => setPwaSettings(prev => ({ ...prev, offlineMode: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Background Sync</h4>
                        <p className="text-sm text-muted-foreground">Sync data when connection returns</p>
                      </div>
                      <Switch
                        checked={pwaSettings.backgroundSync}
                        onCheckedChange={(checked) => setPwaSettings(prev => ({ ...prev, backgroundSync: checked }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Cache Size Limit</Label>
                      <span className="text-sm text-muted-foreground">{pwaSettings.cacheSize}MB</span>
                    </div>
                    <Slider
                      value={[pwaSettings.cacheSize]}
                      onValueChange={([value]) => setPwaSettings(prev => ({ ...prev, cacheSize: value }))}
                      max={500}
                      min={50}
                      step={25}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Update Frequency</Label>
                    <Select 
                      value={pwaSettings.updateFrequency} 
                      onValueChange={(value: 'immediate' | 'daily' | 'weekly') => 
                        setPwaSettings(prev => ({ ...prev, updateFrequency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearCache}>
                      Clear Cache
                    </Button>
                    <Button variant="outline">
                      Check for Updates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Push Notifications
                    <Badge variant={notificationSettings.enabled ? "default" : "secondary"}>
                      {Notification.permission || "Unknown"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">Enable Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for important updates
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={notificationSettings.enabled}
                        onCheckedChange={(checked) => {
                          if (checked && Notification.permission !== 'granted') {
                            requestNotificationPermission();
                          } else {
                            setNotificationSettings(prev => ({ ...prev, enabled: checked }));
                          }
                        }}
                      />
                      {notificationSettings.enabled && (
                        <Button size="sm" variant="outline" onClick={testNotification}>
                          Test
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Chat Updates</h4>
                        <p className="text-sm text-muted-foreground">New messages and responses</p>
                      </div>
                      <Switch
                        checked={notificationSettings.chatUpdates}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, chatUpdates: checked }))}
                        disabled={!notificationSettings.enabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Content Ready</h4>
                        <p className="text-sm text-muted-foreground">When content generation completes</p>
                      </div>
                      <Switch
                        checked={notificationSettings.contentReady}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, contentReady: checked }))}
                        disabled={!notificationSettings.enabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Team Mentions</h4>
                        <p className="text-sm text-muted-foreground">When you're mentioned by teammates</p>
                      </div>
                      <Switch
                        checked={notificationSettings.teamMentions}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, teamMentions: checked }))}
                        disabled={!notificationSettings.enabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">System Alerts</h4>
                        <p className="text-sm text-muted-foreground">Maintenance and updates</p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                        disabled={!notificationSettings.enabled}
                      />
                    </div>
                  </div>

                  <Card className="bg-gray-50">
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Quiet Hours</h4>
                        <Switch
                          checked={notificationSettings.quietHours.enabled}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, enabled: checked }
                          }))}
                        />
                      </div>
                      {notificationSettings.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Time</Label>
                            <input
                              type="time"
                              value={notificationSettings.quietHours.start}
                              onChange={(e) => setNotificationSettings(prev => ({ 
                                ...prev, 
                                quietHours: { ...prev.quietHours, start: e.target.value }
                              }))}
                              className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                            />
                          </div>
                          <div>
                            <Label>End Time</Label>
                            <input
                              type="time"
                              value={notificationSettings.quietHours.end}
                              onChange={(e) => setNotificationSettings(prev => ({ 
                                ...prev, 
                                quietHours: { ...prev.quietHours, end: e.target.value }
                              }))}
                              className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          Sound
                        </h4>
                        <p className="text-sm text-muted-foreground">Play notification sounds</p>
                      </div>
                      <Switch
                        checked={notificationSettings.sound}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, sound: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center gap-2">
                          <Vibrate className="h-4 w-4" />
                          Vibration
                        </h4>
                        <p className="text-sm text-muted-foreground">Vibrate for notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.vibration}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, vibration: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interface" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Mobile Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Theme Preference</Label>
                    <Select 
                      value={uiSettings.theme} 
                      onValueChange={(value: 'light' | 'dark' | 'auto') => 
                        setUiSettings(prev => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="auto">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Auto
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Font Size</Label>
                      <span className="text-sm text-muted-foreground">{uiSettings.fontSize}px</span>
                    </div>
                    <Slider
                      value={[uiSettings.fontSize]}
                      onValueChange={([value]) => setUiSettings(prev => ({ ...prev, fontSize: value }))}
                      max={20}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Gesture Navigation</h4>
                        <p className="text-sm text-muted-foreground">Swipe gestures for navigation</p>
                      </div>
                      <Switch
                        checked={uiSettings.gestureNavigation}
                        onCheckedChange={(checked) => setUiSettings(prev => ({ ...prev, gestureNavigation: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Haptic Feedback</h4>
                        <p className="text-sm text-muted-foreground">Vibration on interactions</p>
                      </div>
                      <Switch
                        checked={uiSettings.hapticFeedback}
                        onCheckedChange={(checked) => setUiSettings(prev => ({ ...prev, hapticFeedback: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Compact Mode</h4>
                        <p className="text-sm text-muted-foreground">Reduce spacing for smaller screens</p>
                      </div>
                      <Switch
                        checked={uiSettings.compactMode}
                        onCheckedChange={(checked) => setUiSettings(prev => ({ ...prev, compactMode: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Auto Keyboard</h4>
                        <p className="text-sm text-muted-foreground">Auto-focus input fields</p>
                      </div>
                      <Switch
                        checked={uiSettings.autoKeyboard}
                        onCheckedChange={(checked) => setUiSettings(prev => ({ ...prev, autoKeyboard: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Image Quality</Label>
                    <Select 
                      value={performanceSettings.imageQuality} 
                      onValueChange={(value: 'high' | 'medium' | 'low') => 
                        setPerformanceSettings(prev => ({ ...prev, imageQuality: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Quality (Slower)</SelectItem>
                        <SelectItem value="medium">Medium Quality (Balanced)</SelectItem>
                        <SelectItem value="low">Low Quality (Faster)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Animation Speed</Label>
                      <span className="text-sm text-muted-foreground">{performanceSettings.animationSpeed}x</span>
                    </div>
                    <Slider
                      value={[performanceSettings.animationSpeed]}
                      onValueChange={([value]) => setPerformanceSettings(prev => ({ ...prev, animationSpeed: value }))}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Background Processing</h4>
                        <p className="text-sm text-muted-foreground">Process tasks in background</p>
                      </div>
                      <Switch
                        checked={performanceSettings.backgroundProcessing}
                        onCheckedChange={(checked) => setPerformanceSettings(prev => ({ ...prev, backgroundProcessing: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Data Compression</h4>
                        <p className="text-sm text-muted-foreground">Compress data to save bandwidth</p>
                      </div>
                      <Switch
                        checked={performanceSettings.dataCompression}
                        onCheckedChange={(checked) => setPerformanceSettings(prev => ({ ...prev, dataCompression: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Preload Content</h4>
                        <p className="text-sm text-muted-foreground">Load content ahead of time</p>
                      </div>
                      <Switch
                        checked={performanceSettings.preloadContent}
                        onCheckedChange={(checked) => setPerformanceSettings(prev => ({ ...prev, preloadContent: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center gap-2">
                          <Battery className="h-4 w-4" />
                          Battery Saver
                        </h4>
                        <p className="text-sm text-muted-foreground">Reduce power consumption</p>
                      </div>
                      <Switch
                        checked={performanceSettings.batterySaver}
                        onCheckedChange={(checked) => setPerformanceSettings(prev => ({ ...prev, batterySaver: checked }))}
                      />
                    </div>
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <h4 className="font-medium text-blue-900 mb-2">Performance Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Lower image quality improves loading speed on slow connections</li>
                        <li>• Battery saver mode reduces animations and background processing</li>
                        <li>• Data compression can reduce mobile data usage by up to 30%</li>
                        <li>• Preloading content improves perceived performance</li>
                      </ul>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};