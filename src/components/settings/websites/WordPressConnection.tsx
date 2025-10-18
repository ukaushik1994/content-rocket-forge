import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getConnection, saveWordPressConnection, testConnection, deleteConnection } from '@/services/websiteConnection';

interface WordPressConnectionProps {
  onConnectionChange: () => void;
}

export const WordPressConnection = ({ onConnectionChange }: WordPressConnectionProps) => {
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    const connection = await getConnection('wordpress');
    if (connection) {
      setSiteUrl(connection.site_url || '');
      setUsername(connection.username || '');
      setIsActive(connection.is_active);
      // Don't load the password for security
    }
  };

  const handleTest = async () => {
    if (!siteUrl || !username || !appPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields before testing',
        variant: 'destructive'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const success = await testConnection('wordpress');
    setTestResult(success ? 'success' : 'error');
    setIsTesting(false);

    toast({
      title: success ? 'Connection Successful' : 'Connection Failed',
      description: success 
        ? 'WordPress connection verified successfully'
        : 'Failed to connect to WordPress. Please check your credentials.',
      variant: success ? 'default' : 'destructive'
    });
  };

  const handleSave = async () => {
    if (!siteUrl || !username || !appPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    const success = await saveWordPressConnection({
      siteUrl,
      username,
      appPassword,
      defaultSettings: {
        status: 'draft',
        categories: [],
        tags: []
      }
    });

    setIsSaving(false);

    if (success) {
      toast({
        title: 'Connection Saved',
        description: 'WordPress connection has been saved successfully'
      });
      onConnectionChange();
    } else {
      toast({
        title: 'Save Failed',
        description: 'Failed to save WordPress connection',
        variant: 'destructive'
      });
    }
  };

  const handleDisconnect = async () => {
    const success = await deleteConnection('wordpress');
    if (success) {
      setSiteUrl('');
      setUsername('');
      setAppPassword('');
      setIsActive(false);
      toast({
        title: 'Disconnected',
        description: 'WordPress connection has been removed'
      });
      onConnectionChange();
    }
  };

  return (
    <div className="space-y-4">
      {/* Helper Card */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium mb-2 text-sm">📘 How to create an Application Password:</h4>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Log into WordPress → Users → Profile</li>
          <li>Scroll to "Application Passwords"</li>
          <li>Enter name (e.g., "Content Platform")</li>
          <li>Click "Add New Application Password"</li>
          <li>Copy the generated password here</li>
        </ol>
      </Card>

      {/* Form Fields */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="wp-site-url">Site URL *</Label>
          <Input
            id="wp-site-url"
            type="url"
            placeholder="https://yourblog.com"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wp-username">Username *</Label>
          <Input
            id="wp-username"
            type="text"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">WordPress username with publishing permissions</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wp-app-password">Application Password *</Label>
          <div className="relative">
            <Input
              id="wp-app-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="xxxx xxxx xxxx xxxx"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="wp-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="wp-active">Enable WordPress connection</Label>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`flex items-center gap-2 text-sm ${testResult === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {testResult === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Connection verified successfully</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              <span>Connection test failed</span>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={isTesting || !siteUrl || !username || !appPassword}
        >
          {isTesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Test Connection
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Connection
        </Button>
        {siteUrl && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
};