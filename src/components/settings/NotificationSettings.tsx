
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';

export function NotificationSettings() {
  const [emailExpanded, setEmailExpanded] = useState(true);
  const [appExpanded, setAppExpanded] = useState(true);

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Notification preferences saved!');
  };

  // Calculate notification stats
  const emailNotifications = [
    { id: 'email-content-published', enabled: true },
    { id: 'email-ranking-changes', enabled: true },
    { id: 'email-marketing', enabled: false }
  ];
  
  const appNotifications = [
    { id: 'app-comments', enabled: true },
    { id: 'app-mentions', enabled: true }
  ];

  const emailEnabled = emailNotifications.filter(n => n.enabled).length;
  const appEnabled = appNotifications.filter(n => n.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium mb-2">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure how you want to receive notifications and stay updated on important events.
        </p>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {emailEnabled + appEnabled} of {emailNotifications.length + appNotifications.length} enabled
          </span>
          <div className="flex gap-1">
            {[...emailNotifications, ...appNotifications].map((notification, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  notification.enabled ? 'bg-foreground' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveNotifications} className="space-y-6">
        {/* Email Notifications Section */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full h-auto p-0 justify-start font-normal hover:bg-transparent"
            onClick={() => setEmailExpanded(!emailExpanded)}
          >
            <div className="flex items-center justify-between w-full py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {emailExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Email Notifications</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {emailEnabled}/{emailNotifications.length}
                </span>
                <div className="flex gap-1">
                  {emailNotifications.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < emailEnabled ? 'bg-foreground' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Button>
          
          {emailExpanded && (
            <div className="space-y-2 pl-6">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/20 bg-transparent hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="email-content-published" className="font-medium text-sm">Content Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive an email when your content is published.
                  </p>
                </div>
                <Switch id="email-content-published" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/20 bg-transparent hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="email-ranking-changes" className="font-medium text-sm">Ranking Changes</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive an email when your content changes position.
                  </p>
                </div>
                <Switch id="email-ranking-changes" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/20 bg-transparent hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="email-marketing" className="font-medium text-sm">Marketing Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive marketing and product updates.
                  </p>
                </div>
                <Switch id="email-marketing" />
              </div>
            </div>
          )}
        </div>
        
        {/* In-App Notifications Section */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full h-auto p-0 justify-start font-normal hover:bg-transparent"
            onClick={() => setAppExpanded(!appExpanded)}
          >
            <div className="flex items-center justify-between w-full py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {appExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">In-App Notifications</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {appEnabled}/{appNotifications.length}
                </span>
                <div className="flex gap-1">
                  {appNotifications.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < appEnabled ? 'bg-foreground' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Button>
          
          {appExpanded && (
            <div className="space-y-2 pl-6">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/20 bg-transparent hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="app-comments" className="font-medium text-sm">Comments</Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications for new comments on your content.
                  </p>
                </div>
                <Switch id="app-comments" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/20 bg-transparent hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="app-mentions" className="font-medium text-sm">Mentions</Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications when you're mentioned.
                  </p>
                </div>
                <Switch id="app-mentions" defaultChecked />
              </div>
            </div>
          )}
        </div>
        
        <Button type="submit" size="sm">
          Save Notification Settings
        </Button>
      </form>
    </div>
  );
}
