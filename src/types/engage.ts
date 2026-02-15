export interface EngageContact {
  id: string;
  workspace_id: string;
  email: string;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  tags: string[];
  attributes: Record<string, any>;
  unsubscribed: boolean;
  unsubscribed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngageEvent {
  id: string;
  workspace_id: string;
  contact_id: string;
  type: string;
  payload: Record<string, any>;
  occurred_at: string;
}

export interface EngageSegment {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  definition: SegmentDefinition;
  created_at: string;
  updated_at: string;
}

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'includes' | 'not_equals';
  value: string;
}

export interface SegmentDefinition {
  match: 'all' | 'any';
  rules: SegmentRule[];
}

export interface SegmentMembership {
  id: string;
  workspace_id: string;
  segment_id: string;
  contact_id: string;
  computed_at: string;
}

export interface EmailTemplate {
  id: string;
  workspace_id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  workspace_id: string;
  name: string;
  template_id?: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'complete' | 'failed';
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  audience_definition: Record<string, any>;
  stats: CampaignStats;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

export interface EmailMessage {
  id: string;
  workspace_id: string;
  campaign_id?: string | null;
  contact_id?: string | null;
  to_email: string;
  subject: string;
  body_html: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  provider_message_id?: string | null;
  error?: string | null;
  queued_at: string;
  sent_at?: string | null;
}

export interface EmailProviderSettings {
  id: string;
  workspace_id: string;
  provider: 'resend' | 'smtp';
  config: Record<string, any>;
  from_name: string;
  from_email: string;
  reply_to: string;
  created_at: string;
  updated_at: string;
}

export interface Journey {
  id: string;
  workspace_id: string;
  name: string;
  status: 'draft' | 'active' | 'paused';
  trigger_config: Record<string, any>;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JourneyNode {
  id: string;
  workspace_id: string;
  journey_id: string;
  node_id: string;
  type: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface JourneyEdge {
  id: string;
  workspace_id: string;
  journey_id: string;
  source_node_id: string;
  target_node_id: string;
  condition_label?: string | null;
}

export interface JourneyEnrollment {
  id: string;
  workspace_id: string;
  journey_id: string;
  contact_id: string;
  status: 'active' | 'completed' | 'exited';
  enrolled_at: string;
  updated_at: string;
}

export interface JourneyStep {
  id: string;
  workspace_id: string;
  enrollment_id: string;
  node_id: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  scheduled_for: string;
  executed_at?: string | null;
  output: Record<string, any>;
  error?: string | null;
}

export interface EngageAutomation {
  id: string;
  workspace_id: string;
  name: string;
  status: 'active' | 'paused';
  trigger_config: Record<string, any>;
  conditions: Record<string, any>;
  actions: any[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  workspace_id: string;
  provider: string;
  display_name: string;
  auth_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  workspace_id: string;
  content: string;
  media_urls: string[];
  scheduled_at?: string | null;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialPostTarget {
  id: string;
  workspace_id: string;
  post_id: string;
  provider: string;
  account_id?: string | null;
  status: 'scheduled' | 'posted' | 'failed';
  provider_post_id?: string | null;
  error?: string | null;
}

export interface EngageActivityLog {
  id: string;
  workspace_id: string;
  contact_id?: string | null;
  channel: string;
  type: string;
  message: string;
  payload: Record<string, any>;
  created_at: string;
  created_by?: string | null;
}

export type EngageTab = 'email' | 'journeys' | 'automations' | 'social' | 'contacts' | 'activity';
