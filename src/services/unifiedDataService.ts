
import { supabase } from '@/integrations/supabase/client';
import { contentStrategyService, ContentStrategy, CalendarItem, PipelineItem } from './contentStrategyService';

interface UnifiedContext {
  currentStrategy: ContentStrategy | null;
  solutions: any[];
  contentItems: any[];
  calendarItems: CalendarItem[];
  pipelineItems: PipelineItem[];
  analytics: any;
}

class UnifiedDataService {
  private contextCache: UnifiedContext | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getUserContext(userId: string): Promise<UnifiedContext> {
    const now = Date.now();
    
    // Return cached data if it's fresh
    if (this.contextCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.contextCache;
    }

    try {
      // Fetch all user data in parallel
      const [
        currentStrategy,
        solutions,
        contentItems,
        calendarItems,
        pipelineItems,
        analytics
      ] = await Promise.all([
        contentStrategyService.getActiveStrategy(),
        this.getUserSolutions(userId),
        this.getUserContent(userId),
        contentStrategyService.getCalendarItems(),
        contentStrategyService.getPipelineItems(),
        this.getUserAnalytics(userId)
      ]);

      this.contextCache = {
        currentStrategy,
        solutions,
        contentItems,
        calendarItems,
        pipelineItems,
        analytics
      };

      this.lastFetch = now;
      return this.contextCache;
    } catch (error) {
      console.error('Error fetching unified context:', error);
      return {
        currentStrategy: null,
        solutions: [],
        contentItems: [],
        calendarItems: [],
        pipelineItems: [],
        analytics: null
      };
    }
  }

  private async getUserSolutions(userId: string) {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  private async getUserContent(userId: string) {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return data || [];
  }

  private async getUserAnalytics(userId: string) {
    // Mock analytics - in real app would fetch from analytics service
    return {
      totalContent: 0,
      published: 0,
      inReview: 0,
      totalTraffic: '0',
      averageEngagement: '0%'
    };
  }

  // Navigation helpers for cross-tool workflows
  createContentFromStrategy(strategy: ContentStrategy, keyword?: string) {
    const contentBuilderUrl = '/content-builder';
    const params = new URLSearchParams();
    
    if (keyword) params.set('keyword', keyword);
    if (strategy.target_audience) params.set('audience', strategy.target_audience);
    if (strategy.brand_voice) params.set('voice', strategy.brand_voice);
    params.set('strategy_id', strategy.id);
    
    return `${contentBuilderUrl}?${params.toString()}`;
  }

  async createPipelineFromStrategy(strategyId: string, suggestions: string[]) {
    const pipelineItems = suggestions.map(title => ({
      title,
      stage: 'idea',
      content_type: 'blog',
      priority: 'medium',
      strategy_id: strategyId
    }));

    const promises = pipelineItems.map(item => 
      contentStrategyService.createPipelineItem(item)
    );

    return Promise.all(promises);
  }

  // Clear cache when data changes
  invalidateCache() {
    this.contextCache = null;
    this.lastFetch = 0;
  }
}

export const unifiedDataService = new UnifiedDataService();
