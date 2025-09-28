import { supabase } from '@/integrations/supabase/client';
import { keywordLibraryService, UnifiedKeyword } from './keywordLibraryService';
import { contentStrategyService } from './contentStrategyService';
import { toast } from 'sonner';

interface StrategyKeywordIntegration {
  id: string;
  strategy_id: string;
  keyword_id: string;
  priority: 'high' | 'medium' | 'low';
  target_position?: number;
  content_gap_score?: number;
  created_at: string;
}

interface KeywordOpportunity {
  keyword: UnifiedKeyword;
  opportunityScore: number;
  competitionGap: number;
  volumeToEffortRatio: number;
  reasoning: string;
  recommendedContentType: string;
}

interface ContentGapAnalysis {
  totalKeywords: number;
  coveredKeywords: number;
  gapKeywords: UnifiedKeyword[];
  opportunityScore: number;
  recommendations: string[];
}

class KeywordStrategyBridge {
  // Add keywords to current strategy
  async addKeywordsToStrategy(keywordIds: string[], strategyId: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const integrations = keywordIds.map(keywordId => ({
        strategy_id: strategyId,
        keyword_id: keywordId,
        priority,
        user_id: user.id
      }));

      // Use direct insert instead of RPC
      for (const integration of integrations) {
        const { error: insertError } = await supabase
          .from('unified_keywords')
          .update({ 
            notes: `Added to strategy ${strategyId} with ${priority} priority`,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', integration.keyword_id);
        
        if (insertError) {
          console.error('Error updating keyword:', insertError);
        }
      }

      // Track usage for each keyword
      for (const keywordId of keywordIds) {
        await keywordLibraryService.trackKeywordUsage(
          keywordId,
          strategyId,
          'strategy',
          'primary'
        );
      }

      toast.success(`${keywordIds.length} keyword(s) added to strategy`);
      return true;
    } catch (error) {
      console.error('Error adding keywords to strategy:', error);
      
      // Fallback: simple insert without RPC
      try {
        const simpleInserts = keywordIds.map(async keywordId => {
          const { error: insertError } = await supabase
            .from('unified_keywords')
            .update({ 
              notes: `Added to strategy ${strategyId}`,
              last_updated_at: new Date().toISOString()
            })
            .eq('id', keywordId);
          
          if (!insertError) {
            await keywordLibraryService.trackKeywordUsage(keywordId, strategyId, 'strategy', 'primary');
          }
        });
        
        await Promise.all(simpleInserts);
        toast.success(`${keywordIds.length} keyword(s) added to strategy (simplified)`);
        return true;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        toast.error('Failed to add keywords to strategy');
        return false;
      }
    }
  }

  // Get keyword recommendations based on current strategy
  async getKeywordRecommendations(strategyId: string, limit = 10): Promise<KeywordOpportunity[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get all available keywords first
      const { keywords: allKeywords } = await keywordLibraryService.getKeywords({}, 1, 100);

      // For now, just return recommendations based on keyword metrics
      // since the strategy integration table might not have data yet
      const opportunities: KeywordOpportunity[] = allKeywords
        .map(keyword => this.calculateOpportunityScore(keyword))
        .sort((a, b) => b.opportunityScore - a.opportunityScore)
        .slice(0, limit);

      return opportunities;
    } catch (error) {
      console.error('Error getting keyword recommendations:', error);
      return [];
    }
  }

  // Analyze content gaps in current strategy
  async analyzeContentGaps(strategyId: string): Promise<ContentGapAnalysis> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get all keywords for simplified analysis
      const { keywords: allKeywords } = await keywordLibraryService.getKeywords({}, 1, 50);
      
      // Get content items for this user
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id, title, keywords')
        .eq('user_id', user.id);

      const totalKeywords = allKeywords.length;
      const contentKeywords = new Set();
      
      // Extract keywords from existing content
      contentItems?.forEach(item => {
        if (item.keywords && Array.isArray(item.keywords)) {
          item.keywords.forEach((k: string) => contentKeywords.add(k.toLowerCase()));
        }
      });

      // Find gap keywords (keywords not covered in content)
      const gapKeywords = allKeywords.filter(keyword => 
        !contentKeywords.has(keyword.keyword.toLowerCase())
      );

      const coveredKeywords = totalKeywords - gapKeywords.length;
      const opportunityScore = totalKeywords > 0 ? Math.round((gapKeywords.length / totalKeywords) * 100) : 0;

      const recommendations = this.generateGapRecommendations(gapKeywords);

      return {
        totalKeywords,
        coveredKeywords,
        gapKeywords,
        opportunityScore,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing content gaps:', error);
      return {
        totalKeywords: 0,
        coveredKeywords: 0,
        gapKeywords: [],
        opportunityScore: 0,
        recommendations: []
      };
    }
  }

  // Create content proposals from high-opportunity keywords
  async createContentProposalsFromKeywords(keywordIds: string[]): Promise<any[]> {
    try {
      const { data: keywords } = await supabase
        .from('unified_keywords')
        .select('*')
        .in('id', keywordIds);

      if (!keywords) return [];

      const proposals = keywords.map(keyword => ({
        id: `keyword-proposal-${keyword.id}`,
        title: this.generateContentTitle(keyword),
        primary_keyword: keyword.keyword,
        estimated_impressions: keyword.search_volume || 1000,
        priority_tag: this.calculatePriorityTag(keyword),
        content_type: this.recommendContentType(keyword),
        description: `Content proposal based on keyword: ${keyword.keyword}`,
        related_keywords: [],
        content_suggestions: [
          `How to guide for ${keyword.keyword}`,
          `Best practices for ${keyword.keyword}`,
          `Complete guide to ${keyword.keyword}`
        ],
        serp_data: {
          difficulty: keyword.difficulty,
          competition: keyword.competition_score,
          intent: keyword.intent
        }
      }));

      return proposals;
    } catch (error) {
      console.error('Error creating content proposals from keywords:', error);
      return [];
    }
  }

  // Generate keyword-driven calendar suggestions
  async generateSeasonalCalendarSuggestions(strategyId: string): Promise<any[]> {
    try {
      // Get seasonal keywords from all keywords
      const { keywords: allKeywords } = await keywordLibraryService.getKeywords({ 
        seasonality: true 
      } as any, 1, 10);

      const suggestions = allKeywords
        .filter(keyword => keyword.seasonality)
        .map(keyword => ({
          id: `seasonal-${keyword.id}`,
          title: `Seasonal content for ${keyword.keyword}`,
          suggested_date: this.calculateOptimalPublishDate(keyword),
          content_type: 'blog',
          priority: 'high',
          reasoning: `Seasonal keyword with high search volume during specific periods`,
          keyword_focus: keyword.keyword
        }));

      return suggestions;
    } catch (error) {
      console.error('Error generating seasonal calendar suggestions:', error);
      return [];
    }
  }

  private calculateOpportunityScore(keyword: UnifiedKeyword): KeywordOpportunity {
    const volume = keyword.search_volume || 0;
    const difficulty = keyword.difficulty || 50;
    const competition = keyword.competition_score || 50;

    // Calculate opportunity score (higher volume, lower difficulty = better opportunity)
    const volumeScore = Math.min(volume / 1000, 100);
    const difficultyScore = Math.max(0, 100 - difficulty);
    const competitionScore = Math.max(0, 100 - competition);
    
    const opportunityScore = Math.round((volumeScore * 0.4 + difficultyScore * 0.35 + competitionScore * 0.25));
    const competitionGap = Math.max(0, 100 - competition);
    const volumeToEffortRatio = volume > 0 && difficulty > 0 ? Math.round(volume / difficulty) : 0;

    let reasoning = 'Standard opportunity';
    if (opportunityScore > 80) reasoning = 'High potential - good volume with low competition';
    else if (opportunityScore > 60) reasoning = 'Medium potential - balanced volume and competition';
    else reasoning = 'Lower potential - high competition or low volume';

    return {
      keyword,
      opportunityScore,
      competitionGap,
      volumeToEffortRatio,
      reasoning,
      recommendedContentType: this.recommendContentType(keyword)
    };
  }

  private recommendContentType(keyword: UnifiedKeyword): string {
    const intent = keyword.intent?.toLowerCase() || '';
    
    if (intent.includes('how') || intent.includes('guide')) return 'tutorial';
    if (intent.includes('best') || intent.includes('review')) return 'comparison';
    if (intent.includes('what') || intent.includes('define')) return 'educational';
    if (intent.includes('buy') || intent.includes('price')) return 'commercial';
    
    return 'blog';
  }

  private generateContentTitle(keyword: UnifiedKeyword): string {
    const templates = [
      `Complete Guide to ${keyword.keyword}`,
      `How to Master ${keyword.keyword}`,
      `${keyword.keyword}: Best Practices and Tips`,
      `Everything You Need to Know About ${keyword.keyword}`,
      `${keyword.keyword} Made Simple: A Step-by-Step Guide`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private calculatePriorityTag(keyword: UnifiedKeyword): string {
    const opportunityScore = this.calculateOpportunityScore(keyword).opportunityScore;
    
    if (opportunityScore > 80) return 'high_impact';
    if (opportunityScore > 60) return 'medium_impact';
    return 'evergreen';
  }

  private generateGapRecommendations(gapKeywords: UnifiedKeyword[]): string[] {
    const recommendations = [];
    
    if (gapKeywords.length > 10) {
      recommendations.push('Consider creating a comprehensive content series to cover multiple gap keywords');
    }
    
    if (gapKeywords.length > 5) {
      recommendations.push('Prioritize high-volume, low-competition keywords for quick wins');
    }
    
    if (gapKeywords.length > 0) {
      recommendations.push('Create targeted landing pages for commercial intent keywords');
      recommendations.push('Develop educational content for informational keywords');
    }
    
    return recommendations;
  }

  private calculateOptimalPublishDate(keyword: UnifiedKeyword): string {
    // This is a simplified seasonal calculation
    // In a real implementation, you'd use historical search trend data
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    return futureDate.toISOString();
  }
}

export const keywordStrategyBridge = new KeywordStrategyBridge();