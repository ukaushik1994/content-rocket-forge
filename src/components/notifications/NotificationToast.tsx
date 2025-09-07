import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { 
  CheckCircle, 
  Info, 
  AlertCircle, 
  XCircle, 
  Trophy,
  Bell
} from 'lucide-react';
import { NotificationType } from '@/services/enhancedNotificationsService';
import { QuickNotificationActions } from './QuickNotificationActions';

interface NotificationToastProps {
  title?: string;
  message: string;
  type: NotificationType;
  actionButtons?: Array<{
    id: string;
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    url?: string;
  }>;
  notificationId: string;
  onActionExecuted?: (actionId: string, notificationId: string) => void;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-success" />,
  info: <Info className="h-4 w-4 text-info" />,
  warning: <AlertCircle className="h-4 w-4 text-warning" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
  achievement: <Trophy className="h-4 w-4 text-primary" />
};

export const showNotificationToast = ({
  title,
  message,
  type,
  actionButtons,
  notificationId,
  onActionExecuted
}: NotificationToastProps) => {
  const icon = typeIcons[type];
  
  const toastContent = (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-start gap-2">
        {icon}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-medium text-sm text-foreground mb-1">
              {title}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {message}
          </div>
        </div>
      </div>
      
      {actionButtons && actionButtons.length > 0 && (
        <QuickNotificationActions
          notificationId={notificationId}
          actionButtons={actionButtons}
          onActionExecuted={onActionExecuted}
        />
      )}
    </div>
  );

  // Use appropriate toast type
  switch (type) {
    case 'success':
    case 'achievement':
      sonnerToast.success(toastContent, {
        duration: 5000,
        className: 'bg-background border-success/20',
      });
      break;
    case 'warning':
      sonnerToast.warning(toastContent, {
        duration: 6000,
        className: 'bg-background border-warning/20',
      });
      break;
    case 'error':
      sonnerToast.error(toastContent, {
        duration: 8000,
        className: 'bg-background border-destructive/20',
      });
      break;
    case 'info':
    default:
      sonnerToast.info(toastContent, {
        duration: 4000,
        className: 'bg-background border-info/20',
      });
      break;
  }
};

// Enhanced notification toast with Bell icon for system notifications
export const showSystemNotificationToast = (props: NotificationToastProps) => {
  const toastContent = (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-start gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-0">
          {props.title && (
            <div className="font-medium text-sm text-foreground mb-1">
              {props.title}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {props.message}
          </div>
        </div>
      </div>
      
      {props.actionButtons && props.actionButtons.length > 0 && (
        <QuickNotificationActions
          notificationId={props.notificationId}
          actionButtons={props.actionButtons}
          onActionExecuted={props.onActionExecuted}
        />
      )}
    </div>
  );

  sonnerToast.info(toastContent, {
    duration: 5000,
    className: 'bg-background border-primary/20',
  });
};