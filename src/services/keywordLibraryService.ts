import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  sort_by?: 'keyword' | 'search_volume' | 'difficulty' | 'usage_count' | 'first_discovered_at';
  sort_order?: 'asc' | 'desc';
}

interface UpsertKeywordData {
  keyword: string;
  search_volume?: number | null;
  difficulty?: number | null;
  source_type?: string;
  source_id?: string | null;
  notes?: string | null;
}

interface BulkUpdateData {
  search_volume?: number | null;
  difficulty?: number | null;
  notes?: string | null;
}

class KeywordLibraryService {
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
          last_updated_at: new Date().toISOString()
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
}

export const keywordLibraryService = new KeywordLibraryService();