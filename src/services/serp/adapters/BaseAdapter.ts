
import { SerpApiError, SerpErrorType } from '../error-handling/ErrorTypes';
import { SerpApiAdapter } from './types';

/**
 * Base adapter class for SERP API integrations
 */
export abstract class BaseAdapter implements SerpApiAdapter {
  /**
   * Analyze a keyword and return SERP data
   */
  async analyzeKeyword(options: any): Promise<any> {
    try {
      return await this.fetchAnalysis(options);
    } catch (error) {
      console.error('Error in base adapter analyze keyword:', error);
      throw new SerpApiError({
        type: SerpErrorType.ADAPTER_ERROR,
        message: error instanceof Error ? error.message : 'Unknown adapter error',
        provider: this.getProviderName(),
        timestamp: new Date(),
        recoverable: false,
        details: error
      });
    }
  }

  /**
   * Search for keywords
   */
  async searchKeywords(options: any): Promise<any[]> {
    try {
      return await this.fetchKeywords(options);
    } catch (error) {
      console.error('Error in base adapter search keywords:', error);
      throw new SerpApiError({
        type: SerpErrorType.ADAPTER_ERROR,
        message: error instanceof Error ? error.message : 'Unknown adapter error',
        provider: this.getProviderName(),
        timestamp: new Date(),
        recoverable: false,
        details: error
      });
    }
  }

  /**
   * Search for related keywords
   */
  async searchRelatedKeywords(options: any): Promise<any[]> {
    try {
      return await this.fetchRelatedKeywords(options);
    } catch (error) {
      console.error('Error in base adapter search related keywords:', error);
      throw new SerpApiError({
        type: SerpErrorType.ADAPTER_ERROR,
        message: error instanceof Error ? error.message : 'Unknown adapter error',
        provider: this.getProviderName(),
        timestamp: new Date(),
        recoverable: false,
        details: error
      });
    }
  }

  /**
   * Implement in child classes to fetch analysis data
   */
  protected abstract fetchAnalysis(options: any): Promise<any>;

  /**
   * Implement in child classes to fetch keywords
   */
  protected abstract fetchKeywords(options: any): Promise<any[]>;

  /**
   * Implement in child classes to fetch related keywords
   */
  protected abstract fetchRelatedKeywords(options: any): Promise<any[]>;

  /**
   * Get the name of the provider
   */
  abstract getProviderName(): string;
}
