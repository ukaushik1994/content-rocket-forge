
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export function NotificationSettings() {
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Notification preferences saved!');
  };
  
  return (
    <Card className="glass-panel bg-glass">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you want to receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveNotifications}>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Email Notifications</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-content-published">Content Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive an email when your content is published.
                  </p>
                </div>
                <Switch id="email-content-published" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-ranking-changes">Ranking Changes</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive an email when your content changes position.
                  </p>
                </div>
                <Switch id="email-ranking-changes" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-marketing">Marketing Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive marketing and product updates.
                  </p>
                </div>
                <Switch id="email-marketing" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">In-App Notifications</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="app-comments">Comments</Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications for new comments on your content.
                  </p>
                </div>
                <Switch id="app-comments" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="app-mentions">Mentions</Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications when you're mentioned.
                  </p>
                </div>
                <Switch id="app-mentions" defaultChecked />
              </div>
            </div>
            
            <Button type="submit" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
              Save Notification Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
