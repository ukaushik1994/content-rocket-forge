
/**
 * Factory for creating SERP API adapters
 */

import { SerpApiAdapter } from "./types";
import { SerpProvider } from "@/contexts/content-builder/types/serp-types";
import { SerpApiAdapter as SerpApiAdapterImpl } from "./SerpApiAdapter";
import { DataForSeoAdapter } from "./DataForSeoAdapter";

export class AdapterFactory {
  private static adapters: Map<SerpProvider, SerpApiAdapter> = new Map();
  
  /**
   * Get adapter for the specified provider
   */
  static getAdapter(provider: SerpProvider): SerpApiAdapter {
    // Check if we already have an instance
    if (this.adapters.has(provider)) {
      return this.adapters.get(provider)!;
    }
    
    // Create a new instance
    let adapter: SerpApiAdapter;
    
    switch (provider) {
      case 'serpapi':
        adapter = new SerpApiAdapterImpl();
        break;
      case 'dataforseo':
        adapter = new DataForSeoAdapter();
        break;
      case 'mock':
        // Just use SerpApi adapter for now, it has fallback to mock data
        adapter = new SerpApiAdapterImpl();
        break;
      default:
        // Default to SerpApi
        adapter = new SerpApiAdapterImpl();
    }
    
    // Cache the instance
    this.adapters.set(provider, adapter);
    
    return adapter;
  }
}
