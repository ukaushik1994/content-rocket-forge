import { supabase } from "@/integrations/supabase/client";
import { analyzeKeywordEnhanced, EnhancedSerpResult } from "./enhancedSerpService";

export interface SerpMonitoringConfig {
  id: string;
  user_id: string;
  keyword: string;
  location: string;
  language: string;
  check_frequency: number;
  is_active: boolean;
  alert_thresholds: {
    position_change: number;
    new_competitors: boolean;
    featured_snippet_loss: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface SerpAlert {
  id: string;
  user_id: string;
  config_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  alert_data: any;
  is_read: boolean;
  expires_at?: string;
  created_at: string;
}

export interface SerpMonitoringHistory {
  id: string;
  config_id: string;
  user_id: string;
  keyword: string;
  serp_data: any;
  position_changes: any[];
  new_competitors: any[];
  lost_competitors: any[];
  featured_snippet_changes: any;
  check_timestamp: string;
  created_at: string;
}

class SerpMonitoringService {
  // Create monitoring configuration
  async createMonitoringConfig(
    userId: string,
    keyword: string,
    location: string = 'us',
    language: string = 'en',
    checkFrequency: number = 3600,
    alertThresholds?: Partial<SerpMonitoringConfig['alert_thresholds']>
  ): Promise<SerpMonitoringConfig | null> {
    try {
      const { data, error } = await supabase
        .from('serp_monitoring_configs')
        .insert({
          user_id: userId,
          keyword,
          location,
          language,
          check_frequency: checkFrequency,
          alert_thresholds: {
            position_change: 3,
            new_competitors: true,
            featured_snippet_loss: true,
            ...alertThresholds
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data as SerpMonitoringConfig;
    } catch (error) {
      console.error('Error creating monitoring config:', error);
      return null;
    }
  }

  // Get user's monitoring configurations
  async getMonitoringConfigs(userId: string): Promise<SerpMonitoringConfig[]> {
    try {
      const { data, error } = await supabase
        .from('serp_monitoring_configs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as SerpMonitoringConfig[];
    } catch (error) {
      console.error('Error fetching monitoring configs:', error);
      return [];
    }
  }

  // Run monitoring check for a specific configuration
  async runMonitoringCheck(config: SerpMonitoringConfig): Promise<boolean> {
    try {
      const serpData = await analyzeKeywordEnhanced(config.keyword, config.location, true);
      if (!serpData) return false;

      // Get previous check for comparison
      const previousCheck = await this.getLatestMonitoringHistory(config.id);
      
      // Analyze changes
      const changes = this.analyzeChanges(previousCheck?.serp_data, serpData, config.alert_thresholds);

      // Save monitoring history
      await this.saveMonitoringHistory(config, serpData, changes);

      // Create alerts if significant changes detected
      if (changes.hasSignificantChanges) {
        await this.createAlertsForChanges(config, changes);
      }

      return true;
    } catch (error) {
      console.error('Error running monitoring check:', error);
      return false;
    }
  }

  // Analyze changes between old and new SERP data
  private analyzeChanges(oldSerpData: any, newSerpData: EnhancedSerpResult, thresholds: any) {
    const changes = {
      hasSignificantChanges: false,
      position_changes: [] as any[],
      new_competitors: [] as any[],
      lost_competitors: [] as any[],
      featured_snippet_changes: {} as any
    };

    if (!oldSerpData) {
      changes.hasSignificantChanges = false;
      return changes;
    }

    // Analyze position changes
    const oldResults = oldSerpData.serp_blocks?.organic || [];
    const newResults = newSerpData.serp_blocks?.organic || [];

    oldResults.forEach((oldResult: any, oldIndex: number) => {
      const newIndex = newResults.findIndex((r: any) => this.extractDomain(r.link) === this.extractDomain(oldResult.link));
      
      if (newIndex === -1) {
        // Competitor lost position
        changes.lost_competitors.push({
          domain: this.extractDomain(oldResult.link),
          old_position: oldIndex + 1,
          title: oldResult.title
        });
        changes.hasSignificantChanges = true;
      } else if (Math.abs(newIndex - oldIndex) >= thresholds.position_change) {
        // Significant position change
        changes.position_changes.push({
          domain: this.extractDomain(oldResult.link),
          old_position: oldIndex + 1,
          new_position: newIndex + 1,
          change: newIndex - oldIndex,
          title: oldResult.title
        });
        changes.hasSignificantChanges = true;
      }
    });

    // Find new competitors
    newResults.forEach((newResult: any, newIndex: number) => {
      const existsInOld = oldResults.some((r: any) => this.extractDomain(r.link) === this.extractDomain(newResult.link));
      if (!existsInOld && thresholds.new_competitors) {
        changes.new_competitors.push({
          domain: this.extractDomain(newResult.link),
          position: newIndex + 1,
          title: newResult.title
        });
        changes.hasSignificantChanges = true;
      }
    });

    // Analyze featured snippet changes
    const oldFeatured = oldSerpData.featuredSnippets?.[0];
    const newFeatured = newSerpData.featuredSnippets?.[0];

    if (oldFeatured && !newFeatured && thresholds.featured_snippet_loss) {
      changes.featured_snippet_changes = {
        type: 'lost',
        old_domain: this.extractDomain(oldFeatured.source)
      };
      changes.hasSignificantChanges = true;
    } else if (!oldFeatured && newFeatured) {
      changes.featured_snippet_changes = {
        type: 'gained',
        new_domain: this.extractDomain(newFeatured.source)
      };
      changes.hasSignificantChanges = true;
    } else if (oldFeatured && newFeatured && this.extractDomain(oldFeatured.source) !== this.extractDomain(newFeatured.source)) {
      changes.featured_snippet_changes = {
        type: 'changed',
        old_domain: this.extractDomain(oldFeatured.source),
        new_domain: this.extractDomain(newFeatured.source)
      };
      changes.hasSignificantChanges = true;
    }

    return changes;
  }

  // Save monitoring history
  private async saveMonitoringHistory(
    config: SerpMonitoringConfig,
    serpData: EnhancedSerpResult,
    changes: any
  ) {
    try {
      await supabase
        .from('serp_monitoring_history')
        .insert({
          config_id: config.id,
          user_id: config.user_id,
          keyword: config.keyword,
          serp_data: serpData as any,
          position_changes: changes.position_changes as any,
          new_competitors: changes.new_competitors as any,
          lost_competitors: changes.lost_competitors as any,
          featured_snippet_changes: changes.featured_snippet_changes as any
        });
    } catch (error) {
      console.error('Error saving monitoring history:', error);
    }
  }

  // Create alerts for significant changes
  private async createAlertsForChanges(config: SerpMonitoringConfig, changes: any) {
    const alerts = [];

    // Position change alerts
    for (const change of changes.position_changes) {
      const direction = change.change > 0 ? 'dropped' : 'improved';
      const severity = Math.abs(change.change) > 5 ? 'high' : 'medium';
      
      alerts.push({
        user_id: config.user_id,
        config_id: config.id,
        alert_type: 'position_change',
        severity,
        title: `${change.domain} ${direction} for "${config.keyword}"`,
        message: `${change.domain} moved from position ${change.old_position} to ${change.new_position} (${change.change > 0 ? '+' : ''}${change.change})`,
        alert_data: { change, keyword: config.keyword },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
    }

    // New competitor alerts
    for (const competitor of changes.new_competitors) {
      alerts.push({
        user_id: config.user_id,
        config_id: config.id,
        alert_type: 'new_competitor',
        severity: 'medium' as const,
        title: `New competitor for "${config.keyword}"`,
        message: `${competitor.domain} appeared at position ${competitor.position}`,
        alert_data: { competitor, keyword: config.keyword },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Featured snippet alerts
    if (changes.featured_snippet_changes.type === 'lost') {
      alerts.push({
        user_id: config.user_id,
        config_id: config.id,
        alert_type: 'featured_snippet_loss',
        severity: 'high' as const,
        title: `Featured snippet lost for "${config.keyword}"`,
        message: `${changes.featured_snippet_changes.old_domain} lost the featured snippet`,
        alert_data: { change: changes.featured_snippet_changes, keyword: config.keyword },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Insert alerts
    if (alerts.length > 0) {
      try {
        await supabase
          .from('serp_alerts')
          .insert(alerts);
      } catch (error) {
        console.error('Error creating alerts:', error);
      }
    }
  }

  // Get latest monitoring history for a config
  async getLatestMonitoringHistory(configId: string): Promise<SerpMonitoringHistory | null> {
    try {
      const { data, error } = await supabase
        .from('serp_monitoring_history')
        .select('*')
        .eq('config_id', configId)
        .order('check_timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as SerpMonitoringHistory;
    } catch (error) {
      console.error('Error fetching latest monitoring history:', error);
      return null;
    }
  }

  // Get monitoring history for a config
  async getMonitoringHistory(configId: string, limit: number = 50): Promise<SerpMonitoringHistory[]> {
    try {
      const { data, error } = await supabase
        .from('serp_monitoring_history')
        .select('*')
        .eq('config_id', configId)
        .order('check_timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as SerpMonitoringHistory[];
    } catch (error) {
      console.error('Error fetching monitoring history:', error);
      return [];
    }
  }

  // Get user alerts
  async getUserAlerts(userId: string, unreadOnly: boolean = false): Promise<SerpAlert[]> {
    try {
      let query = supabase
        .from('serp_alerts')
        .select('*')
        .eq('user_id', userId);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as SerpAlert[];
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      return [];
    }
  }

  // Mark alerts as read
  async markAlertsAsRead(alertIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('serp_alerts')
        .update({ is_read: true })
        .in('id', alertIds);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking alerts as read:', error);
      return false;
    }
  }

  // Update monitoring config
  async updateMonitoringConfig(
    configId: string,
    updates: Partial<Pick<SerpMonitoringConfig, 'is_active' | 'check_frequency' | 'alert_thresholds'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('serp_monitoring_configs')
        .update(updates)
        .eq('id', configId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating monitoring config:', error);
      return false;
    }
  }

  // Delete monitoring config
  async deleteMonitoringConfig(configId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('serp_monitoring_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting monitoring config:', error);
      return false;
    }
  }

  // Helper method to extract domain from URL
  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  }

  // Run monitoring checks for all active configs for a user
  async runAllUserMonitoringChecks(userId: string): Promise<void> {
    try {
      const configs = await this.getMonitoringConfigs(userId);
      const activeConfigs = configs.filter(c => c.is_active);

      // Process configs in batches to avoid overwhelming the API
      const batchSize = 3;
      for (let i = 0; i < activeConfigs.length; i += batchSize) {
        const batch = activeConfigs.slice(i, i + batchSize);
        await Promise.all(batch.map(config => this.runMonitoringCheck(config)));
        
        // Add delay between batches
        if (i + batchSize < activeConfigs.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error('Error running user monitoring checks:', error);
    }
  }
}

export const serpMonitoringService = new SerpMonitoringService();