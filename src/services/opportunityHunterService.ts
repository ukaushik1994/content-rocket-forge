import { supabase } from '@/integrations/supabase/client';

// Simple interfaces without complex nested types
export interface CompetitorAnalysis {
  competitor_name: string;
  competitor_url: string;
  ranking_position: number;
  content_gaps: string[];
  weaknesses: string[];
  competitive_advantage: string;
}

export interface ContentBuilderPayload {
  keyword: string;
  suggested_format: string;
  format_reason: string;
  title_suggestions: string[];
  faq_opportunities: any[];
  suggested_headings: string[];
  competitor_analysis: any[];
  related_keywords: string[];
  internal_link_opportunities: string[];
  search_intent: string;
  meta_suggestions: {
    title: string;
    description: string;
  };
}

export interface OpportunityBrief {
  id: string;
  user_id: string;
  opportunity_id: string;
  title: string;
  content_type?: string;
  introduction?: string;
  outline?: string[];
  faq_section?: any[];
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
  content_format_reason?: string;
  status: string;
  source?: string;
  serp_data?: any;
  serp_analysis?: any;
  content_gaps?: any[];
  competitor_analysis?: any[];
  competitive_advantage?: string;
  suggested_title?: string;
  suggested_outline?: string[];
  suggested_headings?: string[];
  faq_opportunities?: any[];
  related_keywords?: string[];
  internal_link_opportunities?: string[];
  is_aio_friendly?: boolean;
  aio_score?: number;
  trend_direction?: string;
  priority: string;
  search_intent?: string;
  detected_at: string;
  last_updated: string;
  expires_at?: string;
  assigned_to?: string;
  notes?: string;
  routed_to_content_builder?: boolean;
  content_builder_payload?: any;
  routed_at?: string;
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
  // Public method - simple scan wrapper
  async scanOpportunities(userId?: string): Promise<{ message: string; opportunities: Opportunity[] }> {
    return this.scanOpportunitiesWithCompetitorIntelligence(userId);
  }

  // Enhanced scan with competitor intelligence
  async scanOpportunitiesWithCompetitorIntelligence(userId?: string): Promise<{ message: string; opportunities: Opportunity[] }> {
    const { data, error } = await supabase.functions.invoke('enhanced-opportunity-hunter', {
      body: {
        action: 'enhanced_scan_opportunities',
        userId,
        include_competitor_analysis: true
      }
    });

    if (error) throw error;
    return data;
  }

  // Public method - simple brief generation wrapper
  async generateBrief(opportunityId: string): Promise<OpportunityBrief> {
    return this.generateEnhancedBrief(opportunityId);
  }

  // Enhanced brief generation with competitor context
  async generateEnhancedBrief(opportunityId: string): Promise<OpportunityBrief> {
    const { data, error } = await supabase.functions.invoke('generate-enhanced-content-brief', {
      body: {
        opportunityId,
        includeCompetitorAnalysis: true,
        includeSemanticKeywords: true
      }
    });

    if (error) throw error;
    return data.brief;
  }

  async analyzeCompetitors(opportunityId: string): Promise<CompetitorAnalysis[]> {
    const { data, error } = await supabase.functions.invoke('competitor-analyzer', {
      body: {
        opportunityId
      }
    });

    if (error) throw error;
    return data.competitor_analysis || [];
  }

  async generateContentBuilderPayload(opportunityId: string): Promise<ContentBuilderPayload> {
    const opportunity = await this.getOpportunityById(opportunityId);
    if (!opportunity) throw new Error('Opportunity not found');

    const payload: ContentBuilderPayload = {
      keyword: opportunity.keyword,
      suggested_format: opportunity.content_format || 'blog',
      format_reason: opportunity.content_format_reason || 'Based on search intent analysis',
      title_suggestions: [
        opportunity.suggested_title || `Complete Guide to ${opportunity.keyword}`,
        `How to ${opportunity.keyword}: A Step-by-Step Guide`,
        `${opportunity.keyword}: Everything You Need to Know`,
        `The Ultimate ${opportunity.keyword} Guide for 2024`
      ],
      faq_opportunities: opportunity.faq_opportunities || [],
      suggested_headings: opportunity.suggested_headings || [
        `What is ${opportunity.keyword}?`,
        `Benefits of ${opportunity.keyword}`,
        `How to implement ${opportunity.keyword}`,
        'Best practices and tips',
        'Common mistakes to avoid',
        'Conclusion'
      ],
      competitor_analysis: opportunity.competitor_analysis || [],
      related_keywords: opportunity.related_keywords || [],
      internal_link_opportunities: opportunity.internal_link_opportunities || [],
      search_intent: opportunity.search_intent || 'informational',
      meta_suggestions: {
        title: `${opportunity.keyword} - Complete Guide | Your Brand`,
        description: `Learn everything about ${opportunity.keyword}. Expert tips, best practices, and actionable insights. Read our comprehensive guide now.`
      }
    };

    await this.updateOpportunity(opportunityId, {
      content_builder_payload: payload,
      routed_to_content_builder: true,
      routed_at: new Date().toISOString()
    });

    return payload;
  }

  async routeToContentBuilder(opportunityId: string): Promise<string> {
    const payload = await this.generateContentBuilderPayload(opportunityId);
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('contentBuilderPayload', JSON.stringify({
        source: 'opportunity_hunter',
        opportunityId,
        payload
      }));
    }

    return `/content/builder?source=opportunity&id=${opportunityId}`;
  }

  async getOpportunities(): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('content_opportunities')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Opportunity[];
  }

  async getFilteredOpportunities(filters: any): Promise<any[]> {
    const { data, error } = await supabase
      .from('content_opportunities')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return (data || []);
  }

  async updateOpportunity(opportunityId: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('content_opportunities')
      .update(updates)
      .eq('id', opportunityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkDuplicateOpportunity(keyword: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('content_opportunities')
      .select('id')
      .ilike('keyword', keyword)
      .in('status', ['new', 'assigned', 'in_progress'])
      .limit(1);

    if (error) throw error;
    return (data || []).length > 0;
  }

  async getOpportunityById(opportunityId: string): Promise<Opportunity | null> {
    const { data, error } = await supabase
      .from('content_opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();

    if (error) return null;
    return data as unknown as Opportunity;
  }

  async getBriefsByOpportunityId(opportunityId: string): Promise<OpportunityBrief[]> {
    const { data, error } = await supabase
      .from('opportunity_briefs')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as OpportunityBrief[];
  }

  async getNotifications(): Promise<OpportunityNotification[]> {
    const { data, error } = await supabase
      .from('opportunity_notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as OpportunityNotification[];
  }

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

  async getSettings(): Promise<OpportunityUserSettings | null> {
    const { data, error } = await supabase
      .from('user_opportunity_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as OpportunityUserSettings | null;
  }

  async updateSettings(settings: Partial<OpportunityUserSettings>): Promise<OpportunityUserSettings> {
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
    return data as OpportunityUserSettings;
  }

  async deleteOpportunity(opportunityId: string): Promise<void> {
    const { error } = await supabase
      .from('content_opportunities')
      .delete()
      .eq('id', opportunityId);

    if (error) throw error;
  }

  async assignOpportunity(opportunityId: string, assignedTo: string): Promise<Opportunity> {
    return this.updateOpportunity(opportunityId, { 
      assigned_to: assignedTo,
      status: 'assigned'
    });
  }

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

    await this.updateOpportunity(opportunityId, { status: 'scheduled' });
  }
}

export const opportunityHunterService = new OpportunityHunterService();