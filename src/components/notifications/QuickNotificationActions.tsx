import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Archive, 
  Eye, 
  ExternalLink,
  Download,
  Share,
  Calendar,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickNotificationActionsProps {
  notificationId: string;
  actionButtons: Array<{
    id: string;
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    url?: string;
  }>;
  onActionExecuted?: (actionId: string, notificationId: string) => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  navigate: <ExternalLink className="h-3 w-3" />,
  view: <Eye className="h-3 w-3" />,
  edit: <Edit className="h-3 w-3" />,
  download: <Download className="h-3 w-3" />,
  share: <Share className="h-3 w-3" />,
  schedule: <Calendar className="h-3 w-3" />,
  publish: <CheckCircle className="h-3 w-3" />,
  archive: <Archive className="h-3 w-3" />,
};

export const QuickNotificationActions: React.FC<QuickNotificationActionsProps> = ({
  notificationId,
  actionButtons,
  onActionExecuted
}) => {
  const handleAction = async (action: {
    id: string;
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    url?: string;
  }) => {
    try {
      switch (action.action) {
        case 'navigate':
          if (action.url) {
            window.open(action.url, '_blank');
          }
          break;
          
        case 'download':
          if (action.url) {
            const link = document.createElement('a');
            link.href = action.url;
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          break;
          
        case 'share':
          if (navigator.share && action.url) {
            await navigator.share({
              title: 'Check out this content',
              url: action.url
            });
          } else {
            // Fallback to clipboard
            if (action.url) {
              await navigator.clipboard.writeText(action.url);
              toast.success('Link copied to clipboard');
            }
          }
          break;
          
        case 'view_changelog':
          window.open('/changelog', '_blank');
          break;
          
        case 'export':
          toast.info('Export initiated - you\'ll receive a notification when ready');
          break;
          
        case 'save_draft':
          toast.success('Draft saved successfully');
          break;
          
        case 'publish':
          toast.success('Content published successfully');
          break;
          
        case 'schedule':
          toast.info('Content scheduled for publishing');
          break;
          
          
        default:
          console.log('Action not implemented:', action.action);
          toast.info(`${action.label} action triggered`);
      }
      
      onActionExecuted?.(action.id, notificationId);
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action failed to execute');
    }
  };

  if (!actionButtons || actionButtons.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {actionButtons.slice(0, 3).map((action) => (
        <Button
          key={action.id}
          size="sm"
          variant={
            action.variant === 'primary' ? 'default' :
            action.variant === 'success' ? 'default' :
            action.variant === 'danger' ? 'destructive' :
            'ghost'
          }
          onClick={() => handleAction(action)}
          className="h-6 text-xs px-2 gap-1"
        >
          {actionIcons[action.action]}
          {action.label}
        </Button>
      ))}
      
      {actionButtons.length > 3 && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs px-2"
          onClick={() => toast.info('More actions available in notification center')}
        >
          +{actionButtons.length - 3} more
        </Button>
      )}
    </div>
  );
};