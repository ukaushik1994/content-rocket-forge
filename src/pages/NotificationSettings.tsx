import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { 
  Bell,
  Clock,
  Mail,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  Save,
  RotateCcw
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  type NotificationSettings,
  type NotificationCategory,
  type NotificationFrequency,
  type NotificationPriority,
  fetchNotificationSettings,
  fetchNotificationCategories,
  updateNotificationSettings
} from '@/services/enhancedNotificationsService';

const frequencyOptions: { value: NotificationFrequency; label: string; description: string }[] = [
  { value: 'instant', label: 'Instant', description: 'Receive notifications immediately' },
  { value: 'hourly', label: 'Hourly', description: 'Receive notifications every hour' },
  { value: 'daily', label: 'Daily', description: 'Receive notifications once per day' },
  { value: 'weekly', label: 'Weekly', description: 'Receive notifications once per week' }
];

const priorityOptions: { value: NotificationPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
];

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<NotificationCategory[]>([]);
  const [settings, setSettings] = useState<Record<string, NotificationSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalQuietHours, setGlobalQuietHours] = useState({ start: '22:00', end: '08:00' });
  const [globalEnabled, setGlobalEnabled] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      try {
        const [categoriesData, settingsData] = await Promise.all([
          fetchNotificationCategories(),
          fetchNotificationSettings(user.id)
        ]);
        
        setCategories(categoriesData);
        
        // Convert settings array to record for easier access
        const settingsRecord: Record<string, NotificationSettings> = {};
        settingsData.forEach(setting => {
          settingsRecord[setting.category] = setting;
        });
        setSettings(settingsRecord);
      } catch (error) {
        console.error('Failed to load notification settings:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handleSettingChange = (
    categoryId: string,
    field: keyof NotificationSettings,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value
      } as NotificationSettings
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      // Save each category's settings
      await Promise.all(
        Object.entries(settings).map(([categoryId, setting]) =>
          updateNotificationSettings(user.id, categoryId, setting)
        )
      );
      
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values based on categories
    const defaultSettings: Record<string, NotificationSettings> = {};
    categories.forEach(category => {
      defaultSettings[category.id] = {
        id: '',
        user_id: user!.id,
        category: category.id,
        enabled: category.default_enabled,
        frequency: category.default_frequency,
        channels: ['in_app'],
        priority_threshold: 'low',
        auto_dismiss_after_days: 30,
        created_at: '',
        updated_at: ''
      };
    });
    setSettings(defaultSettings);
    toast.info('Settings reset to defaults');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notification settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-primary/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>Notification Settings | Cr3ate</title>
        <meta name="description" content="Manage your notification preferences and settings" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container px-6 pt-10 pb-12 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Notification Settings</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Customize how and when you receive notifications to stay informed without being overwhelmed.
              </p>
            </div>
          </div>

          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Global Settings
              </CardTitle>
              <CardDescription>
                Master controls that affect all notification categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Master switch to enable or disable all notifications
                  </p>
                </div>
                <Switch
                  checked={globalEnabled}
                  onCheckedChange={setGlobalEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Quiet Hours</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Set times when you don't want to receive notifications
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={globalQuietHours.start}
                      onChange={(e) => setGlobalQuietHours(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={globalQuietHours.end}
                      onChange={(e) => setGlobalQuietHours(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Settings */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Notification Categories</h2>
            
            {categories.map((category) => {
              const setting = settings[category.id] || {
                id: '',
                user_id: user!.id,
                category: category.id,
                enabled: category.default_enabled,
                frequency: category.default_frequency,
                channels: ['in_app'],
                priority_threshold: 'low' as NotificationPriority,
                auto_dismiss_after_days: 30,
                created_at: '',
                updated_at: ''
              };

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <div className="h-5 w-5 text-primary" />
                          {category.name}
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <Switch
                        checked={setting.enabled}
                        onCheckedChange={(enabled) => 
                          handleSettingChange(category.id, 'enabled', enabled)
                        }
                      />
                    </div>
                  </CardHeader>
                  
                  {setting.enabled && (
                    <CardContent className="space-y-6">
                      {/* Frequency */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Notification Frequency</Label>
                        <Select
                          value={setting.frequency}
                          onValueChange={(value: NotificationFrequency) =>
                            handleSettingChange(category.id, 'frequency', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-sm text-muted-foreground">{option.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Priority Threshold */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Minimum Priority</Label>
                        <p className="text-sm text-muted-foreground">
                          Only show notifications at or above this priority level
                        </p>
                        <Select
                          value={setting.priority_threshold}
                          onValueChange={(value: NotificationPriority) =>
                            handleSettingChange(category.id, 'priority_threshold', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${option.color.replace('bg-', 'bg-')}`} />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Channels */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Notification Channels</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`${category.id}-in-app`}
                              checked={setting.channels.includes('in_app')}
                              onChange={(e) => {
                                const channels = setting.channels.filter(c => c !== 'in_app');
                                if (e.target.checked) channels.push('in_app');
                                handleSettingChange(category.id, 'channels', channels);
                              }}
                              className="h-4 w-4 rounded border-border"
                            />
                            <Label htmlFor={`${category.id}-in-app`} className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              In-App Notifications
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`${category.id}-email`}
                              checked={setting.channels.includes('email')}
                              onChange={(e) => {
                                const channels = setting.channels.filter(c => c !== 'email');
                                if (e.target.checked) channels.push('email');
                                handleSettingChange(category.id, 'channels', channels);
                              }}
                              className="h-4 w-4 rounded border-border"
                            />
                            <Label htmlFor={`${category.id}-email`} className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Notifications
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Auto Dismiss */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Auto Dismiss</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically remove notifications after this many days
                        </p>
                        <Select
                          value={setting.auto_dismiss_after_days.toString()}
                          onValueChange={(value) =>
                            handleSettingChange(category.id, 'auto_dismiss_after_days', parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="0">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default NotificationSettings;