
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Plus, X } from 'lucide-react';
import { opportunityHunterService, OpportunityUserSettings } from '@/services/opportunityHunterService';
import { toast } from 'sonner';

export const OpportunitySettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<OpportunityUserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await opportunityHunterService.getSettings();
      if (data) {
        setSettings(data);
      } else {
        // Set default settings
        setSettings({
          user_id: '',
          scan_frequency: 'daily',
          min_search_volume: 100,
          max_keyword_difficulty: 70,
          notification_channels: ['in_app'],
          excluded_keywords: [],
          preferred_content_formats: ['blog', 'guide'],
          auto_generate_briefs: false,
          aio_friendly_only: false,
          trend_threshold: 5,
          relevance_threshold: 0.7,
          is_active: true
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await opportunityHunterService.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof OpportunityUserSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const addExcludedKeyword = () => {
    if (!settings || !newKeyword.trim()) return;
    const updated = [...settings.excluded_keywords, newKeyword.trim()];
    updateSetting('excluded_keywords', updated);
    setNewKeyword('');
  };

  const removeExcludedKeyword = (keyword: string) => {
    if (!settings) return;
    const updated = settings.excluded_keywords.filter(k => k !== keyword);
    updateSetting('excluded_keywords', updated);
  };

  const toggleContentFormat = (format: string) => {
    if (!settings) return;
    const current = settings.preferred_content_formats;
    const updated = current.includes(format)
      ? current.filter(f => f !== format)
      : [...current, format];
    updateSetting('preferred_content_formats', updated);
  };

  const toggleNotificationChannel = (channel: string) => {
    if (!settings) return;
    const current = settings.notification_channels;
    const updated = current.includes(channel)
      ? current.filter(c => c !== channel)
      : [...current, channel];
    updateSetting('notification_channels', updated);
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Opportunity Hunter Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scan Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scan Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scan Frequency</Label>
                <Select
                  value={settings.scan_frequency}
                  onValueChange={(value) => updateSetting('scan_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active Scanning</Label>
                <Switch
                  checked={settings.is_active}
                  onCheckedChange={(checked) => updateSetting('is_active', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Minimum Search Volume: {settings.min_search_volume.toLocaleString()}
                </Label>
                <Slider
                  value={[settings.min_search_volume]}
                  onValueChange={([value]) => updateSetting('min_search_volume', value)}
                  max={10000}
                  min={0}
                  step={50}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Maximum Keyword Difficulty: {settings.max_keyword_difficulty}
                </Label>
                <Slider
                  value={[settings.max_keyword_difficulty]}
                  onValueChange={([value]) => updateSetting('max_keyword_difficulty', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Content Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Preferences</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred Content Formats</Label>
                <div className="flex flex-wrap gap-2">
                  {['blog', 'guide', 'tutorial', 'glossary', 'faq', 'video', 'infographic'].map(format => (
                    <Button
                      key={format}
                      variant={settings.preferred_content_formats.includes(format) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleContentFormat(format)}
                      className="text-xs"
                    >
                      {format}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-generate Content Briefs</Label>
                  <Switch
                    checked={settings.auto_generate_briefs}
                    onCheckedChange={(checked) => updateSetting('auto_generate_briefs', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>AIO-Friendly Content Only</Label>
                  <Switch
                    checked={settings.aio_friendly_only}
                    onCheckedChange={(checked) => updateSetting('aio_friendly_only', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            
            <div className="space-y-2">
              <Label>Notification Channels</Label>
              <div className="flex flex-wrap gap-2">
                {['in_app', 'email', 'slack', 'webhook'].map(channel => (
                  <Button
                    key={channel}
                    variant={settings.notification_channels.includes(channel) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNotificationChannel(channel)}
                    className="text-xs"
                  >
                    {channel.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Excluded Keywords */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Excluded Keywords</h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword to exclude..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExcludedKeyword()}
              />
              <Button onClick={addExcludedKeyword} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {settings.excluded_keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {settings.excluded_keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <button
                      onClick={() => removeExcludedKeyword(keyword)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-neon-purple hover:bg-neon-blue text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
