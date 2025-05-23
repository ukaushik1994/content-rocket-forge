
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

export function NotificationSettings() {
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Notification preferences saved!');
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-panel bg-glass border border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-neon-purple/20 p-2">
              <Bell className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <CardTitle className="text-gradient">Notification Preferences</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure how you want to receive notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveNotifications}>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gradient">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-content-published" className="text-foreground font-medium">Content Published</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive an email when your content is published.
                      </p>
                    </div>
                    <Switch id="email-content-published" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-ranking-changes" className="text-foreground font-medium">Ranking Changes</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive an email when your content changes position.
                      </p>
                    </div>
                    <Switch id="email-ranking-changes" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-marketing" className="text-foreground font-medium">Marketing Updates</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive marketing and product updates.
                      </p>
                    </div>
                    <Switch id="email-marketing" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gradient">In-App Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-comments" className="text-foreground font-medium">Comments</Label>
                      <p className="text-xs text-muted-foreground">
                        Show notifications for new comments on your content.
                      </p>
                    </div>
                    <Switch id="app-comments" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-white/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-mentions" className="text-foreground font-medium">Mentions</Label>
                      <p className="text-xs text-muted-foreground">
                        Show notifications when you're mentioned.
                      </p>
                    </div>
                    <Switch id="app-mentions" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
                Save Notification Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
