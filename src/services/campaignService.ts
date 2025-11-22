import { supabase } from '@/integrations/supabase/client';
import { CampaignStrategy } from '@/types/campaign-types';

export interface SavedCampaign {
  id: string;
  name: string;
  original_idea: string;
  target_audience?: string;
  goal?: string;
  timeline?: string;
  selected_strategy: CampaignStrategy | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  solution_id?: string | null;
  objective?: string | null;
  solution?: any | null; // Will be populated from join
  // Enhanced metrics
  contentCount?: number;
  plannedCount?: number;
  progressPercentage?: number;
  estimatedReach?: string;
  distributionChannels?: string[];
  // Campaign manager metrics
  timelineStatus?: 'on-track' | 'behind' | 'overdue' | 'unknown';
  daysRemaining?: number;
  nextAction?: string;
  healthIndicator?: 'healthy' | 'warning' | 'critical';
}

export const campaignService = {
  /**
   * @deprecated Use createCampaignAtomic from campaignTransactions.ts instead.
   * This method performs direct inserts without atomic transaction support.
   * Will be removed in a future version.
   * 
   * Save a campaign with selected strategy
   */
  async saveCampaign(
    userId: string,
    name: string,
    originalIdea: string,
    selectedStrategy: CampaignStrategy | null = null
  ): Promise<SavedCampaign> {
    console.warn('⚠️ saveCampaign is deprecated. Use createCampaignAtomic instead.');
    // Validate inputs
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required to save campaign');
    }
    if (!name || name.trim() === '') {
      throw new Error('Campaign name is required');
    }
    if (!originalIdea || originalIdea.trim() === '') {
      throw new Error('Campaign idea is required');
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        name,
        original_idea: originalIdea,
        selected_strategy: selectedStrategy as any,
        status: selectedStrategy ? 'active' : 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Campaign save error:', error);
      throw new Error(`Failed to save campaign: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Campaign saved but no data returned');
    }
    
    return {
      ...data,
      selected_strategy: data.selected_strategy as unknown as CampaignStrategy | null,
    };
  },

  /**
   * Get all campaigns for a user with enhanced metrics
   */
  async getUserCampaigns(userId: string): Promise<SavedCampaign[]> {
    // Fetch campaigns with content count and solution data
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        content_items!content_items_campaign_id_fkey(id),
        solution:solutions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((campaign: any) => {
      const strategy = campaign.selected_strategy as unknown as CampaignStrategy | null;
      
      // Calculate content metrics
      const contentCount = campaign.content_items?.length || 0;
      const plannedCount = strategy?.contentMix 
        ? Object.values(strategy.contentMix).reduce((sum: number, val: any) => {
            return sum + (typeof val === 'number' ? val : (val?.count || 0));
          }, 0)
        : 0;
      const progressPercentage = plannedCount > 0 ? Math.round((contentCount / plannedCount) * 100) : 0;
      
      // Extract estimated reach from strategy
      const estimatedReach = this.extractEstimatedReach(strategy);
      
      // Extract distribution channels
      const distributionChannels = strategy?.distributionStrategy?.channels || [];
      
      // Calculate timeline status
      const { timelineStatus, daysRemaining } = this.calculateTimelineStatus(
        campaign.created_at,
        campaign.timeline || strategy?.timeline,
        progressPercentage
      );
      
      // Calculate next action
      const nextAction = this.calculateNextAction(campaign.status, contentCount, plannedCount);
      
      // Calculate health indicator
      const healthIndicator = this.calculateHealthIndicator(timelineStatus, progressPercentage);
      
      return {
        id: campaign.id,
        name: campaign.name,
        original_idea: campaign.original_idea,
        target_audience: campaign.target_audience,
        goal: campaign.goal,
        timeline: campaign.timeline,
        selected_strategy: strategy,
        status: campaign.status,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        user_id: campaign.user_id,
        solution_id: campaign.solution_id,
        objective: campaign.objective,
        solution: campaign.solution,
        contentCount,
        plannedCount,
        progressPercentage,
        estimatedReach,
        distributionChannels,
        timelineStatus,
        daysRemaining,
        nextAction,
        healthIndicator,
      };
    });
  },

  /**
   * Extract estimated reach from strategy with fallbacks
   */
  extractEstimatedReach(strategy: CampaignStrategy | null): string | undefined {
    if (!strategy) return undefined;
    
    // Try estimatedReach field first
    if (strategy.estimatedReach) {
      return strategy.estimatedReach;
    }
    
    // Try to calculate from impressions
    if (strategy.expectedMetrics?.impressions) {
      const { min, max } = strategy.expectedMetrics.impressions;
      return `${min.toLocaleString()}-${max.toLocaleString()}`;
    }
    
    // Try traffic lift estimate
    if (strategy.distributionStrategy?.estimatedTrafficLift) {
      return strategy.distributionStrategy.estimatedTrafficLift;
    }
    
    return undefined;
  },

  /**
   * Calculate timeline status based on created date and timeline
   */
  calculateTimelineStatus(
    createdAt: string | null,
    timeline: string | undefined,
    progressPercentage: number
  ): { timelineStatus: 'on-track' | 'behind' | 'overdue' | 'unknown'; daysRemaining: number | undefined } {
    if (!createdAt || !timeline) {
      return { timelineStatus: 'unknown', daysRemaining: undefined };
    }

    const created = new Date(createdAt);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    // Parse timeline (e.g., "4 weeks", "4-week", "2 months", "4-week campaign")
    const timelineMatch = timeline.match(/(\d+)[\s-]*(weeks?|months?)/i);
    if (!timelineMatch) {
      return { timelineStatus: 'unknown', daysRemaining: undefined };
    }
    
    const duration = parseInt(timelineMatch[1]);
    const unit = timelineMatch[2].toLowerCase();
    const totalDays = unit === 'week' ? duration * 7 : duration * 30;
    const daysRemaining = totalDays - daysPassed;
    
    // Determine status based on progress vs time
    const expectedProgress = (daysPassed / totalDays) * 100;
    
    if (daysRemaining < 0) {
      return { timelineStatus: 'overdue', daysRemaining };
    } else if (progressPercentage < expectedProgress - 20) {
      return { timelineStatus: 'behind', daysRemaining };
    } else {
      return { timelineStatus: 'on-track', daysRemaining };
    }
  },

  /**
   * Calculate next action based on campaign status
   */
  calculateNextAction(status: string, contentCount: number, plannedCount: number): string {
    switch (status) {
      case 'draft':
        return 'Select strategy';
      case 'planned':
        return 'Start content generation';
      case 'active':
        if (contentCount === 0) {
          return `${plannedCount} pieces generating...`;
        } else if (contentCount < plannedCount) {
          return `${plannedCount - contentCount} pieces pending`;
        } else {
          return 'Ready to publish';
        }
      case 'completed':
        return 'Review performance';
      default:
        return 'View campaign';
    }
  },

  /**
   * Calculate health indicator
   */
  calculateHealthIndicator(
    timelineStatus: 'on-track' | 'behind' | 'overdue' | 'unknown',
    progressPercentage: number
  ): 'healthy' | 'warning' | 'critical' {
    if (timelineStatus === 'overdue' || progressPercentage < 20) {
      return 'critical';
    } else if (timelineStatus === 'behind' || progressPercentage < 50) {
      return 'warning';
    } else {
      return 'healthy';
    }
  },

  /**
   * Get a single campaign by ID
   */
  async getCampaignById(campaignId: string): Promise<SavedCampaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) throw error;
    return {
      ...data,
      selected_strategy: data.selected_strategy as unknown as CampaignStrategy | null,
    };
  },

  /**
   * Update campaign name
   */
  async updateCampaignName(campaignId: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', campaignId);

    if (error) throw error;
  },

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', campaignId);

    if (error) throw error;
    
    console.log(`📊 [Campaign Service] Status updated to "${status}" for campaign ${campaignId}`);
  },

  /**
   * Transition campaign status based on workflow
   * draft → planned (strategy selected)
   * planned → active (content generation started)
   * active → completed (all content generated)
   */
  async transitionCampaignStatus(
    campaignId: string,
    event: 'strategy_selected' | 'generation_started' | 'generation_completed'
  ): Promise<void> {
    const statusMap = {
      'strategy_selected': 'planned',
      'generation_started': 'active',
      'generation_completed': 'completed'
    };

    const newStatus = statusMap[event];
    await this.updateCampaignStatus(campaignId, newStatus);
  },

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) throw error;
  },

  /**
   * Update selected strategy
   */
  async updateSelectedStrategy(
    campaignId: string,
    selectedStrategy: CampaignStrategy
  ): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({
        selected_strategy: selectedStrategy as any,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (error) throw error;
  },

  /**
   * Update campaign with strategy and context fields
   */
  async updateCampaign(
    campaignId: string,
    updates: {
      selected_strategy?: CampaignStrategy;
      target_audience?: string;
      goal?: string;
      timeline?: string;
      status?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({
        ...updates,
        selected_strategy: updates.selected_strategy as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (error) throw error;
  },

  /**
   * Sync campaign names from strategy titles (one-time migration utility)
   */
  async syncAllCampaignTitles(userId: string): Promise<{ synced: number }> {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, name, selected_strategy')
      .eq('user_id', userId);

    if (error) throw error;
    
    let synced = 0;
    
    for (const campaign of campaigns || []) {
      const strategy = campaign.selected_strategy as any;
      if (strategy?.title && campaign.name !== strategy.title) {
        await this.updateCampaignName(campaign.id, strategy.title);
        synced++;
      }
    }
    
    return { synced };
  },
};
