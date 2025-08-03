
import { supabase } from '@/integrations/supabase/client';

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
  faq_opportunities: Array<{ question: string; answer?: string }>;
  suggested_headings: string[];
  competitor_analysis: CompetitorAnalysis[];
  related_keywords: string[];
  internal_link_opportunities: string[];
  search_intent: string;
  meta_suggestions: {
    title: string;
    description: string;
  };
}

// Basic opportunity brief without circular references
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

// Main Opportunity interface - no circular references
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
  serp_data?: Record<string, any>;
  serp_analysis?: Record<string, any>;
  content_gaps?: any[];
  competitor_analysis?: CompetitorAnalysis[];
  competitive_advantage?: string;
  suggested_title?: string;
  suggested_outline?: string[];
  suggested_headings?: string[];
  faq_opportunities?: Array<{ question: string; answer?: string }>;
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
  content_builder_payload?: ContentBuilderPayload;
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
  metadata?: Record<string, any>;
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
      suggested_headings: Array.isArray(data.suggested_headings) ? data.suggested_headings : [],
      faq_opportunities: Array.isArray(data.faq_opportunities) ? data.faq_opportunities : [],
      related_keywords: Array.isArray(data.related_keywords) ? data.related_keywords : [],
      competitor_analysis: Array.isArray(data.competitor_analysis) ? data.competitor_analysis : [],
      internal_link_opportunities: Array.isArray(data.internal_link_opportunities) ? data.internal_link_opportunities : [],
      serp_data: data.serp_data || {},
      serp_analysis: data.serp_analysis || {}
    };
  }

  private transformBrief(data: any): OpportunityBrief {
    return {
      id: data.id,
      user_id: data.user_id,
      opportunity_id: data.opportunity_id,
      title: data.title,
      content_type: data.content_type,
      introduction: data.introduction,
      outline: Array.isArray(data.outline) ? data.outline : [],
      faq_section: Array.isArray(data.faq_section) ? data.faq_section : [],
      internal_links: Array.isArray(data.internal_links) ? data.internal_links : [],
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      target_word_count: data.target_word_count,
      content_brief: data.content_brief,
      format: data.format,
      ai_model_used: data.ai_model_used,
      generation_prompt: data.generation_prompt,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  private transformSettings(data: any): OpportunityUserSettings {
    return {
      id: data.id,
      user_id: data.user_id,
      scan_frequency: data.scan_frequency || 'daily',
      min_search_volume: data.min_search_volume || 100,
      max_keyword_difficulty: data.max_keyword_difficulty || 70,
      notification_channels: Array.isArray(data.notification_channels) ? data.notification_channels : ['in_app'],
      excluded_keywords: Array.isArray(data.excluded_keywords) ? data.excluded_keywords : [],
      preferred_content_formats: Array.isArray(data.preferred_content_formats) ? data.preferred_content_formats : ['blog', 'guide', 'faq'],
      auto_generate_briefs: data.auto_generate_briefs || false,
      aio_friendly_only: data.aio_friendly_only || false,
      trend_threshold: data.trend_threshold || 5,
      relevance_threshold: data.relevance_threshold || 70,
      is_active: data.is_active !== false
    };
  }

  private transformNotification(data: any): OpportunityNotification {
    return {
      id: data.id,
      user_id: data.user_id,
      opportunity_id: data.opportunity_id,
      notification_type: data.notification_type,
      status: data.status,
      sent_at: data.sent_at,
      read_at: data.read_at,
      dismissed_at: data.dismissed_at,
      metadata: this.safeJsonToRecord(data.metadata),
      created_at: data.created_at
    };
  }

  private safeJsonToRecord(json: any): Record<string, any> {
    if (json === null || json === undefined) {
      return {};
    }
    if (typeof json === 'object' && !Array.isArray(json)) {
      return json as Record<string, any>;
    }
    return {};
  }

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
    return (data || []).map(item => this.transformOpportunity(item));
  }

  async getFilteredOpportunities(filters: {
    status?: string[];
    priority?: string[];
    aioFriendly?: boolean;
    maxDifficulty?: number;
    minVolume?: number;
    searchIntent?: string[];
    hasCompetitorAnalysis?: boolean;
  }): Promise<Opportunity[]> {
    let query = supabase
      .from('content_opportunities')
      .select('*');

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

    if (filters.searchIntent?.length) {
      query = query.in('search_intent', filters.searchIntent);
    }

    if (filters.hasCompetitorAnalysis) {
      query = query.not('competitor_analysis', 'eq', '[]');
    }

    const { data, error } = await query.order('detected_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => this.transformOpportunity(item));
  }

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
    return this.transformOpportunity(data);
  }

  // Separate method to get briefs for an opportunity
  async getBriefsByOpportunityId(opportunityId: string): Promise<OpportunityBrief[]> {
    const { data, error } = await supabase
      .from('opportunity_briefs')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => this.transformBrief(item));
  }

  async getNotifications(): Promise<OpportunityNotification[]> {
    const { data, error } = await supabase
      .from('opportunity_notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => this.transformNotification(item));
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
    return data ? this.transformSettings(data) : null;
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
    return this.transformSettings(data);
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
