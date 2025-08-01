
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

class ContentStrategyService {
  // Strategy operations
  async getStrategies(): Promise<ContentStrategy[]> {
    const { data, error } = await supabase
      .from('content_strategies')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getActiveStrategy(): Promise<ContentStrategy | null> {
    const { data, error } = await supabase
      .from('content_strategies')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
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
        ...strategy,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateStrategy(id: string, updates: Partial<ContentStrategy>): Promise<ContentStrategy> {
    const { data, error } = await supabase
      .from('content_strategies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Calendar operations
  async getCalendarItems(): Promise<CalendarItem[]> {
    const { data, error } = await supabase
      .from('content_calendar')
      .select('*')
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createCalendarItem(item: Partial<CalendarItem>): Promise<CalendarItem> {
    const { data, error } = await supabase
      .from('content_calendar')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCalendarItem(id: string, updates: Partial<CalendarItem>): Promise<CalendarItem> {
    const { data, error } = await supabase
      .from('content_calendar')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
    return data || [];
  }

  async createPipelineItem(item: Partial<PipelineItem>): Promise<PipelineItem> {
    const { data, error } = await supabase
      .from('content_pipeline')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePipelineItem(id: string, updates: Partial<PipelineItem>): Promise<PipelineItem> {
    const { data, error } = await supabase
      .from('content_pipeline')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
    return data || [];
  }

  async saveInsight(insight: Partial<StrategyInsight>): Promise<StrategyInsight> {
    const { data, error } = await supabase
      .from('strategy_insights')
      .insert(insight)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // SERP Analysis
  async analyzeSERP(keyword: string, location = 'United States'): Promise<any> {
    try {
      const response = await fetch('/api/serp-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          location,
          language: 'en'
        }),
      });
      
      if (!response.ok) {
        throw new Error('SERP analysis failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('SERP analysis error:', error);
      // Return mock data for development
      return {
        searchVolume: Math.floor(Math.random() * 50000) + 5000,
        keywordDifficulty: Math.floor(Math.random() * 70) + 20,
        competitionScore: Math.random() * 0.8 + 0.1,
        cpc: Math.random() * 3 + 0.5,
        topResults: Array(5).fill(null).map((_, i) => ({
          position: i + 1,
          title: `Top Result ${i + 1} for "${keyword}"`,
          url: `https://example${i + 1}.com`,
          snippet: `High-quality content about ${keyword} with detailed information...`
        })),
        isMockData: true
      };
    }
  }
}

export const contentStrategyService = new ContentStrategyService();
