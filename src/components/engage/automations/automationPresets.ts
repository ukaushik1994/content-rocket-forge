export interface AutomationPreset {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  category: string;
  trigger_type: string;
  trigger_value: string;
  actions: { type: string; config: Record<string, string> }[];
}

export const automationPresets: AutomationPreset[] = [
  {
    id: 'welcome-series',
    name: 'Welcome Series',
    description: 'Send a welcome email and tag new contacts',
    icon: 'UserPlus',
    category: 'Onboarding',
    trigger_type: 'contact_created',
    trigger_value: '',
    actions: [
      { type: 'send_email', config: {} },
      { type: 'add_tag', config: { tag: 'welcomed' } },
    ],
  },
  {
    id: 're-engagement',
    name: 'Re-engagement',
    description: 'Reach out to contacts entering an inactive segment',
    icon: 'RefreshCw',
    category: 'Retention',
    trigger_type: 'segment_entry',
    trigger_value: '',
    actions: [
      { type: 'send_email', config: {} },
    ],
  },
  {
    id: 'tag-nurture',
    name: 'Tag-based Nurture',
    description: 'Wait then nurture contacts tagged as leads',
    icon: 'Tag',
    category: 'Nurture',
    trigger_type: 'tag_added',
    trigger_value: 'lead',
    actions: [
      { type: 'wait', config: { duration: '1', unit: 'days' } },
      { type: 'send_email', config: {} },
    ],
  },
  {
    id: 'event-followup',
    name: 'Event Follow-up',
    description: 'Send email and fire webhook on a custom event',
    icon: 'Zap',
    category: 'Transactional',
    trigger_type: 'event_occurred',
    trigger_value: 'purchase_completed',
    actions: [
      { type: 'send_email', config: {} },
      { type: 'webhook', config: { url: '' } },
    ],
  },
  {
    id: 'vip-upgrade',
    name: 'VIP Upgrade',
    description: 'Upgrade contacts tagged VIP and enroll in journey',
    icon: 'Crown',
    category: 'Loyalty',
    trigger_type: 'tag_added',
    trigger_value: 'vip',
    actions: [
      { type: 'update_field', config: { field: 'tier', value: 'premium' } },
      { type: 'enroll_journey', config: {} },
    ],
  },
  {
    id: 'churn-prevention',
    name: 'Churn Prevention',
    description: 'Engage at-risk contacts with retention emails',
    icon: 'ShieldAlert',
    category: 'Retention',
    trigger_type: 'segment_entry',
    trigger_value: '',
    actions: [
      { type: 'send_email', config: {} },
      { type: 'add_tag', config: { tag: 'retention' } },
    ],
  },
];
