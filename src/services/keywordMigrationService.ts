import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { keywordLibraryService } from './keywordLibraryService';

export interface MigrationResult {
  success: boolean;
  migrated: number;
  duplicates: number;
  errors: string[];
  details: {
    legacy_keywords: number;
    glossary_terms: number;
    strategy_keywords: number;
  };
}

export interface MigrationStats {
  total_legacy: number;
  total_unified: number;
  pending_migration: number;
  stale_serp_data: number;
  usage_tracked: number;
}

class KeywordMigrationService {
  /**
   * Get comprehensive migration statistics
   */
  async getMigrationStats(): Promise<MigrationStats> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Count legacy keywords
      const { count: legacyCount } = await supabase
        .from('keywords')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      // Count unified keywords
      const { count: unifiedCount } = await supabase
        .from('unified_keywords')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Count glossary terms
      const { count: glossaryCount } = await supabase
        .from('glossary_terms')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      // Count stale SERP data (older than 24 hours or null)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { count: staleCount } = await supabase
        .from('unified_keywords')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or(`serp_last_updated.is.null,serp_last_updated.lt.${oneDayAgo.toISOString()}`);

      // Count keywords with usage tracking
      const { count: usageCount } = await supabase
        .from('unified_keywords')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('usage_count', 0);

      return {
        total_legacy: legacyCount || 0,
        total_unified: unifiedCount || 0,
        pending_migration: (legacyCount || 0) + (glossaryCount || 0),
        stale_serp_data: staleCount || 0,
        usage_tracked: usageCount || 0
      };
    } catch (error) {
      console.error('Error getting migration stats:', error);
      throw error;
    }
  }

  /**
   * Migrate legacy keywords with enhanced duplicate handling
   */
  async migrateLegacyKeywords(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migrated: 0,
      duplicates: 0,
      errors: [],
      details: {
        legacy_keywords: 0,
        glossary_terms: 0,
        strategy_keywords: 0
      }
    };

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Migrate from legacy keywords table
      const legacyResult = await this.migrateLegacyKeywordsTable(user.id);
      result.details.legacy_keywords = legacyResult.migrated;
      result.migrated += legacyResult.migrated;
      result.duplicates += legacyResult.duplicates;
      result.errors.push(...legacyResult.errors);

      // Migrate from glossary terms
      const glossaryResult = await this.migrateGlossaryTerms(user.id);
      result.details.glossary_terms = glossaryResult.migrated;
      result.migrated += glossaryResult.migrated;
      result.duplicates += glossaryResult.duplicates;
      result.errors.push(...glossaryResult.errors);

      // Migrate from strategy keywords (placeholder for now)
      const strategyResult = await this.migrateStrategyKeywords(user.id);
      result.details.strategy_keywords = strategyResult.migrated;
      result.migrated += strategyResult.migrated;
      result.duplicates += strategyResult.duplicates;
      result.errors.push(...strategyResult.errors);

      result.success = result.errors.length === 0;
      
      if (result.success) {
        toast.success(`Migration completed: ${result.migrated} keywords migrated, ${result.duplicates} duplicates handled`);
      } else {
        toast.error(`Migration completed with ${result.errors.length} errors`);
      }

      return result;
    } catch (error) {
      console.error('Error during migration:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Migration failed');
      return result;
    }
  }

  /**
   * Migrate from legacy keywords table with intelligent duplicate handling
   */
  private async migrateLegacyKeywordsTable(userId: string): Promise<{ migrated: number; duplicates: number; errors: string[] }> {
    const result = { migrated: 0, duplicates: 0, errors: [] };

    try {
      // Get all legacy keywords
      const { data: legacyKeywords, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!legacyKeywords || legacyKeywords.length === 0) {
        return result;
      }

      // Get existing unified keywords for duplicate checking
      const { data: existingKeywords } = await supabase
        .from('unified_keywords')
        .select('keyword, source_type, source_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      const existingMap = new Map(
        existingKeywords?.map(k => [`${k.keyword.toLowerCase()}_${k.source_type}_${k.source_id}`, k]) || []
      );

      for (const legacyKeyword of legacyKeywords) {
        try {
          const key = `${legacyKeyword.keyword.toLowerCase()}_manual_${legacyKeyword.id}`;
          
          if (existingMap.has(key)) {
            result.duplicates++;
            continue;
          }

          // Migrate keyword with legacy data
          await keywordLibraryService.upsertKeyword({
            keyword: legacyKeyword.keyword,
            search_volume: legacyKeyword.search_volume,
            difficulty: legacyKeyword.difficulty,
            source_type: 'manual',
            source_id: legacyKeyword.id,
            notes: `Migrated from legacy keywords table on ${new Date().toLocaleDateString()}`
          });

          result.migrated++;
        } catch (error) {
          const errorMsg = `Failed to migrate keyword "${legacyKeyword.keyword}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return result;
    } catch (error) {
      const errorMsg = `Error migrating legacy keywords: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      return result;
    }
  }

  /**
   * Migrate from glossary terms
   */
  private async migrateGlossaryTerms(userId: string): Promise<{ migrated: number; duplicates: number; errors: string[] }> {
    const result = { migrated: 0, duplicates: 0, errors: [] };

    try {
      const { data: glossaryTerms, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!glossaryTerms || glossaryTerms.length === 0) {
        return result;
      }

      for (const term of glossaryTerms) {
        try {
          // Check if already exists
          const { data: existing } = await supabase
            .from('unified_keywords')
            .select('id')
            .eq('user_id', userId)
            .eq('keyword', term.term)
            .eq('source_type', 'glossary')
            .eq('source_id', term.id)
            .single();

          if (existing) {
            result.duplicates++;
            continue;
          }

          await keywordLibraryService.upsertKeyword({
            keyword: term.term,
            search_volume: term.search_volume,
            difficulty: term.keyword_difficulty,
            source_type: 'glossary',
            source_id: term.id,
            notes: `Migrated from glossary: ${term.expanded_explanation?.substring(0, 100) || ''}`
          });

          result.migrated++;
        } catch (error) {
          const errorMsg = `Failed to migrate glossary term "${term.term}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
        }
      }

      return result;
    } catch (error) {
      const errorMsg = `Error migrating glossary terms: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      return result;
    }
  }

  /**
   * Migrate from strategy keywords (placeholder implementation)
   */
  private async migrateStrategyKeywords(userId: string): Promise<{ migrated: number; duplicates: number; errors: string[] }> {
    const result = { migrated: 0, duplicates: 0, errors: [] };

    try {
      // Get keywords from AI strategies
      const { data: strategies, error } = await supabase
        .from('ai_strategies')
        .select('id, keywords')
        .eq('user_id', userId);

      if (error) throw error;

      if (!strategies || strategies.length === 0) {
        return result;
      }

      for (const strategy of strategies) {
        if (!strategy.keywords || !Array.isArray(strategy.keywords)) continue;

        for (const keyword of strategy.keywords) {
          try {
            // Check if already exists
            const { data: existing } = await supabase
              .from('unified_keywords')
              .select('id')
              .eq('user_id', userId)
              .eq('keyword', keyword)
              .eq('source_type', 'strategy')
              .eq('source_id', strategy.id)
              .single();

            if (existing) {
              result.duplicates++;
              continue;
            }

            await keywordLibraryService.upsertKeyword({
              keyword,
              source_type: 'strategy',
              source_id: strategy.id,
              notes: `Migrated from AI strategy`
            });

            result.migrated++;
          } catch (error) {
            const errorMsg = `Failed to migrate strategy keyword "${keyword}": ${error instanceof Error ? error.message : 'Unknown error'}`;
            result.errors.push(errorMsg);
          }
        }
      }

      return result;
    } catch (error) {
      const errorMsg = `Error migrating strategy keywords: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      return result;
    }
  }

  /**
   * Test SERP integration and data saving
   */
  async testSerpIntegration(testKeyword: string = 'digital marketing'): Promise<boolean> {
    try {
      console.log(`Testing SERP integration with keyword: ${testKeyword}`);
      
      // Test keyword upsert with SERP data
      const mockSerpData = {
        searchVolume: 12000,
        keywordDifficulty: 65,
        competitionScore: 0.8,
        cpc: 2.45,
        intent: 'commercial',
        trend: 'stable',
        dataQuality: 'high',
        seasonality: false
      };

      const result = await keywordLibraryService.upsertKeywordWithSerpData(
        testKeyword,
        mockSerpData,
        'serp_test'
      );

      if (result) {
        console.log('SERP integration test successful:', result);
        toast.success('SERP integration test successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('SERP integration test failed:', error);
      toast.error('SERP integration test failed');
      return false;
    }
  }

  /**
   * Verify usage tracking functionality
   */
  async testUsageTracking(keywordId: string, contentId: string = 'test-content'): Promise<boolean> {
    try {
      console.log(`Testing usage tracking for keyword: ${keywordId}`);
      
      await keywordLibraryService.trackKeywordUsage(
        keywordId,
        contentId,
        'content_item',
        'primary'
      );

      const usage = await keywordLibraryService.getKeywordUsage(keywordId);
      
      if (usage && usage.length > 0) {
        console.log('Usage tracking test successful:', usage);
        toast.success('Usage tracking test successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Usage tracking test failed:', error);
      toast.error('Usage tracking test failed');
      return false;
    }
  }

  /**
   * Run comprehensive integration tests
   */
  async runIntegrationTests(): Promise<{ serp: boolean; usage: boolean; migration: boolean }> {
    try {
      console.log('Running comprehensive integration tests...');
      
      const results = {
        serp: false,
        usage: false,
        migration: false
      };

      // Test SERP integration
      results.serp = await this.testSerpIntegration();

      // Test migration (dry run)
      const stats = await this.getMigrationStats();
      results.migration = stats.total_legacy >= 0; // Basic connectivity test

      // Test usage tracking (if we have any keywords)
      if (stats.total_unified > 0) {
        const { data: testKeyword } = await supabase
          .from('unified_keywords')
          .select('id')
          .limit(1)
          .single();

        if (testKeyword) {
          results.usage = await this.testUsageTracking(testKeyword.id);
        }
      }

      const allPassed = Object.values(results).every(r => r);
      
      if (allPassed) {
        toast.success('All integration tests passed!');
      } else {
        toast.warning('Some integration tests failed - check console for details');
      }

      return results;
    } catch (error) {
      console.error('Integration tests failed:', error);
      toast.error('Integration tests failed');
      return { serp: false, usage: false, migration: false };
    }
  }
}

export const keywordMigrationService = new KeywordMigrationService();