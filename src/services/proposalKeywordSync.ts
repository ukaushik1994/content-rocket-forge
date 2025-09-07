import { supabase } from '@/integrations/supabase/client';
import { keywordLibraryService } from './keywordLibraryService';
import { toast } from 'sonner';

interface StrategyProposal {
  id?: string;
  title: string;
  description?: string;
  primary_keyword: string;
  related_keywords?: string[];
  content_suggestions?: string[];
  estimated_impressions?: number;
  priority_tag?: string;
  content_type?: string;
  serp_data?: any;
}

interface KeywordSimilarity {
  keyword: string;
  similarity: number;
  id?: string;
}

class ProposalKeywordSyncService {
  // Calculate Levenshtein distance between two strings
  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    // Create matrix
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[len2][len1];
  }

  // Calculate similarity percentage between two keywords
  private calculateSimilarity(keyword1: string, keyword2: string): number {
    const k1 = keyword1.toLowerCase().trim();
    const k2 = keyword2.toLowerCase().trim();
    
    if (k1 === k2) return 100;
    
    const maxLength = Math.max(k1.length, k2.length);
    const distance = this.calculateLevenshteinDistance(k1, k2);
    return ((maxLength - distance) / maxLength) * 100;
  }

  // Find similar keywords in the library (85%+ similarity is considered duplicate)
  private async findSimilarKeywords(newKeyword: string, existingKeywords: string[]): Promise<KeywordSimilarity[]> {
    const similarities: KeywordSimilarity[] = [];
    const similarityThreshold = 85; // 85% similarity threshold
    
    for (const existing of existingKeywords) {
      const similarity = this.calculateSimilarity(newKeyword, existing);
      if (similarity >= similarityThreshold) {
        similarities.push({
          keyword: existing,
          similarity: Math.round(similarity)
        });
      }
    }

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  // Get all existing keywords from the library
  private async getExistingKeywords(): Promise<string[]> {
    try {
      const response = await keywordLibraryService.getKeywords({}, 1, 10000);
      return response.keywords.map(k => k.keyword) || [];
    } catch (error) {
      console.error('Error fetching existing keywords:', error);
      return [];
    }
  }

  // Save historical proposals to database
  async saveProposalsToHistory(proposals: StrategyProposal[], strategySessionId?: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      console.log('💾 Saving proposals to history:', proposals.length);

      const proposalsToInsert = proposals.map(proposal => ({
        user_id: user.id,
        title: proposal.title,
        description: proposal.description,
        primary_keyword: proposal.primary_keyword,
        related_keywords: proposal.related_keywords || [],
        content_suggestions: proposal.content_suggestions || [],
        estimated_impressions: proposal.estimated_impressions || 0,
        priority_tag: proposal.priority_tag || 'evergreen',
        content_type: proposal.content_type || 'blog',
        serp_data: proposal.serp_data || {},
        proposal_data: JSON.parse(JSON.stringify(proposal)),
        strategy_session_id: strategySessionId
      }));

      // Use insert instead of upsert since these are always new proposals
      const { data, error } = await supabase
        .from('ai_strategy_proposals')
        .insert(proposalsToInsert)
        .select();

      if (error) {
        console.error('❌ Database error saving proposals:', error);
        console.error('❌ Detailed error info:', {
          error: error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          proposalsCount: proposalsToInsert.length,
          timestamp: new Date().toISOString()
        });
        toast.error(`Database save failed: ${error.message || 'Unknown error'}`);
        throw new Error(`Failed to save proposals to database: ${error.message || error.code || 'Unknown error'}`);
      }

      console.log('✅ Proposals saved to history successfully:', data?.length || 0);
      toast.success(`Saved ${proposals.length} strategy proposals to history`);
    } catch (error) {
      console.error('❌ Error saving proposals to history:', error);
      toast.error('Failed to save strategy proposals');
      throw error; // Let calling code handle the error
    }
  }

  // Auto-save keywords from proposals to unified keywords library
  async autoSaveKeywordsFromProposals(proposals: StrategyProposal[]): Promise<{
    saved: number;
    duplicates: number;
    variations: number;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      console.log('🔄 Auto-saving keywords from', proposals.length, 'proposals');
      
      // Get existing keywords for duplicate detection
      const existingKeywords = await this.getExistingKeywords();
      
      let savedCount = 0;
      let duplicateCount = 0;
      let variationCount = 0;
      
      // Extract all unique keywords from proposals
      const allKeywords = new Set<string>();
      
      for (const proposal of proposals) {
        // Add primary keyword
        allKeywords.add(proposal.primary_keyword);
        
        // Add related keywords
        if (proposal.related_keywords) {
          proposal.related_keywords.forEach(keyword => allKeywords.add(keyword));
        }
      }

      console.log('📝 Processing', allKeywords.size, 'unique keywords');

      // Process each keyword
      for (const keyword of allKeywords) {
        const normalizedKeyword = keyword.toLowerCase().trim();
        if (!normalizedKeyword) continue;

        // Check for exact duplicates first
        const exactMatch = existingKeywords.find(existing => 
          existing.toLowerCase().trim() === normalizedKeyword
        );
        
        if (exactMatch) {
          duplicateCount++;
          console.log('⚠️ Skipping exact duplicate:', keyword);
          continue;
        }

        // Check for similar keywords (variations)
        const similarKeywords = await this.findSimilarKeywords(keyword, existingKeywords);
        
        if (similarKeywords.length > 0) {
          variationCount++;
          console.log('🔄 Found variation of existing keyword:', {
            new: keyword,
            similar: similarKeywords[0].keyword,
            similarity: similarKeywords[0].similarity + '%'
          });
          
          // For high similarity (95%+), skip saving
          if (similarKeywords[0].similarity >= 95) {
            duplicateCount++;
            continue;
          }
          // For moderate similarity (85-94%), save as variation
        }

        // Save keyword to library
        try {
          await keywordLibraryService.upsertKeyword({
            keyword: keyword,
            source_type: 'ai_strategy',
            notes: `Auto-saved from AI strategy proposal`
          });
          
          savedCount++;
          existingKeywords.push(keyword); // Add to local cache to prevent duplicates in same batch
          console.log('✅ Saved keyword:', keyword);
          
        } catch (error) {
          console.error('❌ Error saving keyword:', keyword, error);
        }
      }

      const result = {
        saved: savedCount,
        duplicates: duplicateCount,
        variations: variationCount
      };

      console.log('🎉 Keyword auto-save completed:', result);
      
      // Show user-friendly toast
      if (savedCount > 0) {
        toast.success(`Auto-saved ${savedCount} new keywords to library`, {
          description: duplicateCount > 0 ? `${duplicateCount} duplicates skipped` : undefined
        });
      } else if (duplicateCount > 0) {
        toast.info('All keywords already exist in library', {
          description: 'No new keywords added'
        });
      }

      return result;
      
    } catch (error) {
      console.error('❌ Error in auto-save keywords:', error);
      toast.error('Failed to auto-save keywords to library');
      return { saved: 0, duplicates: 0, variations: 0 };
    }
  }

  // Get historical proposals for display
  async getHistoricalProposals(limit = 50): Promise<StrategyProposal[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_strategy_proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching historical proposals:', error);
      return [];
    }
  }

  // Get used keywords to exclude from new generation
  async getUsedKeywordsForExclusion(): Promise<string[]> {
    try {
      const historicalProposals = await this.getHistoricalProposals(1000);
      const existingKeywords = await this.getExistingKeywords();
      
      // Combine both sources and deduplicate
      const allUsedKeywords = new Set<string>();
      
      // Add from historical proposals
      historicalProposals.forEach(proposal => {
        allUsedKeywords.add(proposal.primary_keyword.toLowerCase());
        if (proposal.related_keywords) {
          proposal.related_keywords.forEach(kw => 
            allUsedKeywords.add(kw.toLowerCase())
          );
        }
      });
      
      // Add from keyword library
      existingKeywords.forEach(kw => allUsedKeywords.add(kw.toLowerCase()));
      
      return Array.from(allUsedKeywords);
    } catch (error) {
      console.error('Error getting used keywords:', error);
      return [];
    }
  }
}

export const proposalKeywordSync = new ProposalKeywordSyncService();