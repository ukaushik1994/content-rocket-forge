
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export function AdvancedSettings() {
  const [enableDevMode, setEnableDevMode] = useState(false);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [cacheTimeout, setCacheTimeout] = useState('30');
  
  const handleSaveAdvanced = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Advanced settings saved!');
  };
  
  const handleClearCache = () => {
    toast.success('Cache cleared successfully!');
  };
  
  const handleExportLogs = () => {
    toast.info('Preparing log export');
  };
  
  const handleResetSettings = () => {
    toast.success('Settings reset to defaults');
    setEnableDevMode(false);
    setEnableAnalytics(true);
    setCacheTimeout('30');
  };
  
  return (
    <Card className="glass-panel bg-glass">
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
        <CardDescription>
          Configure advanced application settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveAdvanced}>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Performance Settings</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cache-timeout">Cache Timeout (minutes)</Label>
                  <p className="text-xs text-muted-foreground">
                    Set how long content should be cached.
                  </p>
                </div>
                <Input
                  id="cache-timeout"
                  type="number"
                  className="w-20 text-right bg-glass border-border"
                  value={cacheTimeout}
                  onChange={(e) => setCacheTimeout(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="priority-mode">API Priority Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Select which API calls should be prioritized.
                  </p>
                </div>
                <Select defaultValue="auto">
                  <SelectTrigger className="w-36 bg-glass border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="keywords">Keywords</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Developer Options</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dev-mode">Developer Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable additional developer tools and logging.
                  </p>
                </div>
                <Switch 
                  id="dev-mode" 
                  checked={enableDevMode}
                  onCheckedChange={setEnableDevMode}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Usage Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow anonymous usage data collection.
                  </p>
                </div>
                <Switch 
                  id="analytics" 
                  checked={enableAnalytics}
                  onCheckedChange={setEnableAnalytics}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Maintenance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={handleClearCache}>
                  Clear Cache
                </Button>
                <Button type="button" variant="outline" onClick={handleExportLogs}>
                  Export Logs
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
              Save Advanced Settings
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t pt-4 border-border flex justify-between">
        <Button 
          variant="destructive" 
          onClick={handleResetSettings}
        >
          Reset to Defaults
        </Button>
      </CardFooter>
    </Card>
  );
}
