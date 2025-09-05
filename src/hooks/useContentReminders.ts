import { useEffect } from 'react';
import { contentCompletionTracking } from '@/services/contentCompletionTracking';

export const useContentReminders = () => {
  useEffect(() => {
    // Check for upcoming content reminders when the component mounts
    const checkReminders = async () => {
      try {
        await contentCompletionTracking.showUpcomingContentReminders();
      } catch (error) {
        console.error('Error checking content reminders:', error);
      }
    };

    // Check reminders immediately
    checkReminders();

    // Set up interval to check reminders every hour
    const interval = setInterval(checkReminders, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  return {
    checkReminders: () => contentCompletionTracking.showUpcomingContentReminders()
  };
};