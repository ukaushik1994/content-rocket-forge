
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { getApiKey } from '@/services/apiKeyService';

export interface ContentCluster {
  id: string;
  user_id: string;
  name: string;
  status: 'new' | 'in_progress' | 'published';
  estimated_traffic: number;
  suggested_assets: {
    glossary: number;
    blog: number;
    article: number;
    faq: number;
  };
  timeframe_weeks: number;
  priority_tag: 'quick_win' | 'high_return' | 'evergreen' | 'low_priority';
  description?: string;
  solution_mapping: string[];
  competitor_analysis: any[];
  created_at: string;
  updated_at: string;
}

export interface StrategyLog {
  id: string;
  user_id: string;
  cluster_id?: string;
  action: string;
  metadata: any;
  timestamp: string;
}

export interface ContentStrategy {
  id: string;
  user_id: string;
  name: string;
  monthly_traffic_goal?: number;
  content_pieces_per_month?: number;
  timeline: string;
  main_keyword?: string;
  target_audience?: string;
  brand_voice?: string;
  content_pillars?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarItem {
  id: string;
  user_id: string;
  strategy_id?: string;
  content_id?: string;
  title: string;
  content_type: string;
  status: string;
  scheduled_date: string;
  assigned_to?: string;
  priority: string;
  estimated_hours?: number;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineItem {
  id: string;
  user_id: string;
  strategy_id?: string;
  content_id?: string;
  calendar_item_id?: string;
  title: string;
  stage: string;
  content_type: string;
  target_keyword?: string;
  word_count?: number;
  seo_score?: number;
  progress_percentage?: number;
  due_date?: string;
  assigned_to?: string;
  priority: string;
  blockers?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StrategyInsight {
  id: string;
  user_id: string;
  strategy_id?: string;
  keyword: string;
  search_volume?: number;
  keyword_difficulty?: number;
  competition_score?: number;
  opportunity_score?: number;
  serp_data?: any;
  content_gaps?: any[];
  top_competitors?: any[];
  suggested_content?: any[];
  last_analyzed: string;
  created_at: string;
}

// Helper function to convert Json to string array
const jsonToStringArray = (jsonValue: any): string[] => {
  if (!jsonValue) return [];
  if (Array.isArray(jsonValue)) return jsonValue;
  if (typeof jsonValue === 'string') {
    try {
      const parsed = JSON.parse(jsonValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to convert Json to any array
const jsonToArray = (jsonValue: any): any[] => {
  if (!jsonValue) return [];
  if (Array.isArray(jsonValue)) return jsonValue;
  if (typeof jsonValue === 'string') {
    try {
      const parsed = JSON.parse(jsonValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

class ContentStrategyService {
  // Strategy operations
  async getStrategies(): Promise<ContentStrategy[]> {
    const { data, error } = await supabase
      .from('content_strategies')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      content_pillars: jsonToStringArray(item.content_pillars)
    }));
  }

  async getActiveStrategy(): Promise<ContentStrategy | null> {
    const { data, error } = await supabase
      .from('content_strategies')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    return {
      ...data,
      content_pillars: jsonToStringArray(data.content_pillars)
    };
  }

  async createStrategy(strategy: Partial<ContentStrategy>): Promise<ContentStrategy> {
    // Deactivate other strategies first
    await supabase
      .from('content_strategies')
      .update({ is_active: false })
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('content_strategies')
      .insert({
        user_id: strategy.user_id!,
        name: strategy.name || 'Content Strategy',
        monthly_traffic_goal: strategy.monthly_traffic_goal,
        content_pieces_per_month: strategy.content_pieces_per_month,
        timeline: strategy.timeline || '3 months',
        main_keyword: strategy.main_keyword,
        target_audience: strategy.target_audience,
        brand_voice: strategy.brand_voice,
        content_pillars: strategy.content_pillars || [],
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      content_pillars: jsonToStringArray(data.content_pillars)
    };
  }

  async updateStrategy(id: string, updates: Partial<ContentStrategy>): Promise<ContentStrategy> {
    const { data, error } = await supabase
      .from('content_strategies')
      .update({
        name: updates.name,
        monthly_traffic_goal: updates.monthly_traffic_goal,
        content_pieces_per_month: updates.content_pieces_per_month,
        timeline: updates.timeline,
        main_keyword: updates.main_keyword,
        target_audience: updates.target_audience,
        brand_voice: updates.brand_voice,
        content_pillars: updates.content_pillars || [],
        is_active: updates.is_active
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      content_pillars: jsonToStringArray(data.content_pillars)
    };
  }

  // Calendar operations
  async getCalendarItems(): Promise<CalendarItem[]> {
    const { data, error } = await supabase
      .from('content_calendar')
      .select('*')
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      tags: jsonToStringArray(item.tags)
    }));
  }

  async createCalendarItem(item: Partial<CalendarItem>): Promise<CalendarItem> {
    const { data, error } = await supabase
      .from('content_calendar')
      .insert({
        user_id: item.user_id!,
        strategy_id: item.strategy_id,
        content_id: item.content_id,
        title: item.title!,
        content_type: item.content_type || 'blog',
        status: item.status || 'planning',
        scheduled_date: item.scheduled_date!,
        assigned_to: item.assigned_to,
        priority: item.priority || 'medium',
        estimated_hours: item.estimated_hours || 2,
        tags: item.tags || [],
        notes: item.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      tags: jsonToStringArray(data.tags)
    };
  }

  async updateCalendarItem(id: string, updates: Partial<CalendarItem>): Promise<CalendarItem> {
    const { data, error } = await supabase
      .from('content_calendar')
      .update({
        title: updates.title,
        content_type: updates.content_type,
        status: updates.status,
        scheduled_date: updates.scheduled_date,
        assigned_to: updates.assigned_to,
        priority: updates.priority,
        estimated_hours: updates.estimated_hours,
        tags: updates.tags || [],
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      tags: jsonToStringArray(data.tags)
    };
  }

  async deleteCalendarItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_calendar')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Pipeline operations
  async getPipelineItems(): Promise<PipelineItem[]> {
    const { data, error } = await supabase
      .from('content_pipeline')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      blockers: jsonToStringArray(item.blockers)
    }));
  }

  async createPipelineItem(item: Partial<PipelineItem>): Promise<PipelineItem> {
    const { data, error } = await supabase
      .from('content_pipeline')
      .insert({
        user_id: item.user_id!,
        strategy_id: item.strategy_id,
        content_id: item.content_id,
        calendar_item_id: item.calendar_item_id,
        title: item.title!,
        stage: item.stage || 'idea',
        content_type: item.content_type || 'blog',
        target_keyword: item.target_keyword,
        word_count: item.word_count,
        seo_score: item.seo_score || 0,
        progress_percentage: item.progress_percentage || 0,
        due_date: item.due_date,
        assigned_to: item.assigned_to,
        priority: item.priority || 'medium',
        blockers: item.blockers || [],
        notes: item.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      blockers: jsonToStringArray(data.blockers)
    };
  }

  async updatePipelineItem(id: string, updates: Partial<PipelineItem>): Promise<PipelineItem> {
    const { data, error } = await supabase
      .from('content_pipeline')
      .update({
        title: updates.title,
        stage: updates.stage,
        content_type: updates.content_type,
        target_keyword: updates.target_keyword,
        word_count: updates.word_count,
        seo_score: updates.seo_score,
        progress_percentage: updates.progress_percentage,
        due_date: updates.due_date,
        assigned_to: updates.assigned_to,
        priority: updates.priority,
        blockers: updates.blockers || [],
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      blockers: jsonToStringArray(data.blockers)
    };
  }

  async deletePipelineItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_pipeline')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Insights operations
  async getInsights(): Promise<StrategyInsight[]> {
    const { data, error } = await supabase
      .from('strategy_insights')
      .select('*')
      .order('last_analyzed', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      content_gaps: jsonToArray(item.content_gaps),
      top_competitors: jsonToArray(item.top_competitors),
      suggested_content: jsonToArray(item.suggested_content)
    }));
  }

  async saveInsight(insight: Partial<StrategyInsight>): Promise<StrategyInsight> {
    const { data, error } = await supabase
      .from('strategy_insights')
      .insert({
        user_id: insight.user_id!,
        strategy_id: insight.strategy_id,
        keyword: insight.keyword!,
        search_volume: insight.search_volume,
        keyword_difficulty: insight.keyword_difficulty,
        competition_score: insight.competition_score,
        opportunity_score: insight.opportunity_score,
        serp_data: insight.serp_data || {},
        content_gaps: insight.content_gaps || [],
        top_competitors: insight.top_competitors || [],
        suggested_content: insight.suggested_content || [],
        last_analyzed: insight.last_analyzed || new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      content_gaps: jsonToArray(data.content_gaps),
      top_competitors: jsonToArray(data.top_competitors),
      suggested_content: jsonToArray(data.suggested_content)
    };
  }

  // SERP Analysis
  async analyzeSERP(keyword: string, location = 'United States'): Promise<any> {
    try {
      const result = await analyzeKeywordSerp(keyword);
      if (!result) throw new Error('No SERP data');
      return result;
    } catch (error) {
      console.error('SERP analysis error:', error);
      throw error;
    }
  }

  // Content Strategy Engine operations
  async generateStrategyBlueprint(): Promise<{ clusters: ContentCluster[]; message: string }> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('content-strategy-engine', {
      body: {
        action: 'generate_strategy_blueprint',
        user_id: user.id
      }
    });

    if (error) throw error;
    return data;
  }

  async getContentClusters(): Promise<ContentCluster[]> {
    const { data, error } = await supabase
      .from('content_clusters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ContentCluster[];
  }

  async updateClusterStatus(clusterId: string, status: string): Promise<ContentCluster> {
    const { data, error } = await supabase
      .from('content_clusters')
      .update({ status })
      .eq('id', clusterId)
      .select()
      .single();

    if (error) throw error;
    return data as ContentCluster;
  }

  async refreshClusters(): Promise<{ message: string; clusters_updated: number }> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('content-strategy-engine', {
      body: {
        action: 'refresh_clusters',
        user_id: user.id
      }
    });

    if (error) throw error;
    return data;
  }

  async sendToContentBuilder(clusterId: string): Promise<{ payload: any; redirect_url: string }> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('content-strategy-engine', {
      body: {
        action: 'send_to_content_builder',
        cluster_id: clusterId,
        user_id: user.id
      }
    });

    if (error) throw error;
    return data;
  }

  async deleteCluster(clusterId: string): Promise<void> {
    const { error } = await supabase
      .from('content_clusters')
      .delete()
      .eq('id', clusterId);

    if (error) throw error;
  }

  async getStrategyLogs(clusterId?: string): Promise<StrategyLog[]> {
    let query = supabase
      .from('strategy_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (clusterId) {
      query = query.eq('cluster_id', clusterId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as StrategyLog[];
  }

  getPriorityTagColor(tag: string): string {
    switch (tag) {
      case 'quick_win':
        return 'text-primary bg-primary/10 border-border';
      case 'high_return':
        return 'text-foreground bg-muted/30 border-border';
      case 'evergreen':
        return 'text-muted-foreground bg-muted/50 border-border';
      case 'low_priority':
        return 'text-muted-foreground bg-muted/30 border-border';
      default:
        return 'text-muted-foreground bg-muted/30 border-border';
    }
  }

  getPriorityTagLabel(tag: string): string {
    switch (tag) {
      case 'quick_win':
        return '🔥 Quick Win';
      case 'high_return':
        return '🚀 High Return';
      case 'evergreen':
        return '🌲 Evergreen';
      case 'low_priority':
        return '🛑 Low Priority';
      default:
        return tag;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'new':
        return 'text-primary bg-primary/10';
      case 'in_progress':
        return 'text-foreground bg-muted/30';
      case 'published':
        return 'text-foreground bg-muted/20';
      default:
        return 'text-muted-foreground bg-muted/30';
    }
  }

  // AI-first strategy proposals using the content-strategy-engine function
  async generateAIStrategy(params?: { goals?: any; location?: string }): Promise<{ proposals: any[]; message: string }> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    console.log('🚀 Generating AI strategy with params:', params);

    // Get user's API keys
    const openaiKey = await getApiKey('openai');
    const serpKey = await getApiKey('serp');

    // Check for required API keys
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured. Please add your OpenAI API key in Settings > API Settings.');
    }

    if (!serpKey) {
      throw new Error('SERP API key not configured. Please add your SERP API key in Settings > API Settings.');
    }

    const { data, error } = await supabase.functions.invoke('content-strategy-engine', {
      body: {
        action: 'generate_ai_strategy',
        user_id: user.id,
        goals: params?.goals || {},
        location: params?.location || 'United States',
        api_keys: {
          openai: openaiKey,
          serp: serpKey
        }
      }
    });

    if (error) {
      console.error('❌ Strategy generation error:', error);
      throw new Error(`Strategy generation failed: ${error.message || 'Unknown error'}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Strategy generation failed');
    }

    console.log('✅ Strategy generation completed:', data);

    return {
      proposals: data.proposals || [],
      message: data.message || `Generated ${(data.proposals || []).length} strategy proposals`
    };
  }
}

export const contentStrategyService = new ContentStrategyService();
