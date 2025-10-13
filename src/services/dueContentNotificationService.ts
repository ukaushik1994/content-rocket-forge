import { supabase } from '@/integrations/supabase/client';
import { pushEnhancedAlert } from './enhancedNotificationsService';

interface CalendarItem {
  id: string;
  title: string;
  scheduled_date: string;
  status: string;
  notes?: string | null;
  content_type?: string | null;
  tags?: any;
  primary_keyword?: string | null;
  [key: string]: any;
}

// Track which items we've already notified about (session-based)
const notifiedItems = new Set<string>();

/**
 * Get calendar items that are due today
 */
async function getDueTodayContent(userId: string): Promise<CalendarItem[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('content_calendar')
    .select('*')
    .eq('user_id', userId)
    .eq('scheduled_date', today)
    .not('status', 'in', '(completed,published)')
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching due today content:', error);
    return [];
  }

  return data || [];
}

/**
 * Get calendar items that are overdue
 */
async function getOverdueContent(userId: string): Promise<CalendarItem[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('content_calendar')
    .select('*')
    .eq('user_id', userId)
    .lt('scheduled_date', today)
    .not('status', 'in', '(completed,published)')
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching overdue content:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if we've already notified about this item in this session
 */
function hasNotifiedForItem(itemId: string): boolean {
  return notifiedItems.has(itemId);
}

/**
 * Mark item as notified
 */
function markAsNotified(itemId: string): void {
  notifiedItems.add(itemId);
}

/**
 * Create a due content notification with action buttons
 */
async function createDueContentNotification(
  userId: string,
  items: CalendarItem[],
  isOverdue: boolean
): Promise<void> {
  if (items.length === 0) return;

  // Create message showing up to 3 items
  const displayItems = items.slice(0, 3);
  const remaining = items.length - displayItems.length;
  
  const itemTitles = displayItems.map(item => `"${item.title}"`).join(', ');
  const message = remaining > 0 
    ? `${items.length} items: ${itemTitles} and ${remaining} more`
    : `${items.length} item${items.length > 1 ? 's' : ''}: ${itemTitles}`;

  const title = isOverdue ? '⚠️ Overdue Content' : '📝 Content Due Today';
  const priority = isOverdue ? 'urgent' : 'high';

  try {
    await pushEnhancedAlert({
      userId,
      title,
      message,
      priority,
      notificationType: 'warning',
      module: 'content_calendar',
      actionButtons: [
        {
          id: 'generate_content',
          label: 'Generate Content',
          action: 'generate_content',
          variant: 'primary'
        },
        {
          id: 'view_calendar',
          label: 'View Calendar',
          action: 'view_calendar',
          variant: 'secondary'
        }
      ],
      metadata: {
        calendarItems: items.map(item => ({
          id: item.id,
          title: item.title,
          scheduled_date: item.scheduled_date,
          status: item.status,
          notes: item.notes,
          content_type: item.content_type,
          tags: item.tags,
          primary_keyword: item.primary_keyword
        })),
        itemIds: items.map(item => item.id),
        dueType: isOverdue ? 'overdue' : 'due_today',
        dueDate: items[0].scheduled_date
      }
    });

    console.log(`✅ Created ${isOverdue ? 'overdue' : 'due today'} notification for ${items.length} item(s)`);
    
    // Mark all items as notified
    items.forEach(item => markAsNotified(item.id));
  } catch (error) {
    console.error('Error creating due content notification:', error);
  }
}

/**
 * Main function to process and create due content notifications
 */
export async function processDueContentNotifications(userId: string): Promise<void> {
  console.log('🔔 Checking for due content notifications...');

  try {
    // Get due today content
    const dueTodayItems = await getDueTodayContent(userId);
    const newDueTodayItems = dueTodayItems.filter(item => !hasNotifiedForItem(item.id));
    
    if (newDueTodayItems.length > 0) {
      console.log(`📅 Found ${newDueTodayItems.length} new item(s) due today`);
      await createDueContentNotification(userId, newDueTodayItems, false);
    }

    // Get overdue content
    const overdueItems = await getOverdueContent(userId);
    const newOverdueItems = overdueItems.filter(item => !hasNotifiedForItem(item.id));
    
    if (newOverdueItems.length > 0) {
      console.log(`⚠️ Found ${newOverdueItems.length} new overdue item(s)`);
      await createDueContentNotification(userId, newOverdueItems, true);
    }

    if (newDueTodayItems.length === 0 && newOverdueItems.length === 0) {
      console.log('✅ No new due content to notify about');
    }
  } catch (error) {
    console.error('Error processing due content notifications:', error);
  }
}

/**
 * Clear notification tracking (useful for testing)
 */
export function clearNotificationTracking(): void {
  notifiedItems.clear();
  console.log('🧹 Cleared notification tracking');
}
