import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIStrategy {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goals: any;
  generated_at: string;
  keywords: string[];
  proposals: any[];
  serp_data: any;
  status: 'active' | 'archived';
  session_metadata: {
    session_id: string;
    generation_count: number;
    used_keywords: string[];
    total_proposals: number;
  };
  created_at: string;
  updated_at: string;
}

export interface StrategyProposal {
  id?: string;
  title: string;
  description: string;
  primary_keyword: string;
  keywords: string[];
  priority_tag: 'quick_win' | 'high_return' | 'evergreen' | 'low_priority';
  estimated_impressions?: number;
  serp_data: any;
  content_type?: string;
  suggested_outline?: string[];
}

export interface StrategySession {
  session_id: string;
  generated_at: string;
  proposals_count: number;
  keywords_used: string[];
  status: 'active' | 'archived';
}

class AIStrategyService {
  // Strategy persistence operations
  async saveStrategy(data: {
    title: string;
    description?: string;
    goals: any;
    proposals: any[];
    serp_data: any;
    keywords: string[];
    session_metadata?: any;
  }): Promise<AIStrategy> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    // Create session metadata
    const sessionId = `session_${Date.now()}`;
    const usedKeywords = this.extractKeywordsFromProposals(data.proposals);
    
    const sessionMetadata = {
      session_id: sessionId,
      generation_count: 1,
      used_keywords: usedKeywords,
      total_proposals: data.proposals.length,
      ...data.session_metadata
    };

    try {
      console.log('💾 Saving AI strategy to database');
      
      const { data: savedStrategy, error } = await supabase
        .from('ai_strategies')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          goals: data.goals,
          proposals: data.proposals,
          serp_data: data.serp_data,
          keywords: data.keywords,
          session_metadata: sessionMetadata,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Database error saving strategy:', error);
        throw error;
      }
      
      console.log('✅ Strategy saved successfully to database');
      
      // Return with generated_at for compatibility
      return {
        ...savedStrategy,
        generated_at: savedStrategy.created_at
      } as AIStrategy;
    } catch (error) {
      console.error('Failed to save AI strategy:', error);
      throw error;
    }
  }

  async getStrategies(): Promise<AIStrategy[]> {
    try {
      console.log('📊 Getting AI strategies from database');
      
      const { data: strategies, error } = await supabase
        .from('ai_strategies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error fetching strategies:', error);
        throw error;
      }
      
      console.log('✅ Retrieved strategies:', strategies?.length || 0);
      
      // Add generated_at for compatibility
      return (strategies || []).map(strategy => ({
        ...strategy,
        generated_at: strategy.created_at
      })) as AIStrategy[];
    } catch (error) {
      console.error('Failed to fetch AI strategies:', error);
      return [];
    }
  }

  async getStrategySessions(): Promise<StrategySession[]> {
    const strategies = await this.getStrategies();
    
    // Group strategies by session
    const sessionMap = new Map<string, StrategySession>();
    
    strategies.forEach(strategy => {
      const sessionId = strategy.session_metadata?.session_id || 'unknown';
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          session_id: sessionId,
          generated_at: strategy.generated_at,
          proposals_count: 0,
          keywords_used: [],
          status: strategy.status
        });
      }
      
      const session = sessionMap.get(sessionId)!;
      session.proposals_count += strategy.proposals.length;
      session.keywords_used = [...new Set([...session.keywords_used, ...strategy.keywords])];
    });

    return Array.from(sessionMap.values()).sort(
      (a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
    );
  }

  async getUsedKeywords(): Promise<string[]> {
    const strategies = await this.getStrategies();
    const allKeywords = strategies.flatMap(s => 
      [...s.keywords, ...this.extractKeywordsFromProposals(s.proposals)]
    );
    return [...new Set(allKeywords)];
  }

  async generateNewStrategy(params: {
    goals?: any;
    location?: string;
    excludeKeywords?: string[];
  }): Promise<{ proposals: any[]; message: string }> {
    // Import the content strategy service to use existing generation logic
    const { contentStrategyService } = await import('./contentStrategyService');
    
    // Get previously used keywords
    const usedKeywords = await this.getUsedKeywords();
    const excludeKeywords = [...(params.excludeKeywords || []), ...usedKeywords];

    console.log('🚀 Generating new strategy excluding keywords:', excludeKeywords);

    // Generate new strategy with keyword exclusions
    const result = await contentStrategyService.generateAIStrategy({
      goals: params.goals,
      location: params.location
    });

    // Filter out proposals that use already-used keywords
    const filteredProposals = result.proposals.filter(proposal => {
      const proposalKeywords = [
        proposal.primary_keyword,
        ...(proposal.keywords || [])
      ].filter(Boolean);
      
      return !proposalKeywords.some(kw => 
        excludeKeywords.some(used => 
          used.toLowerCase() === kw.toLowerCase()
        )
      );
    });

    if (filteredProposals.length === 0) {
      throw new Error('No new strategy proposals found. All generated keywords have been used before.');
    }

    // Save the new strategy
    await this.saveStrategy({
      title: `AI Strategy - ${new Date().toLocaleDateString()}`,
      description: 'Auto-generated strategy with new keyword opportunities',
      goals: params.goals || {},
      proposals: filteredProposals,
      serp_data: result.proposals.reduce((acc, p) => ({ ...acc, ...p.serp_data }), {}),
      keywords: this.extractKeywordsFromProposals(filteredProposals)
    });

    return {
      proposals: filteredProposals,
      message: `Generated ${filteredProposals.length} new strategy proposals`
    };
  }

  async archiveStrategy(strategyId: string): Promise<void> {
    try {
      console.log('📦 Archiving strategy:', strategyId);
      
      const { error } = await supabase
        .from('ai_strategies')
        .update({ status: 'archived' })
        .eq('id', strategyId);
      
      if (error) {
        console.error('Database error archiving strategy:', error);
        throw error;
      }
      
      console.log('✅ Strategy archived successfully');
    } catch (error) {
      console.error('Failed to archive strategy:', error);
      throw error;
    }
  }

  async deleteStrategy(strategyId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting strategy:', strategyId);
      
      const { error } = await supabase
        .from('ai_strategies')
        .delete()
        .eq('id', strategyId);
      
      if (error) {
        console.error('Database error deleting strategy:', error);
        throw error;
      }
      
      console.log('✅ Strategy deleted successfully');
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      throw error;
    }
  }

  // Content Builder integration
  async prepareContentBuilderPayload(proposal: StrategyProposal): Promise<{
    source: string;
    primary_keyword: string;
    keywords: string[];
    serp_data: any;
    title?: string;
    content_type?: string;
    outline?: string[];
    meta_suggestions?: {
      title: string;
      description: string;
    };
    initial_step: number;
    strategy_context: {
      proposal_id: string;
      priority_tag: string;
      estimated_impressions: number;
    };
  }> {
    // Prepare enhanced payload with strategy context
    const keywords = [
      proposal.primary_keyword,
      ...(proposal.keywords || [])
    ].filter(Boolean);

    // Generate SEO suggestions based on proposal
    const metaSuggestions = {
      title: this.generateSEOTitle(proposal),
      description: this.generateSEODescription(proposal)
    };

    return {
      source: 'ai_strategy_proposal',
      primary_keyword: proposal.primary_keyword,
      keywords,
      serp_data: proposal.serp_data || {},
      title: proposal.title,
      content_type: proposal.content_type || 'blog',
      outline: proposal.suggested_outline || [],
      meta_suggestions: metaSuggestions,
      initial_step: 0, // Start at keyword selection but pre-filled
      strategy_context: {
        proposal_id: proposal.id || '',
        priority_tag: proposal.priority_tag,
        estimated_impressions: proposal.estimated_impressions || 0
      }
    };
  }

  // Helper methods
  private extractKeywordsFromProposals(proposals: any[]): string[] {
    const keywords = proposals.flatMap(p => [
      p.primary_keyword,
      ...(p.keywords || [])
    ]).filter(Boolean);
    
    return [...new Set(keywords)];
  }

  private generateSEOTitle(proposal: StrategyProposal): string {
    const keyword = proposal.primary_keyword;
    const title = proposal.title;
    
    // Create SEO-optimized title
    if (title.toLowerCase().includes(keyword.toLowerCase())) {
      return title.length <= 60 ? title : title.substring(0, 57) + '...';
    }
    
    return `${keyword} - ${title}`.length <= 60 
      ? `${keyword} - ${title}` 
      : `${keyword} - ${title.substring(0, 57 - keyword.length - 3)}...`;
  }

  private generateSEODescription(proposal: StrategyProposal): string {
    const description = proposal.description || '';
    const keyword = proposal.primary_keyword;
    
    // Ensure keyword is in description and under 160 chars
    if (description.toLowerCase().includes(keyword.toLowerCase())) {
      return description.length <= 160 ? description : description.substring(0, 157) + '...';
    }
    
    const enhanced = `Learn about ${keyword}. ${description}`;
    return enhanced.length <= 160 ? enhanced : enhanced.substring(0, 157) + '...';
  }
}

export const aiStrategyService = new AIStrategyService();