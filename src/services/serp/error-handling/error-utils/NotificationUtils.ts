
/**
 * Utility for displaying error notifications
 */
import { toast } from 'sonner';
import { SerpApiError, SerpErrorType } from '../ErrorTypes';

/**
 * Show a toast notification for an error
 */
export const showErrorNotification = (error: SerpApiError): void => {
  const { type, message, provider, recoverable, retryAfter } = error;
  
  switch (type) {
    case SerpErrorType.INVALID_API_KEY:
    case SerpErrorType.EXPIRED_API_KEY:
    case SerpErrorType.MISSING_API_KEY:
      toast.error(message, {
        duration: 5000,
        action: {
          label: 'Settings',
          onClick: () => {
            window.location.href = '/settings/api';
          }
        }
      });
      break;
      
    case SerpErrorType.RATE_LIMIT_EXCEEDED:
      toast.error(`${message}. Try again in ${retryAfter || 60} seconds.`);
      break;
      
    case SerpErrorType.USAGE_QUOTA_EXCEEDED:
      toast.error(`${message}. Please upgrade your plan or try again tomorrow.`, {
        duration: 5000
      });
      break;
      
    case SerpErrorType.NETWORK_ERROR:
    case SerpErrorType.TIMEOUT_ERROR:
      toast.error(message, {
        description: 'Check your internet connection and try again.',
        duration: 5000
      });
      break;
      
    default:
      toast.error(message, { duration: 5000 });
  }
};
