
/**
 * Usage tracker for SERP API calls
 */

import { supabase } from "@/integrations/supabase/client";
import { SerpProvider } from "@/contexts/content-builder/types/serp-types";

interface ApiUsage {
  provider: SerpProvider;
  endpoint: string;
  queryCount: number;
  lastUpdated: Date;
}

export class UsageTracker {
  private static instance: UsageTracker;
  private usageMap: Map<string, ApiUsage> = new Map();
  private readonly localStorageKey = 'serp_api_usage';
  private syncInterval: number | null = null;
  
  private constructor() {
    this.loadUsageData();
    this.startSyncInterval();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }
  
  /**
   * Track usage of an API endpoint
   */
  public trackUsage(provider: SerpProvider, endpoint: string): void {
    const key = `${provider}:${endpoint}`;
    const usage = this.usageMap.get(key) || {
      provider,
      endpoint,
      queryCount: 0,
      lastUpdated: new Date()
    };
    
    usage.queryCount++;
    usage.lastUpdated = new Date();
    
    this.usageMap.set(key, usage);
    this.saveUsageData();
  }
  
  /**
   * Get usage data for a provider
   */
  public getProviderUsage(provider: SerpProvider): ApiUsage[] {
    const providerUsage: ApiUsage[] = [];
    
    this.usageMap.forEach((usage) => {
      if (usage.provider === provider) {
        providerUsage.push(usage);
      }
    });
    
    return providerUsage;
  }
  
  /**
   * Get total usage across all providers
   */
  public getTotalUsage(): number {
    let total = 0;
    
    this.usageMap.forEach((usage) => {
      total += usage.queryCount;
    });
    
    return total;
  }
  
  /**
   * Reset usage data
   */
  public resetUsage(): void {
    this.usageMap.clear();
    this.saveUsageData();
  }
  
  /**
   * Reset usage data for a specific provider
   */
  public resetProviderUsage(provider: SerpProvider): void {
    const keysToRemove: string[] = [];
    
    this.usageMap.forEach((usage, key) => {
      if (usage.provider === provider) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach((key) => {
      this.usageMap.delete(key);
    });
    
    this.saveUsageData();
  }
  
  /**
   * Load usage data from storage
   */
  private loadUsageData(): void {
    try {
      const savedData = localStorage.getItem(this.localStorageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Convert to Map
        Object.entries(parsedData).forEach(([key, value]) => {
          const usage = value as ApiUsage;
          usage.lastUpdated = new Date(usage.lastUpdated);
          this.usageMap.set(key, usage);
        });
      }
    } catch (error) {
      console.error('Error loading API usage data:', error);
    }
  }
  
  /**
   * Save usage data to storage
   */
  private saveUsageData(): void {
    try {
      // Convert Map to object for storage
      const dataObject: Record<string, ApiUsage> = {};
      
      this.usageMap.forEach((value, key) => {
        dataObject[key] = value;
      });
      
      localStorage.setItem(this.localStorageKey, JSON.stringify(dataObject));
      
      // Try to sync with database if authenticated
      this.syncWithDatabase();
    } catch (error) {
      console.error('Error saving API usage data:', error);
    }
  }
  
  /**
   * Start periodic sync with database
   */
  private startSyncInterval(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
    }
    
    // Sync every 5 minutes
    this.syncInterval = window.setInterval(() => {
      this.syncWithDatabase();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Sync usage data with database
   */
  private async syncWithDatabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return; // Not authenticated, skip sync
      }
      
      const usageData = Array.from(this.usageMap.values());
      
      if (usageData.length === 0) {
        return; // No data to sync
      }
      
      // For now, we'll just log the data
      // In the future, this could insert data into a 'api_usage' table
      console.log('API usage data synced:', usageData);
      
      // Example of how to insert into a table if it existed:
      // const { error } = await supabase
      //   .from('api_usage')
      //   .upsert(
      //     usageData.map(usage => ({
      //       user_id: user.id,
      //       provider: usage.provider,
      //       endpoint: usage.endpoint,
      //       query_count: usage.queryCount,
      //       last_updated: usage.lastUpdated
      //     }))
      //   );
      
      // if (error) {
      //   console.error('Error syncing API usage data:', error);
      // }
    } catch (error) {
      console.error('Error syncing API usage data:', error);
    }
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}
