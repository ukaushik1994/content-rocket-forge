import { supabase } from '@/integrations/supabase/client';

export interface KeywordUsageData {
  keyword: string;
  usage_count: number;
  last_used: string;
  proposal_ids: string[];
}

class KeywordDeduplicationService {
  // Get all previously used keywords from historical proposals
  async getPreviouslyUsedKeywords(): Promise<KeywordUsageData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all historical proposals with their keywords
      const { data: proposals, error } = await supabase
        .from('ai_strategy_proposals')
        .select('id, primary_keyword, related_keywords, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate keyword usage
      const keywordMap = new Map<string, KeywordUsageData>();

      (proposals || []).forEach(proposal => {
        const allKeywords = [
          proposal.primary_keyword,
          ...(proposal.related_keywords || [])
        ].filter(Boolean).map(kw => kw.toLowerCase().trim());

        allKeywords.forEach(keyword => {
          if (keywordMap.has(keyword)) {
            const existing = keywordMap.get(keyword)!;
            existing.usage_count++;
            existing.proposal_ids.push(proposal.id);
            // Update last_used if this proposal is newer
            if (new Date(proposal.created_at) > new Date(existing.last_used)) {
              existing.last_used = proposal.created_at;
            }
          } else {
            keywordMap.set(keyword, {
              keyword,
              usage_count: 1,
              last_used: proposal.created_at,
              proposal_ids: [proposal.id]
            });
          }
        });
      });

      return Array.from(keywordMap.values());
    } catch (error) {
      console.error('❌ Error fetching previously used keywords:', error);
      return [];
    }
  }

  // Check if a keyword or its variations have been used before
  async isKeywordAlreadyUsed(keyword: string, threshold: number = 0.8): Promise<boolean> {
    try {
      const usedKeywords = await this.getPreviouslyUsedKeywords();
      const normalizedKeyword = keyword.toLowerCase().trim();

      // Check for exact matches
      if (usedKeywords.some(used => used.keyword === normalizedKeyword)) {
        return true;
      }

      // Check for similar keywords using simple similarity
      for (const used of usedKeywords) {
        if (this.calculateSimilarity(normalizedKeyword, used.keyword) >= threshold) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking keyword usage:', error);
      return false;
    }
  }

  // Get keywords to exclude from new generation (for AI prompt)
  async getKeywordsToExclude(): Promise<string[]> {
    try {
      const usedKeywords = await this.getPreviouslyUsedKeywords();
      
      // Return all used keywords + common variations
      const excludeList: string[] = [];
      
      usedKeywords.forEach(used => {
        excludeList.push(used.keyword);
        
        // Add common variations
        const variations = this.generateKeywordVariations(used.keyword);
        excludeList.push(...variations);
      });

      return [...new Set(excludeList)]; // Remove duplicates
    } catch (error) {
      console.error('❌ Error getting keywords to exclude:', error);
      return [];
    }
  }

  // Generate keyword variations (singular/plural, etc.)
  private generateKeywordVariations(keyword: string): string[] {
    const variations: string[] = [];
    
    // Simple pluralization/singularization
    if (keyword.endsWith('s') && keyword.length > 3) {
      variations.push(keyword.slice(0, -1)); // Remove 's'
    } else {
      variations.push(keyword + 's'); // Add 's'
    }
    
    // Add common endings
    if (!keyword.endsWith('ing')) {
      variations.push(keyword + 'ing');
    }
    
    // Remove common endings
    if (keyword.endsWith('ing')) {
      variations.push(keyword.slice(0, -3));
    }
    
    return variations;
  }

  // Simple similarity calculation (Jaccard similarity)
  private calculateSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  // Filter new keywords against previously used ones
  async filterNewKeywords(newKeywords: string[]): Promise<string[]> {
    try {
      const filtered: string[] = [];
      
      for (const keyword of newKeywords) {
        const isUsed = await this.isKeywordAlreadyUsed(keyword);
        if (!isUsed) {
          filtered.push(keyword);
        } else {
          console.log(`🔄 Filtering duplicate keyword: ${keyword}`);
        }
      }
      
      return filtered;
    } catch (error) {
      console.error('❌ Error filtering keywords:', error);
      return newKeywords; // Return original on error
    }
  }

  // Get usage statistics for reporting
  async getKeywordUsageStats(): Promise<{
    totalKeywords: number;
    totalUsage: number;
    mostUsedKeywords: KeywordUsageData[];
    recentKeywords: KeywordUsageData[];
  }> {
    try {
      const usedKeywords = await this.getPreviouslyUsedKeywords();
      
      const mostUsed = [...usedKeywords]
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10);
      
      const recent = [...usedKeywords]
        .sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())
        .slice(0, 10);
      
      return {
        totalKeywords: usedKeywords.length,
        totalUsage: usedKeywords.reduce((sum, kw) => sum + kw.usage_count, 0),
        mostUsedKeywords: mostUsed,
        recentKeywords: recent
      };
    } catch (error) {
      console.error('❌ Error getting keyword usage stats:', error);
      return {
        totalKeywords: 0,
        totalUsage: 0,
        mostUsedKeywords: [],
        recentKeywords: []
      };
    }
  }
}

export const keywordDeduplicationService = new KeywordDeduplicationService();