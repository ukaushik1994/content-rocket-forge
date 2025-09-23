import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IntegrationConfig {
  name: string;
  provider: string;
  apiKey?: string;
  webhook?: string;
  settings: Record<string, any>;
  isActive: boolean;
  lastSync?: number;
}

interface SerpDataPackage {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  competitors: any[];
  opportunities: any;
  timestamp: number;
  source: string;
}

interface MarketingAction {
  id: string;
  type: 'content_plan' | 'campaign_update' | 'keyword_alert' | 'competitor_change';
  data: any;
  integrations: string[];
  status: 'pending' | 'sent' | 'failed';
  timestamp: number;
}

/**
 * Marketing tools integration service for SERP intelligence
 */
export class MarketingIntegrationHooks {
  private static integrations = new Map<string, IntegrationConfig>();
  private static pendingActions: MarketingAction[] = [];
  private static webhookQueue: any[] = [];

  /**
   * Register a marketing tool integration
   */
  static async registerIntegration(config: IntegrationConfig): Promise<boolean> {
    try {
      // Validate configuration
      if (!config.name || !config.provider) {
        throw new Error('Integration name and provider are required');
      }

      // Test connection if API key provided
      if (config.apiKey) {
        const isValid = await this.testIntegrationConnection(config);
        if (!isValid) {
          throw new Error('Failed to connect to integration service');
        }
      }

      // Store integration config
      this.integrations.set(config.name, {
        ...config,
        isActive: true,
        lastSync: Date.now()
      });

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('ai_service_providers')
          .upsert({
            user_id: user.id,
            provider: config.provider,
            api_key: config.apiKey || '',
            status: 'active',
            category: 'Marketing Tools',
            description: `${config.name} integration for SERP data`,
            setup_url: config.webhook || '',
            capabilities: ['webhook', 'data_sync', 'automation'],
            settings: config.settings
          });
      }

      console.log(`✅ Registered integration: ${config.name}`);
      toast(`Integration connected: ${config.name}`, {
        description: 'SERP data will now sync with your marketing tools'
      });

      return true;
    } catch (error) {
      console.error(`❌ Failed to register integration ${config.name}:`, error);
      toast(`Integration failed: ${config.name}`, {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Send SERP data to integrated marketing tools
   */
  static async syncSerpData(serpData: SerpDataPackage): Promise<void> {
    const activeIntegrations = Array.from(this.integrations.values())
      .filter(integration => integration.isActive);

    if (activeIntegrations.length === 0) {
      console.log('📤 No active marketing integrations to sync');
      return;
    }

    console.log(`📤 Syncing SERP data to ${activeIntegrations.length} integrations`);

    const promises = activeIntegrations.map(async (integration) => {
      try {
        await this.sendToIntegration(integration, serpData);
        
        // Update last sync time
        integration.lastSync = Date.now();
        this.integrations.set(integration.name, integration);
        
        return { integration: integration.name, success: true };
      } catch (error) {
        console.error(`Failed to sync to ${integration.name}:`, error);
        return { integration: integration.name, success: false, error };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    if (successful > 0) {
      toast(`SERP data synced to ${successful} tools`, {
        description: failed > 0 ? `${failed} integrations failed` : 'All integrations updated'
      });
    }
  }

  /**
   * Send data to specific integration
   */
  private static async sendToIntegration(
    integration: IntegrationConfig, 
    data: SerpDataPackage
  ): Promise<void> {
    switch (integration.provider) {
      case 'slack':
        await this.sendToSlack(integration, data);
        break;
      case 'zapier':
        await this.sendToZapier(integration, data);
        break;
      case 'hubspot':
        await this.sendToHubSpot(integration, data);
        break;
      case 'google_sheets':
        await this.sendToGoogleSheets(integration, data);
        break;
      case 'webhook':
        await this.sendToWebhook(integration, data);
        break;
      default:
        throw new Error(`Unsupported integration provider: ${integration.provider}`);
    }
  }

  /**
   * Slack integration
   */
  private static async sendToSlack(integration: IntegrationConfig, data: SerpDataPackage): Promise<void> {
    if (!integration.webhook) {
      throw new Error('Slack webhook URL required');
    }

    const slackMessage = {
      text: `🔍 SERP Analysis Update: ${data.keyword}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `SERP Analysis: ${data.keyword}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Search Volume:* ${data.searchVolume.toLocaleString()}\n*Difficulty:* ${data.difficulty}/100\n*Competitors:* ${data.competitors.length} analyzed`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Opportunity Score:* ${data.opportunities?.score || 'N/A'}\n*Analysis Time:* ${new Date(data.timestamp).toLocaleString()}`
          }
        }
      ]
    };

    await fetch(integration.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });
  }

  /**
   * Zapier integration
   */
  private static async sendToZapier(integration: IntegrationConfig, data: SerpDataPackage): Promise<void> {
    if (!integration.webhook) {
      throw new Error('Zapier webhook URL required');
    }

    const zapierPayload = {
      keyword: data.keyword,
      search_volume: data.searchVolume,
      difficulty: data.difficulty,
      competition_count: data.competitors.length,
      opportunity_score: data.opportunities?.score || 0,
      timestamp: data.timestamp,
      source: 'serp_intelligence'
    };

    await fetch(integration.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zapierPayload)
    });
  }

  /**
   * HubSpot integration
   */
  private static async sendToHubSpot(integration: IntegrationConfig, data: SerpDataPackage): Promise<void> {
    if (!integration.apiKey) {
      throw new Error('HubSpot API key required');
    }

    // Create a note or update contact with SERP data
    const hubspotData = {
      properties: {
        hs_note_body: `SERP Analysis for ${data.keyword}: ${data.searchVolume} monthly searches, difficulty ${data.difficulty}/100`,
        hs_timestamp: data.timestamp
      }
    };

    await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(hubspotData)
    });
  }

  /**
   * Google Sheets integration
   */
  private static async sendToGoogleSheets(integration: IntegrationConfig, data: SerpDataPackage): Promise<void> {
    if (!integration.webhook) {
      throw new Error('Google Sheets webhook URL required');
    }

    const sheetsData = {
      values: [[
        data.keyword,
        data.searchVolume,
        data.difficulty,
        data.competitors.length,
        data.opportunities?.score || 0,
        new Date(data.timestamp).toISOString()
      ]]
    };

    await fetch(integration.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetsData)
    });
  }

  /**
   * Generic webhook integration
   */
  private static async sendToWebhook(integration: IntegrationConfig, data: SerpDataPackage): Promise<void> {
    if (!integration.webhook) {
      throw new Error('Webhook URL required');
    }

    await fetch(integration.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'serp_analysis_complete',
        data,
        integration: integration.name,
        timestamp: Date.now()
      })
    });
  }

  /**
   * Test integration connection
   */
  private static async testIntegrationConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      const testData: SerpDataPackage = {
        keyword: 'test_connection',
        searchVolume: 1000,
        difficulty: 50,
        competitors: [],
        opportunities: { score: 75 },
        timestamp: Date.now(),
        source: 'connection_test'
      };

      await this.sendToIntegration(config, testData);
      return true;
    } catch (error) {
      console.error('Integration connection test failed:', error);
      return false;
    }
  }

  /**
   * Queue marketing action for batch processing
   */
  static queueMarketingAction(action: Omit<MarketingAction, 'id' | 'timestamp' | 'status'>): void {
    const marketingAction: MarketingAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.pendingActions.push(marketingAction);
    console.log(`📋 Queued marketing action: ${action.type}`);

    // Auto-process if queue gets large
    if (this.pendingActions.length >= 10) {
      this.processPendingActions();
    }
  }

  /**
   * Process all pending marketing actions
   */
  static async processPendingActions(): Promise<void> {
    const actions = [...this.pendingActions];
    this.pendingActions = [];

    if (actions.length === 0) return;

    console.log(`⚡ Processing ${actions.length} marketing actions`);

    for (const action of actions) {
      try {
        const targetIntegrations = Array.from(this.integrations.values())
          .filter(integration => 
            integration.isActive && 
            action.integrations.includes(integration.name)
          );

        for (const integration of targetIntegrations) {
          await this.sendActionToIntegration(integration, action);
        }

        action.status = 'sent';
      } catch (error) {
        console.error(`Failed to process action ${action.id}:`, error);
        action.status = 'failed';
      }
    }

    const successful = actions.filter(a => a.status === 'sent').length;
    if (successful > 0) {
      toast(`Processed ${successful} marketing actions`, {
        description: 'Updates sent to connected tools'
      });
    }
  }

  /**
   * Send marketing action to integration
   */
  private static async sendActionToIntegration(
    integration: IntegrationConfig, 
    action: MarketingAction
  ): Promise<void> {
    const actionData = {
      action_type: action.type,
      data: action.data,
      timestamp: action.timestamp,
      integration: integration.name
    };

    switch (integration.provider) {
      case 'slack':
        if (integration.webhook) {
          await fetch(integration.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `🚀 Marketing Action: ${action.type}`,
              blocks: [{
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `Action: ${action.type}\nData: ${JSON.stringify(action.data, null, 2)}`
                }
              }]
            })
          });
        }
        break;
      
      default:
        if (integration.webhook) {
          await fetch(integration.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actionData)
          });
        }
        break;
    }
  }

  /**
   * Get all registered integrations
   */
  static getIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Remove integration
   */
  static removeIntegration(name: string): boolean {
    const removed = this.integrations.delete(name);
    if (removed) {
      console.log(`🗑️ Removed integration: ${name}`);
      toast(`Integration removed: ${name}`);
    }
    return removed;
  }

  /**
   * Get integration statistics
   */
  static getIntegrationStats(): {
    total: number;
    active: number;
    lastSync: number;
    providers: Record<string, number>;
  } {
    const integrations = Array.from(this.integrations.values());
    const active = integrations.filter(i => i.isActive);
    const lastSync = Math.max(...integrations.map(i => i.lastSync || 0));
    
    const providers: Record<string, number> = {};
    integrations.forEach(integration => {
      providers[integration.provider] = (providers[integration.provider] || 0) + 1;
    });

    return {
      total: integrations.length,
      active: active.length,
      lastSync,
      providers
    };
  }
}

// Export convenience functions
export const marketingIntegrationHooks = {
  registerIntegration: MarketingIntegrationHooks.registerIntegration.bind(MarketingIntegrationHooks),
  syncSerpData: MarketingIntegrationHooks.syncSerpData.bind(MarketingIntegrationHooks),
  queueMarketingAction: MarketingIntegrationHooks.queueMarketingAction.bind(MarketingIntegrationHooks),
  processPendingActions: MarketingIntegrationHooks.processPendingActions.bind(MarketingIntegrationHooks),
  getIntegrations: MarketingIntegrationHooks.getIntegrations.bind(MarketingIntegrationHooks),
  removeIntegration: MarketingIntegrationHooks.removeIntegration.bind(MarketingIntegrationHooks),
  getIntegrationStats: MarketingIntegrationHooks.getIntegrationStats.bind(MarketingIntegrationHooks)
};