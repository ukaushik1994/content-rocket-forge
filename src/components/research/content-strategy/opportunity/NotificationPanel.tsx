
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type OpportunityNotification, opportunityHunterService } from '@/services/opportunityHunterService';
import { toast } from 'sonner';
import { Bell, Eye, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationPanelProps {
  notifications: OpportunityNotification[];
  onNotificationAction: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onNotificationAction
}) => {
  const handleMarkRead = async (notificationId: string) => {
    try {
      await opportunityHunterService.markNotificationRead(notificationId);
      toast.success('Notification marked as read');
      onNotificationAction();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      await opportunityHunterService.dismissNotification(notificationId);
      toast.success('Notification dismissed');
      onNotificationAction();
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  if (notifications.length === 0) {
    return (
      <Card className="border-white/10 bg-glass">
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No New Notifications</h3>
          <p className="text-muted-foreground">
            You're all caught up! New opportunity notifications will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className="border-white/10 bg-glass">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Bell className="h-4 w-4 text-neon-purple mr-2" />
                <CardTitle className="text-base">New Opportunity Detected</CardTitle>
                <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {notification.notification_type}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkRead(notification.id)}
                  disabled={notification.status === 'read'}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(notification.id)}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {notification.metadata && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Keyword:</span>
                  <span className="text-neon-purple">{notification.metadata.keyword}</span>
                </div>
                
                {notification.metadata.opportunity_score && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Opportunity Score:</span>
                    <span>{notification.metadata.opportunity_score}</span>
                  </div>
                )}
                
                {notification.metadata.priority && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Priority:</span>
                    <Badge 
                      className={
                        notification.metadata.priority === 'high' 
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : notification.metadata.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          : 'bg-green-500/20 text-green-300 border-green-500/30'
                      }
                    >
                      {notification.metadata.priority}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
