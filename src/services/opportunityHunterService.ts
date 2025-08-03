
import { supabase } from '@/integrations/supabase/client';

export interface Opportunity {
  id: string;
  user_id: string;
  strategy_id?: string;
  keyword: string;
  search_volume?: number;
  keyword_difficulty?: number;
  competition_score?: number;
  opportunity_score?: number;
  relevance_score?: number;
  content_format?: string;
  status: string;
  source?: string;
  serp_data?: any;
  content_gaps?: any[];
  suggested_title?: string;
  suggested_outline?: string[];
  internal_link_opportunities?: any[];
  is_aio_friendly?: boolean;
  trend_direction?: string;
  priority: string;
  detected_at: string;
  last_updated: string;
  expires_at?: string;
  assigned_to?: string;
  notes?: string;
  opportunity_briefs?: OpportunityBrief[];
}

export interface OpportunityBrief {
  id: string;
  user_id: string;
  opportunity_id: string;
  title: string;
  content_type?: string;
  introduction?: string;
  outline?: string[];
  faq_section?: Array<{ question: string; answer: string }>;
  internal_links?: string[];
  meta_title?: string;
  meta_description?: string;
  target_word_count?: number;
  content_brief?: string;
  format: string;
  ai_model_used?: string;
  generation_prompt?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OpportunityNotification {
  id: string;
  user_id: string;
  opportunity_id: string;
  notification_type: string;
  status: string;
  sent_at?: string;
  read_at?: string;
  dismissed_at?: string;
  metadata?: any;
  created_at: string;
}

export interface OpportunityUserSettings {
  id?: string;
  user_id: string;
  scan_frequency: string;
  min_search_volume: number;
  max_keyword_difficulty: number;
  notification_channels: string[];
  excluded_keywords: string[];
  preferred_content_formats: string[];
  auto_generate_briefs: boolean;
  aio_friendly_only: boolean;
  trend_threshold: number;
  relevance_threshold: number;
  is_active: boolean;
}

class OpportunityHunterService {
  private transformOpportunity(data: any): Opportunity {
    return {
      ...data,
      content_gaps: Array.isArray(data.content_gaps) ? data.content_gaps : [],
      suggested_outline: Array.isArray(data.suggested_outline) ? data.suggested_outline : [],
      internal_link_opportunities: Array.isArray(data.internal_link_opportunities) ? data.internal_link_opportunities : [],
      serp_data: data.serp_data || {},
      opportunity_briefs: data.opportunity_briefs || []
    };
  }

  private transformSettings(data: any): OpportunityUserSettings {
    return {
      ...data,
      notification_channels: Array.isArray(data.notification_channels) ? data.notification_channels : ['in_app'],
      excluded_keywords: Array.isArray(data.excluded_keywords) ? data.excluded_keywords : [],
      preferred_content_formats: Array.isArray(data.preferred_content_formats) ? data.preferred_content_formats : ['blog', 'guide', 'faq']
    };
  }

  // Scan for new opportunities
  async scanOpportunities(userId?: string): Promise<{ message: string; opportunities: Opportunity[] }> {
    const { data, error } = await supabase.functions.invoke('opportunity-hunter', {
      body: {
        action: 'scan_opportunities',
        userId
      }
    });

    if (error) throw error;
    return data;
  }

  // Get all opportunities for user
  async getOpportunities(): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('content_opportunities')
      .select(`
        *,
        opportunity_briefs (*)
      `)
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => this.transformOpportunity(item));
  }

  // Get opportunities with filters
  async getFilteredOpportunities(filters: {
    status?: string[];
    priority?: string[];
    aioFriendly?: boolean;
    maxDifficulty?: number;
    minVolume?: number;
  }): Promise<Opportunity[]> {
    let query = supabase
      .from('content_opportunities')
      .select(`
        *,
        opportunity_briefs (*)
      `);

    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters.priority?.length) {
      query = query.in('priority', filters.priority);
    }

    if (filters.aioFriendly !== undefined) {
      query = query.eq('is_aio_friendly', filters.aioFriendly);
    }

    if (filters.maxDifficulty) {
      query = query.lte('keyword_difficulty', filters.maxDifficulty);
    }

    if (filters.minVolume) {
      query = query.gte('search_volume', filters.minVolume);
    }

    const { data, error } = await query.order('detected_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => this.transformOpportunity(item));
  }

  // Update opportunity status
  async updateOpportunity(opportunityId: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    const { data, error } = await supabase
      .from('content_opportunities')
      .update(updates)
      .eq('id', opportunityId)
      .select()
      .single();

    if (error) throw error;
    return this.transformOpportunity(data);
  }

  // Generate content brief for opportunity
  async generateBrief(opportunityId: string): Promise<OpportunityBrief> {
    const { data, error } = await supabase.functions.invoke('generate-content-brief', {
      body: {
        opportunityId
      }
    });

    if (error) throw error;
    return data.brief;
  }

  // Get notifications for user
  async getNotifications(): Promise<OpportunityNotification[]> {
    const { data, error } = await supabase
      .from('opportunity_notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('opportunity_notifications')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Dismiss notification
  async dismissNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('opportunity_notifications')
      .update({
        status: 'dismissed',
        dismissed_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Get user opportunity settings
  async getSettings(): Promise<OpportunityUserSettings | null> {
    const { data, error } = await supabase
      .from('user_opportunity_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.transformSettings(data) : null;
  }

  // Update user opportunity settings
  async updateSettings(settings: Partial<OpportunityUserSettings>): Promise<OpportunityUserSettings> {
    // Ensure user_id is always present for upsert
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const settingsWithUserId = {
      ...settings,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('user_opportunity_settings')
      .upsert(settingsWithUserId)
      .select()
      .single();

    if (error) throw error;
    return this.transformSettings(data);
  }

  // Delete opportunity
  async deleteOpportunity(opportunityId: string): Promise<void> {
    const { error } = await supabase
      .from('content_opportunities')
      .delete()
      .eq('id', opportunityId);

    if (error) throw error;
  }

  // Assign opportunity to user
  async assignOpportunity(opportunityId: string, assignedTo: string): Promise<Opportunity> {
    return this.updateOpportunity(opportunityId, { 
      assigned_to: assignedTo,
      status: 'assigned'
    });
  }

  // Add to content calendar
  async addToCalendar(opportunityId: string, scheduledDate: string): Promise<void> {
    const opportunity = await this.getOpportunityById(opportunityId);
    
    if (!opportunity) throw new Error('Opportunity not found');

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('content_calendar')
      .insert({
        user_id: user.id,
        strategy_id: opportunity.strategy_id,
        title: opportunity.suggested_title || opportunity.keyword,
        content_type: opportunity.content_format || 'blog',
        status: 'planning',
        scheduled_date: scheduledDate,
        priority: opportunity.priority,
        tags: [opportunity.keyword],
        notes: `Generated from opportunity: ${opportunity.keyword}`
      });

    if (error) throw error;

    // Update opportunity status
    await this.updateOpportunity(opportunityId, { status: 'scheduled' });
  }

  // Get single opportunity by ID
  private async getOpportunityById(opportunityId: string): Promise<Opportunity | null> {
    const { data, error } = await supabase
      .from('content_opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();

    if (error) return null;
    return this.transformOpportunity(data);
  }
}

export const opportunityHunterService = new OpportunityHunterService();
