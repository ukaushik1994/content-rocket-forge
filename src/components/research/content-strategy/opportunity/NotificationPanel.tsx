
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Info, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { OpportunityNotification } from '@/services/opportunityHunterService';
import { opportunityHunterService } from '@/services/opportunityHunterService';
import { toast } from 'sonner';
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
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      await opportunityHunterService.dismissNotification(notificationId);
      toast.success('Notification dismissed');
      onNotificationAction();
    } catch (error) {
      toast.error('Failed to dismiss notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_opportunity':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'high_priority':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'competitor_alert':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'deadline_reminder':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'new_opportunity':
        return 'New Opportunity';
      case 'high_priority':
        return 'High Priority';
      case 'competitor_alert':
        return 'Competitor Alert';
      case 'deadline_reminder':
        return 'Deadline Reminder';
      default:
        return 'Notification';
    }
  };

  const getNotificationMessage = (notification: OpportunityNotification) => {
    const metadata = notification.metadata || {};
    
    switch (notification.notification_type) {
      case 'new_opportunity':
        return `New opportunity discovered: "${metadata.keyword || 'Unknown keyword'}"`;
      case 'high_priority':
        return `High priority opportunity requires attention: "${metadata.keyword || 'Unknown keyword'}"`;
      case 'competitor_alert':
        return `Competitor movement detected for: "${metadata.keyword || 'Unknown keyword'}"`;
      case 'deadline_reminder':
        return `Deadline approaching for: "${metadata.keyword || 'Unknown keyword'}"`;
      default:
        return 'New notification received';
    }
  };

  if (notifications.length === 0) {
    return (
      <Card className="border-white/10 bg-glass">
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            You're all caught up! New opportunity notifications will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            <Badge variant="secondary">
              {notifications.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 p-4 border border-white/10 rounded-lg bg-black/20"
            >
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.notification_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getNotificationTypeLabel(notification.notification_type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), 'MMM d, HH:mm')}
                  </span>
                </div>
                
                <p className="text-sm mb-3">
                  {getNotificationMessage(notification)}
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkRead(notification.id)}
                    className="text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark Read
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(notification.id)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
