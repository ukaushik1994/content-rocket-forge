import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { enhancedSerpService } from './enhancedSerpService';

export interface UnifiedKeyword {
  id: string;
  user_id: string;
  keyword: string;
  search_volume?: number | null;
  difficulty?: number | null;
  source_type: string;
  source_id?: string | null;
  first_discovered_at: string;
  last_updated_at: string;
  usage_count: number;
  content_usage: any;
  notes?: string | null;
  is_active: boolean;
  // Enhanced SERP metadata
  serp_last_updated?: string | null;
  competition_score?: number | null;
  serp_data_quality?: string | null;
  cpc?: number | null;
  trend_direction?: string | null;
  intent?: string | null;
  seasonality?: boolean | null;
}

export interface KeywordUsageLog {
  id: string;
  unified_keyword_id: string;
  content_id?: string;
  content_type: 'content_item' | 'glossary_term' | 'strategy' | 'cluster';
  usage_type: 'primary' | 'secondary' | 'serp_extracted' | 'manual';
  created_at: string;
}

export interface KeywordFilters {
  search?: string;
  source_type?: string[];
  volume_min?: number;
  volume_max?: number;
  difficulty_min?: number;
  difficulty_max?: number;
  usage_count_min?: number;
  has_usage?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: 'keyword' | 'search_volume' | 'difficulty' | 'usage_count' | 'first_discovered_at' | 'serp_last_updated';
  sort_order?: 'asc' | 'desc';
  show_duplicates_only?: boolean;
  data_freshness?: 'fresh' | 'stale' | 'any';
}

interface UpsertKeywordData {
  keyword: string;
  search_volume?: number | null;
  difficulty?: number | null;
  source_type?: string;
  source_id?: string | null;
  notes?: string | null;
  // Enhanced SERP data
  competition_score?: number | null;
  serp_data_quality?: string | null;
  cpc?: number | null;
  trend_direction?: string | null;
  intent?: string | null;
  seasonality?: boolean | null;
}

interface DuplicateKeyword {
  keyword: string;
  instances: UnifiedKeyword[];
  totalUsage: number;
  sources: string[];
}

interface BulkUpdateData {
  search_volume?: number | null;
  difficulty?: number | null;
  notes?: string | null;
}

class KeywordLibraryService {
  /**
   * Get keywords ACTUALLY USED in content items
   * This extracts keywords from content_items and shows content-specific data
   */
  async getContentKeywords(filters: KeywordFilters = {}, page = 1, limit = 50) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get all content items
      const { data: contentItems, error } = await supabase
        .from('content_items')
        .select('id, title, status, content_type, created_at, updated_at, metadata')
        .eq('user_id', user.id);

      if (error) throw error;

      // Extract and aggregate keywords from content metadata
      const keywordMap = new Map<string, {
        keyword: string;
        usageCount: number;
        contentPieces: Array<{
          id: string;
          title: string;
          status: string;
          type: string;
        }>;
        firstUsed: string;
        lastUsed: string;
      }>();

      for (const item of contentItems || []) {
        // Extract keywords from metadata
        const metadata = item.metadata as any;
        const mainKeyword = metadata?.mainKeyword;
        const secondaryKeywords = metadata?.secondaryKeywords || [];
        
        const allKeywords = [
          mainKeyword,
          ...secondaryKeywords
        ].filter(Boolean);

        for (const kw of allKeywords) {
          if (!keywordMap.has(kw)) {
            keywordMap.set(kw, {
              keyword: kw,
              usageCount: 0,
              contentPieces: [],
              firstUsed: item.created_at,
              lastUsed: item.updated_at
            });
          }
          
          const entry = keywordMap.get(kw)!;
          entry.usageCount++;
          entry.contentPieces.push({
            id: item.id,
            title: item.title,
            status: item.status,
            type: item.content_type
          });
          
          if (item.created_at < entry.firstUsed) entry.firstUsed = item.created_at;
          if (item.updated_at > entry.lastUsed) entry.lastUsed = item.updated_at;
        }
      }

      // Convert to array
      let keywordsList = Array.from(keywordMap.values());

      // Apply search filter
      if (filters.search) {
        keywordsList = keywordsList.filter(k => 
          k.keyword.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      // Apply usage filter
      if (filters.usage_count_min !== undefined) {
        keywordsList = keywordsList.filter(k => k.usageCount >= filters.usage_count_min!);
      }

      if (filters.has_usage !== undefined) {
        if (filters.has_usage) {
          keywordsList = keywordsList.filter(k => k.usageCount > 0);
        } else {
          keywordsList = keywordsList.filter(k => k.usageCount === 0);
        }
      }

      // Sort by usage count (most used first)
      keywordsList.sort((a, b) => b.usageCount - a.usageCount);

      // Pagination
      const total = keywordsList.length;
      const offset = (page - 1) * limit;
      const paginated = keywordsList.slice(offset, offset + limit);

      return {
        keywords: paginated.map(k => ({
          id: k.keyword, // Use keyword as ID
          keyword: k.keyword,
          usage_count: k.usageCount,
          content_pieces: k.contentPieces,
          first_used: k.firstUsed,
          last_used: k.lastUsed,
          source_type: 'content',
          is_active: true,
          user_id: user.id,
          first_discovered_at: k.firstUsed,
          last_updated_at: k.lastUsed,
          content_usage: null,
          search_volume: null,
          difficulty: null,
          source_id: null,
          notes: null,
          serp_last_updated: null,
          competition_score: null,
          serp_data_quality: null,
          cpc: null,
          trend_direction: null,
          intent: null,
          seasonality: null
        })) as UnifiedKeyword[],
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching content keywords:', error);
      throw error;
    }
  }

  async getKeywords(filters: KeywordFilters = {}, page = 1, limit = 50) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      let query = supabase
        .from('unified_keywords')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Apply filters
      if (filters.search) {
        query = query.ilike('keyword', `%${filters.search}%`);
      }

      if (filters.source_type && filters.source_type.length > 0) {
        query = query.in('source_type', filters.source_type);
      }

      if (filters.volume_min !== undefined) {
        query = query.gte('search_volume', filters.volume_min);
      }

      if (filters.volume_max !== undefined) {
        query = query.lte('search_volume', filters.volume_max);
      }

      if (filters.difficulty_min !== undefined) {
        query = query.gte('difficulty', filters.difficulty_min);
      }

      if (filters.difficulty_max !== undefined) {
        query = query.lte('difficulty', filters.difficulty_max);
      }

      if (filters.usage_count_min !== undefined) {
        query = query.gte('usage_count', filters.usage_count_min);
      }

      if (filters.has_usage !== undefined) {
        if (filters.has_usage) {
          query = query.gt('usage_count', 0);
        } else {
          query = query.eq('usage_count', 0);
        }
      }

      if (filters.date_from) {
        query = query.gte('first_discovered_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('first_discovered_at', filters.date_to);
      }

      // Data freshness filter
      if (filters.data_freshness) {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        if (filters.data_freshness === 'fresh') {
          query = query.gte('serp_last_updated', oneDayAgo.toISOString());
        } else if (filters.data_freshness === 'stale') {
          query = query.or(`serp_last_updated.is.null,serp_last_updated.lt.${oneDayAgo.toISOString()}`);
        }
      }

      // Filter for duplicates only
      if (filters.show_duplicates_only) {
        const { data: duplicateKeywords } = await supabase
          .from('unified_keywords')
          .select('keyword')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        if (duplicateKeywords) {
          const keywordCounts = duplicateKeywords.reduce((acc: Record<string, number>, item) => {
            acc[item.keyword] = (acc[item.keyword] || 0) + 1;
            return acc;
          }, {});
          
          const duplicates = Object.keys(keywordCounts).filter(keyword => keywordCounts[keyword] > 1);
          if (duplicates.length > 0) {
            query = query.in('keyword', duplicates);
          } else {
            return {
              keywords: [],
              total: 0,
              page,
              totalPages: 0
            };
          }
        }
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'last_updated_at';
      const sortOrder = filters.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        keywords: (data || []) as UnifiedKeyword[],
        total: count || 0,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching keywords:', error);
      throw error;
    }
  }

  async upsertKeyword(keywordData: UpsertKeywordData): Promise<UnifiedKeyword> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('unified_keywords')
        .upsert({
          keyword: keywordData.keyword,
          search_volume: keywordData.search_volume,
          difficulty: keywordData.difficulty,
          source_type: keywordData.source_type || 'manual',
          source_id: keywordData.source_id,
          notes: keywordData.notes,
          user_id: user.id,
          last_updated_at: new Date().toISOString(),
          // Enhanced SERP data
          competition_score: keywordData.competition_score,
          serp_data_quality: keywordData.serp_data_quality,
          cpc: keywordData.cpc,
          trend_direction: keywordData.trend_direction,
          intent: keywordData.intent,
          seasonality: keywordData.seasonality,
          serp_last_updated: keywordData.search_volume || keywordData.difficulty || keywordData.competition_score ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      return data as UnifiedKeyword;
    } catch (error) {
      console.error('Error upserting keyword:', error);
      throw error;
    }
  }

  // Intelligent SERP integration with research module
  async upsertKeywordWithSerpData(keyword: string, serpData?: any, sourceType = 'serp'): Promise<UnifiedKeyword> {
    try {
      const keywordData: UpsertKeywordData = {
        keyword,
        source_type: sourceType,
      };

      // Extract SERP metrics if available
      if (serpData) {
        keywordData.search_volume = serpData.searchVolume || serpData.search_volume;
        keywordData.difficulty = serpData.keywordDifficulty || serpData.difficulty;
        keywordData.competition_score = serpData.competitionScore || serpData.competition_score;
        keywordData.cpc = serpData.cpc;
        keywordData.intent = serpData.intent;
        keywordData.trend_direction = serpData.trend || 'stable';
        keywordData.serp_data_quality = serpData.dataQuality || 'medium';
        keywordData.seasonality = serpData.seasonality || false;
      }

      return await this.upsertKeyword(keywordData);
    } catch (error) {
      console.error('Error upserting keyword with SERP data:', error);
      throw error;
    }
  }

  // Refresh SERP metrics for individual keyword
  async refreshKeywordMetrics(keywordId: string): Promise<UnifiedKeyword> {
    try {
      const { data: keyword, error } = await supabase
        .from('unified_keywords')
        .select('*')
        .eq('id', keywordId)
        .single();

      if (error || !keyword) throw new Error('Keyword not found');

      // Fetch fresh SERP data
      const serpData = await enhancedSerpService.analyzeKeywordEnhanced(keyword.keyword, 'us', true);
      
      if (serpData) {
        const updatedKeyword = await this.upsertKeywordWithSerpData(
          keyword.keyword, 
          serpData,
          keyword.source_type
        );
        
        toast.success('Keyword metrics refreshed successfully');
        return updatedKeyword;
      } else {
        throw new Error('Failed to fetch SERP data');
      }
    } catch (error) {
      console.error('Error refreshing keyword metrics:', error);
      toast.error('Failed to refresh keyword metrics');
      throw error;
    }
  }

  // Batch refresh for stale keywords
  async refreshStaleKeywords(): Promise<number> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get keywords with stale SERP data (older than 24 hours or null)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data: staleKeywords, error } = await supabase
        .from('unified_keywords')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or(`serp_last_updated.is.null,serp_last_updated.lt.${oneDayAgo.toISOString()}`)
        .limit(10); // Limit to avoid rate limiting

      if (error) throw error;

      let refreshedCount = 0;
      for (const keyword of staleKeywords || []) {
        try {
          await this.refreshKeywordMetrics(keyword.id);
          refreshedCount++;
        } catch (error) {
          console.error(`Failed to refresh keyword ${keyword.keyword}:`, error);
        }
      }

      toast.success(`Refreshed ${refreshedCount} keyword metrics`);
      return refreshedCount;
    } catch (error) {
      console.error('Error refreshing stale keywords:', error);
      toast.error('Failed to refresh stale keywords');
      throw error;
    }
  }

  // Calculate data freshness
  getDataFreshness(keyword: UnifiedKeyword): 'fresh' | 'stale' | 'unknown' {
    if (!keyword.serp_last_updated) return 'unknown';
    
    const lastUpdated = new Date(keyword.serp_last_updated);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return lastUpdated > oneDayAgo ? 'fresh' : 'stale';
  }

  async trackKeywordUsage(
    keywordId: string,
    contentId: string,
    contentType: KeywordUsageLog['content_type'],
    usageType: KeywordUsageLog['usage_type']
  ): Promise<void> {
    try {
      // Insert usage log
      const { error: logError } = await supabase
        .from('keyword_usage_log')
        .insert({
          unified_keyword_id: keywordId,
          content_id: contentId,
          content_type: contentType,
          usage_type: usageType
        });

      if (logError) throw logError;

      // Update usage count manually
      const { count } = await supabase
        .from('keyword_usage_log')
        .select('id', { count: 'exact' })
        .eq('unified_keyword_id', keywordId);

      await supabase
        .from('unified_keywords')
        .update({ usage_count: count || 0 })
        .eq('id', keywordId);
    } catch (error) {
      console.error('Error tracking keyword usage:', error);
      throw error;
    }
  }

  async getKeywordUsage(keywordId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('keyword_usage_log')
        .select(`
          *,
          content_items:content_id(id, title, status, content_type),
          glossary_terms:content_id(id, term)
        `)
        .eq('unified_keyword_id', keywordId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching keyword usage:', error);
      return [];
    }
  }

  async deleteKeywords(keywordIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('unified_keywords')
        .update({ is_active: false })
        .in('id', keywordIds);

      if (error) throw error;
      toast.success(`${keywordIds.length} keyword(s) deleted`);
    } catch (error) {
      console.error('Error deleting keywords:', error);
      toast.error('Failed to delete keywords');
      throw error;
    }
  }

  async bulkUpdateKeywords(keywordIds: string[], updates: BulkUpdateData): Promise<void> {
    try {
      const { error } = await supabase
        .from('unified_keywords')
        .update({
          search_volume: updates.search_volume,
          difficulty: updates.difficulty,
          notes: updates.notes,
          last_updated_at: new Date().toISOString()
        })
        .in('id', keywordIds);

      if (error) throw error;
      toast.success(`${keywordIds.length} keyword(s) updated`);
    } catch (error) {
      console.error('Error updating keywords:', error);
      toast.error('Failed to update keywords');
      throw error;
    }
  }

  async syncKeywordsFromSources(): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Sync from keywords table
      await this.syncFromKeywordsTable(user.id);
      
      // Sync from glossary terms
      await this.syncFromGlossaryTerms(user.id);
      
      // Sync from strategy keywords
      await this.syncFromStrategyKeywords(user.id);

      toast.success('Keywords synchronized successfully');
    } catch (error) {
      console.error('Error syncing keywords:', error);
      toast.error('Failed to sync keywords');
      throw error;
    }
  }

  private async syncFromKeywordsTable(userId: string): Promise<void> {
    const { data: keywords } = await supabase
      .from('keywords')
      .select('*')
      .eq('user_id', userId);

    if (keywords && keywords.length > 0) {
      for (const keyword of keywords) {
        await this.upsertKeyword({
          keyword: keyword.keyword,
          search_volume: keyword.search_volume,
          difficulty: keyword.difficulty,
          source_type: 'manual',
          source_id: keyword.id
        });
      }
    }
  }

  private async syncFromGlossaryTerms(userId: string): Promise<void> {
    const { data: terms } = await supabase
      .from('glossary_terms')
      .select('*')
      .eq('user_id', userId);

    if (terms && terms.length > 0) {
      for (const term of terms) {
        await this.upsertKeyword({
          keyword: term.term,
          search_volume: term.search_volume,
          difficulty: term.keyword_difficulty,
          source_type: 'glossary',
          source_id: term.id
        });
      }
    }
  }

  private async syncFromStrategyKeywords(userId: string): Promise<void> {
    // Simple implementation to avoid TypeScript recursion
    console.log('Strategy keywords sync placeholder for user:', userId);
  }

  async exportKeywords(keywordIds: string[], format: 'csv' | 'json' = 'csv'): Promise<void> {
    try {
      const { data: keywords, error } = await supabase
        .from('unified_keywords')
        .select('*')
        .in('id', keywordIds);

      if (error) throw error;

      if (format === 'csv') {
        const csv = this.convertToCSV(keywords || []);
        this.downloadFile(csv, 'keywords.csv', 'text/csv');
      } else {
        const json = JSON.stringify(keywords, null, 2);
        this.downloadFile(json, 'keywords.json', 'application/json');
      }

      toast.success('Keywords exported successfully');
    } catch (error) {
      console.error('Error exporting keywords:', error);
      toast.error('Failed to export keywords');
    }
  }

  private convertToCSV(keywords: any[]): string {
    const headers = ['keyword', 'search_volume', 'difficulty', 'source_type', 'usage_count', 'first_discovered_at'];
    const csvContent = [
      headers.join(','),
      ...keywords.map(k => headers.map(h => String(k[h] || '')).join(','))
    ].join('\n');
    return csvContent;
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Find duplicate keywords
  async findDuplicates(): Promise<DuplicateKeyword[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: keywords, error } = await supabase
        .from('unified_keywords')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('keyword');

      if (error) throw error;

      // Group keywords by name
      const grouped = (keywords || []).reduce((acc: Record<string, UnifiedKeyword[]>, keyword) => {
        const key = keyword.keyword.toLowerCase().trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(keyword as UnifiedKeyword);
        return acc;
      }, {});

      // Find duplicates (more than one instance)
      const duplicates: DuplicateKeyword[] = Object.entries(grouped)
        .filter(([_, instances]) => instances.length > 1)
        .map(([keyword, instances]) => ({
          keyword,
          instances,
          totalUsage: instances.reduce((sum, instance) => sum + instance.usage_count, 0),
          sources: [...new Set(instances.map(instance => instance.source_type))]
        }));

      return duplicates;
    } catch (error) {
      console.error('Error finding duplicates:', error);
      return [];
    }
  }

  // Merge duplicate keywords
  async mergeDuplicates(duplicateKeyword: DuplicateKeyword, keepInstance: UnifiedKeyword): Promise<void> {
    try {
      const instancesToRemove = duplicateKeyword.instances.filter(instance => instance.id !== keepInstance.id);
      
      // Update the kept instance with combined data
      const combinedUsage = duplicateKeyword.totalUsage;
      const combinedNotes = duplicateKeyword.instances
        .map(instance => instance.notes)
        .filter(Boolean)
        .join('; ');

      await supabase
        .from('unified_keywords')
        .update({
          usage_count: combinedUsage,
          notes: combinedNotes || keepInstance.notes,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', keepInstance.id);

      // Remove duplicate instances
      await this.deleteKeywords(instancesToRemove.map(instance => instance.id));
      
      toast.success('Duplicates merged successfully');
    } catch (error) {
      console.error('Error merging duplicates:', error);
      toast.error('Failed to merge duplicates');
      throw error;
    }
  }

  // Get keyword usage details with content and solution info
  async getDetailedKeywordUsage(keywordId: string): Promise<any> {
    try {
      // Get usage logs first
      const { data: usageLogs, error: usageError } = await supabase
        .from('keyword_usage_log')
        .select('*')
        .eq('unified_keyword_id', keywordId)
        .order('created_at', { ascending: false });

      if (usageError) throw usageError;

      // For each usage log, fetch the related content
      const usageWithDetails = await Promise.all(
        (usageLogs || []).map(async (usage) => {
          let contentDetails = null;
          let solutionMapping = null;

          if (usage.content_id) {
            if (usage.content_type === 'content_item') {
              const { data: contentItem } = await supabase
                .from('content_items')
                .select('id, title, status, content_type, metadata')
                .eq('id', usage.content_id)
                .single();
              
              if (contentItem) {
                contentDetails = contentItem;
                if (contentItem.metadata && typeof contentItem.metadata === 'object') {
                  const metadata = contentItem.metadata as any;
                  if (metadata.solution_mapping) {
                    solutionMapping = metadata.solution_mapping;
                  }
                }
              }
            } else if (usage.content_type === 'glossary_term') {
              const { data: glossaryTerm } = await supabase
                .from('glossary_terms')
                .select('id, term, glossary_id')
                .eq('id', usage.content_id)
                .single();
              
              if (glossaryTerm) {
                contentDetails = glossaryTerm;
              }
            }
          }

          return {
            ...usage,
            content_items: usage.content_type === 'content_item' ? contentDetails : null,
            glossary_terms: usage.content_type === 'glossary_term' ? contentDetails : null,
            solution_mapping: solutionMapping
          };
        })
      );

      return usageWithDetails;
    } catch (error) {
      console.error('Error fetching detailed keyword usage:', error);
      return [];
    }
  }
}

export const keywordLibraryService = new KeywordLibraryService();
