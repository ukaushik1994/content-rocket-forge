
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type OpportunityUserSettings, opportunityHunterService } from '@/services/opportunityHunterService';
import { toast } from 'sonner';
import { Settings, Save, Plus, X } from 'lucide-react';

export const OpportunitySettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<OpportunityUserSettings>({
    user_id: '',
    scan_frequency: 'daily',
    min_search_volume: 100,
    max_keyword_difficulty: 50,
    notification_channels: ['in_app'],
    excluded_keywords: [],
    preferred_content_formats: ['blog', 'guide', 'faq'],
    auto_generate_briefs: true,
    aio_friendly_only: false,
    trend_threshold: 0.2,
    relevance_threshold: 0.6,
    is_active: true
  });
  
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const userSettings = await opportunityHunterService.getSettings();
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await opportunityHunterService.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExcludedKeyword = () => {
    if (newKeyword.trim() && !settings.excluded_keywords.includes(newKeyword.trim())) {
      setSettings(prev => ({
        ...prev,
        excluded_keywords: [...prev.excluded_keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveExcludedKeyword = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      excluded_keywords: prev.excluded_keywords.filter(k => k !== keyword)
    }));
  };

  const handleFormatToggle = (format: string) => {
    const isSelected = settings.preferred_content_formats.includes(format);
    setSettings(prev => ({
      ...prev,
      preferred_content_formats: isSelected
        ? prev.preferred_content_formats.filter(f => f !== format)
        : [...prev.preferred_content_formats, format]
    }));
  };

  const contentFormats = ['blog', 'guide', 'faq', 'listicle', 'case-study', 'tutorial', 'comparison'];

  if (isLoading) {
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
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-neon-purple" />
            OpportunityHunter Settings
          </CardTitle>
          <CardDescription>
            Configure how OpportunityHunter scans and notifies you about content opportunities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Scanning Frequency */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Scan Frequency</Label>
            <Select
              value={settings.scan_frequency}
              onValueChange={(value) => setSettings(prev => ({ ...prev, scan_frequency: value }))}
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

          {/* Volume and Difficulty Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Min Search Volume: {settings.min_search_volume.toLocaleString()}
              </Label>
              <Slider
                value={[settings.min_search_volume]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, min_search_volume: value }))}
                max={10000}
                min={0}
                step={100}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Max Keyword Difficulty: {settings.max_keyword_difficulty}
              </Label>
              <Slider
                value={[settings.max_keyword_difficulty]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, max_keyword_difficulty: value }))}
                max={100}
                min={1}
                step={1}
              />
            </div>
          </div>

          {/* Relevance and Trend Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Relevance Threshold: {Math.round(settings.relevance_threshold * 100)}%
              </Label>
              <Slider
                value={[settings.relevance_threshold]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, relevance_threshold: value }))}
                max={1}
                min={0}
                step={0.1}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Trend Threshold: {Math.round(settings.trend_threshold * 100)}%
              </Label>
              <Slider
                value={[settings.trend_threshold]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, trend_threshold: value }))}
                max={1}
                min={0}
                step={0.1}
              />
            </div>
          </div>

          {/* Content Format Preferences */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Preferred Content Formats</Label>
            <div className="flex flex-wrap gap-2">
              {contentFormats.map(format => (
                <Badge
                  key={format}
                  variant={settings.preferred_content_formats.includes(format) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    settings.preferred_content_formats.includes(format)
                      ? 'bg-neon-purple text-white'
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => handleFormatToggle(format)}
                >
                  {format}
                </Badge>
              ))}
            </div>
          </div>

          {/* Excluded Keywords */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Excluded Keywords</Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add keyword to exclude"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddExcludedKeyword()}
              />
              <Button onClick={handleAddExcludedKeyword} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.excluded_keywords.map(keyword => (
                <Badge key={keyword} variant="outline" className="pr-1">
                  {keyword}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-red-500/20"
                    onClick={() => handleRemoveExcludedKeyword(keyword)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Auto-Generate Content Briefs</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate AI content briefs for new opportunities
                </p>
              </div>
              <Switch
                checked={settings.auto_generate_briefs}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, auto_generate_briefs: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">AIO-Friendly Keywords Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only show opportunities optimized for AI Overviews
                </p>
              </div>
              <Switch
                checked={settings.aio_friendly_only}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, aio_friendly_only: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Enable OpportunityHunter</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off automatic opportunity scanning
                </p>
              </div>
              <Switch
                checked={settings.is_active}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-neon-purple hover:bg-neon-blue text-white"
            >
              {isSaving ? (
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
