
import { SerpApiAdapter } from './SerpApiAdapter';
import { DataForSeoAdapter } from './DataForSeoAdapter';
import { SerpApiAdapter as AdapterInterface } from './types';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

/**
 * Factory for creating SERP API adapters based on provider
 */
export class AdapterFactory {
  // Cache for adapters to avoid repeated instantiation
  private static adapters: Record<string, AdapterInterface> = {};

  /**
   * Get an adapter for the specified provider
   */
  static getAdapter(provider: SerpProvider): AdapterInterface {
    // Return cached adapter if available
    if (this.adapters[provider]) {
      return this.adapters[provider];
    }

    // Create new adapter based on provider
    let adapter: AdapterInterface;

    switch (provider) {
      case 'serpapi':
        adapter = new SerpApiAdapter();
        break;
      case 'dataforseo':
        adapter = new DataForSeoAdapter();
        break;
      default:
        adapter = new SerpApiAdapter();
    }

    // Cache the adapter
    this.adapters[provider] = adapter;

    return adapter;
  }

  /**
   * Get all available adapters
   */
  static getAllAdapters(): AdapterInterface[] {
    return [
      this.getAdapter('serpapi'),
      this.getAdapter('dataforseo')
    ];
  }
}
